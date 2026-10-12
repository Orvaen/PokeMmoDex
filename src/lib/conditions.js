import { LOCATIONS } from "./data.js";

// Conditions d'un lieu, lues dans son nom : « Route 39 (Night/Season1) » → nuit, été
export const TIMES = ["Morning", "Day", "Night"];
export function condOf(en) {
  const tags = (en.match(/\(([^)]*)\)/)?.[1] || "").split("/");
  const times = tags.filter(x => TIMES.includes(x));
  const season = tags.find(x => /^Season\d$/.test(x));
  return { times: times.length ? times : TIMES, season: season ? +season.slice(6) : null };
}
// time : "" | "Morning" | "Day" | "Night" ; season : "" | "0".."3"
export const fits = (cond, time, season) => (time === "" || cond.times.includes(time)) && (season === "" || cond.season === null || cond.season === +season);

const CACHE = new Map();
const condOfLoc = key => { if (!CACHE.has(key)) CACHE.set(key, condOf(LOCATIONS[key].en)); return CACHE.get(key); };
// Le Pokémon se rencontre-t-il à l'état sauvage à ce moment / cette saison ?
export const wildAt = (p, time, season) => p.locs.some(([loc]) => fits(condOfLoc(loc), time, season));
