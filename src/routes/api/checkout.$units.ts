import { createFileRoute } from "@tanstack/react-router";
import type { OfferUnits } from "@/lib/checkout";
import { getPagouCheckoutUrl } from "@/lib/checkout";

const VALID: OfferUnits[] = ["1", "2", "3", "5"];

export const Route = createFileRoute("/api/checkout/$units")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const units = params.units;
        if (!(VALID as string[]).includes(units)) {
          return Response.json({ error: "Oferta inválida" }, { status: 400 });
        }
        const target = getPagouCheckoutUrl(units as OfferUnits);
        if (!target) {
          return Response.json(
            {
              error:
                "Checkout Pagou não configurado. Defina a variável PAGOU_CHECKOUT_* correspondente no ambiente.",
            },
            { status: 503 },
          );
        }
        return Response.redirect(target, 302);
      },
    },
  },
});
