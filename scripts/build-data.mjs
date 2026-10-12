// Génère src/data/dex.json à partir des données extraites du client PokeMMO.
//
// Sources (à cloner à côté, voir README) :
//   - PokeMMO-Tools/pokemmo-data  : Pokémon, stats, lieux, noms FR (export du client PokeMMO)
//   - PokeMMOZone/PokeMMO-Data     : tiers PvP, noms et descriptions des talents
//   - smogon/pokemon-showdown      : notes des talents et table des types Gen 5
//
// Usage : node scripts/build-data.mjs <pokemmo-data> <PokeMMO-Data> <pokemon-showdown>
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const [toolsDir, zoneDir, psDir] = process.argv.slice(2);
if (!toolsDir || !zoneDir || !psDir) {
  console.error("Usage : node scripts/build-data.mjs <pokemmo-data> <PokeMMO-Data> <pokemon-showdown>");
  process.exit(1);
}
const readJSON = p => JSON.parse(fs.readFileSync(p, "utf8"));

const monsters = readJSON(path.join(toolsDir, "data/monster.json")).filter(m => m.id >= 1 && m.id <= 649);
const frNames = readJSON(path.join(toolsDir, "locales/fr-FR/monster.json"));
const frLocations = readJSON(path.join(toolsDir, "locales/fr-FR/locations.json"));
const frItems = readJSON(path.join(toolsDir, "locales/fr-FR/item_names.json"));
const pvp = readJSON(path.join(zoneDir, "data/pvp-data.json"));

// Tiers PvP
const tierOf = {};
for (const [tier, list] of Object.entries(pvp)) for (const p of list) tierOf[p.id] = tier;

// Évolutions : on garde le sens avant et on calcule le pré-évolution
const prevo = {};
for (const m of monsters) for (const e of m.evolutions) if (e.id <= 649) prevo[e.id] = m.id;

const TYPE = s => s[0] + s.slice(1).toLowerCase();
const REGIONS = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova"];
const METHODS = [];
const RARITIES = ["Very Common", "Common", "Uncommon", "Rare", "Very Rare", "Horde", "Lure", "Special"];
// Certains textes du client sont en UTF-8 relu comme du Windows-1252 (« PokÃ©mon », « Nidoranâ™€ »)
const CP1252 = { "€": 0x80, "‚": 0x82, "ƒ": 0x83, "„": 0x84, "…": 0x85, "†": 0x86, "‡": 0x87, "ˆ": 0x88, "‰": 0x89, "Š": 0x8a, "‹": 0x8b, "Œ": 0x8c, "Ž": 0x8e, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "˜": 0x98, "™": 0x99, "š": 0x9a, "›": 0x9b, "œ": 0x9c, "ž": 0x9e, "Ÿ": 0x9f };
const fixText = s => {
  if (!/[ÃÂâ]/.test(s)) return s;
  const bytes = [...s].map(ch => CP1252[ch] ?? ch.charCodeAt(0));
  if (bytes.some(b => b > 255)) return s;
  const out = Buffer.from(bytes).toString("utf8");
  return out.includes("\uFFFD") ? s : out;
};
const STAT_KEY = { hp: "hp", attack: "atk", defense: "def", sp_attack: "spa", sp_defense: "spd", speed: "spe" };
const titleCase = s => s.toLowerCase().replace(/(^|[\s(/-])([a-z])/g, (_, a, b) => a + b.toUpperCase());

const locations = {};
const pokemon = monsters.map(m => {
  const name = fixText(m.name);
  const fr = frNames[name.toLowerCase()] || name;
  const locs = [];
  const seen = new Set();
  for (const l of m.locations) {
    const loc = fixText(l.location), key = loc.toLowerCase();
    const id = `${l.region_name}|${key}`;
    if (!locations[id]) locations[id] = { region: REGIONS.indexOf(l.region_name), en: titleCase(loc), fr: frLocations[key] || frLocations[l.location.toLowerCase()] || titleCase(loc) };
    if (!METHODS.includes(l.type)) METHODS.push(l.type);
    const sig = [id, l.type, l.rarity, l.min_level, l.max_level].join();
    if (seen.has(sig)) continue;
    seen.add(sig);
    locs.push([id, METHODS.indexOf(l.type), RARITIES.indexOf(l.rarity), l.min_level, l.max_level]);
  }
  return {
    id: m.id, en: name, fr,
    types: [...new Set(m.types.map(TYPE))],
    stats: { hp: m.stats.hp, atk: m.stats.attack, def: m.stats.defense, spa: m.stats.sp_attack, spd: m.stats.sp_defense, spe: m.stats.speed },
    abilities: m.abilities.map(a => (a.name && a.name !== "--" ? a.name : null)),
    eggGroups: m.egg_groups,
    gender: m.gender_ratio, // 0 = mâle seulement, 254 = femelle seulement, 255 = asexué, sinon part de femelles sur 254
    evos: m.evolutions.filter(e => e.id <= 649).map(e => ({ id: e.id, how: e.type, val: e.val, item: e.item_name ? { en: e.item_name, fr: frItems[e.item_name.toLowerCase()] || e.item_name } : null })),
    prevo: prevo[m.id] || null,
    obtainable: !!m.obtainable,
    tier: tierOf[m.id] && tierOf[m.id] !== "UN" ? tierOf[m.id] : null,
    yields: Object.fromEntries(Object.entries(m.yields).filter(([k, v]) => k.startsWith("ev_") && v).map(([k, v]) => [STAT_KEY[k.slice(3)], v])),
    locs,
  };
});

// Talents : noms français officiels et descriptions (PokeMMO-Data, repris de PokeAPI)
const abilitiesRaw = readJSON(path.join(zoneDir, "data/abilities-data.json"));
const abilities = {};
for (const a of Object.values(abilitiesRaw)) {
  const en = a.name_translations?.en?.name;
  if (!en) continue;
  const clean = x => (x || "").replace(/\s+/g, " ").trim();
  abilities[en] = {
    fr: a.name_translations?.fr?.name || en,
    desc: { fr: clean(a.effect_translations?.fr?.effect), en: clean(a.effect || a.effect_translations?.en?.effect) },
  };
}

// Notes des talents (Showdown)
const abilitiesSrc = fs.readFileSync(path.join(psDir, "data/abilities.ts"), "utf8");
const abilityRatings = {};
for (const [, name, rating] of abilitiesSrc.matchAll(/name: "([^"]+)",\s*rating: (-?[\d.]+)/g)) abilityRatings[name] = +rating;

// Table des types Gen 5 (sans Fée) : 0 neutre, 1 faible, 2 résiste, 3 immunisé
const loadTable = file => {
  const src = fs.readFileSync(path.join(psDir, file), "utf8").replace(/export const TypeChart[^=]*=/, "module.exports =");
  const ctx = { module: {} };
  vm.runInNewContext(src, ctx);
  return ctx.module.exports;
};
const base = loadTable("data/typechart.ts");
const gen5 = loadTable("data/mods/gen5/typechart.ts");
const TYPES = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel"];
const typeChart = {};
for (const def of TYPES) {
  const row = (gen5[def.toLowerCase()]?.damageTaken) || base[def.toLowerCase()].damageTaken;
  typeChart[def] = Object.fromEntries(TYPES.map(atk => [atk, row[atk] || 0]));
}

const out = { pokemon, locations, methods: METHODS, rarities: RARITIES, regions: REGIONS, abilities, abilityRatings, typeChart, generated: new Date().toISOString().slice(0, 10) };
const dest = path.join(path.dirname(new URL(import.meta.url).pathname), "../src/data/dex.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out));
console.log(`${pokemon.length} Pokémon, ${Object.keys(locations).length} lieux, ${Object.keys(abilityRatings).length} talents → ${dest} (${(fs.statSync(dest).size / 1024).toFixed(0)} Ko)`);
