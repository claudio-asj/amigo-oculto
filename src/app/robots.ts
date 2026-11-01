import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";

// Salas são privadas: só a home entra no Google. (O WhatsApp ignora robots.txt,
// então o preview do convite continua funcionando.)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/s/", "/api/"] },
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
  };
}
