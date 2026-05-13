import { createFileRoute } from "@tanstack/react-router";
import {
  isWebhookEventProcessed,
  markOrderPaidFromWebhook,
} from "@/lib/order-store.server";
import { timingSafeEqualStr } from "@/lib/timing-safe.server";

/**
 * Webhook Kirvuspay — eventos TRANSACTION_CREATED / TRANSACTION_PAID / TRANSACTION_CANCELED.
 * Validação obrigatória do `token` contra KIRVUSPAY_WEBHOOK_TOKEN.
 */
export const Route = createFileRoute("/api/webhooks/kirvuspay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.KIRVUSPAY_WEBHOOK_TOKEN?.trim();
        if (!expected) {
          console.error(
            "[kirvuspay webhook] KIRVUSPAY_WEBHOOK_TOKEN não configurado — rejeitando.",
          );
          return Response.json(
            { error: "webhook_not_configured" },
            { status: 503 },
          );
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const payload = body as {
          event?: string;
          token?: string;
          transaction?: {
            id?: string;
            identifier?: string;
            status?: string;
          };
        };

        if (
          typeof payload.token !== "string" ||
          !timingSafeEqualStr(payload.token, expected)
        ) {
          return Response.json({ error: "invalid_token" }, { status: 401 });
        }

        const transactionId = payload.transaction?.id;
        const identifier = payload.transaction?.identifier;
        const event = payload.event;

        if (!transactionId) {
          return Response.json({ error: "missing_transaction_id" }, { status: 400 });
        }

        const eventKey = `${transactionId}:${event ?? "unknown"}`;
        if (await isWebhookEventProcessed(eventKey)) {
          return Response.json({ received: true, duplicate: true });
        }

        if (event === "TRANSACTION_PAID") {
          await markOrderPaidFromWebhook({
            webhookEventId: eventKey,
            transactionId,
            correlationId: identifier ?? null,
          });
        } else {
          console.info(
            "[kirvuspay webhook]",
            event ?? "(no event)",
            transactionId,
            identifier ?? "",
          );
        }

        return Response.json({ received: true });
      },
    },
  },
});
