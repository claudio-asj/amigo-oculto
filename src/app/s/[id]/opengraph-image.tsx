import { ImageResponse } from "next/og";
import { fonts } from "@/lib/brand";
import { formatDate } from "@/lib/format";
import { OG_SIZE, OgCard } from "@/lib/og-card";
import { findPublicRoom } from "@/lib/rooms";

// Preview do convite quando o link da sala é colado no WhatsApp.
export const alt = "Convite para o amigo oculto";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const room = findPublicRoom((await params).id);
  const details = room && [room.budget, formatDate(room.eventDate)].filter(Boolean).join("  ·  ");

  return new ImageResponse(
    room ? (
      <OgCard
        card="green"
        kicker={room.drawn ? "O sorteio já foi feito!" : "Convite pro amigo oculto"}
        title={room.name}
        footer={room.drawn ? "Abra o link para ver quem você tirou." : details || "Toque para entrar com seu nome."}
      />
    ) : (
      <OgCard title="Sorteio sem cadastro e sem ninguém espiar." />
    ),
    { ...size, fonts: await fonts() },
  );
}
