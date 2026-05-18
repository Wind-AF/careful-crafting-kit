import { SalesAssistantChat } from "@/components/landing/SalesAssistantChat";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-10 sm:py-12">
      <div className="container-page text-center text-sm text-gh-muted">
        <h3 className="font-display text-xl uppercase text-gh-gold sm:text-2xl">
          Dúvidas?
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-balance">
          Use o assistente abaixo — as respostas são as mesmas desta página.
        </p>
        <SalesAssistantChat />
        <p className="mt-8 border-t border-white/10 pt-6 text-xs">
          Copyright {new Date().getFullYear()} © GHMUSCLE — Todos os direitos
          reservados — CNPJ 43.874.370/0001-60
        </p>
        <p className="mt-2 text-xs">
          <span className="opacity-70">Política de privacidade</span>
          <span className="mx-2 opacity-40">|</span>
          <span className="opacity-70">Termos de uso</span>
        </p>
      </div>
    </footer>
  );
}
