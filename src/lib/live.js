// Essaims et alphas en direct.
//
// Ces apparitions ne sont pas dans les fichiers du jeu : ce sont des joueurs qui les signalent.
// Le site n'a donc pas de source par défaut. Pour en brancher une, définir VITE_LIVE_URL au build
// (ex. dans .env ou dans le workflow GitHub Pages) avec l'adresse d'un JSON public, autorisé en CORS,
// au format suivant :
//
//   {
//     "updated": "2026-10-12T13:40:00Z",
//     "swarms": [{ "region": "Kanto", "pokemon": "Blastoise", "location": "Cape Brink", "at": "2026-10-12T11:10:00Z" }],
//     "alphas": [{ "region": "Unova", "pokemon": "Jynx", "location": "Route 8", "at": "2026-10-12T07:36:15Z" }]
//   }
//
// "region" : Kanto, Johto, Hoenn, Sinnoh ou Unova. "pokemon" : nom anglais ou français, ou numéro.
// N'utiliser qu'une source dont le propriétaire a donné son accord.
import { ALL, BY_ID, REGIONS, norm } from "./data.js";

export const LIVE_URL = import.meta.env.VITE_LIVE_URL || "";
export const REFRESH_MS = 60_000;

const BY_NAME = new Map();
for (const p of ALL) { BY_NAME.set(norm(p.en), p); BY_NAME.set(norm(p.fr), p); }
const REGION_ALIAS = { unys: "Unova" };

function pokemonOf(v) {
  if (typeof v === "number" || /^\d+$/.test(String(v))) return BY_ID.get(+v) || null;
  return BY_NAME.get(norm(String(v || ""))) || null;
}

function entry(e) {
  if (!e || typeof e !== "object") return null;
  const p = pokemonOf(e.pokemon);
  const r = String(e.region || "");
  const region = REGIONS.findIndex(x => x.toLowerCase() === (REGION_ALIAS[r.toLowerCase()] || r).toLowerCase());
  const at = e.at ? new Date(e.at) : null;
  return { p, name: p ? null : String(e.pokemon || "?"), region, location: String(e.location || ""), at: at && !isNaN(at) ? at : null };
}

export async function fetchLive(signal) {
  const res = await fetch(LIVE_URL, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const list = k => (Array.isArray(json[k]) ? json[k].map(entry).filter(Boolean) : []);
  const updated = json.updated ? new Date(json.updated) : null;
  return { swarms: list("swarms"), alphas: list("alphas"), updated: updated && !isNaN(updated) ? updated : new Date() };
}

// Créneaux alpha : quatre par jour, de 00:00, 06:00, 12:00 et 18:00 UTC, pendant 4 h 45 chacun.
export const ALPHA_SLOT_STARTS = [0, 6, 12, 18];
export const ALPHA_SLOT_MIN = 4 * 60 + 45;

// État du créneau à l'instant `now` : actif ou pas, et prochaine bascule.
export function alphaSlot(now = new Date()) {
  const dayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const min = (now - dayStart) / 60000;
  const idx = Math.floor(min / 360);
  const into = min - idx * 360;
  const start = new Date(dayStart + idx * 360 * 60000);
  if (into < ALPHA_SLOT_MIN) {
    return { active: true, idx, start, end: new Date(start.getTime() + ALPHA_SLOT_MIN * 60000) };
  }
  const nextStart = new Date(dayStart + (idx + 1) * 360 * 60000);
  return { active: false, idx: (idx + 1) % 4, start: nextStart, end: new Date(nextStart.getTime() + ALPHA_SLOT_MIN * 60000) };
}

// Les quatre créneaux du jour (UTC) convertis en dates, pour les afficher à l'heure locale.
export function alphaSlotsOf(now = new Date()) {
  const dayStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return ALPHA_SLOT_STARTS.map(h => {
    const start = new Date(dayStart + h * 3600000);
    return { start, end: new Date(start.getTime() + ALPHA_SLOT_MIN * 60000) };
  });
}
