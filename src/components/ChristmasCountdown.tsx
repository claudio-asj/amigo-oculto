"use client";

import { useState, useSyncExternalStore } from "react";
import { LETTER_STYLES } from "./Paper";

/** Dias até o próximo 25 de dezembro, no fuso de quem está vendo. */
function daysToChristmas(now: Date) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let xmas = new Date(now.getFullYear(), 11, 25);
  if (today > xmas) xmas = new Date(now.getFullYear() + 1, 11, 25);
  // round, e não floor: o horário de verão pode deixar um dia com 23h ou 25h.
  return Math.round((xmas.getTime() - today.getTime()) / 86_400_000);
}

const noop = () => () => {};

function message(days: number) {
  if (days === 0) return "Feliz Natal! Hoje é dia de abrir os presentes.";
  if (days === 1) return "É hoje à noite! Espero que o amigo oculto já esteja sorteado.";
  if (days <= 7) return "Corre que ainda dá tempo de sortear e comprar o presente.";
  if (days <= 30) return "Já dá pra organizar o amigo oculto da família.";
  return "Dá tempo de organizar o amigo oculto com calma.";
}

/**
 * A página é gerada no build, então a conta dos dias só pode ser feita no
 * navegador. No servidor (e no primeiro instante) aparece "··" no lugar.
 */
export function ChristmasCountdown() {
  const days = useSyncExternalStore(
    noop,
    () => daysToChristmas(new Date()),
    () => null,
  );

  const title =
    days === null ? "Faltam" : days === 0 ? "Hoje é" : days === 1 ? "Amanhã é" : "Faltam";
  const tiles = days === null ? "··" : days <= 1 ? "" : String(days);

  return (
    <div className="paper-card tape tilt-r flex w-full flex-col items-center gap-2 text-center">
      <p className="sr-only">
        {days === null
          ? ""
          : days === 0
            ? "Hoje é Natal."
            : days === 1
              ? "Amanhã é Natal."
              : `Faltam ${days} dias para o Natal.`}
      </p>
      <div aria-hidden className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="font-hand text-4xl text-green">{title}</span>
        {tiles && (
          <span className="whitespace-nowrap text-4xl">
            {tiles.split("").map((ch, i) => {
              const s = LETTER_STYLES[(i * 2) % LETTER_STYLES.length];
              return (
                <span
                  key={i}
                  className="cut-letter"
                  style={{ background: s.bg, color: s.fg, rotate: `${s.r}deg` }}
                >
                  {ch}
                </span>
              );
            })}
          </span>
        )}
        <span className="font-hand text-4xl text-green">
          {days !== null && days <= 1 ? "Natal!" : "dias pro Natal"}
        </span>
      </div>
      {days !== null && <p className="font-bold">{message(days)}</p>}
    </div>
  );
}

/**
 * Presente de papel que balança, abre a tampa e solta uma estrela.
 * Roda duas vezes (menos de 5 s, como pede a WCAG 2.2.2) e para.
 * Tocar no presente faz de novo.
 */
export function GiftAnimation() {
  const [run, setRun] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setRun((n) => n + 1)}
      className="gift-anim"
      aria-label="Presente animado. Toque para abrir de novo."
    >
      <svg key={run} viewBox="0 0 160 160" className="h-40 w-40" aria-hidden>
        <ellipse cx="80" cy="148" rx="58" ry="6" fill="rgba(0,0,0,.18)" />
        <g className="gift-confetti">
          <rect x="40" y="70" width="7" height="11" fill="var(--green)" />
          <rect x="112" y="66" width="7" height="11" fill="var(--gold)" />
          <rect x="60" y="62" width="6" height="10" fill="var(--paper)" />
          <rect x="98" y="58" width="6" height="10" fill="var(--green)" />
        </g>
        <g className="gift-star">
          <path
            d="M80 46l6.4 14.6 15.6 1.3-11.9 10.4 3.7 15.6L80 79.6l-13.9 8.3 3.6-15.5L58 62l15.7-1.5z"
            fill="var(--gold)"
          />
        </g>
        <g className="gift-box" style={{ filter: "drop-shadow(2px 3px 0 rgba(0,0,0,.18))" }}>
          <rect x="28" y="80" width="104" height="64" fill="var(--red)" />
          <rect x="72" y="80" width="16" height="64" fill="var(--gold)" />
          <g className="gift-lid">
            <rect x="20" y="62" width="120" height="22" fill="#b32a28" />
            <rect x="72" y="62" width="16" height="22" fill="var(--gold)" />
            <ellipse cx="68" cy="55" rx="14" ry="9" fill="var(--gold)" transform="rotate(-20 68 55)" />
            <ellipse cx="92" cy="55" rx="14" ry="9" fill="var(--gold)" transform="rotate(20 92 55)" />
            <circle cx="80" cy="59" r="6" fill="#c99a2e" />
          </g>
        </g>
      </svg>
    </button>
  );
}
