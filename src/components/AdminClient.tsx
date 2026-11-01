"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, useCopy, type PublicRoom } from "./api";
import { Check } from "lucide-react";
import { siWhatsapp } from "simple-icons";
import { BrandIcon, Icon3D } from "./Icons";
import { ErrorNote, Help, Star } from "./Paper";
import { Loading, NotFound, ParticipantTags, RoomHeader } from "./RoomHeader";

const MIN = 3;

function readToken(id: string): string | null {
  const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("k");
  try {
    const saved = JSON.parse(localStorage.getItem("ao_admin") ?? "{}");
    if (fromHash) {
      saved[id] = fromHash;
      localStorage.setItem("ao_admin", JSON.stringify(saved));
      return fromHash;
    }
    return saved[id] ?? null;
  } catch {
    return fromHash;
  }
}

export function AdminClient() {
  const { id } = useParams<{ id: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const call = useCallback(
    async (t: string, action: string, extra: Record<string, unknown> = {}) => {
      const res = await api<{ room: PublicRoom }>(`/api/rooms/${id}/admin`, {
        body: { token: t, action, ...extra },
      });
      setRoom(res.room);
    },
    [id],
  );

  useEffect(() => {
    (async () => {
      await null;
      const t = readToken(id);
      if (!t) {
        setFatal("Este link de organizador está incompleto. Use o link completo que você salvou.");
        return;
      }
      setToken(t);
      await call(t, "get");
    })().catch((e) => setFatal((e as Error).message));
  }, [id, call]);

  const waiting = room && !room.drawn;
  useEffect(() => {
    if (!waiting || !token) return;
    const t = setInterval(() => call(token, "get").catch(() => {}), 10000);
    return () => clearInterval(t);
  }, [waiting, token, call]);

  if (fatal) return <NotFound message={fatal} />;
  if (!room || !token) return <Loading />;

  const origin = window.location.origin;
  const inviteUrl = `${origin}/s/${room.id}`;
  const adminUrl = `${origin}/s/${room.id}/admin#k=${token}`;
  const whatsText = `🎁 Amigo oculto "${room.name}"!\nToque no link, escreva seu nome e invente uma senha de 4 números (anote ela!):\n${inviteUrl}`;

  async function act(action: string, extra?: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      await call(token!, action, extra);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <RoomHeader room={room} />

      <section className="paper-card paper-card--red tilt-l relative">
        <p className="font-hand text-3xl">Esta é a sua página de organizar</p>
        <p className="mt-1">
          Daqui você chama as pessoas e faz o sorteio. Você <strong>não</strong> vai ver quem tirou
          quem, ninguém vê.
        </p>
        <p className="mt-3 font-bold">
          Importante: guarde o endereço desta página. Sem ele você não consegue voltar aqui para
          sortear.
        </p>
        <p className="mt-1">
          O jeito mais fácil é mandar para você mesmo no WhatsApp (escolha o seu próprio nome ou
          um grupo só seu na lista de conversas).
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <a
            className="btn-paper btn-paper--paper"
            href={`https://wa.me/?text=${encodeURIComponent(`Meu link para organizar o amigo oculto "${room.name}" (não mande pra ninguém):\n${adminUrl}`)}`}
            target="_blank"
            rel="noreferrer"
          >
            <BrandIcon icon={siWhatsapp} size={22} /> Guardar no meu WhatsApp
          </a>
        </div>
        <CopyRow url={adminUrl} label="Ou copiar o endereço" variant="paper" />
      </section>

      {!room.drawn && (
        <section className="paper-card tape tilt-r">
          <h2 className="font-hand text-3xl text-green">Passo 1: chame as pessoas</h2>
          <p className="mb-3">
            Toque em “Mandar convite no WhatsApp”, escolha o grupo da família e envie. Cada pessoa abre o
            link, escreve o nome e inventa uma senha.
          </p>
          <a
            className="btn-paper btn-paper--green w-full text-lg"
            href={`https://wa.me/?text=${encodeURIComponent(whatsText)}`}
            target="_blank"
            rel="noreferrer"
          >
            <BrandIcon icon={siWhatsapp} size={24} /> Mandar convite no WhatsApp
          </a>
          <p className="mt-5 font-bold">Você também vai participar do sorteio?</p>
          <p className="mb-2">Então entre pelo convite, igual a todo mundo:</p>
          <a className="btn-paper btn-paper--paper w-full" href={inviteUrl} target="_blank" rel="noreferrer">
            Eu também vou participar
          </a>
          <details className="help mt-4">
            <summary>Prefiro copiar o convite e colar em outro lugar</summary>
            <p className="!pl-0">
              Toque em “Copiar convite”. Depois, na conversa onde quer mandar, segure o dedo na caixa
              de mensagem e escolha “Colar”.
            </p>
            <CopyRow url={inviteUrl} label="Copiar convite" />
          </details>
        </section>
      )}

      <section className="paper-card tilt-l">
        <h2 className="font-hand mb-3 text-3xl text-green">
          {room.drawn ? "Participantes" : "Passo 2: veja quem já entrou"} ({room.participants.length})
        </h2>
        {room.drawn ? (
          <ParticipantTags room={room} />
        ) : room.participants.length === 0 ? (
          <p>
            Ninguém entrou ainda. Os nomes aparecem aqui sozinhos conforme as pessoas entram, não
            precisa recarregar.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {room.participants.map((p) => (
              <li key={p.id} className="gift-tag">
                {p.name}
                <button
                  className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-full font-extrabold text-[var(--red-dark)] hover:bg-red hover:text-white"
                  aria-label={`Remover ${p.name}`}
                  disabled={busy}
                  onClick={() => {
                    if (confirm(`Remover ${p.name} da sala?`)) act("remove", { participantId: p.id });
                  }}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {room.drawn ? (
        <section className="paper-card tape tilt-r relative text-center">
          <Star className="absolute -top-6 right-0 h-14 w-14" />
          <p className="font-hand flex items-center justify-center gap-2 text-4xl text-green">
            Sorteio feito! <Icon3D name="festa" size={44} />
          </p>
          <p className="mt-2">
            Agora avise o grupo: cada pessoa abre o mesmo link do convite e vê{" "}
            <strong>só quem ela tirou</strong>. Se você também participa, abra o convite para ver o
            seu.
          </p>
          <div className="mt-4 flex justify-center">
            <a
              className="btn-paper btn-paper--green"
              href={`https://wa.me/?text=${encodeURIComponent(
                `🎁 Sorteio do amigo oculto "${room.name}" feito! Abra o mesmo link de antes para ver quem você tirou:\n${inviteUrl}`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <BrandIcon icon={siWhatsapp} size={22} /> Avisar no WhatsApp
            </a>
          </div>
        </section>
      ) : (
        <section className="paper-card tape tape-red tilt-r edge-zigzag">
          <h2 className="font-hand text-3xl text-red">Passo 3: sortear</h2>
          <p className="mb-2">
            Confira se todo mundo está na lista do passo 2. Faltou alguém? Mande o convite de novo
            para essa pessoa.
          </p>
          <p className="mb-4 font-bold">
            Atenção: depois de sortear, ninguém mais consegue entrar e não dá para sortear de novo.
          </p>
          <ErrorNote message={error} />
          <button
            className="btn-paper mt-2 w-full text-xl"
            disabled={busy || room.participants.length < MIN}
            onClick={() => {
              if (
                confirm(
                  `Sortear entre ${room.participants.length} pessoas? Ninguém mais vai poder entrar.`,
                )
              )
                act("draw");
            }}
          >
            {room.participants.length < MIN
              ? `Faltam ${MIN - room.participants.length} pessoa${MIN - room.participants.length > 1 ? "s" : ""} para poder sortear`
              : busy
                ? "Misturando os papéis…"
                : (
                  <>
                    <Icon3D name="presente" size={30} /> Bora sortear!
                  </>
                )}
          </button>
        </section>
      )}

      <section className="paper-card tilt-l">
        <h2 className="font-hand mb-2 text-3xl text-green">Dúvidas</h2>
        <Help q="Eu também posso participar?">
          Pode. Toque em “Eu também vou participar” e entre com o seu nome e uma senha, igual a todo
          mundo. Você não vai ver o resultado dos outros, só o seu.
        </Help>
        <Help q="Alguém entrou com o nome errado ou entrou duas vezes. O que faço?">
          Antes do sorteio, toque no × ao lado do nome, na lista do passo 2. A pessoa pode entrar de
          novo pelo convite.
        </Help>
        <Help q="Alguém esqueceu a senha antes do sorteio.">
          Tire o nome da pessoa da lista (no ×) e peça para ela entrar de novo pelo convite, com uma
          senha nova.
        </Help>
        <Help q="Perdi o endereço desta página. E agora?">
          Procure no histórico do navegador deste celular: a página se chama “Organizar”. Se não
          achar, não tem outro jeito de voltar. Por isso vale guardar o endereço no seu WhatsApp.
        </Help>
        <Help q="Dá para sortear de novo?">
          Não. Depois do sorteio o resultado fica fixo, para ninguém poder trocar quem tirou quem.
        </Help>
      </section>
    </>
  );
}

function CopyRow({ url, label, variant }: { url: string; label: string; variant?: "paper" }) {
  const copy = useCopy();
  const [done, setDone] = useState(false);
  return (
    <div className="mt-3 flex flex-col gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="input-paper text-sm"
        aria-label={label}
      />
      <button
        className={`btn-paper ${variant === "paper" ? "btn-paper--paper" : ""}`}
        onClick={async () => {
          if (await copy(url)) {
            setDone(true);
            setTimeout(() => setDone(false), 4000);
          }
        }}
      >
        {done ? (
          <>
            Copiado! Agora é só colar <Check size={20} aria-hidden />
          </>
        ) : (
          label
        )}
      </button>
      <span role="status" className="sr-only">
        {done ? "Link copiado" : ""}
      </span>
    </div>
  );
}
