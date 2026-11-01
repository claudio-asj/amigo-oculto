import "server-only";
import { C, CutWord, Star } from "./brand";

export const OG_SIZE = { width: 1200, height: 630 };

/** Mesa de kraft com o logo recortado em cima e um cartão de papel embaixo. */
export function OgCard({
  kicker,
  title,
  footer,
  card = "paper",
}: {
  kicker?: string;
  title: string;
  footer?: string;
  card?: "paper" | "green";
}) {
  const green = card === "green";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 44,
        width: "100%",
        height: "100%",
        background: C.kraft,
        fontFamily: "Nunito",
        color: C.ink,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <CutWord word="AMIGO" size={58} />
        <CutWord word="OCULTO" size={58} start={5} />
        <Star size={84} />
      </div>

      <div
        style={{
          display: "flex",
          position: "relative",
          flexDirection: "column",
          alignItems: "center",
          width: 980,
          padding: "44px 56px 40px",
          background: green ? C.green : C.paper,
          color: green ? "#fff" : C.ink,
          transform: "rotate(-1.2deg)",
          boxShadow: "6px 9px 0 rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        {/* fita adesiva */}
        <div
          style={{
            position: "absolute",
            top: -20,
            left: 430,
            width: 150,
            height: 40,
            background: C.tape,
            transform: "rotate(-5deg)",
          }}
        />
        {kicker && <div style={{ fontSize: 34, opacity: 0.9 }}>{kicker}</div>}
        <div
          style={{
            fontFamily: "Caveat",
            fontSize: title.length > 28 ? 78 : 96,
            lineHeight: 1.05,
            whiteSpace: "pre-line",
            color: green ? "#fff" : C.red,
            marginTop: kicker ? 6 : 0,
          }}
        >
          {title}
        </div>
        {footer && <div style={{ fontSize: 30, marginTop: 14, opacity: 0.9 }}>{footer}</div>}
      </div>
    </div>
  );
}
