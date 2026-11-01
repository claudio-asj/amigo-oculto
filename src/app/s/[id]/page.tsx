import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { RoomClient } from "@/components/RoomClient";
import { Loading } from "@/components/RoomHeader";
import { findPublicRoom } from "@/lib/rooms";

// O título e a descrição viram o texto do preview quando o convite é colado no
// WhatsApp. A imagem vem de ./opengraph-image.tsx.
export async function generateMetadata({ params }: PageProps<"/s/[id]">): Promise<Metadata> {
  const room = findPublicRoom((await params).id);
  const robots = { index: false, follow: false };
  if (!room) return { title: "Sala não encontrada", robots };
  const description = room.drawn
    ? "O sorteio já foi feito. Abra para ver quem você tirou."
    : "Escreva seu nome e invente uma senha de 4 números. Ninguém vê quem tirou quem.";
  return {
    title: room.name,
    description,
    robots,
    alternates: { canonical: null },
    openGraph: { title: `Amigo oculto: ${room.name}`, description, url: `/s/${room.id}` },
  };
}

// Avisa o Next que a página tem parte dinâmica (os metadados dependem da sala),
// sem tirar o resto do shell estático.
async function Dynamic() {
  await connection();
  return null;
}

export default function RoomPage() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <RoomClient />
      </Suspense>
      <Suspense>
        <Dynamic />
      </Suspense>
    </>
  );
}
