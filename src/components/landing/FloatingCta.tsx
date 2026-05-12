export function FloatingCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gh-gold/40 bg-black/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] shadow-[0_-8px_32px_rgba(0,0,0,0.6)] backdrop-blur md:pt-4">
      <div className="container-page flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-center text-sm font-medium text-white sm:text-left">
          Adquira o seu agora!
        </p>
        <a
          href="#oferta"
          className="inline-flex w-full max-w-sm items-center justify-center rounded-md bg-gradient-to-b from-gh-gold-bright to-gh-gold px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-black shadow-lg transition hover:brightness-110 sm:w-auto sm:max-w-none sm:px-8"
        >
          Comprar agora
        </a>
      </div>
    </div>
  );
}
