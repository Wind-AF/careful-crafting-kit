import Image from "next/image";
import { SectionTitle } from "./SectionTitle";

/**
 * Fotos do carrossel «Quem usa aprova!» na página oficial de referência:
 * https://ghmuscle.com.br/ghdrol/
 */
const DEPOIMENTOS = [
  {
    src: "https://ghmuscle.com.br/wp-content/uploads/2026/03/1.png",
    alt: "Rafael — cliente que usa GHDROL",
    name: "Rafael T.",
    cidade: "Curitiba · PR",
    quote:
      "Há três semanas na rotina certinha: mais disposição no treino e foco no trampo. O pump ficou bem mais consistente.",
  },
  {
    src: "https://ghmuscle.com.br/wp-content/uploads/2025/05/2-4.png",
    alt: "Lucas — cliente que usa GHDROL",
    name: "Lucas M.",
    cidade: "Belo Horizonte · MG",
    quote:
      "Eu era bem cético com GH em cápsula, mas senti recuperação melhor já nas primeiras semanas. Até durmo mais tranquilo.",
  },
  {
    src: "https://ghmuscle.com.br/wp-content/uploads/2026/03/2.png",
    alt: "Diego — cliente que usa GHDROL",
    name: "Diego P.",
    cidade: "Porto Alegre · RS",
    quote:
      "Peguei o kit maior pela promoção. Chegou rápido e o pessoal do WhatsApp me respondeu na hora.",
  },
  {
    src: "https://ghmuscle.com.br/wp-content/uploads/2025/05/4-4.png",
    alt: "André — cliente que usa GHDROL",
    name: "André L.",
    cidade: "São Paulo · SP",
    quote:
      "Não é mágica — continuo treinando pesado — mas a energia no dia a dia eu notei já na primeira caixa.",
  },
  {
    src: "https://ghmuscle.com.br/wp-content/uploads/2025/05/5-1.png",
    alt: "Camila — cliente que usa GHDROL",
    name: "Camila R.",
    cidade: "Florianópolis · SC",
    quote:
      "Estou satisfeita com a praticidade: uma dose única e cabe na minha rotina corrida. Sinto menos cansaço quando chego na segunda série dos exercícios grandes.",
  },
] as const;

export function Testimonials() {
  return (
    <section className="border-t border-white/10 bg-black/40 py-12 sm:py-16">
      <div className="container-page">
        <SectionTitle as="h2" subtitle="Quem usa aprova">
          Depoimentos e resultados
        </SectionTitle>
        <p className="mx-auto mb-10 max-w-xl text-center text-sm text-gh-muted sm:mb-12 sm:max-w-2xl">
          Relatos de quem iniciou a transformação. Resultados variam conforme
          organismo, treino e dieta.
        </p>
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
          {DEPOIMENTOS.map((d, i) => (
            <article
              key={`${d.name}-${i}`}
              className={`flex flex-col items-center rounded-2xl border border-white/10 bg-gh-surface/70 px-5 pb-6 pt-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.35)] ${i === DEPOIMENTOS.length - 1 ? "lg:col-span-3 lg:mx-auto lg:max-w-sm" : ""}`}
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-gh-gold/50 shadow-[0_0_24px_rgba(201,162,39,0.25)] sm:h-28 sm:w-28">
                <Image
                  src={d.src}
                  alt={d.alt}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 96px, 112px"
                />
              </div>
              <p className="mt-3 font-display text-lg uppercase tracking-wide text-gh-gold">
                {d.name}
              </p>
              <p className="text-xs text-gh-muted">{d.cidade}</p>
              <div className="mt-2 text-gh-gold/90" aria-hidden>
                ★★★★★
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-gh-muted">
                <span className="text-gh-gold/80">&ldquo;</span>
                {d.quote}
                <span className="text-gh-gold/80">&rdquo;</span>
              </blockquote>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
