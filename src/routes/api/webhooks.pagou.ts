import { createFileRoute } from "@tanstack/react-router";
import {
  isWebhookEventProcessed,
  markOrderPaidFromWebhook,
} from "@/lib/order-store.server";
import { timingSafeEqualStr } from "@/lib/timing-safe.server";

/**
 * Webhook legado Pagou. Exige PAGOU_WEBHOOK_SECRET (Bearer ou header
 * x-webhook-secret) para evitar que terceiros marquem pedidos como pagos.
 */
export const Route = createFileRoute("/api/webhooks/pagou")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.PAGOU_WEBHOOK_SECRET?.trim();
        if (!expected) {
          console.error(
            "[pagou webhook] PAGOU_WEBHOOK_SECRET não configurado — rejeitando.",
          );
          return Response.json(
            { error: "webhook_not_configured" },
            { status: 503 },
          );
        }

        const auth = request.headers.get("authorization") ?? "";
        const headerSecret =
          request.headers.get("x-webhook-secret")?.trim() ??
          (auth.toLowerCase().startsWith("bearer ")
            ? auth.slice(7).trim()
            : "");

        if (!timingSafeEqualStr(headerSecret, expected)) {
          return Response.json({ error: "invalid_secret" }, { status: 401 });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        const envelope = body as {
          id?: string;
          event?: string;
          data?: {
            id?: string;
            event_type?: string;
            correlation_id?: string | null;
          };
        };
        const webhookEventId = envelope.id;
        if (!webhookEventId) {
          return Response.json({ error: "missing_event_id" }, { status: 400 });
        }
        if (await isWebhookEventProcessed(webhookEventId)) {
          return Response.json({ received: true, duplicate: true });
        }
        const data = envelope.data;
        const transactionId = data?.id;
        const eventType = data?.event_type;
        if (eventType === "transaction.paid" && transactionId) {
          await markOrderPaidFromWebhook({
            webhookEventId,
            transactionId,
            correlationId: data.correlation_id,
          });
        } else {
          console.info(
            "[pagou webhook]",
            webhookEventId,
            eventType ?? "(no event_type)",
            transactionId ?? "",
          );
        }
        return Response.json({ received: true });
      },
    },
  },
});
