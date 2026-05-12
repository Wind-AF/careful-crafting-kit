import { createServerFn } from "@tanstack/react-start";
import { normalizePagouApiKey } from "./pagou.server";

export const getPagouConfigStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    return {
      hasApiKeyConfigured: Boolean(
        normalizePagouApiKey(process.env.PAGOU_API_KEY),
      ),
    };
  },
);
