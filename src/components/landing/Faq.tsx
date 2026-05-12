"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/data/faq-items";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="perguntas-frequentes"
      className="border-t border-white/10 bg-gh-surface py-12 sm:py-16"
    >
      <div className="container-page">
        <h2 className="font-display text-center text-balance text-3xl uppercase text-gh-gold-bright sm:text-4xl md:text-5xl">
          Perguntas frequentes
        </h2>
        <div className="mx-auto mt-10 max-w-xl divide-y divide-white/10 rounded-lg border border-white/10 bg-black/40 sm:max-w-3xl">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="px-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold text-gh-text sm:text-lg"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="shrink-0 text-gh-gold">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen ? (
                  <p className="pb-4 text-sm leading-relaxed text-gh-muted sm:text-base">
                    {item.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
