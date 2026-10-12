// Génère src/data/items.json : objets qui augmentent la puissance d'un type (objets classiques, Plaques,
// Encens, Joyaux), avec noms et descriptions FR du client PokeMMO et les Pokémon sauvages qui les tiennent.
//
// Usage : node scripts/build-items.mjs <pokemmo-data>
import fs from "node:fs";
import path from "node:path";

const [toolsDir] = process.argv.slice(2);
if (!toolsDir) { console.error("Usage : node scripts/build-items.mjs <pokemmo-data>"); process.exit(1); }
const readJSON = p => JSON.parse(fs.readFileSync(path.join(toolsDir, p), "utf8"));
const items = readJSON("data/items.json");
const frNames = readJSON("locales/fr-FR/item_names.json");
const frDesc = readJSON("locales/fr-FR/item_descriptions.json");
const monsters = readJSON("data/monster.json").filter(m => m.id >= 1 && m.id <= 649);
const clean = s => (s || "").replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();

// Descriptions propres à PokeMMO (ids 5xxx / 6xxx, avec les % exacts) en premier
const PREF = [5, 6, 9, 1, 8, 0, 2, 3, 4, 7];
const byName = new Map();
for (const i of items) {
  const k = i.name.toLowerCase();
  if (!byName.has(k)) byName.set(k, []);
  byName.get(k).push(i);
}
const best = list => [...list].sort((a, b) => PREF.indexOf(Math.floor(a.id / 1000)) - PREF.indexOf(Math.floor(b.id / 1000)));

// Pokémon sauvages qui tiennent chaque objet
export const holdersOf = (() => {
  const map = new Map();
  for (const m of monsters) for (const h of m.held_items || []) {
    const k = h.name.toLowerCase();
    if (!map.has(k)) map.set(k, new Set());
    map.get(k).add(m.id);
  }
  return k => [...(map.get(k) || [])].sort((a, b) => a - b);
})();

const TYPES = ["Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel"];
const out = [];
for (const [k, list] of byName) {
  const sorted = best(list);
  const en = sorted.find(i => i.description)?.description || "";
  const flat = clean(en).replace(/-ty ?pe/g, "-type");
  const m = flat.match(/(?:power of|boosts(?: the power of)?) ([A-Za-z]+)-type moves/i);
  if (!m || /and [A-Za-z]+-type/.test(flat) || /^TM|^HM/.test(sorted[0].name)) continue;
  const type = TYPES.find(t => t.toLowerCase() === m[1].toLowerCase());
  if (!type) continue;
  const name = sorted[0].name;
  const kind = / Plate$/.test(name) ? "plate" : / Incense$/.test(name) ? "incense" : / Gem$/.test(name) ? "gem" : "item";
  const pct = +(flat.match(/by (\d+)%/)?.[1] || (kind === "gem" ? 50 : 20));
  const fr = frNames[k] || name;
  const descFr = clean(sorted.map(i => frDesc[(i.description || "").toLowerCase()]).find(Boolean));
  out.push({ en: name, fr, type, kind, pct, consumed: kind === "gem", desc: { en: clean(en), fr: descFr || null }, holders: holdersOf(k) });
}
const KIND = ["item", "plate", "incense", "gem"];
out.sort((a, b) => TYPES.indexOf(a.type) - TYPES.indexOf(b.type) || KIND.indexOf(a.kind) - KIND.indexOf(b.kind) || a.en.localeCompare(b.en));
const dest = path.join(path.dirname(new URL(import.meta.url).pathname), "../src/data/items.json");
fs.writeFileSync(dest, JSON.stringify({ typeBoost: out }));
console.log(`${out.length} objets de type → ${dest} (${(fs.statSync(dest).size / 1024).toFixed(0)} Ko)`);
