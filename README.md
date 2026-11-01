# Amigo Oculto

Sorteio de amigo oculto sem cadastro. O organizador cria a sala e manda o link
no grupo; cada pessoa entra com nome e um PIN de 4 números e vê só o próprio
resultado. Nem quem organizou consegue ver quem tirou quem.

Visual de recorte e colagem de papel natalino.

## Como a privacidade funciona

- O organizador recebe um link secreto (`/s/<sala>/admin#k=<token>`). O token
  fica depois do `#`, então não aparece em log de servidor. Com ele dá pra
  convidar, remover gente e sortear, mas a API não tem nenhuma rota que
  devolva os pares.
- Participantes entram com nome e PIN. O PIN é guardado com hash `scrypt`.
  O navegador recebe um cookie `httpOnly` e a pessoa volta direto. Em outro
  celular, entra de novo com nome + PIN.
- 5 PINs errados bloqueiam aquele nome por 15 minutos (contra quem tenta
  adivinhar o PIN de outra pessoa).
- O sorteio embaralha todos num círculo (cada um dá pro próximo), então
  ninguém tira a si mesmo. Depois de sortear, a sala fecha.
- Limite: quem tem acesso ao servidor ou ao banco (você, no Coolify) consegue
  ler a tabela `assignments`. Pela interface, ninguém consegue.

## Rodar local

```bash
npm install
npm run dev      # http://localhost:3000
```

O banco SQLite fica em `./data/amigo-oculto.db` (ou em `DATABASE_PATH`).
Usa o `node:sqlite` nativo do Node (≥ 22.13), sem dependência nativa.

## Deploy no Coolify

1. Suba o projeto para um repositório Git (GitHub/GitLab/Gitea).
2. No Coolify: **New Resource → Application → (seu repo)**.
3. **Build Pack**: escolha **Dockerfile** (ou **Docker Compose**, que já usa o
   `docker-compose.yml` com o volume declarado).
4. **Port Exposes**: `3000`.
5. **Persistent Storage** (obrigatório se usar o build pack Dockerfile):
   adicione um volume com **Destination Path** `/app/data`. Sem isso, as salas
   somem a cada deploy.
6. Configure o domínio `https://amigooculto.claudiojr.dev.br` e faça o deploy.

O container tem healthcheck em `/api/health`. Variáveis de ambiente:

- `SITE_URL` (opcional, padrão `https://amigooculto.claudiojr.dev.br`): a URL
  pública. Se mudar o domínio, marque também como build variable no Coolify,
  porque canonical, sitemap e os links das imagens de preview (`og:image`) são
  gerados no build.
- `DATABASE_PATH` (opcional, padrão `/app/data/amigo-oculto.db`).

## SEO e imagens

Favicon, ícones de app e imagens de compartilhamento são gerados com
`next/og` a partir da fonte do logo (Rubik Mono One), em `src/app/icon.tsx`,
`apple-icon.tsx` e `opengraph-image.tsx`. Cada sala tem a própria imagem de
preview (`src/app/s/[id]/opengraph-image.tsx`) com o nome do grupo, para o
convite chegar bonito no WhatsApp. As fontes `.woff` ficam em
`src/assets/fonts` (licença OFL). O `src/app/favicon.ico` foi montado a partir
dos PNGs de `/icon/32` e `/icon/192`; se mudar o ícone, gere de novo.

Só a home é indexável. `/s/` e `/api/` ficam fora do `robots.txt`, e as
páginas de sala levam `noindex`.

**Backup:** basta copiar o arquivo `.db` do volume.

## Licença e créditos

Software livre sob a [GPL-3.0](./LICENSE). Feito por Claudio Junior
([claudiojr.dev.br](https://claudiojr.dev.br),
[@claudioasj@organica.social](https://organica.social/@claudioasj)).

- Ícones 3D: [Fluent Emoji](https://github.com/microsoft/fluentui-emoji), da
  Microsoft, licença MIT (`public/icons/3d/LICENSE`).
- Ícones de interface: [Lucide](https://lucide.dev) (ISC) e
  [Simple Icons](https://simpleicons.org) (CC0).
- Fontes: Caveat, Nunito e Rubik Mono One (SIL Open Font License).
