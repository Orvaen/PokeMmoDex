import { useEffect, useMemo, useRef, useState } from "react";
import { ALL, BY_ID, METHODS, TYPES, norm, pad } from "../lib/data.js";
import { LOCATIONS } from "../lib/encounters.js";
import { locName, nameOf, useLang } from "../lib/i18n.js";
import { go, href } from "../lib/router.js";
import { useStored } from "../lib/storage.js";
import { Dropdown, Icon, Sprite } from "../components/ui.jsx";
import { CenterRow } from "../components/Access.jsx";
import { baseName } from "../data/maps.js";
import { TIMES, condLabel } from "../lib/conditions.js";
import { HORDE_SIZE, KINDS, ODDS, RARITY_WEIGHT, evaluate, huntSpots } from "../lib/shiny.js";

const WILD = ALL.filter(p => p.locs.length);
const DEFAULT_RATES = { horde: 120, single: 300 };

const fmtHours = (h, lang) => {
  if (!isFinite(h)) return "—";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 100) return `${h.toLocaleString(lang, { maximumFractionDigits: h < 10 ? 1 : 0 })} h`;
  return `${Math.round(h).toLocaleString(lang)} h`;
};
const pct = (x, lang) => `${(x * 100).toLocaleString(lang, { maximumFractionDigits: x < 0.1 ? 1 : 0 })} %`;

export default function ShinyHuntPage({ id }) {
  const { lang, t } = useLang();
  const [lastId, setLastId] = useStored("shinyPick", null);
  const p = BY_ID.get(id ?? lastId) || null;
  useEffect(() => { if (p) setLastId(p.id); }, [p?.id]);

  const [kind, setKind] = useState("");
  const [region, setRegion] = useState("");
  const [season, setSeason] = useState("");
  const [time, setTime] = useState("");
  const [leppa, setLeppa] = useState("");
  const [noHm, setNoHm] = useState(false);
  const [sort, setSort] = useState("fast");
  const [rates, setRates] = useStored("shinyRates", DEFAULT_RATES);
  const [oddsKey, setOddsKey] = useStored("shinyOdds", "base");

  // Teinte : type principal du Pokémon choisi
  useEffect(() => {
    const ty = p ? TYPES[p.types[0]] : { h: 85, c: 0.12 };
    document.documentElement.style.setProperty("--h", ty.h);
    document.documentElement.style.setProperty("--cc", Math.max(ty.c, 0.08));
  }, [p?.id]);

  const spots = useMemo(() => (p ? huntSpots(p) : []), [p?.id]);
  const kindsHere = useMemo(() => new Set(spots.map(s => s.kind)), [spots]);
  useEffect(() => { if (kind && !kindsHere.has(kind)) setKind(""); }, [kindsHere]);

  const cards = useMemo(() => {
    const opts = { time, season, rates, odds: ODDS[oddsKey] };
    return spots
      .filter(s => (!kind || s.kind === kind) && (region === "" || s.region === +region))
      .map(s => evaluate(s, opts))
      .filter(Boolean)
      .filter(c => !leppa || (leppa === "no" ? c.center && c.center.advice !== "leppa" : c.center?.advice === "leppa"))
      .filter(c => !noHm || c.hms.every(h => h.opt))
      .sort((a, b) => sort === "near"
        ? (a.center?.steps ?? 99) + (a.center?.ferry ? 2 : 0) - (b.center?.steps ?? 99) - (b.center?.ferry ? 2 : 0) || a.hours - b.hours
        : a.hours - b.hours);
  }, [spots, kind, region, season, time, leppa, noHm, sort, rates, oddsKey]);

  const best = cards[0];
  const chip = on => `h-8 rounded-full border px-3 text-[0.82rem] ${on ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:text-fg"}`;

  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-7 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${t.sh.title}${p ? " · " + nameOf(p, lang) : ""} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5">
        <a href="#/" className="hidden h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg max-[860px]:inline-flex">{Icon.left}{t.back}</a>
      </div>

      <div className="max-w-[64ch]">
        <h1 className="text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-light leading-none tracking-[-0.045em]">{t.sh.title}</h1>
        <p className="mt-3 text-muted">{t.sh.intro}</p>
      </div>

      <div className="grid gap-3">
        <Picker p={p} />
        {p && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.sh.method}>
              <button type="button" aria-pressed={!kind} onClick={() => setKind("")} className={chip(!kind)}>{t.sh.allMethods}</button>
              {KINDS.filter(k => kindsHere.has(k)).map(k => (
                <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>{t.sh.kinds[k]}</button>
              ))}
            </div>
          </div>
        )}
        {p && (
          <div className="flex flex-wrap items-center gap-2">
            <Dropdown label={t.region} value={region} active={region !== ""} onChange={setRegion}
              options={[{ value: "", label: t.allRegions }, { sep: true }, ...t.regions.map((r, i) => ({ value: String(i), label: r }))]} />
            <Dropdown label={t.seasonLbl} value={season} active={season !== ""} onChange={setSeason}
              options={[{ value: "", label: t.allSeasons }, { sep: true }, ...t.seasons.map((x, i) => ({ value: String(i), label: x }))]} />
            <Dropdown label={t.timeLbl} value={time} active={time !== ""} onChange={setTime}
              options={[{ value: "", label: t.allTimes }, { sep: true }, ...TIMES.map(x => ({ value: x, label: t.timesOfDay[x] }))]} />
            <div className="inline-flex gap-0.5 rounded-full border border-line p-0.5" role="group" aria-label={t.evLeppaLabel}>
              {[["", t.evLeppaAll], ["no", t.evLeppaNo], ["yes", t.evLeppaYes]].map(([v, l]) => (
                <button key={v || "all"} type="button" aria-pressed={leppa === v} onClick={() => setLeppa(v)}
                  className={`h-7 rounded-full px-3 text-[0.8rem] ${leppa === v ? "bg-accent-soft font-medium text-accent-ink" : "text-muted hover:text-fg"}`}>{l}</button>
              ))}
            </div>
            <button type="button" aria-pressed={noHm} onClick={() => setNoHm(v => !v)} className={chip(noHm)}>{t.evNoHmOnly}</button>
            <Dropdown label={t.evSortBy} value={sort} active={sort !== "fast"} onChange={setSort}
              options={[{ value: "fast", label: t.sh.sortFast }, { value: "near", label: t.evSortNear }]} />
            <span className="ml-auto text-[0.8rem] text-faint">{t.sh.count(cards.length)}</span>
          </div>
        )}
      </div>

      {p && <Settings rates={rates} setRates={setRates} oddsKey={oddsKey} setOddsKey={setOddsKey} />}

      {!p ? (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">{t.sh.pickFirst}</p>
      ) : !spots.length ? (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">{t.sh.noWild(nameOf(p, lang))}</p>
      ) : cards.length ? (
        <>
          {best && !best.unknown && sort === "fast" && (
            <p className="-mt-2 rounded-xl bg-accent-soft px-4 py-2.5 text-[0.9rem] text-accent-ink">
              {t.sh.bestLine(baseName(locName(LOCATIONS[best.loc], lang)), t.sh.kinds[best.kind], fmtHours(best.hours, lang))}
            </p>
          )}
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(310px,1fr))] gap-3">
            {cards.map(c => <SpotCard key={c.key} c={c} p={p} />)}
          </ul>
        </>
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">{t.sh.none}</p>
      )}

      <div className="grid max-w-[72ch] gap-2 border-t border-line pt-4 text-[0.82rem] text-faint">
        <p>{t.sh.howTitle} {t.sh.how(HORDE_SIZE, Object.values(RARITY_WEIGHT).join(" / "))}</p>
        <p>{t.sh.specialNote}</p>
        <p>{t.evAdvHelp}</p>
        <p>{t.hmNote}</p>
      </div>
    </div>
  );
}

// Choix du Pokémon : champ de recherche avec suggestions
function Picker({ p }) {
  const { lang, t } = useLang();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const box = useRef(null);
  const results = useMemo(() => {
    const raw = q.trim().replace(/^#/, "");
    if (!raw) return [];
    const n = norm(raw);
    return WILD.filter(x => /^\d+$/.test(raw) ? String(x.id).startsWith(String(+raw)) : x.keyFr.includes(n) || x.keyEn.includes(n))
      .sort((a, b) => (nameOf(a, lang).toLowerCase().startsWith(raw.toLowerCase()) ? 0 : 1) - (nameOf(b, lang).toLowerCase().startsWith(raw.toLowerCase()) ? 0 : 1) || a.id - b.id)
      .slice(0, 8);
  }, [q, lang]);
  useEffect(() => setHi(0), [q]);
  useEffect(() => {
    const close = e => { if (!box.current?.contains(e.target)) setOpen(false); };
    addEventListener("pointerdown", close);
    return () => removeEventListener("pointerdown", close);
  }, []);
  const pick = x => { setQ(""); setOpen(false); go({ page: "shiny", id: x.id }); };

  return (
    <div ref={box} className="relative flex flex-wrap items-center gap-3">
      {p && (
        <a href={href({ page: "pokemon", id: p.id })} className="flex items-center gap-2 rounded-2xl border border-line bg-panel py-1.5 pl-1.5 pr-4 hover:border-accent">
          <span className="grid size-12 place-items-center rounded-xl bg-sunk"><Sprite p={p} shiny animated className="size-12" fallbackClass="size-6" /></span>
          <span className="grid">
            <span className="text-[1.05rem] font-medium leading-tight">{nameOf(p, lang)}</span>
            <span className="font-mono text-[0.72rem] text-faint">#{pad(p.id)} · {t.sh.shinyLabel}</span>
          </span>
        </a>
      )}
      <label className="relative min-w-[240px] flex-1 max-w-[360px]">
        <span className="sr-only">{t.sh.searchLabel}</span>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">{Icon.search}</span>
        <input
          type="search" value={q} autoComplete="off" spellCheck={false}
          placeholder={p ? t.sh.change : t.sh.searchPh}
          role="combobox" aria-expanded={open && results.length > 0} aria-controls="shiny-results" aria-autocomplete="list"
          onFocus={() => setOpen(true)}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onKeyDown={e => {
            if (e.key === "ArrowDown") { e.preventDefault(); setHi(i => Math.min(results.length - 1, i + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setHi(i => Math.max(0, i - 1)); }
            if (e.key === "Enter" && results[hi]) { e.preventDefault(); pick(results[hi]); }
            if (e.key === "Escape") setOpen(false);
          }}
          className="h-10 w-full rounded-xl border border-line bg-panel pl-9 pr-3 text-[0.9rem] placeholder:text-faint focus:border-accent focus:outline-none"
        />
        {open && results.length > 0 && (
          <ul id="shiny-results" role="listbox" className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 grid gap-px rounded-xl border border-line bg-panel p-1 shadow-soft">
            {results.map((x, i) => (
              <li key={x.id} role="option" aria-selected={i === hi}>
                <button type="button" onPointerDown={e => e.preventDefault()} onClick={() => pick(x)} onMouseEnter={() => setHi(i)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left ${i === hi ? "bg-sunk" : ""}`}>
                  <span className="grid size-8 place-items-center"><Sprite p={x} className="size-8" fallbackClass="size-4" /></span>
                  <span className="flex-1 truncate text-[0.88rem]">{nameOf(x, lang)}</span>
                  <span className="font-mono text-[0.68rem] text-faint">#{pad(x.id)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </label>
    </div>
  );
}

// Réglages du calcul : rythme de jeu et chances de shiny
function Settings({ rates, setRates, oddsKey, setOddsKey }) {
  const { lang, t } = useLang();
  const num = (k, v) => setRates(r => ({ ...r, [k]: Math.max(1, Math.min(2000, Math.round(+v) || 1)) }));
  const field = "h-8 w-20 rounded-lg border border-line bg-panel px-2 text-right font-mono text-[0.85rem] focus:border-accent focus:outline-none";
  return (
    <details className="group -mt-2 rounded-2xl border border-line">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-[0.86rem] text-muted hover:text-fg">
        <span className="transition group-open:rotate-0 -rotate-90">{Icon.chevDown}</span>
        {t.sh.settings}
        <span className="ml-auto font-mono text-[0.74rem] text-faint">
          {rates.horde} {t.sh.hordesUnit} · {rates.single} {t.sh.encUnit} · 1/{ODDS[oddsKey].toLocaleString(lang)}
        </span>
      </summary>
      <div className="grid gap-3 border-t border-line px-4 py-3.5 text-[0.86rem]">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <label className="flex items-center gap-2">{t.sh.hordesPerHour}
            <input type="number" min="1" max="2000" value={rates.horde} onChange={e => num("horde", e.target.value)} className={field} /></label>
          <label className="flex items-center gap-2">{t.sh.encPerHour}
            <input type="number" min="1" max="2000" value={rates.single} onChange={e => num("single", e.target.value)} className={field} /></label>
          <button type="button" onClick={() => setRates(DEFAULT_RATES)} className="text-[0.8rem] text-faint underline underline-offset-4 hover:text-fg">{t.reset}</button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted">{t.sh.odds}</span>
          {Object.entries(ODDS).map(([k, v]) => (
            <button key={k} type="button" aria-pressed={oddsKey === k} onClick={() => setOddsKey(k)}
              className={`h-8 rounded-full border px-3 text-[0.8rem] ${oddsKey === k ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:text-fg"}`}>
              {t.sh.oddsLabels[k]} · 1/{v.toLocaleString(lang)}
            </button>
          ))}
        </div>
        <p className="text-[0.78rem] text-faint">{t.sh.settingsHelp}</p>
      </div>
    </details>
  );
}

function SpotCard({ c, p }) {
  const { lang, t } = useLang();
  const loc = LOCATIONS[c.loc];
  const when = condLabel(c.conds, t);
  const name = nameOf(p, lang);
  return (
    <li>
      <article className="grid h-full content-start gap-3 rounded-2xl border border-line bg-panel p-4 transition-shadow hover:shadow-soft">
        <header className="flex items-start justify-between gap-3">
          <a href={href({ page: "location", key: c.loc })} className="group min-w-0">
            <h2 className="text-balance text-[1.02rem] font-medium leading-snug group-hover:text-accent-ink">{baseName(locName(loc, lang))}</h2>
            <p className="text-[0.78rem] text-muted">{t.regions[loc.region]} · {t.methods[METHODS[c.method]] || METHODS[c.method]} · {t.levels(c.min, c.max)}</p>
            {when && <p className="mt-0.5 text-[0.72rem] font-medium text-accent-ink">◷ {when}</p>}
          </a>
          <span className={`flex-none rounded-full px-2.5 py-1 text-[0.72rem] font-medium ${c.kind === "horde" ? "bg-accent text-panel" : "bg-sunk text-muted"}`}>
            {t.sh.kinds[c.kind]}
          </span>
        </header>

        {c.unknown ? (
          <p className="rounded-xl bg-sunk px-3 py-2.5 text-[0.8rem] text-muted">{t.sh.lureNote}</p>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-accent-soft px-3 py-2.5">
            <div className="grid min-w-0 flex-1">
              <b className="whitespace-nowrap font-mono text-[1.6rem] font-normal leading-none tracking-tight text-fg">≈ {fmtHours(c.hours, lang)}</b>
              <span className="text-[0.76rem] text-accent-ink">{t.sh.perShiny}</span>
            </div>
            <div className="grid text-right">
              <b className="font-mono text-[1.15rem] font-normal leading-none">{Math.round(c.perHour).toLocaleString(lang)}</b>
              <span className="text-[0.72rem] text-accent-ink">{t.sh.seenPerHour(name)}</span>
            </div>
          </div>
        )}

        <div className="grid gap-1.5 text-[0.8rem]">
          <span className="flex flex-wrap items-baseline gap-x-2 text-muted">
            <span>{c.kind === "horde" ? t.sh.hordeShare(pct(c.best.share, lang)) : c.kind === "lure" ? t.sh.lureShare(pct(c.best.share, lang)) : t.sh.encShare(pct(c.best.share, lang))}</span>
            {c.varies && <span className="text-faint">{t.sh.varies(condLabel(c.bestConds, t))}</span>}
          </span>
          {c.rivals.length > 0 ? (
            <span className="flex flex-wrap items-center gap-1">
              <span className="mr-1 text-faint">{t.sh.with(c.rivals.length)}</span>
              {c.rivals.slice(0, 10).map(id => {
                const r = BY_ID.get(id);
                return r && (
                  <a key={id} href={href({ page: "pokemon", id })} title={nameOf(r, lang)} className="grid size-7 place-items-center rounded-md hover:bg-sunk">
                    <Sprite p={r} className="size-7" fallbackClass="size-3.5" />
                  </a>
                );
              })}
              {c.rivals.length > 10 && <span className="text-faint">+{c.rivals.length - 10}</span>}
            </span>
          ) : (
            <span className="font-medium text-accent-ink">✓ {t.sh.alone}</span>
          )}
        </div>

        <CenterRow c={c} region={loc.region} />
      </article>
    </li>
  );
}
