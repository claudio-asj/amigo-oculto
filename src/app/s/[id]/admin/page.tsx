import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminClient } from "@/components/AdminClient";
import { Loading } from "@/components/RoomHeader";

export const metadata: Metadata = {
  title: "Organizar · Amigo Oculto",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function AdminPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminClient />
    </Suspense>
  );
}
