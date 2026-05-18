import { SectionTitle } from "./SectionTitle";
import cliente1 from "@/assets/cliente-1.jpeg";
import cliente2 from "@/assets/cliente-2.jpeg";
import cliente3 from "@/assets/cliente-3.jpeg";
import cliente4 from "@/assets/cliente-4.jpeg";
import cliente5 from "@/assets/cliente-5.jpeg";

const DEPOIMENTOS = [
  {
    src: cliente1,
    alt: "Patrícia — cliente que usa GHDROL",
    name: "Patrícia M.",
    cidade: "Florianópolis · SC",
    quote:
      "Em poucas semanas já notei mais disposição no dia a dia e treinos bem mais consistentes. Adorei a praticidade.",
  },
  {
    src: cliente2,
    alt: "Juliana — cliente que usa GHDROL",
    name: "Juliana R.",
    cidade: "Belo Horizonte · MG",
    quote:
      "Eu estava cética, mas a recuperação melhorou e até durmo mais tranquila. Cabe certinho na minha rotina corrida.",
  },
  {
    src: cliente3,
    alt: "Camila — cliente que usa GHDROL",
    name: "Camila S.",
    cidade: "Curitiba · PR",
    quote:
      "Peguei o kit maior pela promoção. Chegou rápido e o atendimento no WhatsApp respondeu na hora.",
  },
  {
    src: cliente4,
    alt: "Ricardo — cliente que usa GHDROL",
    name: "Ricardo A.",
    cidade: "São Paulo · SP",
    quote:
      "Não é mágica — continuo treinando pesado — mas a energia no dia a dia eu notei já na primeira caixa.",
  },
  {
    src: cliente5,
    alt: "Diego — cliente que usa GHDROL",
    name: "Diego P.",
    cidade: "Porto Alegre · RS",
    quote:
      "Pump muito mais consistente e foco no trampo. Em três semanas o ganho de força ficou nítido.",
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
                <img
                  src={d.src}
                  alt={d.alt}
                  loading="lazy"
                  decoding="async"
                  width={112}
                  height={112}
                  className="absolute inset-0 h-full w-full object-cover object-top"
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
