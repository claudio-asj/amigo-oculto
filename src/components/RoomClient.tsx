"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, formatDate, type Me, type PublicRoom } from "./api";
import { ErrorNote, Field, Help, Ornament, Star } from "./Paper";
import { Loading, NotFound, ParticipantTags, RoomHeader } from "./RoomHeader";

type State = { room: PublicRoom; me: Me | null };

export function RoomClient() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setState(await api<State>(`/api/rooms/${id}/me`));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      await null;
      await load();
    })();
  }, [load]);

  // Enquanto espera o sorteio, atualiza sozinho.
  const waiting = state && !state.room.drawn;
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [waiting, load]);

  if (error && !state) return <NotFound message={error} />;
  if (!state) return <Loading />;

  const { room, me } = state;
  return (
    <>
      <RoomHeader room={room} />
      {me ? <Inside room={room} me={me} reload={load} /> : <Outside room={room} reload={load} />}
    </>
  );
}

// ---------- Ainda não entrou ----------

function Outside({ room, reload }: { room: PublicRoom; reload: () => void }) {
  const [mode, setMode] = useState<"join" | "login">(room.drawn ? "login" : "join");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const joining = mode === "join";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "").trim();
    const pin = String(f.get("pin") ?? "");
    // Validação nossa, em português: a do navegador pode aparecer em inglês.
    if (!name) return setError("Escreva o seu nome no primeiro campo.");
    if (!/^\d{4}$/.test(pin)) {
      return setError(
        `A senha precisa ter 4 números. Você digitou ${pin.length === 0 ? "nenhum" : pin.length}.`,
      );
    }
    setBusy(true);
    setError(null);
    try {
      await api(`/api/rooms/${room.id}/${mode}`, { body: { name, pin } });
      reload();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  function switchMode() {
    setError(null);
    setMode(joining ? "login" : "join");
  }

  return (
    <>
      {joining && (
        <section className="paper-card tilt-r">
          <h2 className="font-hand text-3xl text-green">Chegou o convite pro amigo oculto!</h2>
          <p className="mb-3">É bem simples. Funciona assim:</p>
          <ol className="steps">
            <li>Escreva o seu nome aqui embaixo.</li>
            <li>Invente uma senha de 4 números e anote num papel.</li>
            <li>
              Espere quem organizou fazer o sorteio. Depois abra <strong>este mesmo link</strong> de
              novo para ver quem você tirou.
            </li>
          </ol>
        </section>
      )}

      <section className="paper-card tape tilt-l edge-zigzag">
        <h2 className="font-hand text-4xl text-red">
          {joining ? "Entrar no sorteio" : "Já entrei antes"}
        </h2>
        <p className="mb-5">
          {joining
            ? "A senha serve para ninguém mais abrir o seu envelope. Não precisa de e-mail nem cadastro."
            : room.drawn
              ? "O sorteio já foi feito! Escreva o mesmo nome e a mesma senha que você usou quando entrou."
              : "Escreva o mesmo nome e a mesma senha que você usou da primeira vez."}
        </p>
        <form key={mode} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <Field
            label="Seu nome"
            hint={joining ? "Do jeito que a família te chama. Exemplo: Tia Lurdes." : undefined}
          >
            <input
              name="name"
              maxLength={40}
              autoComplete="given-name"
              autoCapitalize="words"
              className="input-paper"
            />
          </Field>
          <Field
            label={joining ? "Invente uma senha de 4 números" : "Sua senha de 4 números"}
            hint={
              joining
                ? "Só números, por exemplo 2512. Anote num papel: vai precisar dela se trocar de celular."
                : undefined
            }
          >
            <input
              name="pin"
              inputMode="numeric"
              maxLength={4}
              autoComplete="off"
              placeholder="••••"
              className="input-paper pin-input"
              onInput={(e) => {
                const el = e.currentTarget;
                el.value = el.value.replace(/\D/g, "").slice(0, 4);
              }}
            />
          </Field>
          <ErrorNote message={error} />
          <button className="btn-paper mt-1 text-lg" disabled={busy}>
            {busy ? "Entrando, aguarde…" : joining ? "Entrar no sorteio" : "Abrir meu envelope"}
          </button>
        </form>
      </section>

      {!room.drawn && (
        <section className="paper-card tilt-r text-center">
          <p className="font-bold">
            {joining
              ? "Já entrou antes, por outro celular ou computador?"
              : "É a primeira vez que você abre este convite?"}
          </p>
          <button className="btn-paper btn-paper--paper mt-3 w-full" onClick={switchMode}>
            {joining ? "Já entrei antes" : "Voltar e entrar pela primeira vez"}
          </button>
        </section>
      )}

      <section className="paper-card tilt-r">
        <h2 className="font-hand mb-3 text-3xl text-green">Quem já está no sorteio</h2>
        <ParticipantTags room={room} />
      </section>

      <RoomHelp />
    </>
  );
}

// ---------- Já entrou ----------

function Inside({ room, me, reload }: { room: PublicRoom; me: Me; reload: () => void }) {
  async function logout() {
    if (!confirm(`Sair? Para entrar de novo neste celular vai precisar do nome e da senha.`)) return;
    await api(`/api/rooms/${room.id}/logout`, { body: {} }).catch(() => {});
    reload();
  }

  return (
    <>
      {me.match ? (
        <Envelope name={me.name} match={me.match} room={room} />
      ) : (
        <section className="paper-card tape tilt-l relative">
          <Ornament className="absolute -left-3 -top-6 h-14 w-11 rotate-[-12deg]" />
          <p className="font-hand text-center text-4xl text-red">
            Pronto, {me.name}! <span aria-hidden>👋</span>
          </p>
          <p className="mt-2 mb-4 text-center font-bold">Você já está no sorteio. O que acontece agora:</p>
          <ol className="steps">
            <li>Quem organizou vai fazer o sorteio quando todo mundo tiver entrado.</li>
            <li>
              Pode fechar esta página sem medo. Para voltar, abra <strong>o mesmo link</strong> que
              te mandaram no WhatsApp.
            </li>
            <li>Depois do sorteio, vai aparecer aqui um envelope com o nome de quem você tirou.</li>
          </ol>
        </section>
      )}

      <Wishlist roomId={room.id} initial={me.wishlist} />

      <section className="paper-card tilt-r">
        <h2 className="font-hand mb-3 text-3xl text-green">
          Quem está no sorteio ({room.participants.length})
        </h2>
        <ParticipantTags room={room} me={me.id} />
      </section>

      <RoomHelp drawn={room.drawn} />

      <section className="text-center">
        <p className="font-bold">Este celular é de outra pessoa, e não de {me.name}?</p>
        <button className="link-paper mt-2 min-h-12 font-bold" onClick={logout}>
          Sair para outra pessoa entrar
        </button>
      </section>
    </>
  );
}

function Envelope({
  name,
  match,
  room,
}: {
  name: string;
  match: { name: string; wishlist: string };
  room: PublicRoom;
}) {
  const [open, setOpen] = useState(false);
  const date = formatDate(room.eventDate);
  return (
    <section className="flex flex-col items-center gap-2 text-center">
      <p className="font-hand text-4xl">{name}, o sorteio foi feito!</p>
      <p className="font-bold">
        Quem você tirou está dentro do envelope. Antes de abrir, veja se ninguém está olhando a
        sua tela. <span aria-hidden>🤫</span>
      </p>
      <button
        type="button"
        className={`envelope ${open ? "is-open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="resultado"
        aria-label={open ? "Fechar envelope" : "Abrir envelope"}
      >
        <span className="envelope__back" />
        <span className="envelope__letter edge-zigzag" aria-hidden>
          {open && (
            <>
              <span className="font-extrabold text-ink-soft">Você vai dar presente para</span>
              <span className="font-hand text-5xl leading-none text-red">{match.name}</span>
            </>
          )}
        </span>
        <span className="envelope__body" />
        <span className="envelope__flap" />
        <span className="envelope__seal">
          <Star className="h-14 w-14" />
        </span>
      </button>
      <p className="text-lg font-bold" aria-hidden>
        {open ? "Toque no envelope para fechar de novo" : "👆 Toque no envelope para abrir"}
      </p>
      <p id="resultado" role="status" className="sr-only">
        {open ? `Você vai dar presente para ${match.name}.` : ""}
      </p>

      {open && (
        <>
          <div className="paper-card tilt-l mt-4 w-full text-left">
            <h2 className="font-hand text-3xl text-red">E agora?</h2>
            <ol className="steps mt-3">
              <li>
                Compre um presente para <strong>{match.name}</strong>
                {room.budget ? ` (valor combinado: ${room.budget})` : ""}.
              </li>
              <li>
                Não conte pra ninguém! A graça é a surpresa
                {date ? ` no dia ${date}` : " no dia da troca"}.
              </li>
              <li>Esqueceu quem tirou? É só abrir este link de novo, o envelope fica guardado aqui.</li>
            </ol>
          </div>
          <div className="paper-card tape tilt-r mt-2 w-full text-left">
            <h2 className="font-hand text-3xl text-green">O que {match.name} quer ganhar</h2>
            <p className="mt-2 whitespace-pre-wrap">
              {match.wishlist.trim() ||
                `${match.name} ainda não escreveu nenhuma dica. Volte aqui mais perto do dia, pode ser que apareça!`}
            </p>
          </div>
        </>
      )}
    </section>
  );
}

function Wishlist({ roomId, initial }: { roomId: string; initial: string }) {
  const [text, setText] = useState(initial);
  const [status, setStatus] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");

  const save = useCallback(
    async (value: string) => {
      setStatus("saving");
      try {
        await api(`/api/rooms/${roomId}/wishlist`, { method: "PUT", body: { wishlist: value } });
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    },
    [roomId],
  );

  // Salva sozinho 1,5 s depois que a pessoa para de digitar: ninguém perde a
  // cartinha por esquecer o botão.
  useEffect(() => {
    if (status !== "dirty") return;
    const t = setTimeout(() => save(text), 1500);
    return () => clearTimeout(t);
  }, [text, status, save]);

  // Avisa se tentar fechar a página com algo ainda não salvo.
  useEffect(() => {
    if (status !== "dirty" && status !== "saving") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  return (
    <section className="paper-card tilt-l">
      <h2 id="cartinha-title" className="font-hand text-3xl text-red">
        Minha cartinha
      </h2>
      <p id="cartinha-hint" className="mb-3">
        Escreva aqui o que você gostaria de ganhar: tamanho de roupa, cor preferida, o que você
        não gosta. Só a pessoa que tirar você vai ler. Não é obrigatório.
      </p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setStatus("dirty");
        }}
        aria-labelledby="cartinha-title"
        aria-describedby="cartinha-hint cartinha-status"
        maxLength={1000}
        rows={4}
        placeholder="Exemplo: blusa tamanho M, gosto de azul, livro de receitas…"
        className="input-paper resize-y"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          className="btn-paper btn-paper--green"
          onClick={() => save(text)}
          disabled={status === "saving"}
        >
          {status === "saving" ? "Salvando…" : "Salvar cartinha"}
        </button>
        <span id="cartinha-status" role="status" className="font-bold">
          {status === "dirty" && <span className="text-ink-soft">Salvando daqui a pouco…</span>}
          {status === "saved" && <span className="text-green">Cartinha salva ✓</span>}
          {status === "error" && (
            <span className="text-red">Não conseguiu salvar. Confira a internet e toque no botão.</span>
          )}
        </span>
      </div>
      <p className="mt-2 text-ink-soft">A cartinha salva sozinha enquanto você escreve.</p>
    </section>
  );
}

function RoomHelp({ drawn = false }: { drawn?: boolean }) {
  return (
    <section className="paper-card tilt-l">
      <h2 className="font-hand mb-2 text-3xl text-green">Dúvidas</h2>
      <Help q="Como eu volto aqui depois?">
        Abra o mesmo link que te mandaram no WhatsApp. Neste celular você entra direto. Em outro
        celular ou computador, toque em “Já entrei antes” e use o seu nome e a sua senha.
      </Help>
      <Help q="Esqueci minha senha. E agora?">
        {drawn
          ? "Depois do sorteio não tem como trocar a senha, porque ninguém, nem quem organizou, consegue ver os resultados. Se este celular ainda abre direto, você não precisa dela."
          : "Antes do sorteio tem jeito: peça para quem organizou tirar o seu nome da lista e entre de novo com uma senha nova."}
      </Help>
      <Help q="Quem organizou consegue ver quem eu tirei?">
        Não. Cada pessoa só vê o próprio envelope. Nem quem organizou, nem ninguém do grupo.
      </Help>
      <Help q="Posso tirar a mim mesmo?">Não. O sorteio nunca deixa alguém tirar o próprio nome.</Help>
      <Help q="Preciso instalar alguma coisa?">
        Não. É só esta página. Não precisa de aplicativo, e-mail nem cadastro.
      </Help>
    </section>
  );
}
