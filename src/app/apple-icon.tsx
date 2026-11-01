import { ImageResponse } from "next/og";
import { C, LetterTile, Star, fonts } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS não aceita transparência e arredonda os cantos sozinho: fundo kraft cheio.
export default async function AppleIcon() {
  const s = size.width;
  return new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: C.kraft }}>
        <div style={{ display: "flex", position: "absolute", left: s * 0.12, top: s * 0.15 }}>
          <LetterTile ch="A" size={s * 0.48} rotate={-6} />
        </div>
        <div style={{ display: "flex", position: "absolute", left: s * 0.42, top: s * 0.38 }}>
          <LetterTile ch="O" size={s * 0.48} bg={C.green} rotate={5} />
        </div>
        <div style={{ display: "flex", position: "absolute", right: s * 0.08, top: s * 0.07 }}>
          <Star size={s * 0.28} />
        </div>
      </div>
    ),
    { ...size, fonts: await fonts() },
  );
}
