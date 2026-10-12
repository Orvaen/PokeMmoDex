// Chasse shiny : classe les spots où trouver un Pokémon, selon la part de rencontres qui le donnent.
//
// Les données du client ne donnent qu'une rareté par rencontre (Très commun… Très rare, Horde, Leurre),
// pas de pourcentage. Les poids ci-dessous sont donc une ESTIMATION, utilisée seulement pour comparer
// les spots entre eux. Les hordes comptent 5 Pokémon, toutes les espèces de horde d'un lieu à parts égales.
import { METHODS, RARITIES } from "./data.js";
import { ENCOUNTERS, LOCATIONS } from "./encounters.js";
import { TIMES, condOf, fits } from "./conditions.js";
import { baseName } from "../data/maps.js";
import { hmsFor } from "../data/hms.js";
import { centerInfo } from "../components/Access.jsx";

const R = Object.fromEntries(RARITIES.map((r, i) => [r, i]));
export const RARITY_WEIGHT = { [R["Very Common"]]: 30, [R.Common]: 20, [R.Uncommon]: 10, [R.Rare]: 5, [R["Very Rare"]]: 1 };
export const HORDE_SIZE = 5;

// Base PokeMMO : 1/30 000. Donateur ou Charme Chroma : +10 % chacun.
export const ODDS = { base: 30000, one: 27000, both: 24300 };

const M = Object.fromEntries(METHODS.map((m, i) => [m, i]));
const ROD = new Set([M["Old Rod"], M["Good Rod"], M["Super Rod"], M.Fishing]);
const SINGLE = new Set([M.Grass, M["Dark Grass"], M.Cave, M.Inside]);

// Façon de chasser : hordes, rencontres simples, leurre, surf, pêche, Éclate-Roc, Coup d'Boule, Arbre à miel
export const KINDS = ["horde", "single", "lure", "surf", "fishing", "rocks", "headbutt", "honey"];
export function kindOf(method, rarity) {
  if (rarity === R.Special) return null; // phénomènes (ombres, nuages de poussière…) : pas de taux connu
  if (rarity === R.Horde) return "horde";
  if (rarity === R.Lure) return "lure";
  if (SINGLE.has(method)) return "single";
  if (method === M.Water) return "surf";
  if (ROD.has(method)) return "fishing";
  if (method === M.Rocks) return "rocks";
  if (method === M.Headbutt) return "headbutt";
  if (method === M["Honey Tree"]) return "honey";
  return null;
}
// Les hordes se comptent en hordes par heure, le reste en rencontres par heure
export const rateKey = kind => (kind === "horde" ? "horde" : "single");

const weightOf = (kind, rarity) => (kind === "horde" || kind === "lure" ? 1 : RARITY_WEIGHT[rarity] || 0);

// Lieux réunis par nom de base : « Route 203 », « Route 203 (Night) »… Une variante ne liste que les
// espèces propres à son moment ; à un moment donné, il faut donc compter toutes les variantes qui s'appliquent.
const BASES = new Map();
for (const [key, L] of Object.entries(LOCATIONS)) {
  const b = `${L.region}#${baseName(L.en)}`;
  if (!BASES.has(b)) BASES.set(b, []);
  BASES.get(b).push({ key, cond: condOf(L.en) });
}
// Les 12 moments possibles : matin / jour / nuit × 4 saisons
const CONTEXTS = TIMES.flatMap(time => [0, 1, 2, 3].map(season => ({ time, season })));

// Part des rencontres qui donnent l'espèce, pour un lieu, une méthode et un moment
function shareAt(base, method, kind, id, time, season) {
  const pool = new Map();
  for (const { key, cond } of BASES.get(base) || []) {
    if (!fits(cond, time, String(season))) continue;
    for (const e of ENCOUNTERS[key] || []) {
      if (e.method !== method || kindOf(e.method, e.rarity) !== kind) continue;
      const w = weightOf(kind, e.rarity);
      // Horde / leurre : une part par espèce, même si elle apparaît à plusieurs niveaux ou variantes
      pool.set(e.p.id, kind === "horde" || kind === "lure" ? w : (pool.get(e.p.id) || 0) + w);
    }
  }
  const total = [...pool.values()].reduce((a, b) => a + b, 0);
  return { share: total ? (pool.get(id) || 0) / total : 0, rivals: [...pool.keys()].filter(x => x !== id) };
}

// Tous les spots d'une espèce, une carte par lieu (variantes réunies), méthode et façon de chasser
export function huntSpots(p) {
  const map = new Map();
  for (const [loc, method, rarity, min, max] of p.locs) {
    const kind = kindOf(method, rarity);
    if (!kind) continue;
    const L = LOCATIONS[loc];
    const base = `${L.region}#${baseName(L.en)}`;
    const key = `${base}#${method}#${kind}`;
    if (!map.has(key)) map.set(key, { key, base, loc, method, kind, region: L.region, min, max });
    const s = map.get(key);
    s.min = Math.min(s.min, min); s.max = Math.max(s.max, max);
  }
  return [...map.values()].map(s => ({
    ...s,
    contexts: CONTEXTS.map(c => ({ ...c, ...shareAt(s.base, s.method, s.kind, p.id, c.time, c.season) })).filter(c => c.share > 0),
    center: centerInfo(s.loc), hms: hmsFor(s.loc, s.method),
  }));
}

// Calcule le rendement d'un spot selon les filtres et les réglages
export function evaluate(spot, { time, season, rates, odds }) {
  const cs = spot.contexts.filter(c => (time === "" || c.time === time) && (season === "" || c.season === +season));
  if (!cs.length) return null;
  const best = cs.reduce((a, b) => (b.share > a.share ? b : a));
  const perEnc = spot.kind === "horde" ? HORDE_SIZE : 1;
  // Leurre : on ne sait pas quelle part des rencontres vient du leurre, donc pas de durée
  const perHour = spot.kind === "lure" ? null : rates[rateKey(spot.kind)] * best.share * perEnc;
  return {
    ...spot, best,
    rivals: best.rivals,
    conds: cs.map(c => ({ times: [c.time], season: c.season })),
    varies: new Set(cs.map(c => c.share.toFixed(3))).size > 1,
    bestConds: cs.filter(c => c.share.toFixed(3) === best.share.toFixed(3)).map(c => ({ times: [c.time], season: c.season })),
    perHour,
    hours: perHour ? odds / perHour : Infinity,
    unknown: perHour === null,
  };
}
