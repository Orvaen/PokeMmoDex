import { ALL, STATS, ABILITY_RATINGS, abilityInfo, familyRoot, family, genderInfo, RARITIES } from "./data.js";

export const NATURES = {
  Hardy: [null, null, "Hardi"], Lonely: ["atk", "def", "Solo"], Brave: ["atk", "spe", "Brave"], Adamant: ["atk", "spa", "Rigide"], Naughty: ["atk", "spd", "Mauvais"],
  Bold: ["def", "atk", "Assuré"], Docile: [null, null, "Docile"], Relaxed: ["def", "spe", "Relax"], Impish: ["def", "spa", "Malin"], Lax: ["def", "spd", "Lâche"],
  Timid: ["spe", "atk", "Timide"], Hasty: ["spe", "def", "Pressé"], Serious: [null, null, "Sérieux"], Jolly: ["spe", "spa", "Jovial"], Naive: ["spe", "spd", "Naïf"],
  Modest: ["spa", "atk", "Modeste"], Mild: ["spa", "def", "Doux"], Quiet: ["spa", "spe", "Discret"], Bashful: [null, null, "Pudique"], Rash: ["spa", "spd", "Foufou"],
  Calm: ["spd", "atk", "Calme"], Gentle: ["spd", "def", "Gentil"], Sassy: ["spd", "spe", "Malpoli"], Careful: ["spd", "spa", "Prudent"], Quirky: [null, null, "Bizarre"],
};
export const natureFor = (plus, minus) => Object.keys(NATURES).find(k => NATURES[k][0] === plus && NATURES[k][1] === minus);
export const natName = (k, lang) => (lang === "fr" ? NATURES[k][2] : k);
export const natFx = (k, t) => {
  const [p, m] = NATURES[k];
  return p ? `+${t.short[p]} −${t.short[m]}` : t.neutral;
};

export const ABIL_FR = {
  "Stench": "Puanteur", "Drizzle": "Crachin", "Speed Boost": "Turbo", "Battle Armor": "Armurbaston", "Sturdy": "Fermeté", "Damp": "Moiteur", "Limber": "Échauffement",
  "Sand Veil": "Voile Sable", "Static": "Statik", "Volt Absorb": "Absorb Volt", "Water Absorb": "Absorb Eau", "Oblivious": "Benêt", "Cloud Nine": "Ciel Gris",
  "Compound Eyes": "Œil Composé", "Compoundeyes": "Œil Composé", "Insomnia": "Insomnia", "Color Change": "Déguisement", "Immunity": "Vaccin", "Flash Fire": "Torche", "Shield Dust": "Écran Poudre",
  "Own Tempo": "Tempo Perso", "Suction Cups": "Ventouse", "Intimidate": "Intimidation", "Shadow Tag": "Marque Ombre", "Rough Skin": "Peau Dure",
  "Wonder Guard": "Garde Mystik", "Levitate": "Lévitation", "Effect Spore": "Pose Spore", "Synchronize": "Synchro", "Clear Body": "Corps Sain",
  "Natural Cure": "Médic Nature", "Lightning Rod": "Paratonnerre", "Lightningrod": "Paratonnerre", "Serene Grace": "Sérénité", "Swift Swim": "Glissade", "Chlorophyll": "Chlorophylle",
  "Illuminate": "Lumiattirance", "Trace": "Calque", "Huge Power": "Coloforce", "Poison Point": "Point Poison", "Inner Focus": "Attention",
  "Magma Armor": "Armumagma", "Water Veil": "Ignifu-Voile", "Magnet Pull": "Magnépiège", "Soundproof": "Anti-Bruit", "Rain Dish": "Cuvette",
  "Sand Stream": "Sable Volant", "Pressure": "Pression", "Thick Fat": "Isograisse", "Early Bird": "Matinal", "Flame Body": "Corps Ardent", "Run Away": "Fuite",
  "Keen Eye": "Regard Vif", "Hyper Cutter": "Hyper Cutter", "Pickup": "Ramassage", "Truant": "Absentéisme", "Hustle": "Agitation", "Cute Charm": "Joli Sourire",
  "Plus": "Plus", "Minus": "Minus", "Forecast": "Météo", "Sticky Hold": "Glue", "Shed Skin": "Mue", "Guts": "Cran", "Marvel Scale": "Écaille Spéciale",
  "Liquid Ooze": "Suintement", "Overgrow": "Engrais", "Blaze": "Brasier", "Torrent": "Torrent", "Swarm": "Essaim", "Rock Head": "Tête de Roc",
  "Drought": "Sécheresse", "Arena Trap": "Piège Sable", "Vital Spirit": "Esprit Vital", "White Smoke": "Écran Fumée", "Pure Power": "Force Pure",
  "Shell Armor": "Coque Armure", "Air Lock": "Air Lock", "Tangled Feet": "Pieds Confus", "Motor Drive": "Motorisé", "Rivalry": "Rivalité",
  "Steadfast": "Impassible", "Snow Cloak": "Rideau Neige", "Gluttony": "Gloutonnerie", "Anger Point": "Colérique", "Unburden": "Délestage",
  "Heatproof": "Ignifuge", "Simple": "Simple", "Dry Skin": "Peau Sèche", "Download": "Télécharge", "Iron Fist": "Poing de Fer", "Poison Heal": "Soin Poison",
  "Adaptability": "Adaptabilité", "Skill Link": "Multi-Coups", "Hydration": "Hydratation", "Solar Power": "Force Soleil", "Quick Feet": "Pied Véloce",
  "Normalize": "Normalise", "Sniper": "Sniper", "Magic Guard": "Garde Magik", "No Guard": "Annule Garde", "Stall": "Frein", "Technician": "Technicien",
  "Leaf Guard": "Feuille Garde", "Klutz": "Maladresse", "Mold Breaker": "Brise Moule", "Super Luck": "Chanceux", "Aftermath": "Boom Final",
  "Anticipation": "Anticipation", "Forewarn": "Prédiction", "Unaware": "Inconscient", "Tinted Lens": "Lentiteintée", "Filter": "Filtre",
  "Slow Start": "Début Calme", "Scrappy": "Querelleur", "Storm Drain": "Lavabo", "Ice Body": "Corps Gel", "Solid Rock": "Solide Roc",
  "Snow Warning": "Alerte Neige", "Honey Gather": "Cherche Miel", "Frisk": "Fouille", "Reckless": "Téméraire", "Multitype": "Multi-Type",
  "Flower Gift": "Don Floral", "Bad Dreams": "Mauvais Rêve", "Pickpocket": "Pickpocket", "Sheer Force": "Sans Limite", "Contrary": "Contestation",
  "Unnerve": "Tension", "Defiant": "Acharné", "Defeatist": "Défaitiste", "Cursed Body": "Corps Maudit", "Healer": "Cœur Soin", "Friend Guard": "Garde Amie",
  "Weak Armor": "Armurouillée", "Heavy Metal": "Heavy Metal", "Light Metal": "Light Metal", "Multiscale": "Multiécaille", "Toxic Boost": "Rage Poison",
  "Flare Boost": "Rage Brûlure", "Harvest": "Récolte", "Telepathy": "Télépathe", "Moody": "Lunatique", "Overcoat": "Envelocape", "Poison Touch": "Toxitouche",
  "Regenerator": "Régé-Force", "Big Pecks": "Cœur de Coq", "Sand Rush": "Baigne Sable", "Wonder Skin": "Peau Miracle", "Analytic": "Analyste",
  "Illusion": "Illusion", "Imposter": "Imposteur", "Infiltrator": "Infiltration", "Mummy": "Momie", "Moxie": "Impudence", "Justified": "Cœur Noble",
  "Rattled": "Phobique", "Magic Bounce": "Miroir Magik", "Sap Sipper": "Herbivore", "Prankster": "Farceur", "Sand Force": "Force Sable",
  "Iron Barbs": "Épine de Fer", "Zen Mode": "Mode Transe", "Victory Star": "Victorieux", "Turboblaze": "TurboBrasier", "Teravolt": "Téra-Voltage",
};
export const abilName = (a, lang) => (lang === "fr" ? abilityInfo(a)?.fr || ABIL_FR[a] || a : a);

// Nature et IV utiles, déduits des stats de l'évolution finale
export function recommend(s) {
  const phys = s.atk >= s.spa, main = phys ? "atk" : "spa", dump = phys ? "spa" : "atk";
  const mixed = Math.abs(s.atk - s.spa) < 12 && Math.max(s.atk, s.spa) >= 80;
  const wall = Math.max(s.atk, s.spa) < 80 && Math.max(s.def, s.spd) >= 85;
  if (wall) {
    const dumpW = s.atk <= s.spa ? "atk" : "spa", plus = s.def >= s.spd ? "def" : "spd", other = plus === "def" ? "spd" : "def";
    return { role: "wall", primary: natureFor(plus, dumpW), alt: natureFor(other, dumpW), useless: [dumpW] };
  }
  const useless = mixed ? [] : [dump];
  if (s.spe >= 70) return { role: phys ? "fastP" : "fastS", primary: natureFor("spe", dump), alt: natureFor(main, dump), useless };
  if (s.spe <= 45) return { role: phys ? "slowP" : "slowS", primary: natureFor(main, dump), alt: natureFor(main, "spe"), useless, trickRoom: true };
  return { role: phys ? "midP" : "midS", primary: natureFor(main, dump), alt: natureFor("spe", dump), useless };
}

// Talents classés selon les notes de Showdown ; le 3e emplacement est le talent caché
export function abilityRanking(p) {
  return p.abilities
    .map((name, i) => (name ? { name, hidden: i === 2, rating: ABILITY_RATINGS[name] ?? ABILITY_RATINGS[{ Compoundeyes: "Compound Eyes", Lightningrod: "Lightning Rod" }[name]] ?? 0 } : null))
    .filter(Boolean)
    .filter((a, i, arr) => arr.findIndex(b => b.name === a.name) === i)
    .sort((a, b) => b.rating - a.rating || a.hidden - b.hidden);
}

const HORDE = RARITIES.indexOf("Horde");
export function breedInfo(p) {
  const root = familyRoot(p);
  const fam = family(p);
  const breeder = fam.find(s => !s.eggGroups.includes("cannot breed")) || root;
  const groups = breeder.eggGroups;
  const g = genderInfo(breeder);
  const famIds = new Set(fam.map(s => s.id));
  // Mâles conseillés : même groupe œuf, 50/50, de préférence trouvables en horde
  const males = ALL
    .filter(q => !q.prevo && q.obtainable && q.gender === 127 && !famIds.has(q.id) && q.eggGroups.some(e => groups.includes(e)))
    .map(q => ({ q, horde: q.horde }))
    .sort((a, b) => b.horde - a.horde || a.q.id - b.q.id)
    .slice(0, 8);
  return {
    root, groups, gender: g, males,
    canBreed: !groups.includes("cannot breed") && !groups.includes("ditto"),
    needsDitto: g.kind === "N" || g.kind === "M" || groups.includes("genderless"),
  };
}

// Arbre PokeMMO : chaque parent tient un objet et les deux parents disparaissent.
// Un IV à 31 chez les deux parents passe toujours ; le bracelet verrouille l'IV propre à chaque parent.
// La Pierre Stase est tenue à chaque étape par le parent qui porte la nature.
//
// Le choix des IV à verrouiller à chaque étape est cherché pour équilibrer les Pokémon de base :
// pour un 6×31, ça donne 8/8/4/4/4/4 au lieu de 32/16/8/4/2/1, bien plus simple à réunir.
const merge = (a, b) => { const o = { ...a }; for (const [k, v] of Object.entries(b)) o[k] = (o[k] || 0) + v; return o; };
const spread = leaves => Object.values(leaves).reduce((a, v) => a + v * v, 0);
const without = (T, s) => T.filter(x => x !== s);
const planMemo = new Map();
function plan(T) {
  const key = T.join();
  if (planMemo.has(key)) return planMemo.get(key);
  let best = { leaves: { [T[0]]: 1 }, pick: null };
  if (T.length > 1) {
    let score = Infinity;
    for (const x of T) for (const y of T) {
      if (x === y) continue;
      const leaves = merge(plan(without(T, y)).leaves, plan(without(T, x)).leaves);
      if (spread(leaves) < score) { score = spread(leaves); best = { leaves, pick: [x, y] }; }
    }
  }
  planMemo.set(key, best);
  return best;
}
const natMemo = new Map();
function planNat(T) {
  const key = T.join();
  if (natMemo.has(key)) return natMemo.get(key);
  let best = { leaves: {}, pick: null };
  if (T.length) {
    let score = Infinity;
    for (const x of T) {
      const leaves = merge(planNat(without(T, x)).leaves, plan(T).leaves);
      if (spread(leaves) < score) { score = spread(leaves); best = { leaves, pick: x }; }
    }
  }
  natMemo.set(key, best);
  return best;
}

// IV à 31 d'un Pokémon de la boîte
export const perfect = item => STATS.filter(s => item.ivs?.[s] === 31);

/**
 * Construit l'arbre en réutilisant les Pokémon que le joueur possède déjà.
 * ctx (optionnel) :
 *   box        : Pokémon possédés { id, species, gender: "M"|"F"|"N", ivs, nature, ability }
 *   nature     : nature visée
 *   isFamily   : species → bool (lignée de l'espèce visée, obligatoire côté mère de la lignée)
 *   isCompatible : species → bool (même groupe œuf, ou Métamorph)
 * Un nœud couvert par un Pokémon possédé devient une feuille « déjà à toi ».
 */
export function buildTree(ivs, natured, ctx = null) {
  let nid = 0;
  const used = new Set();
  const box = ctx?.box || [];

  // Pokémon possédé qui remplit la demande (le plus « juste » possible pour ne pas gaspiller un meilleur)
  function findOwned({ ivs, nat, spine, gender, path }) {
    let best = null;
    for (const it of box) {
      if (used.has(it.id)) continue;
      // Interdit dans tout un sous-arbre (recherche locale de optimizeTree)
      if (ctx.forbid?.some(([pre, id]) => id === it.id && path.startsWith(pre))) continue;
      const p31 = perfect(it);
      if (!ivs.every(s => p31.includes(s))) continue;
      if (nat && it.nature !== ctx.nature) continue;
      if (spine ? !ctx.isFamily(it.species) : !ctx.isCompatible(it.species)) continue;
      if (spine && it.gender !== "F") continue;
      if (!spine && gender && it.gender !== gender && it.gender !== "N") continue;
      const waste = p31.length - ivs.length + (it.nature && !nat ? 0.1 : 0);
      if (!best || waste < best.waste) best = { it, waste };
    }
    return best?.it || null;
  }
  // Ce qu'un Pokémon possédé apporte déjà à une demande (pour choisir les IV à verrouiller)
  function coverage(req) {
    let best = 0;
    for (const it of box) {
      if (used.has(it.id)) continue;
      if (req.spine ? !ctx.isFamily(it.species) || it.gender !== "F" : !ctx.isCompatible(it.species)) continue;
      if (req.nat && it.nature !== ctx.nature) continue;
      const c = perfect(it).filter(s => req.ivs.includes(s)).length;
      best = Math.max(best, c === req.ivs.length ? c + 10 : c);
    }
    return best;
  }

  function node(ivs, nat, gender, spine, item, path = "r") {
    const n = { id: nid++, ivs, nat, gender, spine, item, kids: null, owned: null, path };
    if (ctx && (ivs.length || nat)) {
      const own = findOwned({ ivs, nat, spine, gender, path });
      if (own) {
        used.add(own.id);
        n.owned = own;
        if (own.gender !== "N") n.gender = spine || n.id === 0 ? n.gender : own.gender;
        return n;
      }
    }
    if (nat ? ivs.length === 0 : ivs.length <= 1) return n;

    if (nat) {
      let x = planNat(ivs).pick;
      if (box.length) {
        // Ce qu'on possède d'abord, puis l'équilibre des Pokémon de base
        let bestScore = -Infinity;
        for (const c of ivs) {
          const s = 1000 * (coverage({ ivs: without(ivs, c), nat: true, spine }) + coverage({ ivs, nat: false, spine: false }))
            - spread(merge(planNat(without(ivs, c)).leaves, plan(ivs).leaves));
          if (s > bestScore) { bestScore = s; x = c; }
        }
      }
      n.kids = [node(without(ivs, x), true, "F", spine, "ever", path + "0"), node(ivs, false, "M", false, x, path + "1")];
    } else {
      let [x, y] = plan(ivs).pick;
      if (box.length) {
        let bestScore = -Infinity;
        for (const a of ivs) for (const b of ivs) {
          if (a === b) continue;
          const s = 1000 * (coverage({ ivs: without(ivs, b), spine }) + coverage({ ivs: without(ivs, a), spine: false }))
            - spread(merge(plan(without(ivs, b)).leaves, plan(without(ivs, a)).leaves));
          if (s > bestScore) { bestScore = s; x = a; y = b; }
        }
      }
      // Hors lignée, le genre de la mère se décide selon ce qu'on possède
      const A = node(without(ivs, y), false, spine ? "F" : null, spine, x, path + "0");
      const aGender = spine ? "F" : A.owned && A.owned.gender !== "N" ? A.owned.gender : "F";
      A.gender = aGender;
      const B = node(without(ivs, x), false, aGender === "F" ? "M" : "F", false, y, path + "1");
      n.kids = [A, B];
    }
    return n;
  }
  return node(ivs, natured, null, true, null);
}

// Le choix glouton peut « griller » un Pokémon possédé trop bas dans l'arbre.
// Recherche locale : on interdit tour à tour chaque usage d'un Pokémon possédé et on garde l'arbre le moins coûteux.
const treeScore = tree => {
  let breeds = 0, toGet = 0;
  walk(tree, n => { if (n.kids) breeds++; else if (!n.owned) toGet++; });
  return breeds * 1000 + toGet;
};
export function optimizeTree(ivs, natured, ctx) {
  const first = buildTree(ivs, natured, { ...ctx, forbid: [] });
  if (!ctx?.box?.length) return first;
  const deadline = Date.now() + 250; // reste réactif même avec une grosse boîte
  let best = first, bestScore = treeScore(first);
  // Recherche par niveaux : déplacer un Pokémon possédé peut d'abord coûter plus avant de rapporter,
  // on garde donc à chaque niveau les quelques meilleurs arbres, même s'ils ne battent pas encore le record.
  let frontier = [{ tree: first, forbid: [] }];
  const seen = new Set();
  for (let depth = 0; depth < 3 && frontier.length; depth++) {
    const next = [];
    for (const { tree, forbid } of frontier) {
      const uses = [];
      // Chaque usage peut être interdit à son nœud, ou dans le sous-arbre de son parent ou grand-parent
      walk(tree, n => { if (n.owned) for (let k = n.path.length; k >= Math.max(2, n.path.length - 2); k--) uses.push([n.path.slice(0, k), n.owned.id]); });
      for (const u of uses) {
        if (Date.now() > deadline) return best;
        const f = [...forbid, u];
        const key = f.map(x => x.join(":")).sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        const t = buildTree(ivs, natured, { ...ctx, forbid: f });
        const sc = treeScore(t);
        if (sc < bestScore) { best = t; bestScore = sc; }
        next.push({ tree: t, forbid: f, sc });
      }
    }
    frontier = next.sort((x, y) => x.sc - y.sc).slice(0, 4);
  }
  return best;
}

export function walk(n, fn) {
  fn(n);
  n.kids?.forEach(k => walk(k, fn));
}

export function planSummary(tree, femaleShare) {
  let breeds = 0, genderSel = 0, rareSel = 0, ever = 0;
  const braces = {}, leaves = [];
  walk(tree, n => {
    if (n.kids) {
      breeds++;
      if (n.id !== 0) { genderSel++; if (n.spine && femaleShare < 0.5) rareSel++; }
    } else leaves.push(n);
    if (n.item === "ever") ever++;
    else if (n.item) braces[n.item] = (braces[n.item] || 0) + 1;
  });
  const braceTotal = Object.values(braces).reduce((a, b) => a + b, 0);
  // Étapes : accouplements groupés par hauteur dans l'arbre
  const steps = [];
  (function collect(n) {
    if (!n.kids) return 0;
    const h = 1 + Math.max(...n.kids.map(collect));
    (steps[h] ||= []).push(n);
    return h;
  })(tree);
  const owned = leaves.filter(l => l.owned);
  const toGet = leaves.filter(l => !l.owned);
  return { breeds, genderSel, rareSel, ever, braces, braceTotal, leaves, owned, toGet, steps: steps.filter(Boolean) };
}

export const PRICE_DEFAULTS = { brace: 10000, ever: 0, gender: 5000, rare: 25000 };
export { STATS };
