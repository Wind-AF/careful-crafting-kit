import { createFileRoute } from "@tanstack/react-router";
import {
  isWebhookEventProcessed,
  markOrderPaidFromWebhook,
} from "@/lib/order-store.server";

/**
 * Webhook Kirvuspay — eventos TRANSACTION_CREATED / TRANSACTION_PAID / TRANSACTION_CANCELED.
 * Validamos o `token` recebido contra KIRVUSPAY_WEBHOOK_TOKEN (se configurado).
 */
export const Route = createFileRoute("/api/webhooks/kirvuspay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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

        const expected = process.env.KIRVUSPAY_WEBHOOK_TOKEN?.trim();
        if (expected && payload.token !== expected) {
          return Response.json({ error: "invalid_token" }, { status: 401 });
        }

        const transactionId = payload.transaction?.id;
        const identifier = payload.transaction?.identifier;
        const event = payload.event;

        if (!transactionId) {
          return Response.json({ error: "missing_transaction_id" }, { status: 400 });
        }

        // Idempotência: usa identifier + event para diferenciar repetições.
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
