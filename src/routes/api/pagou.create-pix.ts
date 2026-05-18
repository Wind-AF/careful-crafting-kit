import { createFileRoute } from "@tanstack/react-router";
import type { OfferUnits } from "@/lib/checkout";
import { digitsOnly, isValidCPFDigits } from "@/lib/cpf";
import { createKirvuspayPix, hasKirvuspayConfigured } from "@/lib/kirvuspay.server";
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
        if (!hasKirvuspayConfigured()) {
          return Response.json(
            {
              error: "Gateway não configurado",
              detail:
                "Defina KIRVUSPAY_PUBLIC_KEY e KIRVUSPAY_SECRET_KEY no ambiente.",
            },
            { status: 500 },
          );
        }

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
          phone?: string;
          address?: Record<string, unknown>;
        };
        const tracking = parseTrackingFromRequestBody(b);

        if (!b.units || !isOfferUnits(b.units)) {
          return Response.json({ error: "Oferta inválida" }, { status: 400 });
        }
        const name = String(b.name ?? "").trim();
        const email = String(b.email ?? "").trim();
        const cpfDigits = digitsOnly(String(b.document ?? ""));
        const phone = b.phone ? String(b.phone).trim() : undefined;

        if (name.length < 3 || name.length > 200) {
          return Response.json({ error: "Nome completo inválido" }, { status: 400 });
        }
        if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return Response.json({ error: "E-mail inválido" }, { status: 400 });
        }
        const phoneDigitsCheck = phone ? digitsOnly(phone) : "";
        if (phone && (phone.length > 20 || phoneDigitsCheck.length < 10 || phoneDigitsCheck.length > 11)) {
          return Response.json({ error: "Telefone inválido" }, { status: 400 });
        }
        if (cpfDigits.length !== 11 || !isValidCPFDigits(cpfDigits)) {
          return Response.json(
            { error: "CPF inválido", detail: "Confira os dígitos do CPF." },
            { status: 400 },
          );
        }

        const a = b.address ?? {};
        const addrCep = digitsOnly(String((a as Record<string, unknown>).cep ?? ""));
        const addrStreet = String((a as Record<string, unknown>).street ?? "").trim();
        const addrNumber = String((a as Record<string, unknown>).number ?? "").trim();
        const addrComplement = String((a as Record<string, unknown>).complement ?? "").trim();
        const addrDistrict = String((a as Record<string, unknown>).district ?? "").trim();
        const addrCity = String((a as Record<string, unknown>).city ?? "").trim();
        const addrUf = String((a as Record<string, unknown>).uf ?? "").trim().toUpperCase();
        if (
          addrCep.length !== 8 ||
          addrStreet.length < 3 || addrStreet.length > 200 ||
          addrNumber.length < 1 || addrNumber.length > 20 ||
          addrComplement.length > 100 ||
          addrDistrict.length < 2 || addrDistrict.length > 100 ||
          addrCity.length < 2 || addrCity.length > 100 ||
          !/^[A-Z]{2}$/.test(addrUf)
        ) {
          return Response.json({ error: "Endereço de entrega inválido" }, { status: 400 });
        }
        const address = {
          cep: addrCep,
          street: addrStreet,
          number: addrNumber,
          ...(addrComplement ? { complement: addrComplement } : {}),
          district: addrDistrict,
          city: addrCity,
          uf: addrUf,
        };

        const offer = getOfferByUnits(b.units);
        if (!offer) {
          return Response.json({ error: "Oferta não encontrada" }, { status: 400 });
        }

        try {
          const result = await createKirvuspayPix(
            { offer, buyer: { name, email, cpfDigits }, phone },
            request,
          );

          if (!result.ok) {
            console.error("[create-pix] kirvuspay error:", result.status, result.body);
            // Only forward user-actionable info for 4xx; mask 5xx internals.
            if (result.status >= 500) {
              return Response.json(
                { error: "gateway_unavailable", detail: "Erro interno. Tente novamente." },
                { status: 502 },
              );
            }
            const raw = result.body;
            const rawObj =
              raw !== null && typeof raw === "object" && !Array.isArray(raw)
                ? (raw as Record<string, unknown>)
                : null;
            // Extract a user-safe message only — not the full upstream body.
            const safeMsg =
              (rawObj?.message as string | undefined) ||
              (rawObj?.error as string | undefined) ||
              (Array.isArray((rawObj as { errors?: { message?: string }[] } | null)?.errors)
                ? ((rawObj as { errors?: { message?: string }[] }).errors?.[0]?.message)
                : undefined) ||
              "Não foi possível gerar o Pix. Verifique os dados informados.";
            const payload: Record<string, unknown> = { error: safeMsg, detail: safeMsg };
            if (result.status === 401) {
              payload.detail =
                "Gateway recusou as credenciais. Contate o suporte.";
            }
            return Response.json(payload, { status: result.status });
          }

          try {
            await savePendingOrder({
              transactionId: result.transactionId,
              externalRef: result.identifier,
              units: b.units,
              email,
              name,
              amountCents: offer.amountCents,
              createdAt: new Date().toISOString(),
              address,
              ...(tracking ? { tracking } : {}),
            });
          } catch (persistErr) {
            console.error("[create-pix] savePendingOrder:", persistErr);
          }

          return Response.json({
            id: result.transactionId,
            status: result.status,
            pix: {
              qr_code: result.qrCode,
              qr_base64: result.qrBase64,
              qr_image: result.qrImage,
              expiration_date: null,
            },
            external_ref: result.identifier,
            order_url: result.orderUrl,
          });
        } catch (err) {
          console.error("[create-pix] unexpected:", err);
          return Response.json(
            { error: "unexpected", detail: "Erro interno. Tente novamente." },
            { status: 500 },
          );
        }
      },
    },
  },
});
