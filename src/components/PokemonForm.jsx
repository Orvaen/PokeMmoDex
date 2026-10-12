import { useMemo, useState } from "react";
import { ALL, BY_ID, STATS, STAT_COL, genderInfo, pad } from "../lib/data.js";
import { NATURES, abilName, natFx, natName, natureFor } from "../lib/breeding.js";
import { nameOf, useLang } from "../lib/i18n.js";
import { Sprite } from "./ui.jsx";

const DITTO = 132;
const NAT_STATS = ["atk", "def", "spa", "spd", "spe"];

const Chip = ({ on, onClick, children }) => (
  <button type="button" aria-pressed={on} onClick={onClick}
    className={`h-8 rounded-full border px-3 text-[0.82rem] transition-colors ${on ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:bg-sunk hover:text-fg"}`}>
    {children}
  </button>
);
const fieldCls = "h-10 w-full rounded-[10px] border border-line bg-panel px-3 text-[0.9rem] focus:border-accent focus:outline-none";

/**
 * Formulaire d'un Pokémon de la boîte.
 * allowed : espèces proposées (compatibles avec l'élevage en cours)
 */
export default function PokemonForm({ initial, allowed, goal, title, onSave, onCancel }) {
  const { lang, t } = useLang();
  const [species, setSpecies] = useState(initial?.species ?? null);
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState(initial?.gender ?? "F");
  const [ivs, setIvs] = useState(() => ({ hp: "", atk: "", def: "", spa: "", spd: "", spe: "", ...(initial?.ivs || {}) }));
  const [nature, setNature] = useState(initial?.nature ?? "");
  const [ability, setAbility] = useState(initial?.ability ?? "");
  const [error, setError] = useState("");
  const [exact, setExact] = useState(() => STATS.some(s => initial?.ivs?.[s] != null && initial.ivs[s] !== 31));
  const [paste, setPaste] = useState("");
  const [part, setPart] = useState(() => ({ plus: NATURES[initial?.nature]?.[0] || null, minus: NATURES[initial?.nature]?.[1] || null }));

  const pickNature = k => { setNature(k); setPart({ plus: NATURES[k]?.[0] || null, minus: NATURES[k]?.[1] || null }); };
  const pickSide = (side, st) => {
    const next = { ...part, [side]: part[side] === st ? null : st };
    const other = side === "plus" ? "minus" : "plus";
    if (next[other] === st) next[other] = null;
    setPart(next);
    setNature(next.plus && next.minus ? natureFor(next.plus, next.minus) : "");
  };
  const setAll = list => setIvs(cur => Object.fromEntries(STATS.map(s => [s, list.includes(s) ? 31 : (+cur[s] === 31 ? "" : cur[s])])));
  // « 31/31/x/31/31/31 » : 6 valeurs dans l'ordre PV Atq Déf A.Spé D.Spé Vit
  const onPaste = str => {
    setPaste(str);
    const parts = str.split(/[\s/,;.-]+/).filter(Boolean);
    if (parts.length !== 6) return;
    setIvs(Object.fromEntries(STATS.map((s, i) => { const n = parseInt(parts[i], 10); return [s, Number.isNaN(n) ? "" : Math.max(0, Math.min(31, n))]; })));
    if (parts.some(x => /^\d+$/.test(x) && +x !== 31)) setExact(true);
  };

  const p = species ? BY_ID.get(species) : null;
  const g = p ? (p.id === DITTO ? { kind: "N" } : genderInfo(p)) : null;
  const fixedGender = g && (g.kind === "N" ? "N" : g.kind === "M" ? "M" : g.kind === "F" ? "F" : null);
  const shownGender = fixedGender || gender;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
    const list = (allowed || ALL).filter(x => !q || x.keyFr.includes(q) || x.keyEn.includes(q) || String(x.id) === q);
    return list.slice(0, 8);
  }, [query, allowed]);

  const setIv = (s, v) => {
    const n = v === "" ? "" : Math.max(0, Math.min(31, parseInt(v, 10) || 0));
    setIvs(cur => ({ ...cur, [s]: n }));
  };

  const save = e => {
    e.preventDefault();
    if (!p) { setError(t.formNeedSpecies); return; }
    const clean = Object.fromEntries(STATS.map(s => [s, ivs[s] === "" ? null : +ivs[s]]));
    onSave({ ...(initial || {}), id: initial?.id ?? Date.now() + Math.random(), species: p.id, gender: shownGender, ivs: clean, nature: nature || null, ability: ability || null });
  };

  const abilities = p ? [...new Set(p.abilities.filter(Boolean))] : [];

  return (
    <form onSubmit={save} className="grid gap-4 rounded-2xl border border-accent bg-panel p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[1.05rem] font-medium">{title}</h3>
        <button type="button" onClick={onCancel} className="text-[0.84rem] text-muted hover:text-fg">{t.cancel}</button>
      </div>

      {/* Espèce */}
      <div className="grid gap-1.5">
        <span className="eyebrow">{t.formSpecies}</span>
        {p ? (
          <div className="flex items-center gap-3 rounded-xl bg-sunk px-3 py-2">
            <span className="grid size-10 place-items-center"><Sprite p={p} className="size-10" /></span>
            <span className="flex-1 font-medium">{nameOf(p, lang)} <span className="font-mono text-[0.75rem] text-faint">#{pad(p.id)}</span></span>
            <button type="button" className="text-[0.84rem] text-accent-ink underline underline-offset-4" onClick={() => { setSpecies(null); setAbility(""); }}>{t.change}</button>
          </div>
        ) : (
          <div className="grid gap-1.5">
            <input id="form-species" autoFocus className={fieldCls} placeholder={t.formSpeciesPh} value={query} onChange={e => setQuery(e.target.value)} />
            <div className="flex flex-wrap gap-1.5">
              {matches.map(x => (
                <button key={x.id} type="button" onClick={() => { setSpecies(x.id); setError(""); }} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel py-0.5 pl-1 pr-3 text-[0.84rem] hover:border-accent">
                  <span className="grid size-7 place-items-center"><Sprite p={x} className="size-7" fallbackClass="size-4" /></span>
                  {nameOf(x, lang)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Genre + talent : boutons directs */}
      <div className="flex flex-wrap items-start gap-x-5 gap-y-3">
        <div className="grid gap-1.5">
          <span className="eyebrow">{t.formGender}</span>
          {fixedGender ? (
            <span className="inline-flex h-9 items-center rounded-[10px] bg-sunk px-3 text-[0.9rem] text-muted">{fixedGender === "N" ? t.genderless : fixedGender === "M" ? "♂" : "♀"}</span>
          ) : (
            <div className="inline-flex gap-1 rounded-[11px] bg-sunk p-1">
              {[["M", "♂"], ["F", "♀"]].map(([v, l]) => (
                <button key={v} type="button" aria-pressed={gender === v} onClick={() => setGender(v)} className={`h-7 w-11 rounded-lg text-[1rem] ${gender === v ? "bg-panel font-semibold text-fg shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-muted"}`}>{l}</button>
              ))}
            </div>
          )}
        </div>
        {abilities.length > 0 && (
          <div className="grid min-w-0 gap-1.5">
            <span className="eyebrow">{t.formAbility}</span>
            <div className="flex flex-wrap gap-1.5">
              {[["", t.formAnyAbility], ...abilities.map(a => [a, abilName(a, lang) + (p.abilities[2] === a ? ` · ${t.hiddenShort}` : "")])].map(([v, l]) => (
                <Chip key={v || "any"} on={ability === v} onClick={() => setAbility(v)}>{l}</Chip>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Nature : une stat qui monte, une qui baisse */}
      <div className="grid gap-1.5">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="eyebrow">{t.nature}</span>
          <span className="text-[0.86rem] font-medium">{nature ? `${natName(nature, lang)} · ${natFx(nature, t)}` : t.formAnyNature}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip on={!nature} onClick={() => pickNature("")}>{t.formAnyNature}</Chip>
          {goal?.nature && <Chip on={nature === goal.nature} onClick={() => pickNature(goal.nature)}>★ {t.natPlan} : {natName(goal.nature, lang)}</Chip>}
          <Chip on={!!nature && !NATURES[nature][0]} onClick={() => pickNature("Serious")}>{t.natNeutral}</Chip>
        </div>
        <div className="grid gap-1 rounded-xl bg-sunk p-2">
          {[["plus", "▲", t.natPlus], ["minus", "▼", t.natMinus]].map(([side, arrow, label]) => (
            <div key={side} className="flex flex-wrap items-center gap-1">
              <span className={`w-[88px] whitespace-nowrap text-[0.76rem] ${side === "plus" ? "text-[oklch(0.58_0.15_150)]" : "text-[oklch(0.6_0.17_25)]"}`}>{arrow} {label}</span>
              {NAT_STATS.map(st => {
                const on = part[side] === st;
                return (
                  <button key={st} type="button" aria-pressed={on} onClick={() => pickSide(side, st)}
                    className={`h-7 min-w-[48px] rounded-lg px-2 text-[0.78rem] ${on ? (side === "plus" ? "bg-[oklch(0.6_0.15_150)] text-white" : "bg-[oklch(0.6_0.17_25)] text-white") : "bg-panel text-muted hover:text-fg"}`}>
                    {t.short[st]}
                  </button>
                );
              })}
            </div>
          ))}
          {(part.plus || part.minus) && !nature && <p className="text-[0.74rem] text-faint">{t.natPick}</p>}
        </div>
      </div>

      {/* IV : un clic = 31 */}
      <div className="grid gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="eyebrow mr-1">{t.formIvs}</span>
          <Chip on={STATS.every(s => +ivs[s] === 31)} onClick={() => setAll(STATS)}>{t.ivAll31}</Chip>
          {goal?.ivs?.length > 0 && goal.ivs.length < 6 && <Chip on={STATS.every(s => (+ivs[s] === 31) === goal.ivs.includes(s))} onClick={() => setAll(goal.ivs)}>★ {t.ivGoal}</Chip>}
          <Chip on={false} onClick={() => setAll([])}>{t.ivNone}</Chip>
        </div>
        <div className="grid grid-cols-6 gap-1.5 max-[520px]:grid-cols-3">
          {STATS.map(s => {
            const v = ivs[s];
            const is31 = +v === 31;
            return exact ? (
              <label key={s} className={`grid gap-1 rounded-[11px] border p-1.5 text-center ${is31 ? "iv-chip border-transparent" : "border-line"}`} style={{ "--s": STAT_COL[s] }}>
                <span className="text-[0.74rem] font-medium">{t.short[s]}</span>
                <input id={"iv-" + s} inputMode="numeric" value={v} placeholder="?" onChange={e => setIv(s, e.target.value)} onFocus={e => e.target.select()}
                  className="h-8 w-full rounded-lg border border-line bg-panel text-center font-mono text-[0.95rem] focus:border-accent focus:outline-none" />
              </label>
            ) : (
              <button key={s} id={"iv-" + s} type="button" aria-pressed={is31} onClick={() => setIv(s, is31 ? "" : 31)} style={{ "--s": STAT_COL[s] }}
                className={`grid gap-0.5 rounded-[11px] border py-2 text-center transition-colors ${is31 ? "iv-chip border-transparent" : "border-line hover:bg-sunk"}`}>
                <span className="text-[0.74rem] font-medium">{t.short[s]}</span>
                <span className={`font-mono text-[1.05rem] ${v === "" ? "text-faint" : ""}`}>{v === "" ? "–" : v}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[0.78rem] text-faint">
          <span>{t.formIvHint}</span>
          <button type="button" onClick={() => setExact(x => !x)} className="text-accent-ink underline underline-offset-4">{exact ? t.done : t.ivExact}</button>
          <span>{t.ivPaste}</span>
          <input aria-label={t.ivExact} placeholder={t.ivPastePh} value={paste} onChange={e => onPaste(e.target.value)}
            className="h-7 w-[150px] rounded-md border border-line bg-panel px-2 font-mono text-[0.78rem] text-fg focus:border-accent focus:outline-none" />
        </div>
      </div>

      {error && <p className="text-[0.86rem] text-[oklch(0.6_0.18_25)]">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="h-10 rounded-xl bg-fg px-5 text-[0.9rem] font-medium text-bg hover:bg-accent-ink">{t.save}</button>
        <button type="button" onClick={onCancel} className="h-10 rounded-xl border border-line px-4 text-[0.9rem] text-muted hover:text-fg">{t.cancel}</button>
      </div>
    </form>
  );
}
