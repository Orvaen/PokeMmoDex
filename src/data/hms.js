// CS (capacités de terrain) nécessaires pour atteindre un lieu depuis le Centre Pokémon le plus proche.
// Calcul automatique : routes maritimes traversées (Surf), méthode du spot (Surf, Éclate-Roc),
// plus une liste courte de passages connus des jeux d'origine. PokeMMO peut différer : à signaler sur GitHub.
import { METHODS } from "../lib/data.js";
import { LOCATIONS } from "../lib/encounters.js";
import { REGION_MAPS, accessPath, baseName } from "./maps.js";

export const HMS = {
  cut: { fr: "Coupe", en: "Cut" },
  surf: { fr: "Surf", en: "Surf" },
  strength: { fr: "Force", en: "Strength" },
  flash: { fr: "Flash", en: "Flash" },
  rocksmash: { fr: "Éclate-Roc", en: "Rock Smash" },
  waterfall: { fr: "Cascade", en: "Waterfall" },
  whirlpool: { fr: "Siphon", en: "Whirlpool" },
  dive: { fr: "Plongée", en: "Dive" },
  rockclimb: { fr: "Escalade", en: "Rock Climb" },
};
const ORDER = Object.keys(HMS);

// "région:lieu" → CS. through : aussi nécessaires pour traverser ce lieu. opt : conseillée (obscurité).
const GATES = {
  "0:Route 9": { hms: ["cut"], through: true },
  "0:Rock Tunnel": { hms: ["flash"], through: true, opt: true },
  "0:Power Plant": { hms: ["surf"] },
  "0:Cerulean Cave": { hms: ["surf"] },
  "0:Seafoam Islands": { hms: ["surf", "strength"] },
  "0:Victory Road": { hms: ["strength"], through: true },
  "1:Ilex Forest": { hms: ["cut"], through: true },
  "1:Whirl Islands": { hms: ["surf", "whirlpool"] },
  "1:Dragon's Den": { hms: ["surf", "whirlpool"] },
  "1:Ice Path": { hms: ["strength"], through: true },
  "1:Tohjo Falls": { hms: ["surf", "waterfall"], through: true },
  "1:Dark Cave": { hms: ["flash"], opt: true },
  "2:Granite Cave": { hms: ["flash"], opt: true },
  "2:Underwater": { hms: ["surf", "dive"] },
  "2:Seafloor Cavern": { hms: ["surf", "dive"] },
  "2:Shoal Cave": { hms: ["surf"] },
  "2:Victory Road": { hms: ["surf", "waterfall", "strength", "rocksmash"] },
  "3:Victory Road": { hms: ["surf", "waterfall", "strength", "rocksmash", "rockclimb"] },
};
// Routes classées « maritimes » sur nos schémas mais avec une partie à pied
const LAND_OK = new Set(["3:Route 213", "2:Route 109"]);

/**
 * CS pour un lieu (et une méthode de rencontre, facultative).
 * Renvoie [{ hm, opt }] trié, ou [] si aucune.
 */
export function hmsFor(locKey, methodIdx) {
  const loc = LOCATIONS[locKey];
  const region = loc.region;
  const base = baseName(loc.en);
  const map = REGION_MAPS[region];
  const need = new Map(); // hm → opt
  const add = (hm, opt = false) => { if (!need.has(hm) || need.get(hm)) need.set(hm, opt); };

  const path = map?.nodes[base] ? accessPath(region, base) || [base] : [base];
  path.forEach((n, i) => {
    const last = i === path.length - 1;
    const node = map?.nodes[n];
    if (node?.kind === "w" && !LAND_OK.has(`${region}:${n}`)) add("surf");
    const g = GATES[`${region}:${n}`];
    if (g && (last || g.through)) g.hms.forEach(h => add(h, !!g.opt));
  });

  const m = METHODS[methodIdx];
  if (m === "Water") add("surf");
  if (m === "Rocks") add("rocksmash");
  return [...need].map(([hm, opt]) => ({ hm, opt })).sort((a, b) => a.opt - b.opt || ORDER.indexOf(a.hm) - ORDER.indexOf(b.hm));
}
export const hmName = (hm, lang) => HMS[hm][lang === "fr" ? "fr" : "en"];
