import { createFileRoute, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckoutPageChrome } from "@/components/checkout/CheckoutPageChrome";
import { CheckoutFunnel } from "@/components/checkout/CheckoutFunnel";
import type { OfferUnits } from "@/lib/checkout";
import { getPagouCheckoutUrl } from "@/lib/checkout";
import { getOfferByUnits } from "@/lib/offers";
import { getPagouConfigStatus } from "@/lib/pagou-config.functions";

const VALID = new Set<OfferUnits>(["1", "2", "3", "5"]);

export const Route = createFileRoute("/checkout/$units")({
  component: CheckoutPage,
  head: ({ params }) => {
    const offer = VALID.has(params.units as OfferUnits)
      ? getOfferByUnits(params.units as OfferUnits)
      : undefined;
    return {
      meta: [
        {
          title: offer
            ? `Checkout — ${offer.label} | GHDROL`
            : "Checkout | GHDROL",
        },
        offer
          ? {
              name: "description",
              content: `Finalize no Pix: ${offer.label}, ${offer.cashPrice} à vista. Frete grátis.`,
            }
          : { name: "description", content: "Checkout GHDROL" },
      ],
    };
  },
});

function CheckoutPage() {
  const { units } = Route.useParams();
  if (!VALID.has(units as OfferUnits)) throw notFound();

  const offer = getOfferByUnits(units as OfferUnits);
  if (!offer) throw notFound();

  const fetchConfig = useServerFn(getPagouConfigStatus);
  const { data } = useQuery({
    queryKey: ["pagou-config"],
    queryFn: () => fetchConfig({}),
  });

  return (
    <CheckoutPageChrome offer={offer}>
      <CheckoutFunnel
        offer={offer}
        hasApiKeyConfigured={Boolean(data?.hasApiKeyConfigured)}
        hostedCheckoutUrl={getPagouCheckoutUrl(offer.units)}
      />
    </CheckoutPageChrome>
  );
}
