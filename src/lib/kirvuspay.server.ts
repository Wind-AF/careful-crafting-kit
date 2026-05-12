import type { Offer } from "./offers";

const KIRVUSPAY_API_BASE = "https://app.kirvuspay.com.br/api/v1";

export function hasKirvuspayConfigured(): boolean {
  return Boolean(
    process.env.KIRVUSPAY_PUBLIC_KEY?.trim() &&
      process.env.KIRVUSPAY_SECRET_KEY?.trim(),
  );
}

export function getPublicBaseUrl(request?: Request): string | null {
  const env = process.env.PUBLIC_BASE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  if (request) {
    try {
      return new URL(request.url).origin;
    } catch {
      return null;
    }
  }
  return null;
}

export type KirvuspayPixResult =
  | {
      ok: true;
      transactionId: string;
      status: string;
      qrCode: string;
      qrBase64?: string | null;
      qrImage?: string | null;
      orderUrl?: string | null;
      identifier: string;
    }
  | {
      ok: false;
      status: number;
      body: unknown;
    };

export async function createKirvuspayPix(
  args: {
    offer: Offer;
    buyer: { name: string; email: string; cpfDigits: string };
    phone?: string;
  },
  request?: Request,
): Promise<KirvuspayPixResult> {
  const publicKey = process.env.KIRVUSPAY_PUBLIC_KEY?.trim();
  const secretKey = process.env.KIRVUSPAY_SECRET_KEY?.trim();
  if (!publicKey || !secretKey) {
    return {
      ok: false,
      status: 500,
      body: { error: "Kirvuspay credentials not configured" },
    };
  }

  const identifier = `gh-${args.offer.units}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const amountReais = Math.round(args.offer.amountCents) / 100;

  const baseUrl = getPublicBaseUrl(request);
  const callbackUrl = baseUrl
    ? `${baseUrl}/api/webhooks/kirvuspay`
    : undefined;

  const body: Record<string, unknown> = {
    identifier,
    amount: amountReais,
    client: {
      name: args.buyer.name,
      email: args.buyer.email,
      document: args.buyer.cpfDigits,
      ...(args.phone ? { phone: args.phone } : {}),
    },
    products: [
      {
        id: `ghdrol-${args.offer.units}`,
        name: `GHDROL — ${args.offer.label}`,
        quantity: 1,
        price: amountReais,
      },
    ],
    metadata: {
      provider: "ghdrol-checkout",
      units: args.offer.units,
    },
    ...(callbackUrl ? { callbackUrl } : {}),
  };

  let res: Response;
  try {
    res = await fetch(`${KIRVUSPAY_API_BASE}/gateway/pix/receive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": publicKey,
        "x-secret-key": secretKey,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      ok: false,
      status: 502,
      body: {
        error: "network_error",
        detail: err instanceof Error ? err.message : String(err),
      },
    };
  }

  const raw = await res.text();
  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = raw;
  }

  if (!res.ok) {
    return { ok: false, status: res.status, body: parsed };
  }

  const data = parsed as {
    transactionId?: string;
    status?: string;
    pix?: { code?: string; base64?: string; image?: string };
    order?: { url?: string };
  };

  if (!data?.transactionId || !data?.pix?.code) {
    return {
      ok: false,
      status: 502,
      body: { error: "invalid_response", detail: parsed },
    };
  }

  return {
    ok: true,
    transactionId: data.transactionId,
    status: data.status ?? "PENDING",
    qrCode: data.pix.code,
    qrBase64: data.pix.base64 ?? null,
    qrImage: data.pix.image ?? null,
    orderUrl: data.order?.url ?? null,
    identifier,
  };
}
