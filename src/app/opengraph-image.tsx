import { ImageResponse } from "next/og";
import { fonts } from "@/lib/brand";
import { OG_SIZE, OgCard } from "@/lib/og-card";

export const alt = "Amigo Oculto: sorteio sem cadastro e sem ninguém espiar";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <OgCard
        title="Sorteio sem cadastro e sem ninguém espiar."
        footer="Crie a sala, mande o link no grupo e sorteie. É grátis."
      />
    ),
    { ...size, fonts: await fonts() },
  );
}
