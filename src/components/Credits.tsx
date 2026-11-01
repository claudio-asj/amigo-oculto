import { Briefcase, Globe } from "lucide-react";
import { siGithub, siInstagram, siMastodon, siX } from "simple-icons";
import { CoffeeButton } from "./CoffeeButton";
import { BrandIcon, Icon3D } from "./Icons";

const REPO = "https://github.com/claudio-asj/amigo-oculto";

const LINKS = [
  { label: "claudiojr.dev.br", href: "https://claudiojr.dev.br", icon: <Globe size={20} aria-hidden /> },
  { label: "GitHub", href: "https://github.com/claudio-asj", icon: <BrandIcon icon={siGithub} /> },
  {
    label: "@claudioasj@organica.social",
    href: "https://organica.social/@claudioasj",
    icon: <BrandIcon icon={siMastodon} />,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/claudio-junior-537319162/",
    icon: <Briefcase size={20} aria-hidden />,
  },
  {
    label: "@claudio_almeida",
    href: "https://www.instagram.com/claudio_almeida/",
    icon: <BrandIcon icon={siInstagram} />,
  },
  { label: "@claudio_tsunami", href: "https://x.com/claudio_tsunami", icon: <BrandIcon icon={siX} /> },
];

export function Credits() {
  return (
    <footer className="mx-auto w-full max-w-[560px] px-4 pb-10">
      <div className="paper-card tilt-r flex flex-col items-center gap-3 text-center">
        <p className="flex items-center gap-2 font-bold">
          Feito com <Icon3D name="coracao" size={24} alt="carinho" /> por Claudio Junior
        </p>
        <p>
          O Amigo Oculto é software livre, com licença GPL-3.0. O código está no{" "}
          <a className="link-paper font-bold" href={REPO} target="_blank" rel="noreferrer">
            GitHub
          </a>
          : pode usar, estudar, mudar e compartilhar.
        </p>
        <CoffeeButton />
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Redes do Claudio">
          {LINKS.map((l) => (
            <li key={l.href} className="gift-tag max-w-full !p-0">
              <a
                href={l.href}
                target="_blank"
                // rel="me" deixa o Mastodon confirmar que este site é meu.
                rel="me noreferrer"
                className="flex min-h-11 min-w-0 items-center gap-2 py-1.5 pr-4 pl-6 text-sm hover:underline"
              >
                {l.icon}
                {/* O @ do Mastodon é uma "palavra" longa: deixa quebrar com texto grande (1.4.4). */}
                <span className="[overflow-wrap:anywhere]">{l.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="text-sm text-ink-soft">
          Ícones 3D: Fluent Emoji (Microsoft, MIT). Outros ícones: Lucide e Simple Icons. Fontes:
          Caveat, Nunito e Rubik Mono One (OFL).
        </p>
      </div>
    </footer>
  );
}
