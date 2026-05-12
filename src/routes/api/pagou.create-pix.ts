import { createFileRoute } from "@tanstack/react-router";
import type { OfferUnits } from "@/lib/checkout";
import { digitsOnly, isValidCPFDigits } from "@/lib/cpf";
import { createPixTransaction } from "@/lib/pagou.server";
import { savePendingOrder } from "@/lib/order-store.server";
import { getOfferByUnits } from "@/lib/offers";
import { parseTrackingFromRequestBody } from "@/lib/tracking";

const VALID: OfferUnits[] = ["1", "2", "3", "5"];

function isOfferUnits(u: string): u is OfferUnits {
  return (VALID as string[]).includes(u);
}

export const Route = createFileRoute("/api/pagou/create-pix")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "JSON inválido" }, { status: 400 });
        }

        const b = body as Record<string, unknown> & {
          units?: string;
          name?: string;
          email?: string;
          document?: string;
        };
        const tracking = parseTrackingFromRequestBody(b);

        if (!b.units || !isOfferUnits(b.units)) {
          return Response.json({ error: "Oferta inválida" }, { status: 400 });
        }
        const name = String(b.name ?? "").trim();
        const email = String(b.email ?? "").trim();
        const cpfDigits = digitsOnly(String(b.document ?? ""));
        if (name.length < 3) {
          return Response.json({ error: "Nome completo inválido" }, { status: 400 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json({ error: "E-mail inválido" }, { status: 400 });
        }
        if (cpfDigits.length !== 11) {
          return Response.json({ error: "CPF inválido (11 dígitos)" }, { status: 400 });
        }
        if (!isValidCPFDigits(cpfDigits)) {
          return Response.json(
            {
              error: "CPF inválido",
              detail:
                "Confira os dígitos do CPF. A Pagou recusa documentos com dígitos verificadores incorretos.",
            },
            { status: 400 },
          );
        }
        const offer = getOfferByUnits(b.units);
        if (!offer) {
          return Response.json({ error: "Oferta não encontrada" }, { status: 400 });
        }

        try {
          const result = await createPixTransaction(
            { offer, buyer: { name, email, cpfDigits } },
            request,
          );

          if (!result.ok) {
            const raw = result.body;
            const payload: Record<string, unknown> =
              raw !== null && typeof raw === "object" && !Array.isArray(raw)
                ? { ...(raw as Record<string, unknown>) }
                : { error: String(raw) };
            if (result.status === 401 && !payload.detail) {
              payload.detail =
                "Pagou recusou o token. Verifique PAGOU_API_KEY e se PAGOU_ENV (sandbox ou production) corresponde ao token no painel Pagou.";
            }
            if (result.status === 403 && !payload.detail) {
              payload.detail =
                "Acesso negado pela Pagou. Confira permissões da chave e se a conta está ativa.";
            }
            return Response.json(payload, { status: result.status });
          }

          try {
            await savePendingOrder({
              transactionId: result.id,
              externalRef: result.externalRef,
              units: b.units,
              email,
              name,
              amountCents: offer.amountCents,
              createdAt: new Date().toISOString(),
              ...(tracking ? { tracking } : {}),
            });
          } catch (persistErr) {
            console.error("[create-pix] savePendingOrder:", persistErr);
          }

          return Response.json({
            id: result.id,
            status: result.status,
            pix: {
              qr_code: result.qrCode,
              expiration_date: result.expirationDate,
            },
            external_ref: result.externalRef,
          });
        } catch (err) {
          console.error("[create-pix] unexpected:", err);
          return Response.json(
            {
              error: "unexpected",
              detail:
                err instanceof Error
                  ? err.message
                  : "Erro interno ao gerar o Pix.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
