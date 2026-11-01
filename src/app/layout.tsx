import type { Metadata, Viewport } from "next";
import { Caveat, Nunito, Rubik_Mono_One } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/brand";

const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["600", "700"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const rubikMono = Rubik_Mono_One({
  variable: "--font-rubik-mono",
  subsets: ["latin"],
  weight: "400",
});

const description =
  "Sorteio de amigo oculto (ou amigo secreto) online e grátis. Crie uma sala, mande o link no grupo do WhatsApp e sorteie. Sem cadastro, e ninguém vê o resultado dos outros, nem quem organizou.";

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  applicationName: SITE_NAME,
  title: {
    default: "Amigo Oculto online: sorteio grátis e sem cadastro",
    template: `%s · ${SITE_NAME}`,
  },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    url: "/",
    title: "Amigo Oculto online: sorteio grátis e sem cadastro",
    description,
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: { title: SITE_NAME, statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#c8312f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${caveat.variable} ${nunito.variable} ${rubikMono.variable} antialiased`}
    >
      <body className="min-h-dvh">
        <main className="mx-auto flex w-full max-w-[560px] flex-col gap-8 px-4 py-8 sm:py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
