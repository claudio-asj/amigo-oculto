import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Mesmas cores de globals.css. O Satori (ImageResponse) não lê variáveis CSS.
export const C = {
  kraft: "#c9a57a",
  kraftDark: "#a9845a",
  paper: "#fbf6ea",
  ink: "#2b211b",
  inkSoft: "#5e4e42",
  red: "#c8312f",
  redDark: "#962221",
  green: "#2f6b45",
  greenDark: "#204c31",
  gold: "#e0b345",
  tape: "rgba(243, 227, 163, 0.8)",
};

export const SITE_NAME = "Amigo Oculto";
export const SITE_URL = new URL(process.env.SITE_URL || "https://amigooculto.claudiojr.dev.br");

// Mesma sequência de retalhos do <Logo /> (Paper.tsx).
const LETTERS = [
  { bg: C.red, fg: "#fff", r: -4 },
  { bg: C.paper, fg: C.ink, r: 3 },
  { bg: C.green, fg: "#fff", r: -2 },
  { bg: C.gold, fg: C.ink, r: 5 },
  { bg: C.paper, fg: C.red, r: -3 },
  { bg: C.red, fg: "#fff", r: 2 },
  { bg: C.green, fg: "#fff", r: 4 },
];

// Fontes em .woff (o Satori não aceita woff2). Em produção o Dockerfile copia
// src/assets/fonts para dentro da imagem, porque a OG de cada sala é gerada
// em tempo de requisição.
const fontFile = (f: string) => readFile(join(process.cwd(), "src/assets/fonts", f));
const fontsPromise = Promise.all([
  fontFile("rubik-mono-one-latin-400-normal.woff"),
  fontFile("caveat-latin-700-normal.woff"),
  fontFile("nunito-latin-800-normal.woff"),
]);

export async function fonts() {
  const [rubik, caveat, nunito] = await fontsPromise;
  return [
    { name: "Rubik Mono One", data: rubik, weight: 400 as const, style: "normal" as const },
    { name: "Caveat", data: caveat, weight: 700 as const, style: "normal" as const },
    { name: "Nunito", data: nunito, weight: 800 as const, style: "normal" as const },
  ];
}

export function CutWord({ word, size, start = 0 }: { word: string; size: number; start?: number }) {
  return (
    <div style={{ display: "flex", gap: size * 0.08 }}>
      {word.split("").map((ch, i) => {
        const s = LETTERS[(start + i) % LETTERS.length];
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Rubik Mono One",
              fontSize: size,
              lineHeight: 1,
              padding: `${size * 0.12}px ${size * 0.22}px`,
              background: s.bg,
              color: s.fg,
              transform: `rotate(${s.r}deg)`,
              boxShadow: `${size * 0.06}px ${size * 0.09}px 0 rgba(0,0,0,0.2)`,
            }}
          >
            {ch}
          </div>
        );
      })}
    </div>
  );
}

export function Star({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50">
      <path
        d="M25 3l6.4 14.6 15.6 1.3-11.9 10.4 3.7 15.6L25 36.6l-13.9 8.3 3.6-15.5L3 19l15.7-1.5z"
        fill={C.gold}
        transform="rotate(-8 25 25)"
      />
    </svg>
  );
}

/** Um retalho de cartolina com uma letra, como no logo. Base do favicon. */
export function LetterTile({
  ch,
  size,
  bg = C.red,
  fg = "#fff",
  rotate = -6,
}: {
  ch: string;
  size: number;
  bg?: string;
  fg?: string;
  rotate?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontFamily: "Rubik Mono One",
        fontSize: size * 0.62,
        lineHeight: 1,
        paddingTop: size * 0.04,
        borderBottom: `${Math.max(1, size * 0.06)}px solid ${bg === C.red ? C.redDark : C.greenDark}`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {ch}
    </div>
  );
}
