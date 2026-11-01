"use client";

import { useState } from "react";
import { useCopy } from "./api";

const TEXT = "Achei um site pra sortear o amigo oculto sem cadastro, e ninguém vê quem tirou quem:";

/**
 * No celular abre a folha de compartilhamento do sistema (WhatsApp, Telegram…).
 * Onde não existe Web Share (quase todo desktop), copia o link.
 */
export function ShareSite({ url }: { url: string }) {
  const copy = useCopy();
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Amigo Oculto", text: TEXT, url });
        return;
      } catch (e) {
        // Fechou a folha sem escolher nada: não é erro.
        if ((e as Error).name === "AbortError") return;
      }
    }
    if (await copy(url)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button type="button" className="btn-paper btn-paper--green" onClick={share}>
        {copied ? (
          "Link copiado ✓"
        ) : (
          <>
            Compartilhar o site <span aria-hidden>📤</span>
          </>
        )}
      </button>
      <a
        className="link-paper text-sm font-bold"
        href={`https://wa.me/?text=${encodeURIComponent(`${TEXT} ${url}`)}`}
        target="_blank"
        rel="noreferrer"
      >
        ou mandar direto no WhatsApp
      </a>
      <span role="status" className="sr-only">
        {copied ? "Link do site copiado" : ""}
      </span>
    </div>
  );
}
