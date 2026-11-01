"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./api";
import { ErrorNote, Field } from "./Paper";

export function CreateRoomForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!String(f.get("name") ?? "").trim()) {
      setError("Escreva um nome para o grupo, por exemplo “Família Souza”.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { id, adminToken } = await api<{ id: string; adminToken: string }>("/api/rooms", {
        body: {
          name: f.get("name"),
          budget: f.get("budget"),
          eventDate: f.get("eventDate"),
        },
      });
      try {
        const saved = JSON.parse(localStorage.getItem("ao_admin") ?? "{}");
        saved[id] = adminToken;
        localStorage.setItem("ao_admin", JSON.stringify(saved));
      } catch {}
      router.push(`/s/${id}/admin#k=${adminToken}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Nome do grupo" hint="Todo mundo vai ver esse nome no convite.">
        <input
          name="name"
          maxLength={80}
          placeholder="Exemplo: Família Souza"
          className="input-paper"
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Valor do presente" hint="Pode deixar em branco.">
          <input name="budget" maxLength={40} placeholder="até R$ 100" className="input-paper" />
        </Field>
        <Field label="Dia da troca de presentes" hint="Pode deixar em branco.">
          <input name="eventDate" type="date" className="input-paper" />
        </Field>
      </div>
      <ErrorNote message={error} />
      <button className="btn-paper mt-2 text-lg" disabled={busy}>
        {busy ? "Criando, aguarde…" : "Criar o sorteio"}
      </button>
    </form>
  );
}
