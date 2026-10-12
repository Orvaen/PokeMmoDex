import { useEffect, useMemo, useState } from "react";
import { ALL, LOCATIONS, METHODS, RARITIES, STATS, STAT_COL, pad } from "../lib/data.js";
import { locName, nameOf, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { useStored } from "../lib/storage.js";
import { Dropdown, Icon, Sprite } from "../components/ui.jsx";

const HORDE = RARITIES.indexOf("Horde");
const EV_MAX = 252;
// Couleur de l'interface selon la stat choisie
const STAT_HUE = { hp: 25, atk: 55, def: 95, spa: 250, spd: 150, spe: 340 };

// Spots de horde : un par lieu et par méthode (herbes, grotte, surf…), avec toutes les espèces possibles
const SPOTS = (() => {
  const map = new Map();
  for (const p of ALL) {
    for (const [loc, method, rarity, min, max] of p.locs) {
      if (rarity !== HORDE) continue;
      const key = `${loc}#${method}`;
      if (!map.has(key)) map.set(key, { key, loc, method, region: LOCATIONS[loc].region, species: [] });
      const spot = map.get(key);
      if (!spot.species.some(s => s.p.id === p.id)) spot.species.push({ p, min, max });
    }
  }
  return [...map.values()];
})();

export default function EvHordesPage() {
  const { lang, t } = useLang();
  const [stat, setStat] = useStored("evStat", "spe");
  const [region, setRegion] = useState("");
  const [onlyPure, setOnlyPure] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--h", STAT_HUE[stat]);
    document.documentElement.style.setProperty("--cc", 0.12);
  }, [stat]);

  const cards = useMemo(() => {
    return SPOTS
      .filter(s => region === "" || s.region === +region)
      .map(s => {
        const good = s.species.filter(x => x.p.yields[stat]);
        if (!good.length) return null;
        const yields = good.map(x => x.p.yields[stat]);
        return { ...s, good, share: good.length / s.species.length, best: Math.max(...yields), worst: Math.min(...yields), minLv: Math.min(...good.map(x => x.min)) };
      })
      .filter(Boolean)
      .filter(c => !onlyPure || c.share === 1)
      .sort((a, b) => b.share - a.share || b.best - a.best || a.minLv - b.minLv);
  }, [stat, region, onlyPure]);

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
          <button
            type="button"
            aria-pressed={onlyPure}
            onClick={() => setOnlyPure(v => !v)}
            className={`h-8 rounded-full border px-3 text-[0.82rem] ${onlyPure ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:text-fg"}`}
          >
            {t.evOnlyPure}
          </button>
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

      <p className="max-w-[70ch] border-t border-line pt-4 text-[0.82rem] text-faint">{t.evNote}</p>
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
            <h2 className="text-balance text-[1.02rem] font-medium leading-snug group-hover:text-accent-ink">{locName(loc, lang)}</h2>
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

        <ul className="grid gap-1">
          {c.species.map(({ p, min, max }) => {
            const y = p.yields[stat];
            return (
              <li key={p.id}>
                <a href={href({ page: "pokemon", id: p.id })} className={`flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-sunk ${y ? "" : "opacity-55"}`}>
                  <span className="grid size-8 flex-none place-items-center"><Sprite p={p} className="size-8" fallbackClass="size-4" /></span>
                  <span className="min-w-0 flex-1 truncate text-[0.88rem]">{nameOf(p, lang)} <span className="font-mono text-[0.7rem] text-faint">#{pad(p.id)}</span></span>
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
