import { createServerFn } from "@tanstack/react-start";
import { hasKirvuspayConfigured } from "./kirvuspay.server";

export const getPagouConfigStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    return {
      hasApiKeyConfigured: hasKirvuspayConfigured(),
    };
  },
);
