import { createFileRoute } from "@tanstack/react-router";
import { hasKirvuspayConfigured } from "@/lib/kirvuspay.server";
import { timingSafeEqualStr } from "@/lib/timing-safe.server";

/**
 * Endpoint de diagnóstico. Protegido por ADMIN_STATUS_TOKEN
 * (header `x-admin-token` ou `Authorization: Bearer ...`).
 * Não dispara chamadas externas para o gateway.
 */
export const Route = createFileRoute("/api/pagou/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const expected = process.env.ADMIN_STATUS_TOKEN?.trim();
        if (!expected) {
          return Response.json(
            { error: "status_endpoint_disabled" },
            { status: 503 },
          );
        }

        const auth = request.headers.get("authorization") ?? "";
        const provided =
          request.headers.get("x-admin-token")?.trim() ??
          (auth.toLowerCase().startsWith("bearer ")
            ? auth.slice(7).trim()
            : "");

        if (provided.length !== expected.length || provided !== expected) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }

        return Response.json({
          gatewayConfigured: hasKirvuspayConfigured(),
          webhookKirvuspayConfigured: Boolean(
            process.env.KIRVUSPAY_WEBHOOK_TOKEN?.trim(),
          ),
          webhookPagouConfigured: Boolean(
            process.env.PAGOU_WEBHOOK_SECRET?.trim(),
          ),
        });
      },
    },
  },
});
