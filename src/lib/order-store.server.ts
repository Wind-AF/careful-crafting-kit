import { Redis } from "@upstash/redis";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** Pedido criado no Pix; atualizado a paid pelo webhook. */
export type StoredOrder = {
  transactionId: string;
  externalRef: string;
  units: string;
  email: string;
  name: string;
  amountCents: number;
  status: "pending" | "paid";
  createdAt: string;
  paidAt?: string;
  lastWebhookEventId?: string;
  /** Parâmetros da URL de campanha (ex.: click_id, sid, fbclid). */
  tracking?: Record<string, string>;
};

const TTL_PENDING_SEC = 60 * 60 * 24 * 14;
const TTL_PAID_SEC = 60 * 60 * 24 * 365;

export async function savePendingOrder(
  order: Omit<StoredOrder, "status" | "paidAt" | "lastWebhookEventId">,
): Promise<void> {
  const redis = getRedis();
  const record: StoredOrder = { ...order, status: "pending" };

  if (!redis) {
    console.info("[order:pending]", JSON.stringify(record));
    return;
  }

  await redis.set(`order:tx:${order.transactionId}`, record, {
    ex: TTL_PENDING_SEC,
  });
  await redis.set(`order:ref:${order.externalRef}`, order.transactionId, {
    ex: TTL_PENDING_SEC,
  });
}

/** Marca pedido pago (evento Pagou `transaction.paid`). */
export async function markOrderPaidFromWebhook(params: {
  webhookEventId: string;
  transactionId: string;
  correlationId?: string | null;
}): Promise<void> {
  const redis = getRedis();
  const paidAt = new Date().toISOString();

  if (!redis) {
    console.info(
      "[order:paid]",
      JSON.stringify({
        webhookEventId: params.webhookEventId,
        transactionId: params.transactionId,
        correlationId: params.correlationId ?? null,
        paidAt,
      }),
    );
    return;
  }

  const key = `order:tx:${params.transactionId}`;
  const existing = await redis.get<StoredOrder>(key);

  const merged: StoredOrder = existing
    ? {
        ...existing,
        status: "paid",
        paidAt,
        lastWebhookEventId: params.webhookEventId,
        externalRef: existing.externalRef || params.correlationId || "",
      }
    : {
        transactionId: params.transactionId,
        externalRef: params.correlationId ?? "",
        units: "?",
        email: "",
        name: "",
        amountCents: 0,
        status: "paid",
        createdAt: paidAt,
        paidAt,
        lastWebhookEventId: params.webhookEventId,
      };

  await redis.set(key, merged, { ex: TTL_PAID_SEC });
  if (merged.externalRef) {
    await redis.set(`order:ref:${merged.externalRef}`, params.transactionId, {
      ex: TTL_PAID_SEC,
    });
  }
  await redis.set(`order:paid:${params.transactionId}`, merged, {
    ex: TTL_PAID_SEC,
  });

  console.info(
    "[order:paid:stored]",
    params.transactionId,
    merged.externalRef,
  );
}

/** Evita processar o mesmo evento de webhook duas vezes. Retorna true se for duplicado. */
export async function isWebhookEventProcessed(
  webhookEventId: string,
): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  const first = await redis.set(`pagou:webhook:${webhookEventId}`, "1", {
    nx: true,
    ex: 60 * 60 * 24 * 7,
  });

  return first === null;
}
