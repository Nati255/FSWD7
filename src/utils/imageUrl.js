// מחזיר URL “בטוח” לתמונה:
// - אם מתחיל ב- http/https או ב- / → מחזיר כמו שהוא
// - אחרת מוסיף prefix /images/ (לתמונות ששמת ב-public/images)
export function normalizeImageUrl(u) {
  if (!u) return "";
  const s = String(u).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) return s;
  return `/images/${s}`;
}
