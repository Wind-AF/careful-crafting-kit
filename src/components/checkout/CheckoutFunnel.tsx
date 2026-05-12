"use client";

import { Suspense, useState } from "react";
import { PixCheckoutForm } from "@/components/checkout/PixCheckoutForm";
import {
  CheckoutStepIndicators,
  CheckoutUrgencyBanner,
} from "@/components/checkout/CheckoutMarketing";
import type { Offer } from "@/lib/offers";

type Phase = "data" | "payment";

type Props = {
  offer: Offer;
  hasApiKeyConfigured: boolean;
  hostedCheckoutUrl?: string | null;
};

/** Coluna direita completa: urgência, etapas, resumo e Pagou. */
export function CheckoutFunnel({
  offer,
  hasApiKeyConfigured,
  hostedCheckoutUrl,
}: Props) {
  const [phase, setPhase] = useState<Phase>("data");

  return (
    <div className="space-y-6">
      <CheckoutUrgencyBanner offer={offer} />
      <CheckoutStepIndicators phase={phase} />

      <div className="rounded-2xl border border-gh-gold/35 bg-gradient-to-b from-gh-surface/95 to-black/90 p-6 shadow-[0_16px_48px_rgba(0,0,0,0.45)] sm:p-7">
        <h3 className="border-b border-white/10 pb-4 text-center font-display text-xl uppercase tracking-wide text-white">
          Resumo do pedido
        </h3>

        <div className="mt-5 space-y-1 text-center">
          <p className="text-[11px] uppercase tracking-wider text-gh-muted">
            Promoção por tempo limitado
          </p>
          <p className="text-sm text-gh-muted">
            De{" "}
            <span className="line-through opacity-80">{offer.crossedPrice}</span>
          </p>
          <p className="mt-3 text-xs uppercase tracking-wide text-gh-muted">
            Parcelamento referência 12x
          </p>
          <p className="font-display text-4xl text-gh-gold-bright sm:text-5xl">
            {offer.installments}
          </p>
          <p className="mt-2 text-sm text-white">
            ou{" "}
            <strong className="text-gh-gold-bright">{offer.cashPrice}</strong> à
            vista no Pix
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gh-gold">
            Frete grátis · Todo o Brasil
          </p>
        </div>

        <div className="mt-6">
          <Suspense
            fallback={
              <div
                className="h-48 animate-pulse rounded-xl bg-white/5"
                aria-busy="true"
              />
            }
          >
            <PixCheckoutForm
              offer={offer}
              hasApiKeyConfigured={hasApiKeyConfigured}
              hostedCheckoutUrl={hostedCheckoutUrl}
              variant="embedded"
              onPixReady={() => setPhase("payment")}
            />
          </Suspense>
        </div>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-gh-muted">
        Ao continuar, concorda com a compra e políticas do canal. Suporte na
        página inicial: perguntas frequentes e WhatsApp.
      </p>
    </div>
  );
}
