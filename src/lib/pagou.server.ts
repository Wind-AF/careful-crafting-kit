import type { Offer } from "./offers";

export function normalizePagouApiKey(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  let k = raw.trim();
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1).trim();
  }
  return k.length ? k : undefined;
}

/** URL pública do site (para notify_url dos webhooks Pagou). */
export function getPublicBaseUrl(): string | undefined {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const pagouOnly = process.env.PAGOU_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (pagouOnly) return pagouOnly;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return undefined;
}

export function getWebhookNotifyUrl(): string | undefined {
  const base = getPublicBaseUrl();
  if (!base) return undefined;
  return `${base}/api/webhooks/pagou`;
}

/**
 * notify_url para a Pagou: env explícito primeiro; senão deriva do pedido (Host /
 * X-Forwarded-*), útil na Vercel sem NEXT_PUBLIC_APP_URL.
 */
export function resolveWebhookNotifyUrl(request?: Request): string | undefined {
  const omit =
    process.env.PAGOU_OMIT_NOTIFY_URL === "1" ||
    process.env.PAGOU_OMIT_NOTIFY_URL === "true";
  if (omit) return undefined;

  const fromEnv = getWebhookNotifyUrl();
  if (fromEnv) return fromEnv;

  if (!request) return undefined;

  const rawHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const host = rawHost.split(",")[0]?.trim().replace(/^https?:\/\//, "");
  if (!host) return undefined;

  let proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "";
  if (!proto) proto = host.includes("localhost") ? "http" : "https";

  return `${proto}://${host}/api/webhooks/pagou`;
}

function pickPixField(
  pix: unknown,
  snake: string,
  camel: string,
): string | undefined {
  if (!pix || typeof pix !== "object") return undefined;
  const o = pix as Record<string, unknown>;
  const a = o[snake];
  const b = o[camel];
  if (typeof a === "string" && a.length > 0) return a;
  if (typeof b === "string" && b.length > 0) return b;
  return undefined;
}

function pickExpiration(pix: unknown): string | null | undefined {
  if (!pix || typeof pix !== "object") return undefined;
  const o = pix as Record<string, unknown>;
  if ("expiration_date" in o && o.expiration_date === null) return null;
  if ("expirationDate" in o && o.expirationDate === null) return null;
  const a = o.expiration_date;
  const b = o.expirationDate;
  if (typeof a === "string" && a.length > 0) return a;
  if (typeof b === "string" && b.length > 0) return b;
  return undefined;
}

export type CreatePixInput = {
  offer: Offer;
  buyer: { name: string; email: string; cpfDigits: string };
};

export type CreatePixResult =
  | {
      ok: true;
      id: string;
      status: string;
      qrCode: string;
      expirationDate: string | null;
      externalRef: string;
    }
  | { ok: false; status: number; body: unknown };

/** Extrai mensagem legível dos erros Pagou (vários formatos). */
export function extractPagouDetail(json: unknown): string | undefined {
  if (!json || typeof json !== "object" || Array.isArray(json)) return undefined;
  const j = json as Record<string, unknown>;
  const pick = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : undefined;
  const fromMsg =
    pick(j.message) ?? pick(j.error) ?? pick(j.detail) ?? pick(j.title);
  if (fromMsg) return fromMsg;
  const errs = j.errors;
  if (Array.isArray(errs) && errs[0] && typeof errs[0] === "object") {
    const e = errs[0] as Record<string, unknown>;
    const m = pick(e.message);
    const field = typeof e.field === "string" ? e.field : "";
    if (m) return field ? `${field}: ${m}` : m;
  }
  return undefined;
}

export function getPagouApiBase(): string {
  return process.env.PAGOU_ENV === "production"
    ? "https://api.pagou.ai"
    : "https://api-sandbox.pagou.ai";
}

/** Detalhe legível para falhas de fetch no Node (Undici), inclui `cause` e errno. */
export function formatNodeFetchError(err: unknown): string {
  const parts: string[] = [];
  let cur: unknown = err;
  let depth = 0;
  while (cur && depth < 10) {
    if (cur instanceof Error) {
      parts.push(cur.message);
      const ne = cur as NodeJS.ErrnoException;
      if (typeof ne.code === "string") parts.push(`errno=${ne.code}`);
      cur = cur.cause;
    } else if (typeof cur === "string") {
      parts.push(cur);
      break;
    } else break;
    depth++;
  }
  const out = [...new Set(parts.filter(Boolean))].join(" · ");
  return out || "Erro desconhecido de rede";
}

/** Avisos sem expor a chave (só prefixos públicos). */
export function pagouEnvMismatchHints(apiKey: string | undefined): string[] {
  const out: string[] = [];
  if (!apiKey) return out;
  const prod = process.env.PAGOU_ENV === "production";
  if (apiKey.startsWith("sk_live") && !prod) {
    out.push(
      "Token com prefixo sk_live_ é de PRODUÇÃO: define PAGOU_ENV=production na Vercel e faz redeploy (caso contrário chamamos api-sandbox.pagou.ai).",
    );
  }
  return out;
}

/** bearer (default) | apikey — @see https://developer.pagou.ai/start-here/authentication */
export function buildPagouJsonHeaders(rawKey: string): Record<string, string> {
  const mode = (process.env.PAGOU_AUTH_MODE ?? "bearer").toLowerCase().trim();
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (mode === "apikey" || mode === "api_key") {
    h.apiKey = rawKey;
  } else {
    h.Authorization = `Bearer ${rawKey}`;
  }
  return h;
}

export function buildPagouGetHeaders(rawKey: string): Record<string, string> {
  const mode = (process.env.PAGOU_AUTH_MODE ?? "bearer").toLowerCase().trim();
  const h: Record<string, string> = { Accept: "application/json" };
  if (mode === "apikey" || mode === "api_key") {
    h.apiKey = rawKey;
  } else {
    h.Authorization = `Bearer ${rawKey}`;
  }
  return h;
}

async function parsePagouResponseBody(res: Response): Promise<{
  json: unknown;
  rawSnippet?: string;
  parseFailed?: boolean;
}> {
  const text = await res.text();
  const rawSnippet = text.trim() ? text.slice(0, 500) : undefined;
  if (!text.trim()) return { json: null };
  try {
    return { json: JSON.parse(text) as unknown, rawSnippet };
  } catch {
    return { json: null, rawSnippet, parseFailed: true };
  }
}

/** GET /v2/transactions — valida token sem criar cobrança (quickstart Pagou). */
export async function probePagouTransactionsList(rawKey: string): Promise<{
  httpStatus: number;
  authOk: boolean;
  detail?: string;
  requestId?: string;
}> {
  try {
    const res = await fetch(`${getPagouApiBase()}/v2/transactions?limit=1`, {
      method: "GET",
      headers: buildPagouGetHeaders(rawKey),
      cache: "no-store",
    });
    const { json, rawSnippet, parseFailed } = await parsePagouResponseBody(res);
    let detail: string | undefined;
    if (parseFailed) {
      detail = `Resposta não-JSON (HTTP ${res.status}). Confirme PAGOU_ENV e o host ${getPagouApiBase()}.`;
      if (rawSnippet) detail += ` Trecho: ${rawSnippet.slice(0, 160)}`;
    } else {
      detail =
        extractPagouDetail(json) ??
        (!res.ok ? `HTTP ${res.status}` : undefined);
    }
    const rid =
      json &&
      typeof json === "object" &&
      !Array.isArray(json) &&
      typeof (json as Record<string, unknown>).requestId === "string"
        ? ((json as Record<string, unknown>).requestId as string)
        : undefined;
    return {
      httpStatus: res.status,
      authOk: res.ok && !parseFailed,
      detail,
      requestId: rid,
    };
  } catch (e) {
    console.error("[pagou] probe fetch:", e);
    return {
      httpStatus: 503,
      authOk: false,
      detail: formatNodeFetchError(e),
    };
  }
}

export async function createPixTransaction(
  input: CreatePixInput,
  request?: Request,
): Promise<CreatePixResult> {
  const key = normalizePagouApiKey(process.env.PAGOU_API_KEY);
  if (!key) {
    return {
      ok: false,
      status: 503,
      body: {
        error: "missing_api_key",
        detail:
          "PAGOU_API_KEY não está disponível neste deployment. Na Vercel: Environment Variables → Production → nome exato PAGOU_API_KEY → Save → Redeploy obrigatório.",
      },
    };
  }

  const notifyUrl = resolveWebhookNotifyUrl(request);
  const externalRef = `ghdrol_${input.offer.units}u_${crypto.randomUUID()}`;

  const payload: Record<string, unknown> = {
    external_ref: externalRef,
    amount: input.offer.amountCents,
    currency: "BRL",
    method: "pix",
    buyer: {
      name: input.buyer.name.trim(),
      email: input.buyer.email.trim(),
      document: { type: "CPF", number: input.buyer.cpfDigits },
    },
    products: [
      {
        name: `GHDROL — ${input.offer.label}`,
        price: input.offer.amountCents,
        quantity: 1,
      },
    ],
  };

  if (notifyUrl) payload.notify_url = notifyUrl;

  let res: Response;
  try {
    res = await fetch(`${getPagouApiBase()}/v2/transactions`, {
      method: "POST",
      headers: buildPagouJsonHeaders(key),
      body: JSON.stringify(payload),
    });
  } catch (fetchErr) {
    console.error("[pagou] fetch error:", fetchErr);
    return {
      ok: false,
      status: 503,
      body: {
        error: "pagou_unreachable",
        detail: `${formatNodeFetchError(fetchErr)} (destino: ${getPagouApiBase()})`,
      },
    };
  }

  const { json, rawSnippet, parseFailed } = await parsePagouResponseBody(res);

  if (parseFailed) {
    return {
      ok: false,
      status: res.status >= 400 ? res.status : 502,
      body: {
        error: "pagou_non_json",
        detail: `A Pagou devolveu corpo que não é JSON (HTTP ${res.status}). Confirme PAGOU_ENV e ${getPagouApiBase()}.`,
        rawSnippet: rawSnippet ?? null,
      },
    };
  }

  const envelope = json as {
    success?: boolean;
    data?: {
      id?: string;
      status?: string;
      pix?: unknown;
    };
  };

  const failureBody = (): Record<string, unknown> => {
    const base: Record<string, unknown> =
      json !== null && typeof json === "object" && !Array.isArray(json)
        ? { ...(json as Record<string, unknown>) }
        : { raw: json };
    const detail = extractPagouDetail(json);
    if (detail && base.detail === undefined) base.detail = detail;
    return base;
  };

  if (!res.ok || envelope.success === false) {
    const status =
      !res.ok ? res.status : envelope.success === false ? 422 : res.status;
    return { ok: false, status, body: failureBody() };
  }

  const id = envelope.data?.id;
  const pixObj = envelope.data?.pix;
  const qr = pickPixField(pixObj, "qr_code", "qrCode");
  if (!id || !qr) {
    return {
      ok: false,
      status: 502,
      body: {
        ...failureBody(),
        detail:
          extractPagouDetail(json) ??
          "Resposta Pagou sem QR Pix (confira método PIX na conta e valor da transação).",
      },
    };
  }

  return {
    ok: true,
    id,
    status: envelope.data?.status ?? "pending",
    qrCode: qr,
    expirationDate: pickExpiration(pixObj) ?? null,
    externalRef,
  };
}
