import { createFileRoute } from "@tanstack/react-router";
import {
  getPagouApiBase,
  getPublicBaseUrl,
  getWebhookNotifyUrl,
  normalizePagouApiKey,
  pagouEnvMismatchHints,
  probePagouTransactionsList,
} from "@/lib/pagou.server";

export const Route = createFileRoute("/api/pagou/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const key = normalizePagouApiKey(process.env.PAGOU_API_KEY);
        const hasKey = Boolean(key && key.length >= 12);
        const url = new URL(request.url);
        const probe = url.searchParams.get("probe") === "1" && Boolean(key);

        let probeListTransactions: Awaited<
          ReturnType<typeof probePagouTransactionsList>
        > | null = null;
        if (probe && key) {
          probeListTransactions = await probePagouTransactionsList(key);
        }

        const envHints = pagouEnvMismatchHints(key);

        return Response.json({
          apiKeyLooksConfigured: hasKey,
          envMismatchHints: envHints.length ? envHints : undefined,
          authMode:
            (process.env.PAGOU_AUTH_MODE ?? "bearer").toLowerCase().trim() ||
            "bearer",
          pagouEnv:
            process.env.PAGOU_ENV === "production" ? "production" : "sandbox",
          pagouApiBase: getPagouApiBase(),
          publicBaseUrl: getPublicBaseUrl() ?? null,
          notifyUrlFromEnv: getWebhookNotifyUrl() ?? null,
          notifyWebhookPath: "/api/webhooks/pagou",
          probeListTransactions,
        });
      },
    },
  },
});
