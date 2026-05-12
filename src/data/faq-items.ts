export type FaqItem = {
  q: string;
  a: string;
  /** Texto curto para botões do assistente */
  chip: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    chip: "Resultados",
    q: "Porque não consigo ter resultados e como o GHDROL vai me ajudar?",
    a: "Quase 90% das pessoas que tentam criar músculos enfrentam limitações relacionadas a genética, testosterona e GH. O GHDROL foi pensado para atuar nesses fatores e acelerar a evolução quando o organismo demora a responder.",
  },
  {
    chip: "Entrega",
    q: "Como funciona a entrega e segurança da compra?",
    a: "Compra segura com processamento via Pagou. Após o pagamento, você recebe nota e rastreio no e-mail. Frete grátis para todo o Brasil. Prazo de entrega de até 8 dias úteis conforme logística.",
  },
  {
    chip: "Quando vejo resultado?",
    q: "Em quanto tempo vejo um resultado visível?",
    a: "Muitas pessoas notam mais disposição, força e pump nas primeiras semanas; resultados visíveis variam de acordo com treino, dieta e organismo.",
  },
  {
    chip: "É seguro?",
    q: "Qualquer pessoa pode tomar? É seguro?",
    a: "Indicado para maiores de 18 anos. Em caso de doenças, gravidez ou uso de medicamentos, consulte um profissional de saúde antes de usar qualquer suplemento.",
  },
  {
    chip: "Como usar",
    q: "Qual o modo correto de usar?",
    a: "Utilizar 3 cápsulas por dia, pela manhã ou tarde, todos os dias, mesmo nos dias sem treino, salvo orientação diferente do rótulo ou profissional.",
  },
  {
    chip: "Garantia",
    q: "Como funciona a garantia?",
    a: "Garantia de satisfação de 60 dias conforme comunicado na oferta. Também se aplicam o direito de arrependimento (CDC) e políticas do canal de compra.",
  },
  {
    chip: "Ingredientes",
    q: "Quais substâncias ele possui?",
    a: "Tetraborato de sódio decahidratado, arginina, valina, lisina, óxido de magnésio, taurina, zinco bisglicinato, niacinamida, colecalciferol, cianocobalamina — conforme informação do fabricante no rótulo.",
  },
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Palavras-chave simples para tentativa de correspondência no campo livre */
export function matchFaqByKeywords(text: string): FaqItem | null {
  const q = normalize(text).trim();
  if (!q) return null;
  const words = q.split(/\s+/).filter((w) => w.length > 2);

  let best: FaqItem | null = null;
  let bestScore = 0;

  for (const item of FAQ_ITEMS) {
    const hay = normalize(`${item.q} ${item.a} ${item.chip}`);
    const score = words.reduce((acc, w) => acc + (hay.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return bestScore > 0 ? best : null;
}
