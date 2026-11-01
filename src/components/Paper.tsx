import Link from "next/link";
import { cloneElement, useId, type ReactElement } from "react";

export const LETTER_STYLES = [
  { bg: "var(--red)", fg: "#fff", r: -4 },
  { bg: "var(--paper)", fg: "var(--ink)", r: 3 },
  { bg: "var(--green)", fg: "#fff", r: -2 },
  { bg: "var(--gold)", fg: "var(--ink)", r: 5 },
  { bg: "var(--paper)", fg: "var(--red)", r: -3 },
  { bg: "var(--red)", fg: "#fff", r: 2 },
  { bg: "var(--green)", fg: "#fff", r: 4 },
];

export function Logo({ small = false }: { small?: boolean }) {
  const words = ["AMIGO", "OCULTO"];
  let k = 0;
  return (
    <Link
      href="/"
      aria-label="Amigo Oculto, página inicial"
      className={`flex flex-wrap items-center justify-center gap-x-3 ${small ? "text-base" : "text-2xl sm:text-3xl"}`}
    >
      {words.map((w) => (
        <span key={w} aria-hidden className="whitespace-nowrap">
          {w.split("").map((ch, i) => {
            const s = LETTER_STYLES[k++ % LETTER_STYLES.length];
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
      ))}
      <Star className={small ? "h-6 w-6" : "h-10 w-10"} />
    </Link>
  );
}

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 50 50" className={className} aria-hidden>
      <path
        d="M25 3l6.4 14.6 15.6 1.3-11.9 10.4 3.7 15.6L25 36.6l-13.9 8.3 3.6-15.5L3 19l15.7-1.5z"
        fill="var(--gold)"
        style={{ filter: "drop-shadow(2px 3px 0 rgba(0,0,0,.18))" }}
        transform="rotate(-8 25 25)"
      />
    </svg>
  );
}

export function Tree({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" className={className} aria-hidden>
      <g style={{ filter: "drop-shadow(2px 3px 0 rgba(0,0,0,.18))" }}>
        <rect x="25" y="62" width="10" height="14" fill="#7a4b2a" />
        <path d="M30 4 L52 40 H8 Z" fill="var(--green)" />
        <path d="M30 22 L57 64 H3 Z" fill="var(--green)" />
        <circle cx="22" cy="48" r="3.5" fill="var(--red)" />
        <circle cx="38" cy="38" r="3.5" fill="var(--gold)" />
        <circle cx="40" cy="56" r="3.5" fill="var(--red)" />
      </g>
    </svg>
  );
}

export function Ornament({ className = "", color = "var(--red)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 50" className={className} aria-hidden>
      <g style={{ filter: "drop-shadow(2px 3px 0 rgba(0,0,0,.18))" }}>
        <rect x="15" y="4" width="10" height="8" fill="var(--gold)" />
        <circle cx="20" cy="30" r="17" fill={color} />
        <path d="M5 26 Q20 34 35 26" stroke="var(--paper)" strokeWidth="3" fill="none" />
      </g>
    </svg>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  /** Erro deste campo: aparece embaixo dele e marca o campo como inválido (WCAG 3.3.1). */
  error?: string | null;
  children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-extrabold">
        {label}
      </label>
      {cloneElement(children, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {error && (
        <span id={errorId} className="field-error">
          {error}
        </span>
      )}
      {hint && (
        <span id={hintId} className="text-sm text-ink-soft">
          {hint}
        </span>
      )}
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="paper-card paper-card--red tilt-r !p-3 text-sm font-bold">
      {message}
    </p>
  );
}

/** Pergunta que abre e fecha. Nativo (<details>): funciona sem JS e com leitor de tela. */
export function Help({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="help">
      <summary>{q}</summary>
      <p>{children}</p>
    </details>
  );
}
