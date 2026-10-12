// Génère src/data/berries.json à partir de l'export du client PokeMMO (PokeMMO-Tools/pokemmo-data) :
// goûts de chaque Baie, temps de pousse, récolte, noms et descriptions FR.
// La recette (3 graines) se déduit des goûts : une graine « Simple » vaut 1 point, une « Très » 2 points.
//
// Usage : node scripts/build-berries.mjs <pokemmo-data>
import fs from "node:fs";
import path from "node:path";

const [toolsDir] = process.argv.slice(2);
if (!toolsDir) { console.error("Usage : node scripts/build-berries.mjs <pokemmo-data>"); process.exit(1); }
const readJSON = p => JSON.parse(fs.readFileSync(path.join(toolsDir, p), "utf8"));

const berries = readJSON("data/items-berry.json");
const items = new Map(readJSON("data/items.json").map(i => [i.id, i]));
const frNames = readJSON("locales/fr-FR/item_names.json");
const frDesc = readJSON("locales/fr-FR/item_descriptions.json");
const clean = s => (s || "").replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();

const FLAVORS = ["spicy", "dry", "sweet", "bitter", "sour"];
// Toutes les façons de faire la somme avec 3 graines de 1 ou 2 points
function recipes(target) {
  const seeds = FLAVORS.flatMap(f => [[f, 1], [f, 2]]);
  const out = new Set();
  for (let a = 0; a < seeds.length; a++) for (let b = a; b < seeds.length; b++) for (let c = b; c < seeds.length; c++) {
    const sum = Object.fromEntries(FLAVORS.map(f => [f, 0]));
    for (const [f, v] of [seeds[a], seeds[b], seeds[c]]) sum[f] += v;
    if (FLAVORS.every(f => sum[f] === target[f])) out.add(JSON.stringify([seeds[a], seeds[b], seeds[c]].sort((x, y) => y[1] - x[1] || FLAVORS.indexOf(x[0]) - FLAVORS.indexOf(y[0]))));
  }
  return [...out].map(s => JSON.parse(s));
}

// Description : la plus récente (Unys) d'abord
const PREF = [9, 1, 5, 6, 8, 0];
const out = berries.map(b => {
  const list = b.items.map(id => items.get(id)).filter(Boolean);
  const en = list[0].name;
  const pick = [...list].sort((x, y) => PREF.indexOf(Math.floor(x.id / 1000)) - PREF.indexOf(Math.floor(y.id / 1000)));
  const descEn = clean(pick.find(i => i.description)?.description);
  const descFr = clean(pick.map(i => frDesc[(i.description || "").toLowerCase()]).find(Boolean));
  const flavor = Object.fromEntries(FLAVORS.map(f => [f, b[`${f}_degree`]]));
  const rec = recipes(flavor);
  return {
    id: b.id, en, fr: frNames[en.toLowerCase()] || en, desc: { en: descEn, fr: descFr || null },
    flavor, recipes: rec, grow: b.grow_time, harvest: [b.min_harvest, b.max_harvest],
    naturePower: { type: b.nature_power_type, power: b.nature_power_power },
  };
});
const seedNames = Object.fromEntries(FLAVORS.flatMap(f => ["Plain", "Very"].map(k => {
  const en = `${k} ${f[0].toUpperCase() + f.slice(1)} Seed`;
  return [`${f}${k === "Very" ? 2 : 1}`, { en, fr: frNames[en.toLowerCase()] || en }];
})));
const dest = path.join(path.dirname(new URL(import.meta.url).pathname), "../src/data/berries.json");
fs.writeFileSync(dest, JSON.stringify({ berries: out, seeds: seedNames }));
const amb = out.filter(b => b.recipes.length !== 1);
console.log(`${out.length} Baies → ${dest} (${(fs.statSync(dest).size / 1024).toFixed(0)} Ko)${amb.length ? `, recette ambiguë : ${amb.map(b => b.en).join(", ")}` : ""}`);
