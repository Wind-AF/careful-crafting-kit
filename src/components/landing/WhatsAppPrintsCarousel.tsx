"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { SectionTitle } from "./SectionTitle";

/** Troque por PNG/JPG reais em public/whatsapp/ ou altere caminhos aqui. */
const PRINTS = [
  {
    src: "/whatsapp/print-1.svg",
    alt: "Avaliação — conversa no WhatsApp sobre energia no treino",
  },
  {
    src: "/whatsapp/print-2.svg",
    alt: "Avaliação — resultado em poucas semanas",
  },
  {
    src: "/whatsapp/print-3.svg",
    alt: "Avaliação — recompra e indicação",
  },
  {
    src: "/whatsapp/print-4.svg",
    alt: "Avaliação — entrega e suporte",
  },
] as const;

export function WhatsAppPrintsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = useCallback((i: number) => {
    const root = scrollRef.current;
    if (!root) return;
    const slide = root.children[i] as HTMLElement | undefined;
    if (!slide) return;
    slide.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const updateActive = () => {
      const slides = Array.from(root.children) as HTMLElement[];
      const cr = root.getBoundingClientRect();
      let best = 0;
      let bestOverlap = 0;
      slides.forEach((slide, i) => {
        const r = slide.getBoundingClientRect();
        const overlap =
          Math.min(r.right, cr.right) - Math.max(r.left, cr.left);
        const visible = overlap > 0 ? overlap / Math.min(r.width, cr.width) : 0;
        if (visible > bestOverlap) {
          bestOverlap = visible;
          best = i;
        }
      });
      setActive(best);
    };

    updateActive();
    root.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      root.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  return (
    <section className="border-t border-white/10 bg-gh-surface py-12 sm:py-16">
      <div className="container-page">
        <SectionTitle as="h2" subtitle="Via WhatsApp">
          Avaliações
        </SectionTitle>
        <p className="mx-auto mb-8 max-w-xl text-center text-sm text-gh-muted sm:mb-10 sm:max-w-2xl">
          Conversas reais do canal oficial com clientes. Ilustrativo; nomes e
          dados podem ter sido ocultados por privacidade.
        </p>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="region"
            aria-roledescription="carrossel"
            aria-label="Carrossel de avaliações no WhatsApp"
          >
            {PRINTS.map((p, i) => (
              <div
                key={p.src}
                data-index={i}
                className="snap-center snap-always shrink-0 first:pl-[max(0px,calc(50%-11rem))] last:pr-[max(0px,calc(50%-11rem))] sm:first:pl-[max(0px,calc(50%-13rem))] sm:last:pr-[max(0px,calc(50%-13rem))]"
              >
                <div className="relative w-[min(22rem,calc(100vw-2.5rem))] rounded-2xl border border-white/15 bg-black/40 shadow-[0_12px_48px_rgba(0,0,0,0.45)] sm:w-[26rem]">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={360}
                    height={640}
                    sizes="(max-width: 640px) min(352px, 100vw) 416px"
                    className="block h-auto w-full rounded-2xl"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-center justify-center gap-2">
            {PRINTS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                className={`h-2 rounded-full transition-all ${active === i ? "w-8 bg-gh-gold" : "w-2 bg-white/25 hover:bg-white/40"}`}
                aria-label={`Ir para a avaliação ${i + 1}`}
                aria-current={active === i ? true : undefined}
              />
            ))}
          </div>

          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollToIndex(Math.max(0, active - 1))}
              className="rounded-lg border border-white/15 bg-black/40 px-4 py-2 text-sm text-white transition hover:border-gh-gold/50 hover:bg-black/60"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() =>
                scrollToIndex(Math.min(PRINTS.length - 1, active + 1))
              }
              className="rounded-lg border border-white/15 bg-black/40 px-4 py-2 text-sm text-white transition hover:border-gh-gold/50 hover:bg-black/60"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
