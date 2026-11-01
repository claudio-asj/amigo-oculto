/** "2026-12-24" -> "24 de dezembro". Usado no cliente e nas imagens de preview. */
export function formatDate(d: string | null) {
  if (!d) return null;
  const [y, m, day] = d.split("-").map(Number);
  if (!y || !m || !day) return d;
  return new Date(y, m - 1, day).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });
}
