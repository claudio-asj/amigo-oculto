"use client";

import { Check, Copy, X } from "lucide-react";
import { useRef, useState } from "react";
import { useCopy } from "./api";
import { Icon3D } from "./Icons";

const PIX = "cla.junior21@gmail.com";

/**
 * "Pague um cafezinho": abre uma janela com a chave Pix e um botão de copiar.
 * <dialog> com showModal() prende o foco, fecha com Esc e devolve o foco ao
 * botão que abriu.
 */
export function CoffeeButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const copy = useCopy();
  const [copied, setCopied] = useState(false);

  async function copyPix() {
    if (await copy(PIX)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn-paper btn-paper--paper"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        <Icon3D name="cafe" size={30} /> Pague um cafezinho
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="cafe-title"
        className="coffee-dialog"
        // Toque fora da caixa (no fundo escuro) também fecha.
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        onClose={() => setCopied(false)}
      >
        <div className="paper-card tape flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            className="absolute top-2 right-2 inline-flex h-11 w-11 items-center justify-center"
            onClick={() => dialog.current?.close()}
            aria-label="Fechar"
          >
            <X size={26} aria-hidden />
          </button>
          <Icon3D name="cafe" size={72} />
          <h2 id="cafe-title" className="font-hand text-4xl text-red">
            Pague um cafezinho
          </h2>
          <p>
            O Amigo Oculto é de graça. Se ele ajudou a sua família, um Pix de qualquer valor me
            ajuda a manter o site no ar.
          </p>

          <p className="mt-1 font-extrabold">Minha chave Pix (e-mail):</p>
          <p className="w-full rounded border-2 border-dashed border-[var(--ink-soft)] bg-white px-3 py-2 text-lg font-bold [overflow-wrap:anywhere]">
            {PIX}
          </p>
          <button type="button" className="btn-paper btn-paper--green w-full" onClick={copyPix}>
            {copied ? (
              <>
                Chave copiada <Check size={22} aria-hidden />
              </>
            ) : (
              <>
                <Copy size={22} aria-hidden /> Copiar a chave Pix
              </>
            )}
          </button>
          <span role="status" className="sr-only">
            {copied ? "Chave Pix copiada" : ""}
          </span>

          <ol className="steps mt-2 self-stretch text-left">
            <li>Abra o aplicativo do seu banco e entre em “Pix”.</li>
            <li>Escolha “Pagar com chave” (ou “Transferir”) e cole a chave.</li>
            <li>Confira se aparece o nome Claudio antes de confirmar.</li>
          </ol>

          <button
            type="button"
            className="link-paper mt-1 min-h-11 font-bold"
            onClick={() => dialog.current?.close()}
          >
            Fechar
          </button>
        </div>
      </dialog>
    </>
  );
}
