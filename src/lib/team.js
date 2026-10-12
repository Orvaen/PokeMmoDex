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
