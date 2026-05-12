import Image from "next/image";
import { OFFERS } from "@/lib/offers";
import { CtaButton } from "./CtaButton";
import { SectionTitle } from "./SectionTitle";
import { TrackedCheckoutLink } from "./TrackedCheckoutLink";

export function Pricing() {
  return (
    <section id="oferta" className="scroll-mt-24 py-12 sm:py-16">
      <div className="container-page">
        <SectionTitle as="h2" subtitle="Promoção por tempo limitado">
          Escolha seu kit GHDROL
        </SectionTitle>

        <div className="mx-auto max-w-3xl rounded-xl border border-gh-gold/30 bg-gh-surface/80 p-4 text-center sm:p-6">
          <p className="text-sm text-gh-muted">
            Promoção com até <strong className="text-white">40% OFF</strong> neste
            lote — frete grátis para todo o Brasil e suporte pelo WhatsApp.
          </p>
          <p className="mt-2 text-xs uppercase tracking-wider text-gh-gold">
            Oportunidade única — sujeita à disponibilidade de estoque
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-6 lg:grid lg:grid-cols-2 lg:gap-6">
          {OFFERS.map((o) => (
            <article
              key={o.units}
              className={`relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-gradient-to-b from-gh-surface to-black/80 p-4 sm:p-6 lg:max-w-none ${
                o.badge === "mais vendido!"
                  ? "border-gh-gold shadow-[0_0_40px_rgba(201,162,39,0.2)]"
                  : "border-white/10"
              }`}
            >
              {o.badge ? (
                <span className="absolute right-4 top-4 rounded-full bg-gh-red px-3 py-1 text-xs font-bold uppercase text-white">
                  {o.badge}
                </span>
              ) : null}
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                <Image
                  src={o.image}
                  alt={o.imageAlt}
                  width={180}
                  height={180}
                  className="h-40 w-40 shrink-0 object-contain"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display text-2xl uppercase text-white">
                    {o.label}
                  </h3>
                  <p className="mt-1 text-sm text-gh-gold">frete grátis Brasil</p>
                  <p className="text-sm text-gh-muted">
                    suporte e rastreio no e-mail
                  </p>
                  <p className="mt-3 text-sm text-gh-muted">
                    <span className="line-through">{o.crossedPrice}</span>
                  </p>
                  <p className="text-sm text-gh-muted">por apenas 12x de</p>
                  <p className="font-display text-3xl text-gh-gold-bright sm:text-4xl">
                    {o.installments}
                  </p>
                  <p className="text-sm text-white">
                    ou <strong>{o.cashPrice}</strong> à vista
                  </p>
                </div>
              </div>
              <TrackedCheckoutLink
                units={o.units}
                className="mt-6 inline-flex w-full max-w-sm items-center justify-center self-center rounded-md bg-gradient-to-b from-gh-gold-bright to-gh-gold py-3 text-center text-sm font-bold uppercase tracking-wide text-black transition hover:brightness-110 sm:max-w-none sm:self-stretch sm:text-base"
              >
                Quero comprar este
              </TrackedCheckoutLink>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <CtaButton href="#oferta">Quero GHDROL agora</CtaButton>
        </div>
      </div>
    </section>
  );
}
