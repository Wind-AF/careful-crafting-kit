import type { OfferUnits } from "./checkout";

export type Offer = {
  units: OfferUnits;
  label: string;
  badge?: string;
  crossedPrice: string;
  installments: string;
  cashPrice: string;
  amountCents: number;
  image: string;
  imageAlt: string;
};

export const OFFERS: Offer[] = [
  {
    units: "1",
    label: "1 unidade",
    crossedPrice: "R$299,00",
    installments: "R$14,85",
    cashPrice: "R$147,90",
    amountCents: 14790,
    image: "https://ghmuscle.com.br/wp-content/uploads/2022/06/img-1-unidade.png",
    imageAlt: "GHDROL — 1 unidade",
  },
  {
    units: "2",
    label: "2 unidades",
    crossedPrice: "R$399,00",
    installments: "R$23,89",
    cashPrice: "R$237,90",
    amountCents: 23790,
    image: "https://ghmuscle.com.br/wp-content/uploads/2022/06/img-2-unidades.png",
    imageAlt: "GHDROL — 2 unidades",
  },
  {
    units: "3",
    label: "3 unidades",
    badge: "mais vendido!",
    crossedPrice: "R$599,00",
    installments: "R$31,92",
    cashPrice: "R$317,90",
    amountCents: 31790,
    image: "https://ghmuscle.com.br/wp-content/uploads/2023/02/img-3-unidades-1.png",
    imageAlt: "GHDROL — 3 unidades",
  },
  {
    units: "5",
    label: "5 unidades",
    badge: "mais barato!",
    crossedPrice: "R$799,00",
    installments: "R$44,97",
    cashPrice: "R$447,90",
    amountCents: 44790,
    image: "https://ghmuscle.com.br/wp-content/uploads/2022/06/img-5-unidades.png",
    imageAlt: "GHDROL — 5 unidades",
  },
];

export function getOfferByUnits(units: OfferUnits): Offer | undefined {
  return OFFERS.find((o) => o.units === units);
}
