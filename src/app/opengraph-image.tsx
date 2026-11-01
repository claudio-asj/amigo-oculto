import { ImageResponse } from "next/og";
import { fonts } from "@/lib/brand";
import { OG_SIZE, OgCard } from "@/lib/og-card";

export const alt = "Amigo Oculto: sorteio de amigo oculto simples e grátis";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        title={"Sorteio de amigo oculto\nsimples e grátis"}
        footer="Crie a sala, mande o link no grupo do WhatsApp e sorteie."
      />
    ),
    { ...size, fonts: await fonts() },
  );
}
