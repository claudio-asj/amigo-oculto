"use client";

import Link from "next/link";
import { formatDate, type PublicRoom } from "./api";
import { Logo } from "./Paper";

export function RoomHeader({ room }: { room: PublicRoom }) {
  const date = formatDate(room.eventDate);
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <Logo small />
      <div className="paper-card paper-card--green tape tape-red tilt-r edge-torn w-full !py-8">
        <h1 className="font-hand text-4xl leading-none sm:text-5xl">{room.name}</h1>
        {(room.budget || date) && (
          <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 font-bold">
            {room.budget && (
              <span>
                <span aria-hidden>💰 </span>
                <span className="sr-only">Valor: </span>
                {room.budget}
              </span>
            )}
            {date && (
              <span>
                <span aria-hidden>📅 </span>
                <span className="sr-only">Data: </span>
                {date}
              </span>
            )}
          </p>
        )}
      </div>
    </header>
  );
}

export function ParticipantTags({ room, me }: { room: PublicRoom; me?: string }) {
  if (room.participants.length === 0) {
    return <p className="text-ink-soft">Ninguém entrou ainda.</p>;
  }
  return (
    <ul className="flex flex-wrap gap-3">
      {room.participants.map((p) => (
        <li key={p.id} className="gift-tag">
          {p.name}
          {p.id === me && <span className="text-xs font-extrabold text-green">(você)</span>}
        </li>
      ))}
    </ul>
  );
}

export function Loading() {
  return (
    <p className="font-hand animate-pulse py-20 text-center text-4xl" role="status">
      Desembrulhando…
    </p>
  );
}

export function NotFound({ message }: { message: string }) {
  return (
    <>
      <Logo small />
      <div className="paper-card tape tilt-l text-center">
        <p className="font-hand text-4xl text-red">Ops!</p>
        <p className="mt-2">{message}</p>
        <Link href="/" className="btn-paper btn-paper--green mt-5">
          Criar uma sala nova
        </Link>
      </div>
    </>
  );
}
