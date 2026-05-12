export type OfferUnits = "1" | "2" | "3" | "5";

const URL_ENV: Record<OfferUnits, string | undefined> = {
  "1": process.env.PAGOU_CHECKOUT_1_UNIT_URL,
  "2": process.env.PAGOU_CHECKOUT_2_UNIT_URL,
  "3": process.env.PAGOU_CHECKOUT_3_UNIT_URL,
  "5": process.env.PAGOU_CHECKOUT_5_UNIT_URL,
};

export function getPagouCheckoutUrl(units: OfferUnits): string | undefined {
  const u = URL_ENV[units];
  if (!u?.trim()) return undefined;
  try {
    void new URL(u);
    return u;
  } catch {
    return undefined;
  }
}
