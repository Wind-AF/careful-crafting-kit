import { createFileRoute } from "@tanstack/react-router";
import {
  isWebhookEventProcessed,
  markOrderPaidFromWebhook,
} from "@/lib/order-store.server";

export const Route = createFileRoute("/api/webhooks/pagou")({
  server: {
    handlers: {
      POST: async ({ request }) => {
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
