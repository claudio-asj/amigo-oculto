"use client";

import { useId, useState, useSyncExternalStore } from "react";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const pad = (n: number) => String(n).padStart(2, "0");
const daysIn = (month: number, year: number) => new Date(year, month, 0).getDate();
const noop = () => () => {};

/**
 * Data em três listas (dia, mês por extenso, ano) no lugar do <input type="date">,
 * que muda muito de um celular para outro e confunde quem tem pouca prática.
 *
 * Manda para o formulário um campo escondido `name` com "AAAA-MM-DD", ou vazio
 * se nada foi escolhido. Se só parte foi escolhida, `${name}Incompleta` vem "1"
 * para o formulário avisar.
 */
export function DateSelect({
  name,
  legend,
  hint,
  error,
}: {
  name: string;
  legend: string;
  hint?: string;
  error?: string | null;
}) {
  const id = useId();
  // O ano só é lido no navegador: a página é gerada no build e ficaria com o ano do build.
  const thisYear = useSyncExternalStore(
    noop,
    () => new Date().getFullYear(),
    () => null,
  );
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const all = day && month && year;
  const none = !day && !month && !year;
  const max = month && year ? daysIn(+month, +year) : 31;
  const impossible = all && +day > max;
  const value = all && !impossible ? `${year}-${pad(+month)}-${pad(+day)}` : "";

  const ownError = impossible
    ? `${MESES[+month - 1][0].toUpperCase()}${MESES[+month - 1].slice(1)} de ${year} só tem ${max} dias. Escolha outro dia.`
    : null;
  const shownError = ownError ?? error;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [shownError && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  // Dezembro deste ano, ou do próximo se já passou do Natal.
  function pick(d: number) {
    const now = new Date();
    const y = now > new Date(now.getFullYear(), 11, 25) ? now.getFullYear() + 1 : now.getFullYear();
    setDay(String(d));
    setMonth("12");
    setYear(String(y));
  }

  const select = "input-paper min-w-0 cursor-pointer";

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={describedBy}>
      <legend className="mb-1.5 font-extrabold">{legend}</legend>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-paper btn-paper--paper !min-h-11 !px-4" onClick={() => pick(24)}>
          24 de dezembro
        </button>
        <button type="button" className="btn-paper btn-paper--paper !min-h-11 !px-4" onClick={() => pick(25)}>
          25 de dezembro
        </button>
      </div>
      <p className="text-sm text-ink-soft">Ou escolha nas listas:</p>

      <div className="flex flex-wrap gap-2">
        <div className="flex min-w-0 grow basis-20 flex-col gap-1">
          <label htmlFor={`${id}-d`} className="text-sm font-bold">
            Dia
          </label>
          <select
            id={`${id}-d`}
            className={select}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            aria-invalid={impossible ? true : undefined}
            aria-describedby={describedBy}
          >
            <option value="">—</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-0 grow-[2] basis-36 flex-col gap-1">
          <label htmlFor={`${id}-m`} className="text-sm font-bold">
            Mês
          </label>
          <select
            id={`${id}-m`}
            className={select}
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            aria-describedby={describedBy}
          >
            <option value="">—</option>
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>
                {m[0].toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-0 grow basis-24 flex-col gap-1">
          <label htmlFor={`${id}-a`} className="text-sm font-bold">
            Ano
          </label>
          <select
            id={`${id}-a`}
            className={select}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            aria-describedby={describedBy}
          >
            <option value="">—</option>
            {(thisYear ? [thisYear, thisYear + 1] : []).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!none && (
        <button
          type="button"
          className="link-paper self-start text-sm font-bold"
          onClick={() => {
            setDay("");
            setMonth("");
            setYear("");
          }}
        >
          Apagar a data
        </button>
      )}

      {shownError && (
        <span id={errorId} className="field-error" role={ownError ? "alert" : undefined}>
          {shownError}
        </span>
      )}
      {hint && (
        <span id={hintId} className="text-sm text-ink-soft">
          {hint}
        </span>
      )}

      <input type="hidden" name={name} value={value} />
      <input type="hidden" name={`${name}Incompleta`} value={!none && !value ? "1" : ""} />
    </fieldset>
  );
}
