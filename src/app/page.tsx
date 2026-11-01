import { Help, Logo, Ornament, Tree } from "@/components/Paper";
import { CreateRoomForm } from "@/components/CreateRoomForm";
import { ShareSite } from "@/components/ShareSite";
import { SITE_URL } from "@/lib/brand";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Amigo Oculto",
  alternateName: "Amigo Secreto",
  url: SITE_URL.href,
  description:
    "Sorteio de amigo oculto online e grátis. Cada pessoa entra com nome e uma senha de 4 números e vê só quem ela tirou.",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Any",
  inLanguage: "pt-BR",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
};

export default function Home() {
  return (
    <>
      <header className="flex flex-col items-center gap-4 pt-4 text-center">
        <Logo />
        <h1 className="font-hand text-3xl leading-tight sm:text-4xl">
          <span className="sr-only">Amigo oculto online: </span>
          Sorteio sem cadastro
          <br />e sem ninguém espiar.
        </h1>
      </header>

      <section className="paper-card tape tilt-l edge-zigzag">
        <h2 className="font-hand text-4xl text-green">Organizar um amigo oculto</h2>
        <p className="mb-5">
          Só quem vai organizar preenche isto. Quem vai participar não precisa: vai receber um
          convite pelo WhatsApp.
        </p>
        <CreateRoomForm />
      </section>

      <section className="paper-card tilt-r relative">
        <Tree className="absolute -right-3 -top-10 h-20 w-16" />
        <h2 className="font-hand text-3xl text-red">Como funciona</h2>
        <ol className="mt-3 flex list-none flex-col gap-3">
          {[
            ["✂️", "Quem organiza preenche o nome do grupo aqui em cima e cria o sorteio."],
            ["📨", "Manda o convite no grupo do WhatsApp. Cada pessoa toca no link, escreve o nome e inventa uma senha de 4 números."],
            ["🎁", "Quando todo mundo tiver entrado, quem organiza aperta o botão de sortear."],
            ["🤫", "Cada pessoa abre o mesmo link de novo e vê, num envelope, quem tirou. Ninguém vê o dos outros, nem quem organizou."],
          ].map(([icon, text]) => (
            <li key={text} className="flex gap-3">
              <span aria-hidden className="text-xl">
                {icon}
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="paper-card tilt-l">
        <h2 className="font-hand mb-2 text-3xl text-green">Dúvidas</h2>
        <Help q="Precisa baixar aplicativo ou fazer cadastro?">
          Não. Funciona direto no navegador do celular. Ninguém precisa de e-mail nem de conta.
        </Help>
        <Help q="Quanto custa?">Nada. É de graça.</Help>
        <Help q="Quem organiza fica sabendo quem tirou quem?">
          Não. O site não mostra isso para ninguém. Cada pessoa só vê o próprio envelope, então quem
          organiza também pode participar.
        </Help>
        <Help q="E se alguém não sabe mexer muito no celular?">
          Basta saber abrir um link do WhatsApp e digitar o nome. A senha são só 4 números. Se
          precisar, alguém da família pode ajudar a entrar, mas o envelope deve ser aberto pela
          própria pessoa.
        </Help>
        <Help q="Quantas pessoas precisa ter?">Pelo menos 3.</Help>
      </section>

      <section className="paper-card tape tape-red tilt-l text-center">
        <h2 className="font-hand text-3xl text-red">Conhece alguém organizando o amigo oculto?</h2>
        <p className="mb-4 text-ink-soft">Mande o site pra essa pessoa.</p>
        <ShareSite url={SITE_URL.href} />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <footer className="flex items-center justify-center gap-3 pb-6 text-sm font-bold opacity-80">
        <Ornament className="h-8 w-7" />
        <span>
          Feliz Natal <span aria-hidden>🎄</span>
        </span>
        <Ornament className="h-8 w-7" color="var(--green)" />
      </footer>
    </>
  );
}
