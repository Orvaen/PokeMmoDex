import { ALL, BY_ID, TYPES, TYPE_CHART } from "./data.js";

export const TEAM_SIZE = 6;
const TYPE_KEYS = Object.keys(TYPES);

// Multiplicateur d'un type d'attaque sur un type défenseur (table Gen 5)
const mult = (atk, def) => ({ 1: 2, 2: 0.5, 3: 0 }[TYPE_CHART[def][atk]] ?? 1);
export const defMult = (atk, types) => types.reduce((m, d) => m * mult(atk, d), 1);

/**
 * Analyse d'une équipe.
 * members : [{ p, moves: [move] }] — moves : capacités offensives choisies (facultatif)
 */
export function analyzeTeam(members) {
  // Défense : pour chaque type d'attaque, combien de membres sont faibles ou résistent
  const defense = TYPE_KEYS.map(atk => {
    const cells = members.map(m => defMult(atk, m.p.types));
    const weak = cells.filter(x => x > 1).length;
    const resist = cells.filter(x => x < 1).length;
    const immune = cells.filter(x => x === 0).length;
    const quad = cells.filter(x => x >= 4).length;
    const danger = weak - resist + quad * 0.5;
    const level = weak >= 3 && resist === 0 ? "high" : weak - resist >= 2 ? "mid" : resist >= 2 && weak === 0 ? "good" : "ok";
    return { atk, cells, weak, resist, immune, danger, level };
  }).sort((a, b) => b.danger - a.danger || b.weak - a.weak);

  // Attaque : types offensifs de chaque membre (ses capacités offensives, sinon ses propres types)
  const attackTypes = members.map(m => {
    const dmg = (m.moves || []).filter(mv => mv && mv.cat !== "N");
    return dmg.length ? [...new Set(dmg.map(mv => mv.type))] : m.p.types;
  });
  const offense = TYPE_KEYS.map(def => {
    let best = 0;
    const by = [];
    members.forEach((m, i) => {
      const x = Math.max(0, ...attackTypes[i].map(a => mult(a, def)));
      if (x > best) best = x;
      if (x > 1) by.push(m.p);
    });
    return { def, best, by };
  });
  const uncovered = offense.filter(o => o.best <= 1);
  const problems = defense.filter(d => d.level === "high" || d.level === "mid").slice(0, 3);
  return { defense, offense, uncovered, problems, attackTypes };
}

// Types qui résistent à un type d'attaque (ou y sont immunisés)
export function resistersOf(atk) {
  return TYPE_KEYS.filter(def => mult(atk, def) < 1).sort((a, b) => mult(atk, a) - mult(atk, b));
}

// Exemples de Pokémon pour combler un trou : obtenables, solides, sans doublon dans l'équipe
const TIER_RANK = { UB: 0, OU: 1, UU: 2, NU: 3 };
export function suggestFor(atk, teamIds, limit = 4) {
  return ALL
    .filter(p => p.obtainable && !teamIds.includes(p.id) && !p.evos.length && defMult(atk, p.types) < 1)
    .filter(p => p.tier !== "UB")
    .sort((a, b) => (TIER_RANK[a.tier] ?? 9) - (TIER_RANK[b.tier] ?? 9) || defMult(atk, a.types) - defMult(atk, b.types) || b.bst - a.bst)
    .slice(0, limit);
}

// Partage par lien : "94:89-85,6,3" (numéro du Pokémon, puis ses capacités)
export const encodeTeam = team => team.filter(Boolean).map(s => s.id + (s.moves?.length ? ":" + s.moves.join("-") : "")).join(",");
export function decodeTeam(str) {
  if (!str) return null;
  const team = str.split(",").slice(0, TEAM_SIZE).map(part => {
    const [id, mv] = part.split(":");
    if (!BY_ID.has(+id)) return null;
    return { id: +id, moves: mv ? mv.split("-").map(Number).filter(Boolean).slice(0, 4) : [] };
  }).filter(Boolean);
  return team.length ? team : null;
}

// Attaques à éviter dans une suggestion automatique (recharge, K.O. de soi, deux tours, conditions)
const AUTO_SKIP = new Set(["Self-Destruct", "Explosion", "Hyper Beam", "Giga Impact", "Blast Burn", "Hydro Cannon", "Frenzy Plant", "Rock Wrecker", "Roar of Time",
  "Focus Punch", "Last Resort", "Dream Eater", "Future Sight", "Doom Desire", "Sky Attack", "Skull Bash", "Solar Beam", "Razor Wind", "Dig", "Fly", "Bounce", "Dive",
  "Shadow Force", "Synchronoise", "Belch", "Snore", "Spit Up", "Fake Out", "Feint", "Outrage", "Thrash", "Petal Dance", "Selfdestruct", "Rollout", "Ice Ball", "Uproar", "Foul Play"]);

/**
 * Propose jusqu'à 4 attaques : la meilleure STAB de chaque type, puis la couverture
 * qui touche le plus de types en super efficace. Tient compte de l'Attaque / Att. Spé.
 */
export function autoMoves(p, options, keep = []) {
  const { atk, spa } = p.stats;
  const catF = mv => (atk > spa * 1.15 ? (mv.cat === "P" ? 1 : 0.6) : spa > atk * 1.15 ? (mv.cat === "S" ? 1 : 0.6) : 1);
  const score = mv => Math.min(mv.power, 120) * ((mv.acc ?? 100) / 100) * (p.types.includes(mv.type) ? 1.5 : 1) * catF(mv);
  const pool = options.filter(mv => mv.power > 1 && !AUTO_SKIP.has(mv.en)).sort((a, b) => score(b) - score(a));
  const chosen = [...keep];
  const has = mv => chosen.some(c => c.id === mv.id || c.type === mv.type);
  for (const ty of p.types) {
    const best = pool.find(mv => mv.type === ty && !has(mv));
    if (best && chosen.length < 4) chosen.push(best);
  }
  const hits = () => new Set(TYPE_KEYS.filter(def => chosen.some(c => mult(c.type, def) > 1)));
  while (chosen.length < 4) {
    const covered = hits();
    let best = null, bestVal = -1;
    for (const mv of pool) {
      if (has(mv)) continue;
      const gain = TYPE_KEYS.filter(def => !covered.has(def) && mult(mv.type, def) > 1).length;
      const val = score(mv) * (1 + 0.35 * gain);
      if (val > bestVal) { bestVal = val; best = mv; }
    }
    if (!best) break;
    chosen.push(best);
  }
  return chosen.slice(keep.length).map(mv => mv.id);
}
