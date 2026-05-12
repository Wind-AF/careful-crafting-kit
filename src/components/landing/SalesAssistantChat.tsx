"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FAQ_ITEMS, matchFaqByKeywords, type FaqItem } from "@/data/faq-items";

type Msg =
  | { role: "bot"; text: string }
  | { role: "user"; text: string };

const INTRO: Msg[] = [
  {
    role: "bot",
    text: 'Olá! Sou o assistente desta página. As respostas são as mesmas da seção "Perguntas frequentes" — só organizadas em formato de chat. Toque num tema ou digite uma palavra-chave (ex.: entrega, garantia, dose).',
  },
];

export function SalesAssistantChat() {
  const [messages, setMessages] = useState<Msg[]>(INTRO);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const pushAnswer = useCallback((item: FaqItem) => {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: item.q },
      { role: "bot", text: item.a },
    ]);
  }, []);

  const onChip = useCallback(
    (item: FaqItem) => {
      pushAnswer(item);
    },
    [pushAnswer],
  );

  const onSubmitFreeText = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const t = draft.trim();
      if (!t) return;

      const hit = matchFaqByKeywords(t);
      setDraft("");
      if (hit) {
        setMessages((prev) => [...prev, { role: "user", text: t }, { role: "bot", text: hit.a }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "user", text: t },
          {
            role: "bot",
            text: "Não encontrei uma resposta pronta para isso aqui no site. Veja os botões de tema abaixo ou fale com um atendente no WhatsApp.",
          },
        ]);
      }
    },
    [draft],
  );

  return (
    <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-xl border border-green-500/30 bg-[#0b141a] shadow-lg shadow-black/40">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#1f2c33] px-3 py-2.5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white"
          aria-hidden
        >
          G
        </span>
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-semibold text-white">GHDROL · Dúvidas</p>
          <p className="text-xs text-green-300/90">Respostas da página de vendas</p>
        </div>
      </div>

      <div className="max-h-[min(22rem,55vh)] space-y-2 overflow-y-auto bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%228%22 height=%228%22%3E%3Ccircle cx=%221%22 cy=%221%22 r=%221%22 fill=%22%23ffffff%22 opacity=%22.04%22/%3E%3C/svg%3E')] px-2 py-3">
        {messages.map((m, i) =>
          m.role === "bot" ? (
            <div key={i} className="flex justify-start">
              <p className="max-w-[92%] rounded-lg rounded-tl-none bg-[#1f2c33] px-3 py-2 text-left text-sm leading-relaxed text-white/95">
                {m.text}
              </p>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <p className="max-w-[92%] rounded-lg rounded-tr-none bg-[#005c4b] px-3 py-2 text-left text-sm leading-relaxed text-white">
                {m.text}
              </p>
            </div>
          ),
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 bg-[#1f2c33] px-2 py-2">
        <p className="mb-1.5 px-1 text-[10px] uppercase tracking-wide text-white/50">
          Temas rápidos
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FAQ_ITEMS.map((item) => (
            <button
              key={item.q}
              type="button"
              onClick={() => onChip(item)}
              className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-green-100 transition hover:bg-white/10"
            >
              {item.chip}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmitFreeText} className="mt-2 flex gap-1.5">
          <label htmlFor="sales-assistant-input" className="sr-only">
            Sua pergunta
          </label>
          <input
            id="sales-assistant-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Digite uma palavra ou pergunta curta…"
            className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-green-500/50 focus:outline-none"
            autoComplete="off"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
