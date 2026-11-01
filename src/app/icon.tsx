import { ImageResponse } from "next/og";
import { C, LetterTile, Star, fonts } from "@/lib/brand";

// /icon/32 é o favicon da aba; 192 e 512 servem ao manifest (instalar no celular).
export function generateImageMetadata() {
  return [32, 192, 512].map((s) => ({
    id: String(s),
    size: { width: s, height: s },
    contentType: "image/png",
  }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const s = Number(await id);
  const small = s <= 48;
  return new ImageResponse(
    small ? (
      // No tamanho de aba só cabe uma letra: o "A" vermelho do logo.
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
        <LetterTile ch="A" size={s * 0.84} rotate={-6} />
      </div>
    ) : (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          background: C.kraft,
          borderRadius: s * 0.18,
        }}
      >
        <div style={{ display: "flex", position: "absolute", left: s * 0.1, top: s * 0.14 }}>
          <LetterTile ch="A" size={s * 0.5} rotate={-6} />
        </div>
        <div style={{ display: "flex", position: "absolute", left: s * 0.42, top: s * 0.38 }}>
          <LetterTile ch="O" size={s * 0.5} bg={C.green} rotate={5} />
        </div>
        <div style={{ display: "flex", position: "absolute", right: s * 0.06, top: s * 0.06 }}>
          <Star size={s * 0.3} />
        </div>
      </div>
    ),
    { width: s, height: s, fonts: await fonts() },
  );
}
