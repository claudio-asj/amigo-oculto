"use client";

import { useState } from "react";
import { api, formatDate } from "./api";
import { ErrorNote, Field, Logo } from "./Paper";

type MasterRoom = {
  id: string;
  name: string;
  budget: string | null;
  eventDate: string | null;
  createdAt: number;
  drawnAt: number | null;
  participants: { id: string; name: string; wishlist: string; joinedAt: number; sessions: number }[];
};

type Overview = {
  stats: { rooms: number; drawn: number; participants: number; wishlists: number };
  rooms: MasterRoom[];
};

const when = (t: number) =>
  new Date(t).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export function MasterClient() {
  const [password, setPassword] = useState<string | null>(null);
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");

  async function load(pw: string) {
    setBusy(true);
    setError(null);
    try {
      setData(await api<Overview>("/api/master", { body: { password: pw } }));
      setPassword(pw);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!data || !password) {
    return (
      <>
        <Logo small />
        <section className="paper-card tape tilt-l">
          <h1 className="font-hand text-4xl text-green">Painel</h1>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              load(String(new FormData(e.currentTarget).get("password") ?? ""));
            }}
          >
            <Field label="Senha">
              <input
                name="password"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                className="input-paper"
              />
            </Field>
            <ErrorNote message={error} />
            <button className="btn-paper" disabled={busy}>
              {busy ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </section>
      </>
    );
  }

  const q = filter.trim().toLowerCase();
  const rooms = q
    ? data.rooms.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.id.includes(q) ||
          r.participants.some((p) => p.name.toLowerCase().includes(q)),
      )
    : data.rooms;
  const { stats } = data;

  return (
    <>
      <Logo small />
      <section className="paper-card tape tilt-l">
        <h1 className="font-hand text-4xl text-green">Painel</h1>
        <dl className="mt-3 grid grid-cols-2 gap-3">
          {[
            ["Salas criadas", stats.rooms],
            ["Sorteios feitos", stats.drawn],
            ["Participantes", stats.participants],
            ["Cartinhas escritas", stats.wishlists],
          ].map(([label, n]) => (
            <div key={label} className="gift-tag flex-col !items-start">
              <dt className="text-sm">{label}</dt>
              <dd className="text-2xl font-extrabold">{n}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-ink-soft">
          Quem tirou quem não aparece aqui: o site promete que ninguém vê isso.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar sala ou pessoa"
            aria-label="Buscar sala ou pessoa"
            className="input-paper"
          />
          <button className="btn-paper btn-paper--paper" disabled={busy} onClick={() => load(password)}>
            {busy ? "Atualizando…" : "Atualizar"}
          </button>
        </div>
        <ErrorNote message={error} />
      </section>

      {rooms.length === 0 && (
        <p className="paper-card text-center">Nenhuma sala {q ? "encontrada" : "criada ainda"}.</p>
      )}

      {rooms.map((r, i) => (
        <section key={r.id} className={`paper-card ${i % 2 ? "tilt-l" : "tilt-r"}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-hand text-3xl text-red">{r.name}</h2>
            <span
              className={`rounded px-2 py-0.5 text-sm font-extrabold text-white ${r.drawnAt ? "bg-green" : "bg-red"}`}
            >
              {r.drawnAt ? "Sorteado" : "Esperando sorteio"}
            </span>
          </div>
          <ul className="mt-2 text-sm">
            <li>
              Código: <code>{r.id}</code> ·{" "}
              <a className="link-paper" href={`/s/${r.id}`} target="_blank" rel="noreferrer">
                abrir convite
              </a>
            </li>
            <li>Criada em {when(r.createdAt)}</li>
            {r.drawnAt && <li>Sorteada em {when(r.drawnAt)}</li>}
            {r.budget && <li>Valor: {r.budget}</li>}
            {r.eventDate && <li>Troca: {formatDate(r.eventDate)}</li>}
          </ul>

          <h3 className="mt-4 font-extrabold">Participantes ({r.participants.length})</h3>
          {r.participants.length === 0 ? (
            <p className="text-ink-soft">Ninguém entrou ainda.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-2">
              {r.participants.map((p) => (
                <li key={p.id} className="rounded border border-[var(--kraft-dark)] p-2">
                  <p className="font-bold">
                    {p.name}{" "}
                    <span className="text-sm font-normal text-ink-soft">
                      entrou {when(p.joinedAt)} · {p.sessions} aparelho{p.sessions === 1 ? "" : "s"}
                    </span>
                  </p>
                  {p.wishlist.trim() ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm">{p.wishlist}</p>
                  ) : (
                    <p className="mt-1 text-sm text-ink-soft">Sem cartinha.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}
