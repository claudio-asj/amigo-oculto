"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "./api";
import { DateSelect } from "./DateSelect";
import { ErrorNote, Field } from "./Paper";

export function CreateRoomForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [dateErr, setDateErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (!String(f.get("name") ?? "").trim()) {
      setNameErr("Escreva um nome para o grupo, por exemplo “Família Souza”.");
      (form.elements.namedItem("name") as HTMLInputElement).focus();
      return;
    }
    setNameErr(null);
    if (f.get("eventDateIncompleta") === "1") {
      setDateErr("Faltou escolher o dia, o mês ou o ano. Complete ou toque em “Apagar a data”.");
      form.querySelector<HTMLSelectElement>("fieldset select")?.focus();
      return;
    }
    setDateErr(null);
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
      <Field label="Nome do grupo" hint="Todo mundo vai ver esse nome no convite." error={nameErr}>
        <input
          name="name"
          maxLength={80}
          placeholder="Exemplo: Família Souza"
          className="input-paper"
        />
      </Field>
      <Field label="Valor do presente" hint="Pode deixar em branco.">
        <input name="budget" maxLength={40} placeholder="até R$ 100" className="input-paper" />
      </Field>
      <DateSelect
        name="eventDate"
        legend="Dia da troca de presentes"
        hint="Pode deixar em branco."
        error={dateErr}
      />
      <ErrorNote message={error} />
      <button className="btn-paper mt-2 text-lg" disabled={busy}>
        {busy ? "Criando, aguarde…" : "Criar o sorteio"}
      </button>
    </form>
  );
}
