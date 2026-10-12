import { BY_ID, STATS } from "./data.js";
import { NATURES } from "./breeding.js";

// Partage d'un plan d'élevage par lien : tout tient dans l'adresse, rien n'est envoyé à un serveur.
// Format (v1), en JSON compact puis base64url :
//   { v: 1, s: espèce de la page, t: évolution visée, i: IV visés (masque de bits), n: nature (indice) ou -1,
//     u: pseudo, b: [[espèce, genre 0♂ 1♀ 2∅, IV en 6 caractères, nature, talent], …] }
// IV : un caractère par stat, 0-9 puis a-v pour 0-31, « - » si inconnu.
const NATURE_KEYS = Object.keys(NATURES);
const DIGITS = "0123456789abcdefghijklmnopqrstuv";
const GENDERS = ["M", "F", "N"];

const toB64 = str => {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64 = b64 => {
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
};

export function encodePlan({ species, target, ivs, natured, nature, box, name }) {
  const data = {
    v: 1,
    s: species,
    t: target,
    i: STATS.reduce((m, s, k) => (ivs.includes(s) ? m | (1 << k) : m), 0),
    n: natured ? NATURE_KEYS.indexOf(nature) : -1,
    u: (name || "").trim().slice(0, 24),
    b: box.map(it => {
      const p = BY_ID.get(it.species);
      return [
        it.species,
        Math.max(0, GENDERS.indexOf(it.gender)),
        STATS.map(s => (it.ivs?.[s] == null ? "-" : DIGITS[it.ivs[s]])).join(""),
        it.nature ? NATURE_KEYS.indexOf(it.nature) : -1,
        it.ability && p ? p.abilities.indexOf(it.ability) : -1,
      ];
    }),
  };
  return toB64(JSON.stringify(data));
}

export function decodePlan(code) {
  try {
    const d = JSON.parse(fromB64(code));
    if (d.v !== 1 || !BY_ID.has(d.s)) return null;
    const box = (d.b || [])
      .filter(r => BY_ID.has(r[0]))
      .map((r, k) => {
        const p = BY_ID.get(r[0]);
        return {
          id: `shared-${k}`,
          species: r[0],
          gender: GENDERS[r[1]] || "F",
          ivs: Object.fromEntries(STATS.map((s, j) => [s, r[2]?.[j] && r[2][j] !== "-" ? DIGITS.indexOf(r[2][j]) : null])),
          nature: r[3] >= 0 ? NATURE_KEYS[r[3]] : null,
          ability: r[4] >= 0 ? p.abilities[r[4]] || null : null,
        };
      });
    return {
      species: d.s,
      target: BY_ID.has(d.t) ? d.t : d.s,
      ivs: STATS.filter((s, k) => d.i & (1 << k)),
      natured: d.n >= 0,
      nature: d.n >= 0 ? NATURE_KEYS[d.n] : null,
      name: typeof d.u === "string" ? d.u.slice(0, 24) : "",
      box,
    };
  } catch {
    return null;
  }
}

export const shareUrl = (pokemonId, code) => `${location.origin}${location.pathname}#/pokemon/${pokemonId}/elevage?plan=${code}`;
