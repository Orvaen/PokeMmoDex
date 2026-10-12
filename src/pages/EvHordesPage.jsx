import { useEffect, useMemo, useState } from "react";
import { ALL, LOCATIONS, METHODS, RARITIES, STATS, STAT_COL, pad } from "../lib/data.js";
import { locName, nameOf, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { useStored } from "../lib/storage.js";
import { Dropdown, Icon, Sprite } from "../components/ui.jsx";
import { placeName } from "../components/RegionMap.jsx";
import { REGION_MAPS, accessPath, baseName, hasCenter } from "../data/maps.js";
import { hmName, hmsFor } from "../data/hms.js";

const HORDE = RARITIES.indexOf("Horde");
const EV_MAX = 252;
// Couleur de l'interface selon la stat choisie
const STAT_HUE = { hp: 25, atk: 55, def: 95, spa: 250, spd: 150, spe: 340 };

// Conditions d'un lieu, lues dans son nom : « Route 39 (Night/Season1) » → nuit, été
const TIMES = ["Morning", "Day", "Night"];
function condOf(en) {
  const tags = (en.match(/\(([^)]*)\)/)?.[1] || "").split("/");
  const times = tags.filter(x => TIMES.includes(x));
  const season = tags.find(x => /^Season\d$/.test(x));
  return { times: times.length ? times : TIMES, season: season ? +season.slice(6) : null };
}
const fits = (cond, time, season) => (time === "" || cond.times.includes(time)) && (season === "" || cond.season === null || cond.season === +season);

// Spots de horde : un par lieu (toutes variantes jour/nuit/saison réunies) et par méthode
const SPOTS = (() => {
  const map = new Map();
  for (const p of ALL) {
    for (const [loc, method, rarity, min, max] of p.locs) {
      if (rarity !== HORDE) continue;
      const L = LOCATIONS[loc];
      const key = `${L.region}#${baseName(L.en)}#${method}`;
      if (!map.has(key)) map.set(key, { key, loc, method, region: L.region, variants: new Set(), species: new Map() });
      const spot = map.get(key);
      spot.variants.add(loc);
      if (!spot.species.has(p.id)) spot.species.set(p.id, { p, min, max, locs: [] });
      const sp = spot.species.get(p.id);
      sp.min = Math.min(sp.min, min); sp.max = Math.max(sp.max, max);
      sp.locs.push(loc);
    }
  }
  return [...map.values()].map(s => {
    const species = [...s.species.values()].map(sp => {
      const conds = [...new Set(sp.locs)].map(l => condOf(LOCATIONS[l].en));
      return { ...sp, conds };
    });
    return { ...s, species, center: centerInfo(s.loc), hms: hmsFor(s.loc, s.method) };
  });
})();

// Libellé court des conditions d'une espèce : « Nuit · Été, Automne »
function condLabel(conds, t) {
  const times = new Set(conds.flatMap(c => c.times));
  const seasons = conds.some(c => c.season === null) ? null : [...new Set(conds.map(c => c.season))].sort();
  const parts = [];
  if (times.size < 3) parts.push(TIMES.filter(x => times.has(x)).map(x => t.timesOfDay[x]).join(", "));
  if (seasons && seasons.length < 4) parts.push(seasons.length === 3 ? t.exceptSeason(t.seasons[[0, 1, 2, 3].find(i => !seasons.includes(i))]) : seasons.map(i => t.seasons[i]).join(", "));
  return parts.join(" · ");
}

// Distance au Centre Pokémon le plus proche, en nombre de zones à traverser
function centerInfo(locKey) {
  const loc = LOCATIONS[locKey];
  const base = baseName(loc.en);
  const map = REGION_MAPS[loc.region];
  const path = accessPath(loc.region, base);
  if (!path || !hasCenter(map.nodes[path[0]])) return null;
  const ferry = path.some((n, i) => i > 0 && map.edges.some(e => e.ferry && ((e.a === n && e.b === path[i - 1]) || (e.b === n && e.a === path[i - 1]))));
  const steps = path.length - 1;
  const advice = steps <= 1 && !ferry ? "center" : steps === 2 && !ferry ? "both" : "leppa";
  return { city: path[0], steps, ferry, advice };
}
const ADV_RANK = { center: 0, both: 1, leppa: 2 };

export default function EvHordesPage() {
  const { lang, t } = useLang();
  const [stat, setStat] = useStored("evStat", "spe");
  const [region, setRegion] = useState("");
  const [onlyPure, setOnlyPure] = useState(false);
  const [leppa, setLeppa] = useState(""); // "" tous, "no" sans Baies Mepo, "yes" avec
  const [noHm, setNoHm] = useState(false);
  const [sort, setSort] = useState("yield");
  const [season, setSeason] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    document.documentElement.style.setProperty("--h", STAT_HUE[stat]);
    document.documentElement.style.setProperty("--cc", 0.12);
  }, [stat]);

  const cards = useMemo(() => {
    return SPOTS
      .filter(s => region === "" || s.region === +region)
      .map(s => {
        const species = s.species.filter(x => x.conds.some(c => fits(c, time, season)));
        const good = species.filter(x => x.p.yields[stat]);
        if (!good.length) return null;
        const yields = good.map(x => x.p.yields[stat]);
        return { ...s, species, good, share: good.length / species.length, best: Math.max(...yields), worst: Math.min(...yields), minLv: Math.min(...good.map(x => x.min)) };
      })
      .filter(Boolean)
      .filter(c => !onlyPure || c.share === 1)
      .filter(c => !leppa || (leppa === "no" ? c.center && c.center.advice !== "leppa" : c.center?.advice === "leppa"))
      .filter(c => !noHm || c.hms.every(h => h.opt))
      .sort((a, b) => (sort === "near" ? (a.center?.steps ?? 99) + (a.center?.ferry ? 2 : 0) - (b.center?.steps ?? 99) - (b.center?.ferry ? 2 : 0) : 0)
        || b.share - a.share || b.best - a.best || a.minLv - b.minLv);
  }, [stat, region, onlyPure, leppa, noHm, sort, season, time]);

  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-7 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${t.evTitle} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5">
        <a href="#/" className="hidden h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg max-[860px]:inline-flex">{Icon.left}{t.back}</a>
      </div>

      <div className="max-w-[64ch]">
        <h1 className="text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-light leading-none tracking-[-0.045em]">{t.evTitle}</h1>
        <p className="mt-3 text-muted">{t.evIntro}</p>
      </div>

      {/* Choix de la stat */}
      <div className="grid gap-3">
        <div className="grid grid-cols-6 gap-2 max-[640px]:grid-cols-3" role="group" aria-label={t.evPickStat}>
          {STATS.map(s => {
            const on = s === stat;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => setStat(s)}
                style={{ "--s": STAT_COL[s] }}
                className={`grid gap-0.5 rounded-2xl border px-3 py-3 text-left transition-colors ${on ? "iv-chip border-transparent" : "border-line bg-panel hover:border-[var(--s)]"}`}
              >
                <span className="text-[0.95rem] font-medium">{t.stats[s]}</span>
                <span className="text-[0.74rem] text-muted">{t.evSpots(SPOTS.filter(sp => sp.species.some(x => x.p.yields[s])).length)}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown
            label={t.region}
            value={region}
            active={region !== ""}
            onChange={setRegion}
            options={[{ value: "", label: t.allRegions }, { sep: true }, ...t.regions.map((r, i) => ({ value: String(i), label: r }))]}
          />
          <Dropdown
            label={t.seasonLbl}
            value={season}
            active={season !== ""}
            onChange={setSeason}
            options={[{ value: "", label: t.allSeasons }, { sep: true }, ...t.seasons.map((x, i) => ({ value: String(i), label: x }))]}
          />
          <Dropdown
            label={t.timeLbl}
            value={time}
            active={time !== ""}
            onChange={setTime}
            options={[{ value: "", label: t.allTimes }, { sep: true }, ...TIMES.map(x => ({ value: x, label: t.timesOfDay[x] }))]}
          />
          <button
            type="button"
            aria-pressed={onlyPure}
            onClick={() => setOnlyPure(v => !v)}
            className={`h-8 rounded-full border px-3 text-[0.82rem] ${onlyPure ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:text-fg"}`}
          >
            {t.evOnlyPure}
          </button>
          <div className="inline-flex gap-0.5 rounded-full border border-line p-0.5" role="group" aria-label={t.evLeppaLabel}>
            {[["", t.evLeppaAll], ["no", t.evLeppaNo], ["yes", t.evLeppaYes]].map(([v, l]) => (
              <button key={v || "all"} type="button" aria-pressed={leppa === v} onClick={() => setLeppa(v)}
                className={`h-7 rounded-full px-3 text-[0.8rem] ${leppa === v ? "bg-accent-soft font-medium text-accent-ink" : "text-muted hover:text-fg"}`}>{l}</button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={noHm}
            onClick={() => setNoHm(v => !v)}
            className={`h-8 rounded-full border px-3 text-[0.82rem] ${noHm ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:text-fg"}`}
          >
            {t.evNoHmOnly}
          </button>
          <Dropdown
            label={t.evSortBy}
            value={sort}
            active={sort !== "yield"}
            onChange={setSort}
            options={[{ value: "yield", label: t.evSortYield }, { value: "near", label: t.evSortNear }]}
          />
          <span className="ml-auto text-[0.8rem] text-faint">{t.evCount(cards.length)}</span>
        </div>
      </div>

      {cards.length ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
          {cards.map(c => <SpotCard key={c.key} c={c} stat={stat} />)}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">{t.evNone}</p>
      )}

      <div className="grid max-w-[70ch] gap-2 border-t border-line pt-4 text-[0.82rem] text-faint">
        <p>{t.evAdvHelp}</p>
        <p>{t.hmNote}</p>
        <p>{t.evNote}</p>
      </div>
    </div>
  );
}

function SpotCard({ c, stat }) {
  const { lang, t } = useLang();
  const loc = LOCATIONS[c.loc];
  const pure = c.share === 1;
  const perHorde = c.best === c.worst ? `+${5 * c.best}` : t.evRange(5 * c.worst, 5 * c.best);
  const lead = [...c.good].sort((a, b) => b.p.yields[stat] - a.p.yields[stat])[0];
  return (
    <li>
      <article className="grid h-full content-start gap-3 rounded-2xl border border-line bg-panel p-4 transition-shadow hover:shadow-soft">
        <header className="flex items-start justify-between gap-3">
          <a href={href({ page: "location", key: c.loc })} className="group min-w-0">
            <h2 className="text-balance text-[1.02rem] font-medium leading-snug group-hover:text-accent-ink">{baseName(locName(loc, lang))}</h2>
            <p className="text-[0.78rem] text-muted">{t.regions[loc.region]} · {t.methods[METHODS[c.method]] || METHODS[c.method]}</p>
          </a>
          <span className={`flex-none rounded-full px-2.5 py-1 text-[0.72rem] font-medium ${pure ? "bg-accent text-panel" : "bg-sunk text-muted"}`}>
            {pure ? t.evPure : t.evShare(c.good.length, c.species.length)}
          </span>
        </header>

        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: `color-mix(in oklab, ${STAT_COL[stat]} 14%, var(--panel))` }}>
          <span className="grid size-14 flex-none place-items-center rounded-xl bg-panel/70"><Sprite p={lead.p} className="size-14" /></span>
          <div className="grid min-w-0 flex-1">
            <b className="whitespace-nowrap font-mono text-[1.6rem] font-normal leading-none tracking-tight">{perHorde}</b>
            <span className="text-[0.78rem] text-muted">{t.evPerHorde(t.stats[stat])}</span>
          </div>
          <div className="grid text-right">
            <b className="font-mono text-[1.15rem] font-normal leading-none">{Math.ceil(EV_MAX / (5 * c.best))}</b>
            <span className="text-[0.72rem] text-muted">{t.evToMax}</span>
          </div>
        </div>

        <CenterRow c={c} region={loc.region} />

        <ul className="grid gap-1">
          {c.species.map(({ p, min, max, conds }) => {
            const when = condLabel(conds, t);
            const y = p.yields[stat];
            return (
              <li key={p.id}>
                <a href={href({ page: "pokemon", id: p.id })} className={`flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-sunk ${y ? "" : "opacity-55"}`}>
                  <span className="grid size-8 flex-none place-items-center"><Sprite p={p} className="size-8" fallbackClass="size-4" /></span>
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate text-[0.88rem]">{nameOf(p, lang)} <span className="font-mono text-[0.7rem] text-faint">#{pad(p.id)}</span></span>
                    {when && <span className="truncate text-[0.7rem] text-accent-ink">◷ {when}</span>}
                  </span>
                  <span className="flex gap-1">
                    {Object.entries(p.yields).map(([k, v]) => (
                      <span key={k} style={{ "--s": STAT_COL[k] }} className={`rounded-[5px] px-1.5 py-px text-[0.68rem] font-medium ${k === stat ? "iv-chip text-fg" : "bg-sunk text-muted"}`}>
                        {v * 5} {t.short[k]}
                      </span>
                    ))}
                  </span>
                  <span className="whitespace-nowrap text-right font-mono text-[0.7rem] text-faint">{t.levels(min, max)}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </article>
    </li>
  );
}

// Bloc « Accès » : Centre le plus proche (avec conseil Centre / Baies Mepo) et CS nécessaires
const ADV_STYLE = {
  center: "bg-[oklch(0.62_0.13_150/0.16)] text-[oklch(0.56_0.13_150)]",
  both: "bg-[oklch(0.75_0.13_80/0.2)] text-[oklch(0.6_0.12_70)]",
  leppa: "bg-[oklch(0.62_0.17_25/0.15)] text-[oklch(0.6_0.17_25)]",
};
function CenterRow({ c, region }) {
  const { lang, t } = useLang();
  const ce = c.center;
  const label = !ce ? t.evCenterUnknown : ce.steps === 0 ? t.evCenterHere : t.evCenterAt(placeName(region, ce.city, lang), ce.steps);
  const adv = ce && { center: t.evAdvCenter, both: t.evAdvBoth, leppa: t.evAdvLeppa }[ce.advice];
  return (
    <a href={href({ page: "location", key: c.loc })} title={t.accessTitle} className="grid gap-1.5 rounded-xl border border-line px-3 py-2.5 text-[0.8rem] transition-colors hover:border-accent">
      <span className="flex items-center gap-2">
        <span className="eyebrow flex-1">{t.evAccess}</span>
        {adv && <span className={`flex-none rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${ADV_STYLE[ce.advice]}`}>{adv}</span>}
      </span>
      <span className="flex items-center gap-2 text-muted">
        {CROSS}
        <span className="min-w-0 flex-1 leading-snug">{label}{ce?.ferry ? ` · ${t.evFerry}` : ""}</span>
      </span>
      <span className="flex flex-wrap items-center gap-1.5 text-muted">
        <span className="w-[14px] flex-none text-center font-mono text-[0.62rem] font-semibold tracking-tight">{t.evHmLabel}</span>
        {c.hms.length ? c.hms.map(({ hm, opt }) => (
          <span key={hm} className={`rounded-md px-1.5 py-px text-[0.72rem] font-medium ${opt ? "border border-dashed border-line text-muted" : "bg-sunk text-fg"}`}>
            {hmName(hm, lang)}{opt ? ` (${t.hmOpt})` : ""}
          </span>
        )) : <span className="text-[0.76rem]">✓ {t.evNoHm}</span>}
      </span>
    </a>
  );
}
const CROSS = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="flex-none"><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><path d="M12 8v8M8 12h8" /></svg>;
