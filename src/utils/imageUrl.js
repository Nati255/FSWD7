
export const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:3001";

export function normalizeImageUrl(u) {
  if (!u) return "";
  const s = String(u).trim();
  if (!s) return "";


  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  
  if (s.startsWith("/uploads/")) return `${API_BASE}${s}`;

  
  if (s.startsWith("/")) return s;

  return `/images/${s}`;
}
