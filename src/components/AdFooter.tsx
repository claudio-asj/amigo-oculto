"use client";

import { useEffect } from "react";
import { ADSENSE_CLIENT, ADSENSE_SLOT_RODAPE } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Um único anúncio, no fim da página, com espaço reservado para a página não
 * pular quando ele carrega. Só existe na home (as páginas de sorteio não
 * carregam o AdSense).
 */
export function AdFooter() {
  useEffect(() => {
    if (!ADSENSE_SLOT_RODAPE) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  if (!ADSENSE_SLOT_RODAPE) return null;
  return (
    <aside aria-label="Publicidade" className="paper-card !p-3 text-center">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Publicidade</p>
      <ins
        className="adsbygoogle block min-h-[100px] w-full"
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT_RODAPE}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
