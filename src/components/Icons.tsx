import Image from "next/image";
import type { SimpleIcon } from "simple-icons";

/**
 * Ícones 3D do Fluent Emoji (Microsoft, licença MIT), hospedados em
 * public/icons/3d. Usados no lugar de emoji: aparecem iguais em qualquer
 * celular. Por padrão são decorativos (alt vazio).
 */
export type Icon3DName =
  | "tesoura"
  | "envelope-chegando"
  | "presente"
  | "segredo"
  | "arvore"
  | "dinheiro"
  | "calendario"
  | "festa"
  | "tchau"
  | "apontando"
  | "cartinha"
  | "coracao"
  | "cafe";

export function Icon3D({
  name,
  size = 32,
  alt = "",
  className = "",
}: {
  name: Icon3DName;
  size?: number;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src={`/icons/3d/${name}.png`}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      className={`inline-block shrink-0 align-middle ${className}`}
    />
  );
}

/** Logo de marca (Simple Icons, CC0) em SVG, na cor do texto. */
export function BrandIcon({ icon, size = 20 }: { icon: SimpleIcon; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <path d={icon.path} />
    </svg>
  );
}
