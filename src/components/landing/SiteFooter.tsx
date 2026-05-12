import Link from "next/link";
import { SalesAssistantChat } from "@/components/landing/SalesAssistantChat";
import { WHATSAPP_SUPPORT_URL } from "@/lib/whatsapp-support";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-10 sm:py-12">
      <div className="container-page text-center text-sm text-gh-muted">
        <h3 className="font-display text-xl uppercase text-gh-gold sm:text-2xl">
          Dúvidas?
        </h3>
        <p className="mx-auto mt-3 max-w-xl text-balance">
          Primeiro use o assistente abaixo — as respostas são as mesmas desta página.
          Depois, se quiser, fale com nosso suporte pelo WhatsApp.
        </p>
        <SalesAssistantChat />
        <Link
          href={WHATSAPP_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex rounded-md border border-green-500/50 bg-green-600/20 px-6 py-3 font-semibold text-green-300 transition hover:bg-green-600/30"
        >
          Tirar dúvidas pelo WhatsApp
        </Link>
        <p className="mt-8 text-xs">
          Central de atendimento · Telefone{" "}
          <a href="tel:+5551982172731" className="text-gh-gold underline">
            (51) 98217-2731
          </a>
        </p>
        <p className="mt-6 border-t border-white/10 pt-6 text-xs">
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
