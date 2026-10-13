// Génère une série de posts Reddit (Markdown, en anglais) à partir des données du site.
// Usage : node --import ./scripts/reddit/register.mjs scripts/reddit/build-posts.mjs
// Sortie : reddit/posts/*.md (un fichier par post, à coller dans l'éditeur Markdown de Reddit)
import { mkdirSync, writeFileSync } from "node:fs";
import { ALL, BY_ID, REGIONS, STATS, TYPES, abilityInfo, ABILITY_RATINGS, TYPE_CHART } from "../../src/lib/data.js";
import { LOCATIONS } from "../../src/lib/encounters.js";
import { RARITIES, METHODS } from "../../src/lib/data.js";
import { condOf } from "../../src/lib/conditions.js";
import { baseName } from "../../src/data/maps.js";
import { hmsFor, hmName } from "../../src/data/hms.js";
import { centerInfo } from "../../src/components/Access.jsx";
import { huntSpots, evaluate, ODDS, HORDE_SIZE } from "../../src/lib/shiny.js";
import { NATURES } from "../../src/lib/breeding.js";
import { resistersOf } from "../../src/lib/team.js";
import { HELD, HELD_CATS } from "../../src/data/heldItems.js";
import ITEMS from "../../src/data/items.json";
import BERRIES from "../../src/data/berries.json";
import MOVES from "../../src/data/moves.json";

const SITE = "https://rayan-studio.github.io/PokeMmoDex/";
const OUT = new URL("../../reddit/posts/", import.meta.url);
mkdirSync(OUT, { recursive: true });

// ---------- Outils ----------
const STAT_EN = { hp: "HP", atk: "Attack", def: "Defense", spa: "Sp. Atk", spd: "Sp. Def", spe: "Speed" };
const STAT_SHORT = { hp: "HP", atk: "Atk", def: "Def", spa: "SpA", spd: "SpD", spe: "Spe" };
const table = (head, rows) => [
  `| ${head.join(" | ")} |`,
  `|${head.map(() => "---").join("|")}|`,
  ...rows.map(r => `| ${r.map(c => String(c ?? "").replace(/\|/g, "/")).join(" | ")} |`),
].join("\n");
const place = loc => baseName(LOCATIONS[loc].en);
const region = i => REGIONS[i];
function centerText(ce) {
  if (!ce) return "unknown";
  const where = ce.steps === 0 ? "on site" : `${ce.city} (${ce.steps} area${ce.steps > 1 ? "s" : ""}${ce.ferry ? ", boat" : ""})`;
  return where;
}
const ADVICE = { center: "Walk back", both: "Either", leppa: "Bring Leppa" };
const hmText = hms => (hms.length ? hms.map(h => hmName(h.hm, "en") + (h.opt ? " (advised)" : "")).join(", ") : "none");
const TIMES_EN = { Morning: "morning", Day: "day", Night: "night" };
const SEASONS_EN = ["spring", "summer", "autumn", "winter"];
// « night only », « summer only », "" si toujours là
function whenText(locs) {
  const conds = [...new Set(locs)].map(l => condOf(LOCATIONS[l].en));
  const times = new Set(conds.flatMap(c => c.times));
  const seasons = conds.some(c => c.season === null) ? null : [...new Set(conds.map(c => c.season))];
  const parts = [];
  if (times.size < 3) parts.push([...times].map(x => TIMES_EN[x]).join("/"));
  if (seasons && seasons.length < 4) parts.push(seasons.sort().map(i => SEASONS_EN[i]).join("/"));
  return parts.length ? parts.join(", ") + " only" : "";
}
function footer(path, next) {
  return [
    "",
    "---",
    "",
    `All tables come from the game data used by my free, open-source PokeMMO Dex (English & French, no ads, no account): ${SITE}${path}`,
    "",
    ...(next ? [`**Next in the series:** ${next}.`, ""] : []),
    "If something is wrong or outdated in PokeMMO, tell me in the comments and I'll fix both the post and the site.",
  ].join("\n");
}
const posts = [];
const add = (file, title, flair, body) => posts.push({ file, title, flair, body });

// ---------- 1. Natures ----------
{
  const ROLE = {
    Adamant: "Physical attacker", Jolly: "Fast physical attacker", Modest: "Special attacker", Timid: "Fast special attacker",
    Bold: "Physical wall (no Atk needed)", Impish: "Physical wall (physical attacker)", Calm: "Special wall (no Atk needed)", Careful: "Special wall (physical attacker)",
    Brave: "Slow physical attacker / Trick Room", Quiet: "Slow special attacker / Trick Room", Relaxed: "Slow physical wall", Sassy: "Slow special wall",
    Naughty: "Mixed attacker (niche)", Lonely: "Mixed attacker (niche)", Hasty: "Fast mixed attacker", Naive: "Fast mixed attacker",
    Mild: "Mixed special attacker (niche)", Rash: "Mixed special attacker (niche)", Lax: "Rarely useful", Gentle: "Rarely useful",
  };
  const main = Object.keys(ROLE).slice(0, 12), rest = Object.keys(ROLE).slice(12);
  const row = k => [`**${k}**`, `+${STAT_SHORT[NATURES[k][0]]}`, `−${STAT_SHORT[NATURES[k][1]]}`, ROLE[k]];
  const neutral = Object.keys(NATURES).filter(k => !NATURES[k][0]);
  // Grille 5×5 : ligne = stat augmentée, colonne = stat baissée
  const S5 = ["atk", "def", "spa", "spd", "spe"];
  const grid = table(["+ \\ −", ...S5.map(s => STAT_SHORT[s])], S5.map(plus => [`**${STAT_SHORT[plus]}**`, ...S5.map(minus => {
    if (plus === minus) return "*neutral*";
    return Object.keys(NATURES).find(n => NATURES[n][0] === plus && NATURES[n][1] === minus);
  })]));
  add("01-natures.md", "Natures cheat sheet: the 12 you'll actually use, and a grid for the rest", "Guide", [
    "Natures give **+10%** to one stat and **−10%** to another. Neutral natures change nothing. Here's what to pick for each role.",
    "",
    "## The 12 natures that matter",
    "",
    table(["Nature", "Up", "Down", "Use it for"], main.map(row)),
    "",
    "**Rule of thumb:** lower the attacking stat you don't use (Atk on special attackers, SpA on physical ones). Only lower Speed if the Pokémon is meant to be slow.",
    "",
    "## The others",
    "",
    table(["Nature", "Up", "Down", "Use it for"], rest.map(row)),
    "",
    `Neutral (no effect): ${neutral.join(", ")}. Avoid them on anything competitive.`,
    "",
    "## Full grid",
    "",
    "Row = stat raised, column = stat lowered.",
    "",
    grid,
    "",
    "## Breeding tip",
    "",
    "Give the parent with the right nature an **Everstone**: the baby always gets that nature.",
    footer("#/natures", "EV training horde spots for every stat"),
  ].join("\n"));
}

// ---------- 2. Hordes EV ----------
const HORDE = RARITIES.indexOf("Horde");
const HORDE_SPOTS = (() => {
  const map = new Map();
  for (const p of ALL) for (const [loc, method, rarity, min, max] of p.locs) {
    if (rarity !== HORDE) continue;
    const L = LOCATIONS[loc];
    const key = `${L.region}#${baseName(L.en)}#${method}`;
    if (!map.has(key)) map.set(key, { key, loc, method, region: L.region, species: new Map() });
    const s = map.get(key);
    if (!s.species.has(p.id)) s.species.set(p.id, { p, min, max, locs: [] });
    const sp = s.species.get(p.id);
    sp.min = Math.min(sp.min, min); sp.max = Math.max(sp.max, max); sp.locs.push(loc);
  }
  return [...map.values()].map(s => ({ ...s, species: [...s.species.values()], center: centerInfo(s.loc), hms: hmsFor(s.loc, s.method) }));
})();
const nearScore = c => (c.center ? c.center.steps + (c.center.ferry ? 2 : 0) : 99);
{
  const sections = [];
  const PER_STAT = 8;
  for (const stat of STATS) {
    const pure = HORDE_SPOTS.filter(s => s.species.every(x => x.p.yields[stat]))
      .map(s => ({ ...s, worst: Math.min(...s.species.map(x => x.p.yields[stat])), minLv: Math.min(...s.species.map(x => x.min)) }))
      .sort((a, b) => b.worst - a.worst || (a.hms.filter(h => !h.opt).length - b.hms.filter(h => !h.opt).length) || nearScore(a) - nearScore(b) || a.minLv - b.minLv)
      .slice(0, PER_STAT);
    const rows = pure.map(s => {
      const ev = s.worst * HORDE_SIZE;
      const mons = s.species.map(x => `${x.p.en} Lv${x.min === x.max ? x.min : `${x.min}–${x.max}`}${whenText(x.locs) ? ` (${whenText(x.locs)})` : ""}`).join(", ");
      return [region(s.region), place(s.loc) + (METHODS[s.method] !== "Grass" ? ` (${METHODS[s.method]})` : ""), mons, ev, Math.ceil(252 / ev), centerText(s.center), ADVICE[s.center?.advice] || "?", hmText(s.hms)];
    });
    sections.push(`## ${STAT_EN[stat]}\n\n${rows.length ? table(["Region", "Spot", "Horde", "EVs/horde", "Hordes for 252", "Nearest Center", "PP refill", "HMs"], rows) : "_No 100% horde spot for this stat._"}`);
  }
  add("02-ev-hordes.md", "EV training: the best horde spots for every stat (EVs per horde, hordes to 252, nearest Center, HMs)", "Guide", [
    "Every spot below is **100% one stat**: every Pokémon that can show up in the horde gives the EV you want, so no wasted fights.",
    "",
    "How to read the tables:",
    "",
    "* **EVs/horde** = the lowest yield in the horde × 5 Pokémon, without boosting items.",
    "* **Hordes for 252** = hordes needed from 0 EVs. A **Macho Brace** doubles EVs gained (and halves Speed).",
    "* **PP refill**: when Sweet Scent or your spread move runs out. *Walk back* = the Center is next door, *Bring Leppa* = it's far, take Leppa Berries.",
    "* **HMs** = what you need to get there from the nearest Center (based on the original games' paths, tell me if PokeMMO differs).",
    "",
    ...sections.flatMap(s => [s, ""]),
    "Overshot a stat? The EV-reducing berries (Pomeg, Kelpsy, Qualot, Hondew, Grepa, Tamato) are in the berries post of this series.",
    footer("#/hordes-ev", "shiny hunting spots where every horde is the same Pokémon"),
  ].join("\n"));
}

// ---------- 3. Chasse shiny ----------
{
  const RATES = { horde: 120, single: 300 };
  const perShinyH = Math.round(ODDS.base / (RATES.horde * HORDE_SIZE));
  const perShinyBoth = Math.round(ODDS.both / (RATES.horde * HORDE_SIZE) * 10) / 10;
  // Pour chaque Pokémon : son meilleur spot de horde à 100 % (une seule espèce dans la horde), à n'importe quel moment
  const rows = [];
  for (const p of ALL.filter(x => x.obtainable)) {
    const spots = huntSpots(p).filter(s => s.kind === "horde").map(s => evaluate(s, { time: "", season: "", rates: RATES, odds: ODDS.base })).filter(Boolean);
    const pure = spots.filter(s => s.best.share === 1)
      .sort((a, b) => (a.hms.filter(h => !h.opt).length - b.hms.filter(h => !h.opt).length) || nearScore(a) - nearScore(b));
    if (!pure.length) continue;
    const s = pure[0];
    const always = s.contexts.length === 12 && s.contexts.every(c => c.share === 1);
    // Moments où la horde est 100 % ce Pokémon
    const times = [...new Set(s.bestConds.flatMap(c => c.times))];
    const seasons = [...new Set(s.bestConds.map(c => c.season))].sort();
    const whenLabel = always ? "any time" : [times.length < 3 ? times.map(t => TIMES_EN[t]).join("/") : "", seasons.length < 4 ? seasons.map(i => SEASONS_EN[i]).join("/") : ""].filter(Boolean).join(", ") || "any time";
    rows.push({ p, s, whenLabel, extra: pure.length - 1 });
  }
  const easy = rows.filter(r => r.s.center && r.s.center.advice !== "leppa" && r.s.hms.every(h => h.opt));
  const byRegion = REGIONS.map((name, i) => ({ name, rows: easy.filter(r => r.s.region === i).sort((a, b) => a.p.id - b.p.id) })).filter(g => g.rows.length);
  add("03-shiny-hordes.md", `Shiny hunting: ${easy.length} Pokémon with a "pure" horde spot close to a Pokémon Center and no HM needed`, "Guide", [
    "In a **pure** spot, every horde is 5 copies of the same Pokémon, so every Pokémon you see is a shiny chance for your target. The list below only keeps pure spots that are **next to a Pokémon Center (or 2 areas away)** and **need no HM**, so you can refill PP for free.",
    "",
    "## How long does it take?",
    "",
    `Rough estimate, using 1/${ODDS.base.toLocaleString("en")} base odds and ${RATES.horde} hordes per hour (${RATES.horde * HORDE_SIZE} Pokémon/h): about **${perShinyH} hours per shiny on average** in a pure spot. With both the donator bonus and the Shiny Charm (1/${ODDS.both.toLocaleString("en")}): about **${perShinyBoth} h**. Your pace will differ, so treat it as a comparison, not a promise.`,
    "",
    ...byRegion.flatMap(g => [
      `## ${g.name}`,
      "",
      table(["Pokémon", "Spot", "Level", "When", "Nearest Center", "PP refill"], g.rows.map(r => [
        r.p.en, place(r.s.loc) + (METHODS[r.s.method] !== "Grass" ? ` (${METHODS[r.s.method]})` : ""), r.s.min === r.s.max ? r.s.min : `${r.s.min}–${r.s.max}`, r.whenLabel, centerText(r.s.center), ADVICE[r.s.center.advice],
      ])),
      "",
    ]),
    `${rows.length - easy.length} more Pokémon have a pure horde spot that's far from a Center or needs an HM. The site's shiny page shows them all, with every spot ranked by estimated time and filters for method, season, time of day and HMs.`,
    footer("#/shiny", "every TM move and how many Pokémon can learn it"),
  ].join("\n"));
}

// ---------- 4. CT / CS ----------
{
  const learners = MOVES.moves.map(() => new Set());
  for (const [pid, rows] of Object.entries(MOVES.learn)) for (const [idx, kind] of rows) if (kind === "T") learners[idx].add(+pid);
  const finals = new Set(ALL.filter(p => p.obtainable && !p.evos.length).map(p => p.id));
  const list = MOVES.moves.map((mv, i) => ({ mv, n: [...learners[i]].filter(id => finals.has(id)).length })).filter(x => x.mv.tm);
  const CAT = { P: "Physical", S: "Special", N: "Status" };
  // Attaques à part : recharge, deux tours, K.O. de soi, puissance variable
  const ODD = new Set(["Hyper Beam", "Giga Impact", "Solar Beam", "Sky Attack", "Skull Bash", "Razor Wind", "Dig", "Fly", "Dive", "Bounce", "Focus Punch", "Self-Destruct", "Selfdestruct", "Explosion", "Hidden Power", "Secret Power", "Round", "Frustration", "Return", "Natural Gift", "Fling", "Payback", "Avalanche", "Revenge", "Last Resort", "Dream Eater", "Future Sight", "Outrage", "Thrash", "Petal Dance"]);
  const score = mv => Math.min(mv.power, 150) * (mv.acc ?? 100) / 100;
  const dmg = Object.keys(TYPES).flatMap(ty => list.filter(x => x.mv.tm === "tm" && x.mv.cat !== "N" && x.mv.type === ty && x.mv.power > 1 && !ODD.has(x.mv.en))
    .sort((a, b) => score(b.mv) - score(a.mv) || b.n - a.n).slice(0, 2));
  const wide = list.filter(x => x.mv.tm === "tm" && x.mv.cat !== "N" && x.mv.type !== "Normal" && x.mv.power >= 60 && !ODD.has(x.mv.en)).sort((a, b) => b.n - a.n).slice(0, 10);
  const status = list.filter(x => x.mv.cat === "N" && x.mv.tm === "tm").sort((a, b) => b.n - a.n).slice(0, 15);
  const hms = list.filter(x => x.mv.tm === "hm").sort((a, b) => b.n - a.n);
  const nFinals = finals.size;
  const r = x => [x.mv.en, x.mv.type, CAT[x.mv.cat], x.mv.power ?? "—", x.mv.acc ?? "—", x.mv.pp, `${x.n} (${Math.round(100 * x.n / nFinals)}%)`];
  const H = ["Move", "Type", "Cat.", "Power", "Acc.", "PP", "Fully evolved learners"];
  add("04-tm-compatibility.md", "TM & HM cheat sheet: the strongest TMs of each type, and the ones the most Pokémon can learn", "Guide", [
    `TMs are an investment, so it helps to know which ones you'll reuse. Counts below are out of the **${nFinals} obtainable fully evolved Pokémon** (pre-evolutions left out so families aren't counted 3 times).`,
    "",
    "## Strongest attacking TMs of each type",
    "",
    "Top 2 per type by power × accuracy (recharge, two-turn and self-KO moves left out).",
    "",
    table(H, dmg.map(r)),
    "",
    "## Coverage TMs that the most Pokémon can learn",
    "",
    "Non-Normal attacks with 60+ power: good buys if you'll teach them to several Pokémon.",
    "",
    table(H, wide.map(r)),
    "",
    "## Status TMs, most compatible first",
    "",
    table(H, status.map(r)),
    "",
    "## HMs: who can carry them",
    "",
    "Handy to pick an HM slave that covers several at once.",
    "",
    table(H, hms.map(r)),
    "",
    "Each move has its own page on the site with every Pokémon that learns it (by level, TM, tutor, egg).",
    footer("#/capacites", "every berry: what it does, which seeds to plant, how long it takes"),
  ].join("\n"));
}

// ---------- 5. Baies ----------
{
  const EV_STAT = { "Pomeg Berry": "hp", "Kelpsy Berry": "atk", "Qualot Berry": "def", "Hondew Berry": "spa", "Grepa Berry": "spd", "Tamato Berry": "spe" };
  const GROUPS = [
    ["EV-reducing berries", Object.keys(EV_STAT)],
    ["PP", ["Leppa Berry"]],
    ["HP recovery", ["Oran Berry", "Sitrus Berry", "Figy Berry", "Wiki Berry", "Mago Berry", "Aguav Berry", "Iapapa Berry", "Enigma Berry"]],
    ["Status cures", ["Cheri Berry", "Chesto Berry", "Pecha Berry", "Rawst Berry", "Aspear Berry", "Persim Berry", "Lum Berry"]],
    ["Type-resist berries", ["Occa", "Passho", "Wacan", "Rindo", "Yache", "Chople", "Kebia", "Shuca", "Coba", "Payapa", "Tanga", "Charti", "Kasib", "Haban", "Colbur", "Babiri", "Chilan"].map(x => x + " Berry")],
    ["Pinch berries (battle)", ["Liechi", "Ganlon", "Salac", "Petaya", "Apicot", "Starf", "Lansat", "Micle", "Custap", "Jaboca", "Rowap"].map(x => x + " Berry")],
  ];
  const byEn = new Map(BERRIES.berries.map(b => [b.en, b]));
  const seeds = b => b.recipes[0].map(([f, l]) => BERRIES.seeds[`${f}${l}`].en.replace(" Seed", "")).join(" + ");
  const effect = b => {
    if (EV_STAT[b.en]) return `Lowers ${STAT_EN[EV_STAT[b.en]]} EVs (+ friendship)`;
    const d = b.desc.en.replace(/typ e/g, "type").replace(/^If held by a Pokémon, /, "").replace(/^it /i, "");
    const resist = d.match(/^Weakens a supereffective (\w+)-type attack/);
    if (resist) return `Halves one super-effective ${resist[1]} hit`;
    if (/^Weakens a Normal-type attack/.test(d)) return "Halves one Normal hit";
    return d.replace(/^(\w)/, c => c.toUpperCase());
  };
  const used = new Set(GROUPS.flatMap(g => g[1]));
  const others = BERRIES.berries.filter(b => !used.has(b.en));
  const sect = (name, list) => [`## ${name}`, "", table(["Berry", "Effect", "Seeds to plant", "Grows in", "Harvest"], list.map(b => [b.en, effect(b), seeds(b), `${b.grow} h`, `${b.harvest[0]}–${b.harvest[1]}`])), ""];
  add("05-berries.md", `All ${BERRIES.berries.length} berries: what they do, which 3 seeds to plant, grow time and harvest`, "Guide", [
    "Every berry is grown by planting **3 seeds together**. The tables give the seed combo, the growing time and how many berries you harvest.",
    "",
    "Seeds: *Plain* or *Very* + a flavor (Spicy, Dry, Sweet, Bitter, Sour).",
    "",
    ...sect(GROUPS[0][0], GROUPS[0][1].map(x => byEn.get(x))),
    "Each one lowers that stat's EVs, so you can fix an EV spread without starting over.",
    "",
    ...GROUPS.slice(1).flatMap(([n, l]) => sect(n, l.map(x => byEn.get(x)).filter(Boolean))),
    ...(others.length ? sect("Other berries", others) : []),
    footer("#/baies", "held items worth getting, with exact numbers and which wild Pokémon carry them"),
  ].join("\n"));
}

// ---------- 6. Objets ----------
{
  const byEn = new Map(ITEMS.held.map(h => [h.en, h]));
  const CAT_EN = { speed: "Speed", power: "Damage", defense: "Bulk & healing", accuracy: "Accuracy, crits & flinch", field: "Weather, screens & trapping", once: "Single use / triggered", breeding: "Breeding & training", explore: "Exploration & money" };
  const holders = en => {
    const h = byEn.get(en);
    if (!h?.holders.length) return "—";
    const names = h.holders.map(id => BY_ID.get(id)).filter(p => p?.wild).map(p => p.en);
    return names.length ? names.slice(0, 4).join(", ") + (names.length > 4 ? ` +${names.length - 4}` : "") : "—";
  };
  const sections = HELD_CATS.flatMap(cat => [
    `## ${CAT_EN[cat]}`, "",
    table(["Item", "Effect", "Wild Pokémon holding it"], Object.entries(HELD).filter(([, v]) => v.cat === cat).map(([en, v]) => [en, v.en, holders(en)])), "",
  ]);
  const types = Object.keys(TYPES);
  const tb = kind => type => ITEMS.typeBoost.filter(x => x.type === type && x.kind === kind).map(x => x.en).join(", ") || "—";
  const boostTable = table(["Type", "+20% item", "Plate (+20%)", "Incense (+20%)", "Gem (+50%, single use)"], types.map(ty => [ty, tb("item")(ty), tb("plate")(ty), tb("incense")(ty), tb("gem")(ty)]));
  add("06-held-items.md", "Held items with exact numbers, and which wild Pokémon carry them (Thief/Covet targets)", "Guide", [
    "Every useful held item with its effect in numbers. The last column lists wild Pokémon that can hold it, so you can farm it with **Thief** or **Covet** (or a Pokémon with Frisk to check first).",
    "",
    "Numbers come from the PokeMMO item text when it gives them, otherwise from Gen 5 rules, which PokeMMO follows.",
    "",
    ...sections,
    "## Type-boosting items",
    "",
    boostTable,
    footer("#/objets", "the abilities that actually matter, and who has them"),
  ].join("\n"));
}

// ---------- 7. Talents ----------
{
  const owners = new Map();
  for (const p of ALL.filter(x => x.obtainable)) p.abilities.forEach((a, i) => {
    if (!a) return;
    if (!owners.has(a)) owners.set(a, []);
    const list = owners.get(a);
    const prev = list.find(o => o.p === p);
    if (prev) prev.hidden &&= i === 2;
    else list.push({ p, hidden: i === 2 });
  });
  const rated = [...owners.keys()].map(a => ({ a, r: ABILITY_RATINGS[a] ?? ABILITY_RATINGS[a === "Compoundeyes" ? "Compound Eyes" : a === "Lightningrod" ? "Lightning Rod" : a] ?? 0 }))
    .filter(x => x.r >= 3.5).sort((a, b) => b.r - a.r || a.a.localeCompare(b.a));
  const who = a => {
    const list = owners.get(a).filter(o => !o.p.evos.length);
    const use = list.length ? list : owners.get(a);
    const names = use.map(o => o.p.en + (o.hidden ? " (HA)" : ""));
    return names.slice(0, 8).join(", ") + (names.length > 8 ? ` +${names.length - 8} more` : "");
  };
  const desc = a => abilityInfo(a)?.desc?.en || "";
  add("07-abilities.md", "Abilities that actually matter: the strongest ones and which obtainable Pokémon have them", "Guide", [
    "The strongest abilities in the game (rated 3.5+ out of 5 on the Pokémon Showdown scale), with a short description and the fully evolved Pokémon that can have them. **(HA)** = hidden ability, so plan your breeding for it.",
    "",
    table(["Ability", "Rating", "What it does", "Pokémon"], rated.map(x => [`**${x.a}**`, x.r, desc(x.a), who(x.a)])),
    "",
    "Hover any ability on the site for its description, or open its page for every Pokémon that has it.",
    footer("#/talents", "a step-by-step method to build a team, with type coverage tables"),
  ].join("\n"));
}

// ---------- 8. Équipe ----------
{
  const types = Object.keys(TYPES);
  const mult = (atk, def) => ({ 1: 2, 2: 0.5, 3: 0 }[TYPE_CHART[def][atk]] ?? 1);
  const resTable = table(["Attacking type", "Resisted by (immune in bold)"], types.map(atk => [atk, resistersOf(atk).map(d => (mult(atk, d) === 0 ? `**${d}**` : d)).join(", ")]));
  // Meilleurs doubles types défensifs parmi les Pokémon obtenables entièrement évolués
  const combos = new Map();
  for (const p of ALL.filter(x => x.obtainable && !x.evos.length)) {
    const k = [...p.types].sort().join("/");
    if (!combos.has(k)) combos.set(k, { types: p.types, mons: [] });
    combos.get(k).mons.push(p);
  }
  const scored = [...combos.values()].map(c => {
    const m = types.map(a => c.types.reduce((x, d) => x * mult(a, d), 1));
    return { ...c, weak: m.filter(x => x > 1).length, res: m.filter(x => x < 1).length, imm: m.filter(x => x === 0).length };
  }).sort((a, b) => (b.res - b.weak) - (a.res - a.weak) || a.weak - b.weak).slice(0, 12);
  const TIER = { OU: 0, UU: 1, NU: 2 };
  const defTable = table(["Typing", "Weak to", "Resists / immune", "Examples"], scored.map(c => [c.types.join("/"), c.weak, `${c.res} (${c.imm} immune)`,
    c.mons.sort((a, b) => (TIER[a.tier] ?? 9) - (TIER[b.tier] ?? 9) || b.bst - a.bst).slice(0, 3).map(p => p.en).join(", ")]));
  add("08-team-building.md", "Team building in PokeMMO: a simple 6-step method (with Gen 5 type tables)", "Guide", [
    "A method that works for both PvE (gyms, Elite 4 rematches) and PvP. PokeMMO uses the **Gen 5 type chart** (no Fairy type), which changes a lot compared to recent games: Dragon is only resisted by Steel, and Steel resists Ghost and Dark.",
    "",
    "## 1. Start from one or two Pokémon you want to use",
    "Build around them instead of picking 6 \"good\" Pokémon at random.",
    "",
    "## 2. Give each slot a job",
    "A classic split: 2–3 attackers (one physical, one special), 1–2 walls or pivots, 1 support (status, hazards, screens). Speed control matters: have at least one fast Pokémon or a priority move.",
    "",
    "## 3. Fix shared weaknesses",
    "If 3 members share a weakness and nobody resists it, that's the type that will sweep you. Add a Pokémon that resists it:",
    "",
    resTable,
    "",
    "Typings that resist the most and fear the least (among obtainable fully evolved Pokémon):",
    "",
    defTable,
    "",
    "## 4. Check offensive coverage",
    "Between your 6 Pokémon, try to hit every type super effectively. Same-type moves (STAB) get ×1.5, so prioritize them, then add coverage moves.",
    "",
    "## 5. Nature, ability, item",
    "* Nature: see the natures cheat sheet earlier in this series.",
    "* Ability: some abilities define a Pokémon's role (see the abilities post).",
    "* Item: Leftovers on walls, Choice items or Life Orb on attackers, Focus Sash on frail leads (see the held items post).",
    "",
    "## 6. EVs",
    "Usually 252 / 252 / 4: max the two stats the job needs. Horde spots for each stat are in the EV post.",
    "",
    "**Shortcut:** the site's team builder does steps 3 and 4 for you. Add up to 6 Pokémon, it gives a one-line verdict, the shared weaknesses, clickable suggestions to fix them, offensive coverage and 4 suggested moves per Pokémon. Share your team with a link in the comments and I'll take a look.",
    footer("#/equipe", ""),
  ].join("\n"));
}

// ---------- Écriture ----------
for (const p of posts) writeFileSync(new URL(p.file, OUT), `**Title:** ${p.title}\n\n**Flair:** ${p.flair}\n\n---\n\n${p.body}\n`);
writeFileSync(new URL("posts.json", OUT), JSON.stringify(posts, null, 1));
for (const p of posts) console.log(p.file.padEnd(26), String(p.body.length).padStart(6), "chars |", p.title);
