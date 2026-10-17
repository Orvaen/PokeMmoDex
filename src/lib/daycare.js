import { BY_ID, STATS, familyRoot, genderInfo } from "./data.js";
import { NATURES } from "./breeding.js";

// Pension PokeMMO, d'après le wiki PokeMMO et PikaMMO :
// - 3 IV sont transmis tels quels, chacun par un parent tiré au hasard ;
//   un bracelet force l'IV de son porteur et compte parmi ces 3.
// - Les 3 autres IV valent la moyenne des deux parents, arrondie vers le bas.
// - Une Pierre Stase transmet la nature du porteur ; sinon la nature est tirée au hasard.
// - Le talent caché passe à 60 % s'il est porté par la mère (ou par le parent qui n'est pas Métamorph).
// - Les capacités Œuf viennent du père (ou du parent qui n'est pas Métamorph).
// - Le genre du bébé peut être choisi en payant, selon le ratio de l'espèce.

export const DITTO = 132;
export const INHERITED = 3;
export const HA_CHANCE = 0.6;
const NATURE_KEYS = Object.keys(NATURES);

export const emptyParent = (species, gender) => ({
  species, gender,
  ivs: Object.fromEntries(STATS.map(s => [s, null])),
  nature: null, ability: null, item: null, moves: [],
});

const speciesOf = par => (par?.species ? BY_ID.get(par.species) : null);
export const isDitto = par => par?.species === DITTO;

// Genre imposé par l'espèce : "N" asexué (et Métamorph), "M" ou "F" pour les espèces à un seul genre
export function fixedGender(p) {
  if (!p) return null;
  if (p.id === DITTO) return "N";
  const g = genderInfo(p);
  return g.kind === "MF" ? null : g.kind;
}

// Accouplement possible ? Renvoie { ok, reason, mother, father, baby }
export function pairing(a, b) {
  const pa = speciesOf(a), pb = speciesOf(b);
  if (!pa || !pb) return { ok: false, reason: "missing" };
  const cannot = p => p.eggGroups.includes("cannot breed");
  if (cannot(pa) || cannot(pb)) return { ok: false, reason: "cannotBreed" };
  const da = isDitto(a), db = isDitto(b);
  if (da && db) return { ok: false, reason: "twoDitto" };
  if (da || db) {
    const other = da ? b : a;
    return { ok: true, mother: other, father: other, ditto: da ? a : b, baby: familyRoot(speciesOf(other)) };
  }
  if (a.gender === "N" || b.gender === "N") return { ok: false, reason: "genderless" };
  if (a.gender === b.gender) return { ok: false, reason: "sameGender" };
  if (!pa.eggGroups.some(g => pb.eggGroups.includes(g))) return { ok: false, reason: "eggGroup" };
  const mother = a.gender === "F" ? a : b, father = mother === a ? b : a;
  return { ok: true, mother, father, baby: familyRoot(speciesOf(mother)) };
}

// Bracelets : stat → liste des parents qui forcent cette stat
function braces(a, b) {
  const out = {};
  [a, b].forEach((par, i) => { if (par.item && par.item !== "ever") (out[par.item] ||= []).push(i); });
  return out;
}

const avg = (x, y) => (x == null || y == null ? null : Math.floor((x + y) / 2));
function subsets(list, k) {
  if (k === 0) return [[]];
  if (list.length < k) return [];
  const [h, ...rest] = list;
  return [...subsets(rest, k - 1).map(s => [h, ...s]), ...subsets(rest, k)];
}

/**
 * Toutes les issues possibles pour les IV, avec leur probabilité.
 * Chaque issue : { p, ivs: { stat: valeur | null } }
 */
export function ivOutcomes(a, b) {
  const forced = braces(a, b);
  const forcedStats = Object.keys(forced);
  const free = STATS.filter(s => !forced[s]);
  const slots = Math.max(0, INHERITED - forcedStats.length);
  const combos = subsets(free, Math.min(slots, free.length));
  const out = [];
  for (const S of combos) {
    const inherited = [...forcedStats, ...S];
    // Parent qui transmet chaque IV hérité : imposé par le bracelet, sinon pile ou face
    const choices = inherited.map(s => (forced[s]?.length === 1 ? [forced[s][0]] : [0, 1]));
    const total = choices.reduce((n, c) => n * c.length, 1);
    for (let m = 0; m < total; m++) {
      let rest = m;
      const ivs = {};
      inherited.forEach((s, i) => {
        const c = choices[i][rest % choices[i].length];
        rest = Math.floor(rest / choices[i].length);
        ivs[s] = (c === 0 ? a : b).ivs[s];
      });
      for (const s of STATS) if (!(s in ivs)) ivs[s] = avg(a.ivs[s], b.ivs[s]);
      out.push({ p: 1 / combos.length / total, ivs });
    }
  }
  return out;
}

// Résumé par stat : valeurs possibles, chance d'un 31 ; et répartition du nombre de 31
export function ivPreview(a, b) {
  const outs = ivOutcomes(a, b);
  const perStat = {};
  for (const s of STATS) {
    const vals = outs.map(o => o.ivs[s]);
    const known = vals.every(v => v != null);
    perStat[s] = {
      min: known ? Math.min(...vals) : null,
      max: known ? Math.max(...vals) : null,
      p31: outs.reduce((n, o) => n + (o.ivs[s] === 31 ? o.p : 0), 0),
    };
  }
  const count = Array(7).fill(0);
  for (const o of outs) count[STATS.filter(s => o.ivs[s] === 31).length] += o.p;
  return { perStat, count };
}

// Nature : { fixed: clé | null, choices: [{ k, p }] }
export function naturePreview(a, b) {
  const holders = [a, b].filter(par => par.item === "ever" && par.nature);
  if (!holders.length) return { fixed: null, choices: [] };
  const share = 1 / holders.length;
  const choices = [];
  holders.forEach(h => { const c = choices.find(x => x.k === h.nature); c ? (c.p += share) : choices.push({ k: h.nature, p: share }); });
  return { fixed: choices.length === 1 ? choices[0].k : null, choices };
}

// Talent du bébé : [{ name, hidden, p }]
export function abilityPreview(pair) {
  const baby = pair.baby;
  const normal = [...new Set([baby.abilities[0], baby.abilities[1]].filter(Boolean))];
  const ha = baby.abilities[2] && !normal.includes(baby.abilities[2]) ? baby.abilities[2] : null;
  const src = speciesOf(pair.mother);
  const passes = ha && src && pair.mother.ability && pair.mother.ability === src.abilities[2] && src.abilities[2] !== src.abilities[0];
  const pHa = passes ? HA_CHANCE : 0;
  return [
    ...normal.map(name => ({ name, hidden: false, p: (1 - pHa) / normal.length })),
    ...(ha ? [{ name: ha, hidden: true, p: pHa }] : []),
  ];
}

// Capacités Œuf apprises par le bébé grâce au père
export function eggMovesPassed(pair, moves) {
  if (!moves || !pair.ok) return [];
  const eggs = new Set((moves.learn[pair.baby.id] || []).filter(r => r[1] === "E").map(r => r[0]));
  return (pair.father.moves || []).filter(m => eggs.has(m));
}

// Prix de la pension pour choisir le genre, selon le ratio de l'espèce
export function genderPrice(baby) {
  const g = genderInfo(baby);
  if (g.kind !== "MF") return null;
  const minority = Math.min(g.female, 1 - g.female);
  return minority >= 0.5 ? 5000 : minority >= 0.25 ? 10000 : 25000;
}

const pickWeighted = list => {
  let r = Math.random();
  for (const x of list) { r -= x.p; if (r <= 0) return x; }
  return list.at(-1);
};

// Un œuf : tire IV, nature, talent et genre selon les règles ci-dessus
export function hatch(a, b, pair, genderChoice, moves) {
  const out = pickWeighted(ivOutcomes(a, b));
  const nat = naturePreview(a, b);
  const nature = nat.choices.length ? pickWeighted(nat.choices).k : NATURE_KEYS[Math.floor(Math.random() * NATURE_KEYS.length)];
  const abil = pickWeighted(abilityPreview(pair).filter(x => x.p > 0));
  const g = genderInfo(pair.baby);
  const gender = g.kind === "N" ? "N" : g.kind !== "MF" ? g.kind : genderChoice || (Math.random() < g.female ? "F" : "M");
  return {
    id: Date.now() + Math.random(),
    species: pair.baby.id,
    gender,
    ivs: out.ivs,
    nature,
    ability: abil?.name || null,
    moves: eggMovesPassed(pair, moves),
  };
}
