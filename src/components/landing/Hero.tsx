import { CtaButton } from "./CtaButton";
import { SectionTitle } from "./SectionTitle";

export function Hero() {
  return (
    <section className="relative min-h-[72svh] overflow-hidden border-b border-gh-gold/30 sm:min-h-[80svh] md:min-h-[88svh]">
      <div className="absolute inset-0 z-0">
        <img
          src="/hero/ghdrol-produto.png"
          alt="GHDROL — frasco do suplemento"
          className="absolute inset-0 h-full w-full object-cover object-[50%_35%] sm:object-[58%_center] md:object-[62%_center] lg:object-[65%_center] md:scale-[1.02]"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/78 via-black/86 to-black/93 md:bg-gradient-to-r md:from-black md:via-black/92 md:to-black/25" aria-hidden />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_85%_70%_at_72%_55%,rgba(234,179,8,0.08),transparent_55%)] mix-blend-screen opacity-55 sm:opacity-65 md:opacity-75" aria-hidden />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_115%_100%_at_50%_50%,transparent_35%,rgba(0,0,0,0.72)_100%)]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div className="container-page relative z-10 flex min-h-[72svh] flex-col justify-center py-12 sm:min-h-[80svh] sm:py-14 md:min-h-[88svh] md:py-20">
        <div className="mx-auto max-w-xl text-center md:mx-0 md:max-w-2xl md:text-left">
          <p className="text-balance font-display text-2xl uppercase tracking-wide text-gh-gold drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-3xl md:text-4xl">
            | GHDROL | OFICIAL |
          </p>
          <h1 className="mt-3 text-balance font-display text-3xl uppercase leading-snug tracking-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.95)] sm:mt-4 sm:text-4xl sm:leading-[1.05] md:text-5xl lg:text-6xl">
            A fórmula mais avançada para transformar o corpo de forma rápida
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/90 normal-case sm:mt-6 sm:uppercase md:mx-0 md:text-base">
            GHDROL eleva o corpo à máxima performance física, íntima e hipertrofia muscular, com ganhos de massa e resultados visíveis em poucas semanas — conforme rotina e organismo.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-snug text-white drop-shadow-md normal-case sm:mt-4 md:mx-0">
            Redefina seus limites e descubra por que o GHDROL age no que atrasa a evolução e potencializa o que importa no treino.
          </p>
          <div className="mt-8 flex justify-center md:justify-start">
            <CtaButton href="#oferta">Quero GHDROL agora</CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export function IntroBlocks() {
  return (
    <section className="py-12 sm:py-14">
      <div className="container-page space-y-8 sm:space-y-10">
        <SectionTitle as="h2" subtitle="Novidade no Brasil">
          Transformação em tempo recorde
        </SectionTitle>
        <div className="prose prose-invert mx-auto max-w-xl text-center text-[15px] leading-relaxed sm:max-w-3xl sm:px-0 sm:text-base">
          <p className="text-gh-muted">
            Você está pronto para transformar seu corpo em tempo recorde? Conheça{" "}
            <strong className="text-white">GHDROL</strong>, a fórmula ultra
            concentrada que chegou para elevar performance, disposição e foco nos
            treinos. Prepare-se para redefinir seus limites.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          <article className="rounded-xl border border-white/10 bg-gh-surface/80 p-4 sm:p-6">
            <h3 className="font-display text-xl uppercase text-gh-gold sm:text-2xl">
              Resultado aparente em poucas semanas
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gh-muted">
              Nas primeiras semanas muitos usuários relatam mais força,
              disposição, pump e sensação de evolução nos treinos. Resultados
              dependem de organismo, sono, dieta e estímulo de treino.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-gh-surface/80 p-4 sm:p-6">
            <h3 className="font-display text-xl uppercase text-gh-gold sm:text-2xl">
              Uso simples no dia a dia
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-gh-muted">
              Tome 3 cápsulas por dia, pela manhã ou à tarde, todos os dias,
              salvo orientação profissional diferente. Leia sempre o rótulo.
            </p>
          </article>
        </div>
        <div className="flex justify-center">
          <CtaButton href="#oferta">Quero GHDROL agora</CtaButton>
        </div>
      </div>
    </section>
  );
}
