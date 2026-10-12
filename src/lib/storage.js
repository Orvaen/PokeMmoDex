import { useEffect, useState } from "react";

// Préférences gardées dans le navigateur (localStorage), jamais envoyées ailleurs.
const PREFIX = "pmdex:";
export const STORAGE_KEYS = ["lang", "theme", "ivs", "natured", "prices", "box", "shareName", "view", "evStat"];

export function load(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v == null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}
export function save(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* stockage indisponible */ }
}
export function clearAll() {
  try { STORAGE_KEYS.forEach(k => localStorage.removeItem(PREFIX + k)); } catch { /* rien */ }
}

export function useStored(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback));
  useEffect(() => { save(key, value); }, [key, value]);
  return [value, setValue];
}
