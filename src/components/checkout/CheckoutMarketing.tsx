"use client";

import { useEffect, useMemo, useState } from "react";
import type { Offer } from "@/lib/offers";

type Phase = "data" | "payment";

type Props = {
  phase: Phase;
};

/** Etapas estilo checkout clássico: dados → entrega (info) → pagamento Pix */
export function CheckoutStepIndicators({ phase }: Props) {
  const steps = useMemo(
    () =>
      [
        {
          key: "data",
          title: "Dados pessoais",
          hint: "Nome, e-mail e CPF",
        },
        {
          key: "delivery",
          title: "Entrega",
          hint: "Frete grátis Brasil",
        },
        {
          key: "pay",
          title: "Pagamento",
          hint: "Pix instantâneo",
        },
      ] as const,
    [],
  );

  function statusFor(index: number): "done" | "current" | "todo" {
    if (phase === "payment") {
      if (index <= 1) return "done";
      return "current";
    }
    if (index === 0) return "current";
    return "todo";
  }

  return (
    <nav aria-label="Etapas do checkout" className="w-full">
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-between sm:gap-2">
        {steps.map((step, i) => {
          const st = statusFor(i);
          const isDone = st === "done";
          const isCurrent = st === "current";

          return (
            <li
              key={step.key}
              className={`relative flex flex-1 flex-col rounded-xl border px-3 py-3 text-center sm:min-h-[5.25rem] sm:px-2 sm:py-3 ${
                isCurrent
                  ? "border-gh-gold bg-gh-gold/10 shadow-[0_0_24px_rgba(232,197,71,0.12)]"
                  : isDone
                    ? "border-green-600/40 bg-green-950/25"
                    : "border-white/10 bg-black/30 opacity-70"
              }`}
            >
              <span
                className={`mx-auto flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isDone
                    ? "bg-green-600 text-white"
                    : isCurrent
                      ? "bg-gh-gold text-black"
                      : "border border-white/25 bg-black/50 text-gh-muted"
                }`}
                aria-hidden
              >
                {isDone ? "✓" : i + 1}
              </span>
              <span className="mt-2 font-display text-[11px] uppercase tracking-wide text-white sm:text-xs">
                {step.title}
              </span>
              <span className="mt-0.5 text-[10px] leading-tight text-gh-muted sm:text-[11px]">
                {step.hint}
              </span>
            </li>
          );
        })}
      </ol>
      {phase === "payment" ? (
        <p className="mt-3 text-center text-[11px] text-gh-muted">
          Endereço de envio e rastreio seguem por e-mail após a confirmação do
          Pix (frete grátis, até 8 dias úteis).
        </p>
      ) : null}
    </nav>
  );
}

type BannerProps = {
  offer: Offer;
};

/** Headline + faixa de urgência + temporizador (sessão). */
export function CheckoutUrgencyBanner({ offer }: BannerProps) {
  const initialSeconds = useMemo(() => 14 * 60 + 23 + (offer.units.charCodeAt(0) % 120), [offer.units]);

  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? initialSeconds : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [initialSeconds]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const qtyLabel =
    offer.units === "1"
      ? "1 pote"
      : `${offer.units} potes`;

  return (
    <div className="space-y-4">
      <div className="text-center lg:text-left">
        <h2 className="font-display text-2xl uppercase leading-tight text-white sm:text-3xl">
          Falta pouco para garantir o seu GHDROL
        </h2>
        <p className="mt-2 text-sm text-gh-muted">
          Você está reservando{" "}
          <strong className="text-gh-gold-bright">{offer.label}</strong> (
          <span className="text-white">{qtyLabel}</span>
          ) no valor promocional à vista no Pix.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gh-red/50 bg-gradient-to-r from-gh-red/90 via-black to-gh-red/80 shadow-lg shadow-black/40">
        <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row sm:px-5">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-white sm:text-left">
            Oferta do lote · não perca o preço bloqueado nesta página
          </p>
          <div
            className="flex shrink-0 items-center gap-2 rounded-lg bg-black/50 px-4 py-2 font-mono text-lg tabular-nums text-gh-gold-bright ring-1 ring-gh-gold/40"
            role="timer"
            aria-live="polite"
            aria-label={`Tempo restante na oferta ${mm} minutos ${ss} segundos`}
          >
            <span className="text-[10px] font-sans uppercase tracking-wider text-gh-muted">
              Expira em
            </span>
            <span>
              {mm}:{ss}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
