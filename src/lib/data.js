import dex from "../data/dex.json";

export const ALL = dex.pokemon;
export const BY_ID = new Map(ALL.map(p => [p.id, p]));
export const METHODS = dex.methods;
export const RARITIES = dex.rarities;
export const REGIONS = dex.regions;
export const TYPE_CHART = dex.typeChart;
export const ABILITY_RATINGS = dex.abilityRatings;

// Talents : nom français officiel et description. Quelques noms du client ont une autre orthographe.
const ABILITY_ALIAS = { Compoundeyes: "Compound Eyes", Lightningrod: "Lightning Rod" };
export const abilityInfo = name => dex.abilities[ABILITY_ALIAS[name] || name] || null;

export const STATS = ["hp", "atk", "def", "spa", "spd", "spe"];

// Couleurs de type harmonisées : même luminosité et saturation, seule la teinte change
export const TYPES = {
  Normal: { fr: "Normal", h: 85, c: 0.04 }, Fire: { fr: "Feu", h: 45, c: 0.15 },
  Water: { fr: "Eau", h: 250, c: 0.13 }, Grass: { fr: "Plante", h: 145, c: 0.14 },
  Electric: { fr: "Électrik", h: 95, c: 0.14 }, Ice: { fr: "Glace", h: 205, c: 0.1 },
  Fighting: { fr: "Combat", h: 25, c: 0.15 }, Poison: { fr: "Poison", h: 320, c: 0.13 },
  Ground: { fr: "Sol", h: 70, c: 0.1 }, Flying: { fr: "Vol", h: 275, c: 0.1 },
  Psychic: { fr: "Psy", h: 355, c: 0.15 }, Bug: { fr: "Insecte", h: 120, c: 0.13 },
  Rock: { fr: "Roche", h: 80, c: 0.07 }, Ghost: { fr: "Spectre", h: 295, c: 0.1 },
  Dragon: { fr: "Dragon", h: 270, c: 0.16 }, Dark: { fr: "Ténèbres", h: 40, c: 0.03 },
  Steel: { fr: "Acier", h: 230, c: 0.03 },
};
for (const t of Object.values(TYPES)) t.col = `oklch(0.66 ${t.c} ${t.h})`;

export const STAT_COL = {
  hp: "oklch(0.65 0.17 25)", atk: "oklch(0.72 0.15 55)", def: "oklch(0.78 0.14 95)",
  spa: "oklch(0.65 0.14 250)", spd: "oklch(0.7 0.14 150)", spe: "oklch(0.68 0.15 340)",
};

export const genOf = n => (n <= 151 ? 1 : n <= 251 ? 2 : n <= 386 ? 3 : n <= 493 ? 4 : 5);
export const pad = n => String(n).padStart(3, "0");
export const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
export const bst = p => STATS.reduce((a, k) => a + p.stats[k], 0);

// Sprites Noir & Blanc de Pokémon Showdown
const spriteId = p => norm(p.en.replace("♀", "f").replace("♂", "m"));
export const spriteUrl = (p, shiny = false) => `https://play.pokemonshowdown.com/sprites/gen5${shiny ? "-shiny" : ""}/${spriteId(p)}.png`;
export const spriteAniUrl = (p, shiny = false) => `https://play.pokemonshowdown.com/sprites/gen5ani${shiny ? "-shiny" : ""}/${spriteId(p)}.gif`;

for (const p of ALL) {
  p.bst = bst(p);
  p.gen = genOf(p.id);
  p.keyEn = norm(p.en);
  p.keyFr = norm(p.fr);
}

// Dégâts reçus : 0 neutre, 1 faible, 2 résiste, 3 immunisé
export function effectiveness(types) {
  const out = {};
  for (const atk of Object.keys(TYPES)) {
    let m = 1;
    for (const def of types) {
      const v = TYPE_CHART[def][atk];
      m *= v === 1 ? 2 : v === 2 ? 0.5 : v === 3 ? 0 : 1;
    }
    out[atk] = m;
  }
  return out;
}

export function familyRoot(p) {
  let r = p;
  while (r.prevo) r = BY_ID.get(r.prevo);
  return r;
}
export function family(p) {
  const out = [];
  (function walk(s) { out.push(s); s.evos.forEach(e => BY_ID.has(e.id) && walk(BY_ID.get(e.id))); })(familyRoot(p));
  return out;
}
// Étapes d'évolution : [[racine], [stade 2...], ...] avec la condition d'évolution
export function evoStages(p) {
  const stages = [];
  (function walk(s, d, how) {
    (stages[d] ||= []).push({ p: s, how });
    s.evos.forEach(e => BY_ID.has(e.id) && walk(BY_ID.get(e.id), d + 1, e));
  })(familyRoot(p), 0, null);
  return stages;
}
export function finalsFrom(p) {
  const out = [];
  (function walk(s) {
    const next = s.evos.filter(e => BY_ID.has(e.id));
    if (!next.length) out.push(s);
    else next.forEach(e => walk(BY_ID.get(e.id)));
  })(p);
  return out;
}


// Genre : 0 mâle seulement, 254 femelle seulement, 255 asexué, sinon part de femelles sur 254
const FEMALE_SHARE = { 31: 0.125, 63: 0.25, 127: 0.5, 191: 0.75 };
export function genderInfo(p) {
  const g = p.gender;
  if (g === 255) return { kind: "N", female: 0 };
  if (g === 0) return { kind: "M", female: 0 };
  if (g === 254) return { kind: "F", female: 1 };
  return { kind: "MF", female: FEMALE_SHARE[g] ?? g / 254 };
}
