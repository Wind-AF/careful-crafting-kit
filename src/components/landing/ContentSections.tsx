import { CtaButton } from "./CtaButton";
import { SectionTitle } from "./SectionTitle";

const BENEFITS: { title: string; body: string }[] = [
  {
    title: "Aumento de GH",
    body: "Estimula a secreção de hormônio do crescimento (GH), favorando ambiente anabólico quando combinado a treino e nutrição.",
  },
  {
    title: "Aumento de massa muscular",
    body: "Apoio à síntese proteica e hipertrofia com estímulos de treino adequados e proteína suficiente na dieta.",
  },
  {
    title: "Força e resistência",
    body: "Mais energia para cargas e volume de treino, com recuperação alinhada ao descanso.",
  },
  {
    title: "Hipertrofia acelerada",
    body: "Potencializa o trabalho muscular já feito na academia — consistência é o que multiplica o resultado.",
  },
  {
    title: "Aumento de testosterona",
    body: "Suporte a níveis hormonais saudáveis no contexto de estilo de vida ativo (varia por perfil).",
  },
  {
    title: "Recuperação muscular",
    body: "Menos sensação de desgaste extremo quando sono e nutrição acompanham o protocolo.",
  },
  {
    title: "Aumento de libido",
    body: "Mais disposição e confiança, em linha com equilíbrio hormonal e bem-estar geral.",
  },
  {
    title: "Vasodilatação",
    body: "Circulação e pump percebidos no treino, com hidratação e técnica corretas.",
  },
  {
    title: "Entrega de nutrientes",
    body: "Melhor aproveitamento do que você já consome — organize macros e micronutrientes.",
  },
  {
    title: "Imunidade",
    body: "Componentes que dialogam com suporte metabólico — mantenha exames e orientação médica em dia.",
  },
];

export function ScienceSection() {
  return (
    <section className="border-t border-white/10 bg-black/30 py-12 sm:py-16">
      <div className="container-page">
        <SectionTitle as="h2">Fórmula com tecnologia avançada</SectionTitle>
        <p className="mx-auto max-w-xl text-center text-sm leading-relaxed text-gh-muted sm:max-w-3xl sm:text-base">
          Após meses de estudos sobre performance física e fatores que atrasam resultados, a linha GHDROL foi desenvolvida para atuar em múltiplas frentes da evolução corporal — sempre combinada a treino, dieta e descanso.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-gh-muted sm:max-w-3xl sm:text-base">
          Finalmente disponível no Brasil para quem busca definição, hipertrofia e performance com protocolo claro.
        </p>
        <div className="mt-12 flex justify-center">
          <CtaButton href="#oferta">Quero GHDROL agora</CtaButton>
        </div>
      </div>
    </section>
  );
}

export function AudienceList() {
  const items = [
    "Tem dificuldade de ganhar massa muscular mesmo treinando",
    "Está estagnado e quer acelerar os ganhos",
    "Não quer desperdiçar dinheiro com soluções sem método",
    "Quer mais presença e confiança no dia a dia",
    "Busca mais performance nos treinos e na intimidade",
    "Quer orgulho do que vê no espelho, com constância",
    "Quer parar de adiar e transformar o corpo com foco",
    "Começou na academia e quer evoluir mais rápido com base",
  ];
  return (
    <section className="py-12 sm:py-14">
      <div className="container-page">
        <SectionTitle as="h2" subtitle="O GHDROL é para quem:">
          Você se identifica?
        </SectionTitle>
        <ul className="mx-auto grid max-w-xl gap-3 sm:max-w-3xl sm:grid-cols-2">
          {items.map((t) => (
            <li
              key={t}
              className="flex gap-2 rounded-lg border border-white/10 bg-gh-surface/60 px-3 py-3 text-sm text-gh-muted sm:px-4"
            >
              <span className="text-gh-gold">✓</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FactorsSection() {
  return (
    <section className="border-t border-white/10 bg-gh-surface py-12 sm:py-14">
      <div className="container-page text-center">
        <h2 className="text-balance font-display text-2xl uppercase text-gh-gold-bright sm:text-3xl md:text-4xl">
          Fatores determinantes para a evolução
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-gh-muted sm:mt-6 sm:max-w-3xl sm:text-base">
          O GHDROL foi pensado para acompanhar quem leva treino a sério: hormônios, recuperação, nutrição e estímulo certo são os pilares. O suplemento potencializa o terreno — você traz o trabalho duro.
        </p>
      </div>
    </section>
  );
}

export function BenefitsGrid() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container-page">
        <SectionTitle as="h2">Como o GHDROL atua?</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <article
              key={b.title}
              className="rounded-xl border border-gh-gold/20 bg-gradient-to-b from-gh-surface to-black/50 p-4 sm:p-5"
            >
              <h3 className="font-display text-lg uppercase tracking-wide text-gh-gold-bright sm:text-xl">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gh-muted">{b.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <CtaButton href="#oferta">Quero GHDROL agora</CtaButton>
        </div>
      </div>
    </section>
  );
}

export function MidCtaBanner() {
  return (
    <section className="border-y border-gh-gold/40 bg-gradient-to-r from-black via-gh-surface to-black py-10 text-center sm:py-12">
      <h2 className="text-balance px-2 font-display text-2xl uppercase text-white sm:text-3xl md:text-4xl">
        GHDROL redefine seus limites
      </h2>
      <p className="mx-auto mt-4 max-w-lg px-2 text-sm text-gh-muted sm:max-w-2xl sm:text-base">
        Acesse o máximo do seu físico com treino, nutrição e o protocolo certo. Seu corpo e sua rotina podem atingir outro patamar.
      </p>
      <div className="mt-8 flex justify-center">
        <CtaButton href="#oferta">Quero GHDROL agora</CtaButton>
      </div>
    </section>
  );
}
