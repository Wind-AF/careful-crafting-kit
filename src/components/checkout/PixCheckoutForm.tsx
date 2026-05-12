"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { digitsOnly, isValidCPFDigits } from "@/lib/cpf";
import type { Offer } from "@/lib/offers";
import { TRACKING_QUERY_KEYS } from "@/lib/tracking";

type Props = {
  offer: Offer;
  hasApiKeyConfigured: boolean;
  /** URL de checkout hospedado Pagou (só preenchida no servidor). */
  hostedCheckoutUrl?: string | null;
  /** Dentro do cartão "Resumo" do CheckoutFunnel (sem borda duplicada). */
  variant?: "standalone" | "embedded";
  /** Chamado quando o QR Pix fica disponível (avança etapas visuais). */
  onPixReady?: () => void;
};

type PixPayload = {
  id: string;
  status: string;
  pix: { qr_code: string; expiration_date: string | null };
  external_ref: string;
};

export function PixCheckoutForm({
  offer,
  hasApiKeyConfigured,
  hostedCheckoutUrl,
  variant = "standalone",
  onPixReady,
}: Props) {
  const embed = variant === "embedded";
  const sp = useSearchParams();
  const tracking = useMemo(() => {
    const out: Record<string, string> = {};
    for (const k of TRACKING_QUERY_KEYS) {
      const v = sp.get(k);
      if (v) out[k] = v;
    }
    return Object.keys(out).length ? out : undefined;
  }, [sp]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpfInput, setCpfInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<PixPayload | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cpfDigits = digitsOnly(cpfInput);
    if (cpfDigits.length !== 11) {
      setError("CPF precisa ter 11 dígitos.");
      return;
    }
    if (!isValidCPFDigits(cpfDigits)) {
      setError("CPF inválido — verifique os dígitos antes de gerar o Pix.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pagou/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          units: offer.units,
          name,
          email,
          document: cpfInput,
          ...(tracking ? { tracking } : {}),
        }),
      });
      const data = (await res.json().catch(() => null)) as
        | PixPayload
        | { detail?: string; error?: string; errors?: { message?: string }[] }
        | null;

      if (!res.ok) {
        const d = data as { detail?: string; error?: string; errors?: { message?: string }[] };
        const msg =
          d?.detail ||
          d?.error ||
          d?.errors?.[0]?.message ||
          `Erro ${res.status} ao criar Pix`;
        setError(msg);
        return;
      }

      setPix(data as PixPayload);
      onPixReady?.();
    } catch {
      setError("Falha de rede. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (pix) {
    return (
      <div
        className={
          embed
            ? "rounded-xl border border-gh-gold/40 bg-black/40 p-5 text-center sm:p-6"
            : "rounded-xl border border-gh-gold/40 bg-gh-surface/90 p-6 text-center"
        }
      >
        <h2 className="font-display text-2xl uppercase text-gh-gold-bright">
          Pague com Pix
        </h2>
        <p className="mt-2 text-sm text-gh-muted">
          Escaneie o QR no app do banco ou copie o código Pix abaixo.
        </p>
        <div className="mx-auto mt-6 flex justify-center rounded-lg bg-white p-4">
          <QRCode value={pix.pix.qr_code} size={200} />
        </div>
        <label className="mt-6 block text-left text-xs uppercase tracking-wide text-gh-muted">
          Código copia e cola
        </label>
        <textarea
          readOnly
          className="mt-1 h-24 w-full resize-none rounded border border-white/20 bg-black/50 p-3 font-mono text-[11px] text-gh-text"
          value={pix.pix.qr_code}
          onFocus={(e) => e.target.select()}
        />
        {pix.pix.expiration_date ? (
          <p className="mt-2 text-xs text-gh-muted">
            Expira em {new Date(pix.pix.expiration_date).toLocaleString("pt-BR")}
          </p>
        ) : null}
        <p className="mt-4 text-xs text-gh-muted">
          Pedido: {pix.external_ref} · Status: {pix.status}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-gh-gold underline"
        >
          Voltar à página inicial
        </Link>
      </div>
    );
  }

  if (!hasApiKeyConfigured) {
    return (
      <div
        className={
          embed
            ? "rounded-xl border border-yellow-700/40 bg-yellow-950/25 p-5 text-sm text-gh-muted sm:p-6"
            : "rounded-xl border border-yellow-700/50 bg-yellow-950/20 p-6 text-sm text-gh-muted"
        }
      >
        <p>
          <strong className="text-white">Pagou API não configurada.</strong>{" "}
          Defina <code className="text-gh-gold">PAGOU_API_KEY</code> no ambiente
          (Vercel ou <code className="text-gh-gold">.env.local</code>) para gerar
          Pix por aqui.
        </p>
        {hostedCheckoutUrl ? (
          <a
            href={hostedCheckoutUrl}
            className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-gradient-to-b from-gh-gold-bright to-gh-gold py-3 text-center font-bold uppercase text-black"
          >
            Ir ao checkout Pagou (link direto)
          </a>
        ) : (
          <p className="mt-4">
            Ou preencha as variáveis{" "}
            <code className="text-gh-gold">PAGOU_CHECKOUT_*_UNIT_URL</code> e use
            o link direto.
          </p>
        )}
        <Link
          href={`/api/checkout/${offer.units}`}
          className="mt-4 block text-center text-gh-gold underline"
        >
          Tentar redirecionamento interno (/api/checkout)
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        embed
          ? "space-y-4 border-t border-white/10 pt-6"
          : "space-y-4 rounded-xl border border-white/10 bg-gh-surface/80 p-6"
      }
    >
      <h2 className="font-display text-xl uppercase text-white sm:text-2xl">
        Seus dados
      </h2>
      <p className="text-sm text-gh-muted">
        {embed ? (
          <>
            Informações para gerar o Pix via{" "}
            <strong className="text-white/90">Pagou</strong>.
          </>
        ) : (
          <>
            Necessários para emitir o Pix (Pagou v2).{" "}
            <strong className="text-white">{offer.cashPrice}</strong> ·{" "}
            {offer.label}
          </>
        )}
      </p>
      <div>
        <label className="block text-xs uppercase text-gh-muted">
          Nome completo
        </label>
        <input
          required
          className="mt-1 w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-gh-text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </div>
      <div>
        <label className="block text-xs uppercase text-gh-muted">E-mail</label>
        <input
          required
          type="email"
          className="mt-1 w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-gh-text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <label className="block text-xs uppercase text-gh-muted">CPF</label>
        <input
          required
          inputMode="numeric"
          className="mt-1 w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-gh-text"
          value={cpfInput}
          onChange={(e) => setCpfInput(e.target.value)}
          autoComplete="off"
          placeholder="000.000.000-00"
        />
        <p className="mt-1 text-xs text-gh-muted">
          Use um CPF válido com{" "}
          <strong className="text-white/90">11 dígitos</strong> (pontuação é
          ignorada).
        </p>
      </div>
      {error ? (
        <p className="rounded bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-gradient-to-b from-gh-gold-bright to-gh-gold py-3 text-center font-bold uppercase text-black disabled:opacity-50"
      >
        {loading ? "Gerando Pix…" : "Gerar QR Pix"}
      </button>
    </form>
  );
}
