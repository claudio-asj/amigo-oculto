"use client";

export type PublicRoom = {
  id: string;
  name: string;
  budget: string | null;
  eventDate: string | null;
  drawn: boolean;
  participants: { id: string; name: string }[];
};

export type Me = {
  id: string;
  name: string;
  wishlist: string;
  match: { name: string; wishlist: string } | null;
};

export async function api<T>(url: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(url, {
    method: init?.method ?? (init?.body ? "POST" : "GET"),
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Algo deu errado.");
  return data as T;
}

export { formatDate } from "@/lib/format";

export function useCopy() {
  return async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };
}
