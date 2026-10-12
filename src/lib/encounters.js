// Lieux et rencontres : chargés à part (environ la moitié des données du Pokédex).
// Importer ce module ajoute p.locs à chaque Pokémon ; seules les pages qui en ont besoin l'importent.
import enc from "../data/encounters.json";
import { ALL } from "./data.js";
import { condOf, fits } from "./conditions.js";

export const LOCATIONS = enc.locations;
for (const p of ALL) p.locs = enc.locs[p.id] || [];

// Index inversé lieu → rencontres
export const ENCOUNTERS = {};
for (const p of ALL) {
  for (const [loc, method, rarity, min, max] of p.locs) {
    (ENCOUNTERS[loc] ||= []).push({ p, method, rarity, min, max });
  }
}

const CACHE = new Map();
const condOfLoc = key => { if (!CACHE.has(key)) CACHE.set(key, condOf(LOCATIONS[key].en)); return CACHE.get(key); };
// Le Pokémon se rencontre-t-il à l'état sauvage à ce moment / cette saison ?
export const wildAt = (p, time, season) => p.locs.some(([loc]) => fits(condOfLoc(loc), time, season));
