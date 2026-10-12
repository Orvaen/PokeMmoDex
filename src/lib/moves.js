import { useEffect, useState } from "react";

// Les capacités pèsent lourd : on ne les charge qu'à la première page qui en a besoin.
let promise = null;
let cache = null;
export function loadMoves() {
  promise ||= import("../data/moves.json").then(m => {
    const data = m.default;
    data.byId = new Map(data.moves.map((mv, i) => [mv.id, i]));
    // Index inversé : capacité → Pokémon qui l'apprennent
    data.learners = data.moves.map(() => []);
    for (const [pid, rows] of Object.entries(data.learn)) {
      for (const [idx, kind, level] of rows) data.learners[idx].push({ pid: +pid, kind, level });
    }
    cache = data;
    return data;
  });
  return promise;
}

export function useMoves() {
  const [data, setData] = useState(cache);
  useEffect(() => {
    if (!cache) loadMoves().then(setData);
  }, []);
  return data;
}

// Ordre d'affichage des modes d'apprentissage
export const KINDS = ["L", "V", "T", "U", "E", "P", "S"];
export const moveName = (mv, lang) => (lang === "fr" ? mv.fr : mv.en);
