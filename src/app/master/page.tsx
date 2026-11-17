import type { Metadata } from "next";
import { MasterClient } from "@/components/MasterClient";

export const metadata: Metadata = {
  title: "Painel · Amigo Oculto",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function MasterPage() {
  return <MasterClient />;
}
