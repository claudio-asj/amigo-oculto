import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Amigo Oculto",
    short_name: "Amigo Oculto",
    description: "Sorteio de amigo oculto sem cadastro e sem ninguém espiar.",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#c9a57a",
    theme_color: "#c8312f",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
