import { Link } from "@tanstack/react-router";
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
  const tracking = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const sp = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    for (const k of TRACKING_QUERY_KEYS) {
      const v = sp.get(k);
      if (v) out[k] = v;
    }
    return Object.keys(out).length ? out : undefined;
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpfInput, setCpfInput] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<PixPayload | null>(null);
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function formatCpf(v: string) {
    const d = digitsOnly(v).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }

  function formatCep(v: string) {
    const d = digitsOnly(v).slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  }

  async function lookupCep(value: string) {
    const d = digitsOnly(value);
    if (d.length !== 8) return;
    setCepLoading(true);
    setCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const data = (await res.json()) as {
        erro?: boolean;
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
      };
      if (data.erro) {
        setCepError("CEP não encontrado.");
        return;
      }
      setStreet(data.logradouro ?? "");
      setDistrict(data.bairro ?? "");
      setCity(data.localidade ?? "");
      setUf((data.uf ?? "").toUpperCase());
    } catch {
      setCepError("Não foi possível buscar o CEP. Preencha manualmente.");
    } finally {
      setCepLoading(false);
    }
  }

  function formatPhone(v: string) {
    const d = digitsOnly(v).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : d;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10)
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  const cpfDigits = digitsOnly(cpfInput);
  const phoneDigits = digitsOnly(phone);
  const cepDigits = digitsOnly(cep);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const nameValid = name.trim().length >= 3;
  const cpfValid = cpfDigits.length === 11 && isValidCPFDigits(cpfDigits);
  const phoneValid = phoneDigits.length === 10 || phoneDigits.length === 11;
  const cepValid = cepDigits.length === 8;
  const streetValid = street.trim().length >= 3;
  const numberValid = number.trim().length >= 1;
  const districtValid = district.trim().length >= 2;
  const cityValid = city.trim().length >= 2;
  const ufValid = /^[A-Za-z]{2}$/.test(uf.trim());
  const addressValid =
    cepValid && streetValid && numberValid && districtValid && cityValid && ufValid;
  const formValid =
    nameValid && emailValid && cpfValid && phoneValid && addressValid;

  async function handleCopyPix() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.pix.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = pix.pix.qr_code;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
      document.body.removeChild(ta);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTouched({ name: true, email: true, cpf: true, phone: true });
    if (!formValid) {
      if (!nameValid) setError("Informe o nome completo.");
      else if (!emailValid) setError("E-mail inválido.");
      else if (!cpfValid) setError("CPF inválido — confira os 11 dígitos.");
      else if (!phoneValid)
        setError("Telefone deve ter DDD + número (10 ou 11 dígitos).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pagou/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          units: offer.units,
          name: name.trim(),
          email: email.trim(),
          document: cpfDigits,
          phone: phoneDigits,
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
            ? "rounded-xl border border-gh-gold/40 bg-black/40 p-4 text-center sm:p-6"
            : "rounded-xl border border-gh-gold/40 bg-gh-surface/90 p-4 text-center sm:p-6"
        }
      >
        <h2 className="font-display text-2xl uppercase text-gh-gold-bright">
          Pague com Pix
        </h2>
        <p className="mt-2 text-sm text-gh-muted">
          Escaneie o QR no app do banco ou copie o código Pix abaixo.
        </p>
        <div className="mx-auto mt-6 flex w-full max-w-[260px] justify-center rounded-lg bg-white p-3 sm:max-w-[280px] sm:p-4">
          <div className="aspect-square w-full">
            <QRCode
              value={pix.pix.qr_code}
              size={256}
              style={{ height: "100%", width: "100%" }}
              viewBox="0 0 256 256"
            />
          </div>
        </div>
        <label className="mt-6 block text-left text-xs uppercase tracking-wide text-gh-muted">
          Código copia e cola
        </label>
        <div className="mt-1 max-h-28 overflow-y-auto rounded border border-white/20 bg-black/50 p-3 text-left font-mono text-xs leading-relaxed text-gh-text break-all">
          {pix.pix.qr_code}
        </div>
        <button
          type="button"
          onClick={handleCopyPix}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-gradient-to-b from-gh-gold-bright to-gh-gold py-3 text-center text-base font-bold uppercase text-black transition-opacity hover:opacity-90"
        >
          {copied ? "Código copiado ✓" : "Copiar código Pix"}
        </button>
        {pix.pix.expiration_date ? (
          <p className="mt-2 text-xs text-gh-muted">
            Expira em {new Date(pix.pix.expiration_date).toLocaleString("pt-BR")}
          </p>
        ) : null}
        <p className="mt-4 text-xs text-gh-muted">
          Pedido: {pix.external_ref} · Status: {pix.status}
        </p>
        <Link
          to="/"
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
          <strong className="text-white">Gateway Kirvuspay não configurado.</strong>{" "}
          Defina <code className="text-gh-gold">KIRVUSPAY_PUBLIC_KEY</code> e{" "}
          <code className="text-gh-gold">KIRVUSPAY_SECRET_KEY</code> no ambiente
          para gerar Pix por aqui.
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
        <a
          href={`/api/checkout/${offer.units}`}
          className="mt-4 block text-center text-gh-gold underline"
        >
          Tentar redirecionamento interno (/api/checkout)
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={
        embed
          ? "space-y-4 border-t border-white/10 pt-6"
          : "space-y-4 rounded-xl border border-white/10 bg-gh-surface/80 p-4 sm:p-6"
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
          className="mt-1 w-full rounded border border-white/20 bg-black/40 px-3 py-3 text-base text-gh-text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          autoComplete="name"
        />
        {touched.name && !nameValid ? (
          <p className="mt-1 text-xs text-red-300">Informe seu nome completo.</p>
        ) : null}
      </div>
      <div>
        <label className="block text-xs uppercase text-gh-muted">E-mail</label>
        <input
          required
          type="email"
          inputMode="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="mt-1 w-full rounded border border-white/20 bg-black/40 px-3 py-3 text-base text-gh-text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          autoComplete="email"
        />
        {touched.email && !emailValid ? (
          <p className="mt-1 text-xs text-red-300">E-mail inválido.</p>
        ) : null}
      </div>
      <div>
        <label className="block text-xs uppercase text-gh-muted">Celular (com DDD)</label>
        <input
          required
          inputMode="tel"
          className="mt-1 w-full rounded border border-white/20 bg-black/40 px-3 py-3 text-base text-gh-text"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          autoComplete="tel"
          placeholder="(11) 91234-5678"
          maxLength={16}
        />
        {touched.phone && !phoneValid ? (
          <p className="mt-1 text-xs text-red-300">
            Telefone deve ter DDD + número (10 ou 11 dígitos).
          </p>
        ) : null}
      </div>
      <div>
        <label className="block text-xs uppercase text-gh-muted">CPF</label>
        <input
          required
          inputMode="numeric"
          className="mt-1 w-full rounded border border-white/20 bg-black/40 px-3 py-3 text-base text-gh-text"
          value={cpfInput}
          onChange={(e) => setCpfInput(formatCpf(e.target.value))}
          onBlur={() => setTouched((t) => ({ ...t, cpf: true }))}
          autoComplete="off"
          placeholder="000.000.000-00"
          maxLength={14}
        />
        {touched.cpf && !cpfValid ? (
          <p className="mt-1 text-xs text-red-300">
            CPF inválido — confira os 11 dígitos.
          </p>
        ) : (
          <p className="mt-1 text-xs text-gh-muted">
            Use um CPF válido com 11 dígitos (a pontuação é preenchida automaticamente).
          </p>
        )}
      </div>
      {error ? (
        <p className="rounded bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading || !formValid}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-gradient-to-b from-gh-gold-bright to-gh-gold py-3 text-center text-base font-bold uppercase text-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Gerando Pix…" : "Gerar QR Pix"}
      </button>
      {!formValid ? (
        <p className="text-center text-[11px] text-gh-muted">
          Preencha todos os campos corretamente para liberar o botão.
        </p>
      ) : null}
    </form>
  );
}
