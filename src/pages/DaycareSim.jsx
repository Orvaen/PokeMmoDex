import { useEffect, useMemo, useRef, useState } from "react";
import { ALL, BY_ID, STATS, STAT_COL, familyRoot, genderInfo, pad } from "../lib/data.js";
import { NATURES, PRICE_DEFAULTS, abilName, natFx, natName } from "../lib/breeding.js";
import { DITTO, abilityPreview, eggMovesPassed, emptyParent, fixedGender, genderPrice, hatch, ivPreview, naturePreview, pairing } from "../lib/daycare.js";
import { nameOf, useLang } from "../lib/i18n.js";
import { useStored } from "../lib/storage.js";
import { useMoves, moveName } from "../lib/moves.js";
import { Dropdown, Icon, Sprite } from "../components/ui.jsx";

const BRACES = ["hp", "atk", "def", "spa", "spd", "spe"];
const FEM = "text-[oklch(0.62_0.16_0)]", MALE = "text-[oklch(0.6_0.13_250)]";
const GOOD = "text-[oklch(0.62_0.15_150)]";
const sym = g => (g === "F" ? "♀" : g === "M" ? "♂" : "∅");
const symCls = g => (g === "F" ? FEM : g === "M" ? MALE : "text-faint");
const card = "grid content-start gap-3.5 rounded-2xl border bg-panel p-3.5";

// Parents par défaut : une femelle de la lignée et un mâle (ou un Métamorph si l'espèce n'a pas de femelle)
function defaults(p, info) {
  const root = info.root;
  const fixed = fixedGender(root);
  if (fixed === "N" || fixed === "M") return { a: emptyParent(root.id, fixed), b: emptyParent(DITTO, "N") };
  const male = fixed === "F" ? info.males[0]?.q : root;
  return { a: emptyParent(root.id, "F"), b: male ? emptyParent(male.id, "M") : emptyParent(DITTO, "N") };
}

// storeKey : clé d'enregistrement (fiche du Pokémon ou page outil) ; free : la page outil garde les parents quels qu'ils soient
export default function DaycareSim({ p, info, head, switcher, storeKey = "daycare", free = false, footer = null }) {
  const { lang, t } = useLang();
  const d = t.dc;
  const moves = useMoves();
  const [saved, setSaved] = useStored(storeKey, null);
  const state = saved?.a && (free || saved.pid === p.id) ? saved : { pid: p.id, ...defaults(p, info) };
  const { a, b } = state;
  const setParent = (k, next) => setSaved({ ...state, [k]: typeof next === "function" ? next(state[k]) : next });

  const [box, setBox] = useStored("box", []);
  const [prices] = useStored("prices", PRICE_DEFAULTS);
  const price = { ...PRICE_DEFAULTS, ...prices };
  const [genderChoice, setGenderChoice] = useState(null);
  const [eggs, setEggs] = useState([]);
  const [added, setAdded] = useState(() => new Set());

  const pair = pairing(a, b);
  const prev = useMemo(() => (pair.ok ? ivPreview(a, b) : null), [pair.ok, a, b]);
  const nat = pair.ok ? naturePreview(a, b) : null;
  const abil = pair.ok ? abilityPreview(pair) : [];
  const passedMoves = pair.ok ? eggMovesPassed(pair, moves) : [];
  const gInfo = pair.ok ? genderInfo(pair.baby) : null;
  const gPrice = pair.ok ? genderPrice(pair.baby) : null;
  const choice = gPrice != null ? genderChoice : null;
  const braceCount = [a, b].filter(x => x.item && x.item !== "ever").length;
  const cost = braceCount * price.brace + (choice ? gPrice : 0);
  const money = n => n.toLocaleString(lang === "fr" ? "fr-FR" : "en-US") + " $";
  const pct = x => (x >= 0.9995 ? "100" : x > 0 && x < 0.01 ? "<1" : String(Math.round(x * 100))) + " %";

  const breed = () => {
    if (!pair.ok) return;
    setEggs(cur => [hatch(a, b, pair, choice, moves), ...cur].slice(0, 12));
  };
  const swap = () => setSaved({ ...state, a: b, b: a });
  const reset = () => { setSaved({ pid: p.id, ...defaults(p, info) }); setEggs([]); setGenderChoice(null); };
  const toBox = egg => {
    setBox(cur => [...cur, { id: egg.id, species: egg.species, gender: egg.gender, ivs: egg.ivs, nature: egg.nature, ability: egg.ability }]);
    setAdded(s => new Set(s).add(egg.id));
  };
  const asParent = (k, egg) => setParent(k, { ...emptyParent(egg.species, egg.gender), ivs: egg.ivs, nature: egg.nature, ability: egg.ability, moves: egg.moves || [] });

  const best = prev ? prev.count.reduce((m, v, i) => (v > 0 ? i : m), 0) : 0;

  return (
    <>
      {head}
      {switcher}

      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {storeKey === "daycareTool" ? <span /> : <p className="max-w-[62ch] text-[0.86rem] text-muted">{d.intro}</p>}
          <div className="flex gap-1.5">
            <button type="button" onClick={swap} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[0.8rem] text-muted hover:text-fg">⇄ {d.swap}</button>
            <button type="button" onClick={reset} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[0.8rem] text-muted hover:text-fg">↺ {d.reset}</button>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
          <ParentCard slot={1} par={a} pair={pair} onChange={n => setParent("a", n)} moves={moves} box={box} />
          <BabyCard pair={pair} prev={prev} nat={nat} abil={abil} passedMoves={passedMoves} moves={moves} gInfo={gInfo} choice={choice} pct={pct} />
          <ParentCard slot={2} par={b} pair={pair} onChange={n => setParent("b", n)} moves={moves} box={box} />
        </div>
      </section>

      {/* Chances, genre, coût et éclosion */}
      {pair.ok && (
        <section className="grid gap-4 rounded-2xl border border-line bg-panel p-4">
          <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-5 max-[720px]:grid-cols-1">
            <div className="grid content-start gap-2.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="eyebrow">{d.oddsTitle}</h3>
                <span className="text-[0.8rem] text-muted">{d.bestCase(best, pct(prev.count[best]))}</span>
              </div>
              <div className="grid grid-cols-7 items-end gap-1.5" role="list">
                {prev.count.map((v, i) => (
                  <div key={i} role="listitem" className="grid gap-1 text-center" aria-label={`${i}×31 : ${pct(v)}`}>
                    <span className={`font-mono text-[0.7rem] ${v > 0 ? "text-muted" : "text-faint"}`}>{v > 0 ? pct(v) : "–"}</span>
                    <div className="flex h-[64px] items-end rounded-md bg-sunk">
                      <div className={`w-full rounded-md ${i === best ? "bg-accent" : "bg-accent/45"}`} style={{ height: v > 0 ? `${Math.max(6, v * 100)}%` : 0 }} />
                    </div>
                    <span className={`font-mono text-[0.72rem] ${i === best ? "font-medium text-fg" : "text-faint"}`}>{i}×31</span>
                  </div>
                ))}
              </div>
              <p className="text-[0.78rem] text-faint">{d.oddsNote}</p>
            </div>

            <div className="grid content-start gap-3">
              <div className="grid gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="eyebrow">{d.babyGender}</span>
                  {gPrice != null && <span className="font-mono text-[0.76rem] text-muted">{choice ? money(gPrice) : d.free}</span>}
                </div>
                {gPrice != null ? (
                  <div className="grid grid-cols-3 gap-1 rounded-[11px] bg-sunk p-1">
                    {[[null, d.random], ["M", `♂ ${pct(1 - gInfo.female)}`], ["F", `♀ ${pct(gInfo.female)}`]].map(([v, l]) => (
                      <button key={String(v)} type="button" aria-pressed={choice === v} onClick={() => setGenderChoice(v)}
                        className={`h-8 rounded-lg text-[0.82rem] ${choice === v ? "bg-panel font-medium text-fg shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-muted hover:text-fg"} ${v ? symCls(v) : ""}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="rounded-[11px] bg-sunk px-3 py-2 text-[0.84rem] text-muted">{gInfo.kind === "N" ? t.genderless : gInfo.kind === "M" ? t.maleOnly : t.femaleOnly}</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl bg-sunk px-3.5 py-2.5">
                <div className="grid">
                  <span className="eyebrow">{d.costTitle}</span>
                  <span className="text-[0.76rem] text-muted">{d.costDetail(braceCount, money(price.brace))}</span>
                </div>
                <b className="font-mono text-[1.15rem] font-normal text-accent-ink">{money(cost)}</b>
              </div>
              <button type="button" onClick={breed} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-fg text-[0.95rem] font-medium text-bg hover:bg-accent-ink">
                {Icon.egg}{d.breedBtn}
              </button>
              <p className="text-[0.76rem] text-faint">{d.breedNote}</p>
            </div>
          </div>

          {eggs.length > 0 && (
            <div className="grid gap-2 border-t border-line pt-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="eyebrow">{d.hatched(eggs.length)}</h3>
                <button type="button" className="text-[0.78rem] text-muted underline underline-offset-4 hover:text-fg" onClick={() => setEggs([])}>{d.clear}</button>
              </div>
              <ul className="grid gap-1.5">
                {eggs.map((egg, i) => (
                  <EggRow key={egg.id} egg={egg} fresh={i === 0} moves={moves} added={added.has(egg.id)}
                    onBox={() => toBox(egg)} onParent={k => asParent(k, egg)} />
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {footer && footer(pair)}

      <details className="rounded-2xl border border-line bg-panel px-4 py-3 text-[0.86rem] text-muted">
        <summary className="cursor-pointer font-medium text-fg">{d.rulesTitle}</summary>
        <ul className="mt-2 grid max-w-[70ch] list-disc gap-1 pl-[18px]">{d.rules.map(r => <li key={r}>{r}</li>)}</ul>
        <p className="mt-2 text-[0.78rem] text-faint">{d.rulesSource}</p>
      </details>
    </>
  );
}

// ---------- Parent ----------
function ParentCard({ slot, par, pair, onChange, moves, box }) {
  const { lang, t } = useLang();
  const d = t.dc;
  const sp = BY_ID.get(par.species);
  const fixed = fixedGender(sp);
  const role = !pair.ok ? null : pair.ditto === par ? "ditto" : pair.mother === par && pair.father === par ? "parent" : pair.mother === par ? "mother" : "father";
  const transmits = role === "father" || role === "parent";
  const set = patch => onChange({ ...par, ...patch });

  const pickSpecies = id => {
    const q = BY_ID.get(id);
    const fg = fixedGender(q);
    onChange({ ...par, species: id, gender: fg || (par.gender === "N" ? (slot === 1 ? "F" : "M") : par.gender), ability: null, moves: [] });
  };
  const setIv = (s, v) => {
    const n = v === "" ? null : Math.max(0, Math.min(31, parseInt(v, 10) || 0));
    set({ ivs: { ...par.ivs, [s]: n } });
  };
  const abilities = sp ? [...new Set(sp.abilities.filter(Boolean))] : [];
  const learnable = useMemo(() => {
    if (!moves || !sp) return [];
    const ids = [...new Set((moves.learn[sp.id] || []).map(r => r[0]))];
    return ids.map(i => ({ i, mv: moves.moves[i] })).sort((x, y) => moveName(x.mv, lang).localeCompare(moveName(y.mv, lang)));
  }, [moves, sp, lang]);
  const babyEggs = useMemo(() => {
    if (!moves || !pair.ok) return new Set();
    return new Set((moves.learn[pair.baby.id] || []).filter(r => r[1] === "E").map(r => r[0]));
  }, [moves, pair.ok, pair.baby]);
  const myBox = box.filter(it => BY_ID.has(it.species));

  return (
    <article className={`${card} ${role === "mother" || role === "parent" ? "border-accent/55" : "border-line"}`} aria-label={`${d.parent} ${slot}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow">{d.parent} {slot}{role && <span className="ml-1.5 normal-case tracking-normal text-accent-ink">· {d.roles[role]}</span>}</span>
        {myBox.length > 0 && (
          <Dropdown label={d.fromBox} size="ghost" value="" align="right"
            options={myBox.map(it => { const q = BY_ID.get(it.species); return { value: String(it.id), label: `${nameOf(q, lang)} ${sym(it.gender)}`, tag: `${STATS.filter(s => it.ivs?.[s] === 31).length}×31` }; })}
            onChange={v => { const it = myBox.find(x => String(x.id) === v); if (it) onChange({ ...emptyParent(it.species, it.gender), ivs: { ...emptyParent().ivs, ...it.ivs }, nature: it.nature || null, ability: it.ability || null }); }} />
        )}
      </div>

      {/* Espèce et genre */}
      <div className="grid gap-2">
        <div className="disc-bg grid h-[92px] place-items-center rounded-xl bg-sunk">
          {sp ? <Sprite p={sp} className="size-[84px]" fallbackClass="size-10" /> : <span className="text-faint">?</span>}
        </div>
        <div className="flex gap-1.5">
          <Combo
            label={d.species}
            current={sp ? <span className="flex min-w-0 items-center gap-1.5"><b className="truncate font-medium">{nameOf(sp, lang)}</b><span className="font-mono text-[0.7rem] text-faint">#{pad(sp.id)}</span></span> : d.species}
            search={q => {
              const n = q.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
              const list = n ? ALL.filter(x => x.keyFr.includes(n) || x.keyEn.includes(n) || String(x.id) === n) : [BY_ID.get(DITTO), ...ALL.filter(x => x.id === familyRoot(x).id && x.obtainable)];
              return list.slice(0, 40).map(x => ({ value: x.id, label: nameOf(x, lang), hint: x.eggGroups.map(g => t.egg[g] || g).join(" / "), icon: <Sprite p={x} className="size-7" fallbackClass="size-4" /> }));
            }}
            onPick={pickSpecies}
          />
          {fixed ? (
            <span title={fixed === "N" ? t.genderless : ""} className={`grid h-9 w-11 flex-none place-items-center rounded-[10px] bg-sunk text-[1rem] ${symCls(fixed)}`}>{sym(fixed)}</span>
          ) : (
            <div className="inline-flex flex-none gap-0.5 rounded-[10px] bg-sunk p-0.5">
              {["F", "M"].map(g => (
                <button key={g} type="button" aria-pressed={par.gender === g} aria-label={g === "F" ? d.female : d.male} onClick={() => set({ gender: g })}
                  className={`h-8 w-9 rounded-lg text-[1rem] ${par.gender === g ? `bg-panel font-semibold shadow-[0_1px_2px_rgb(0_0_0/0.08)] ${symCls(g)}` : "text-faint hover:text-fg"}`}>{sym(g)}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* IV */}
      <div className="grid gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="eyebrow">{t.formIvs}</span>
          <span className="flex gap-2 text-[0.74rem]">
            <button type="button" className="text-accent-ink hover:text-fg" onClick={() => set({ ivs: Object.fromEntries(STATS.map(s => [s, 31])) })}>6×31</button>
            <button type="button" className="text-muted hover:text-fg" onClick={() => set({ ivs: Object.fromEntries(STATS.map(s => [s, null])) })}>{d.clearIvs}</button>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {STATS.map(s => {
            const v = par.ivs[s];
            const braced = par.item === s;
            return (
              <label key={s} style={{ "--s": STAT_COL[s] }}
                className={`relative grid gap-0.5 rounded-[10px] border px-1.5 pb-1 pt-1 text-center ${v === 31 ? "iv-chip border-transparent" : "border-line"} ${braced ? "ring-2 ring-accent" : ""}`}>
                <span className="text-[0.7rem] font-medium">{t.short[s]}</span>
                <input inputMode="numeric" value={v ?? ""} placeholder="?" aria-label={`${t.stats[s]} IV`} onChange={e => setIv(s, e.target.value)} onFocus={e => e.target.select()}
                  className="h-7 w-full rounded-md border border-line bg-panel text-center font-mono text-[0.92rem] focus:border-accent focus:outline-none" />
                {braced && <span className="absolute -right-1 -top-1.5 rounded-full bg-accent px-1 text-[0.6rem] font-semibold leading-[1.4] text-panel">◆</span>}
              </label>
            );
          })}
        </div>
      </div>

      {/* Objet tenu */}
      <div className="grid gap-1.5">
        <span className="eyebrow">{d.item}</span>
        <div className="flex flex-wrap gap-1">
          <ItemChip on={!par.item} onClick={() => set({ item: null })}>{d.none}</ItemChip>
          <ItemChip on={par.item === "ever"} onClick={() => set({ item: "ever" })}>{t.everstone}</ItemChip>
        </div>
        <span className="text-[0.72rem] text-faint">{d.brace}</span>
        <div className="grid grid-cols-6 gap-1">
          {BRACES.map(s => (
            <button key={s} type="button" aria-pressed={par.item === s} title={t.braces[s]} onClick={() => set({ item: par.item === s ? null : s })} style={{ "--s": STAT_COL[s] }}
              className={`h-7 min-w-0 truncate rounded-lg px-0.5 text-[0.7rem] ${par.item === s ? "iv-chip font-medium text-fg" : "bg-sunk text-muted hover:text-fg"}`}>{t.short[s]}</button>
          ))}
        </div>
      </div>

      {/* Nature et talent */}
      <div className="grid gap-1.5">
        <span className="eyebrow">{t.nature}{par.item === "ever" && !par.nature && <span className="ml-1.5 normal-case tracking-normal text-[oklch(0.62_0.16_45)]">· {d.needNature}</span>}</span>
        <Dropdown size="lg" label={d.unknownNature} active={!!par.nature} value={par.nature || ""} onChange={k => set({ nature: k || null })}
          options={[{ value: "", label: d.unknownNature }, { sep: true }, ...Object.keys(NATURES).map(k => ({ value: k, label: natName(k, lang), tag: natFx(k, t) }))]} />
      </div>
      {abilities.length > 0 && (
        <div className="grid gap-1.5">
          <span className="eyebrow">{t.formAbility}</span>
          <div className="flex flex-wrap gap-1">
            {abilities.map(ab => (
              <ItemChip key={ab} on={par.ability === ab} onClick={() => set({ ability: par.ability === ab ? null : ab })}>
                {abilName(ab, lang)}{sp.abilities[2] === ab && sp.abilities[0] !== ab && <span className="ml-1 text-[0.68rem] opacity-70">{t.hiddenShort}</span>}
              </ItemChip>
            ))}
          </div>
        </div>
      )}

      {/* Capacités : seules celles du père passent au bébé */}
      {par.species !== DITTO && (
        <div className="grid gap-1.5">
          <span className="eyebrow">{d.moves}{!transmits && pair.ok && <span className="ml-1.5 normal-case tracking-normal text-faint">· {d.notPassed}</span>}</span>
          {moves ? (
            <div className="grid gap-1">
              {[0, 1, 2, 3].map(k => {
                const idx = par.moves[k];
                const mv = idx != null ? moves.moves[idx] : null;
                const egg = transmits && idx != null && babyEggs.has(idx);
                return (
                  <Combo key={k} small label={`${d.move} ${k + 1}`}
                    current={mv ? <span className={`flex min-w-0 items-center gap-1.5 ${egg ? `font-medium ${GOOD}` : ""}`}>{egg && Icon.egg}<span className="truncate">{moveName(mv, lang)}</span></span> : <span className="text-faint">–</span>}
                    search={q => {
                      const n = q.toLowerCase();
                      const list = learnable.filter(x => !n || moveName(x.mv, lang).toLowerCase().includes(n));
                      // Capacités Œuf du bébé en premier quand ce parent les transmet
                      const sorted = transmits ? [...list.filter(x => babyEggs.has(x.i)), ...list.filter(x => !babyEggs.has(x.i))] : list;
                      return [{ value: -1, label: "–" }, ...sorted.slice(0, 60).map(x => ({ value: x.i, label: moveName(x.mv, lang), hint: transmits && babyEggs.has(x.i) ? d.eggMove : "" }))];
                    }}
                    onPick={v => { const next = [...par.moves]; if (v === -1) next.splice(k, 1); else next[k] = v; set({ moves: next.filter(x => x != null) }); }}
                  />
                );
              })}
            </div>
          ) : (
            <span className="text-[0.78rem] text-faint">{t.loading}</span>
          )}
        </div>
      )}
    </article>
  );
}

// ---------- Bébé ----------
function BabyCard({ pair, prev, nat, abil, passedMoves, moves, gInfo, choice, pct }) {
  const { lang, t } = useLang();
  const d = t.dc;
  if (!pair.ok) {
    return (
      <article className={`${card} place-content-center border-dashed border-line text-center max-[860px]:col-span-2 max-[860px]:row-start-2 max-[560px]:col-span-1 max-[560px]:row-start-auto`}>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-sunk text-faint">{Icon.egg}</span>
        <b className="font-medium">{d.noEgg}</b>
        <p className="text-[0.84rem] text-muted">{d.reasons[pair.reason]}</p>
      </article>
    );
  }
  const baby = pair.baby;
  return (
    <article className={`${card} border-[1.5px] border-accent shadow-soft max-[860px]:col-span-2 max-[860px]:row-start-2 max-[560px]:col-span-1 max-[560px]:row-start-auto`} aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow text-accent-ink">{d.baby}</span>
        <span className="text-[0.76rem]">
          {gInfo.kind === "MF" ? (
            choice ? <b className={`font-medium ${symCls(choice)}`}>{sym(choice)} {d.chosen}</b>
              : <><span className={FEM}>♀ {pct(gInfo.female)}</span><span className="text-faint"> · </span><span className={MALE}>♂ {pct(1 - gInfo.female)}</span></>
          ) : <span className={symCls(gInfo.kind)}>{sym(gInfo.kind)}</span>}
        </span>
      </div>

      <div className="grid gap-2">
        <div className="disc-bg grid h-[92px] place-items-center rounded-xl bg-accent-soft/50">
          <Sprite p={baby} className="size-[84px]" fallbackClass="size-10" />
        </div>
        <div className="flex h-9 items-center justify-center gap-1.5 rounded-[10px] bg-sunk px-3">
          <b className="truncate font-medium">{nameOf(baby, lang)}</b><span className="font-mono text-[0.7rem] text-faint">#{pad(baby.id)}</span>
        </div>
      </div>

      <div className="grid gap-1.5">
        <span className="eyebrow">{d.ivRange}</span>
        <div className="grid grid-cols-3 gap-1">
          {STATS.map(s => {
            const st = prev.perStat[s];
            const sure = st.p31 >= 0.9995;
            const known = st.min != null;
            return (
              <div key={s} style={{ "--s": STAT_COL[s] }} className={`grid gap-0.5 rounded-[10px] border px-1 pb-1 pt-1 text-center ${sure ? "iv-chip border-transparent" : "border-line"}`}
                title={`${t.stats[s]} : ${known ? (st.min === st.max ? st.min : `${st.min}–${st.max}`) : "?"} · 31 : ${pct(st.p31)}`}>
                <span className="text-[0.7rem] font-medium">{t.short[s]}</span>
                <span className="grid h-7 place-items-center font-mono text-[0.86rem]">{!known ? <span className="text-faint">?</span> : st.min === st.max ? st.min : `${st.min}–${st.max}`}</span>
                <span className={`font-mono text-[0.64rem] ${sure ? `font-medium ${GOOD}` : st.p31 > 0 ? "text-muted" : "text-faint"}`}>{st.p31 > 0 ? `31 · ${pct(st.p31)}` : "—"}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-1.5">
        <span className="eyebrow">{t.nature}</span>
        <div className="rounded-[11px] bg-sunk px-3 py-2 text-[0.86rem]">
          {nat.fixed ? (
            <span className="flex flex-wrap items-baseline gap-x-2"><b className={`font-medium ${GOOD}`}>{natName(nat.fixed, lang)}</b><span className="font-mono text-[0.72rem] text-accent-ink">{natFx(nat.fixed, t)}</span><span className="text-[0.76rem] text-muted">{d.guaranteed}</span></span>
          ) : nat.choices.length ? (
            nat.choices.map(c => <span key={c.k} className="mr-2">{natName(c.k, lang)} <span className="font-mono text-[0.72rem] text-muted">{pct(c.p)}</span></span>)
          ) : (
            <span className="text-muted">{d.randomNature}</span>
          )}
        </div>
      </div>

      {abil.length > 0 && (
        <div className="grid gap-1.5">
          <span className="eyebrow">{t.formAbility}</span>
          <div className="flex flex-wrap gap-1">
            {abil.map(x => (
              <span key={x.name} className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[0.8rem] ${x.p > 0 ? "bg-sunk" : "bg-sunk/50 text-faint line-through decoration-faint/50"}`}>
                {abilName(x.name, lang)}{x.hidden && <span className="text-[0.68rem] text-faint">{t.hiddenShort}</span>}
                <span className="font-mono text-[0.7rem] text-muted">{pct(x.p)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-1.5">
        <span className="eyebrow">{d.eggMoves}</span>
        {passedMoves.length ? (
          <div className="grid gap-1">
            {passedMoves.map(i => (
              <span key={i} className={`flex items-center gap-1.5 rounded-lg bg-accent-soft/60 px-2.5 py-1.5 text-[0.84rem] font-medium ${GOOD}`}>{Icon.egg}{moveName(moves.moves[i], lang)}</span>
            ))}
          </div>
        ) : (
          <span className="text-[0.78rem] text-faint">{moves ? d.noEggMoves : t.loading}</span>
        )}
      </div>
    </article>
  );
}

function EggRow({ egg, fresh, moves, added, onBox, onParent }) {
  const { lang, t } = useLang();
  const d = t.dc;
  const p = BY_ID.get(egg.species);
  const n31 = STATS.filter(s => egg.ivs[s] === 31).length;
  return (
    <li className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2 ${fresh ? "anim-rise border-accent bg-accent-soft/40" : "border-line"}`}>
      <span className="grid size-10 flex-none place-items-center"><Sprite p={p} className="size-10" /></span>
      <div className="grid min-w-0 flex-1 gap-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <b className="font-medium">{nameOf(p, lang)}</b>
          <span className={symCls(egg.gender)}>{sym(egg.gender)}</span>
          <span className="text-[0.82rem] text-muted">{natName(egg.nature, lang)}</span>
          {egg.ability && <span className="text-[0.82rem] text-muted">· {abilName(egg.ability, lang)}</span>}
          {egg.moves?.length > 0 && moves && <span className={`text-[0.78rem] ${GOOD}`}>· {egg.moves.map(i => moveName(moves.moves[i], lang)).join(", ")}</span>}
        </div>
        <div className="flex flex-wrap gap-[3px]">
          {STATS.map(s => {
            const v = egg.ivs[s];
            return <span key={s} style={{ "--s": STAT_COL[s] }} className={`rounded-[5px] px-1.5 py-px font-mono text-[0.7rem] ${v === 31 ? "iv-chip font-medium text-fg" : "bg-sunk text-faint"}`}>{t.short[s]} {v ?? "?"}</span>;
          })}
          <span className="ml-1 font-mono text-[0.72rem] text-faint">{n31}×31</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className="h-8 rounded-lg border border-line px-2.5 text-[0.78rem] text-muted hover:text-fg" onClick={() => onParent("a")}>→ {d.parent} 1</button>
        <button type="button" className="h-8 rounded-lg border border-line px-2.5 text-[0.78rem] text-muted hover:text-fg" onClick={() => onParent("b")}>→ {d.parent} 2</button>
        {added
          ? <span className="inline-flex h-8 items-center rounded-lg px-2.5 text-[0.78rem] text-accent-ink">✓ {d.inBox}</span>
          : <button type="button" className="h-8 rounded-lg bg-fg px-2.5 text-[0.78rem] font-medium text-bg hover:bg-accent-ink" onClick={onBox}>+ {d.toBox}</button>}
      </div>
    </li>
  );
}

const ItemChip = ({ on, onClick, children }) => (
  <button type="button" aria-pressed={on} onClick={onClick}
    className={`h-7 rounded-lg px-2.5 text-[0.78rem] transition-colors ${on ? "bg-accent-soft font-medium text-accent-ink" : "bg-sunk text-muted hover:text-fg"}`}>
    {children}
  </button>
);

// Liste déroulante avec recherche (espèces, capacités)
function Combo({ label, current, search, onPick, small = false }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const root = useRef(null);
  const btn = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (!root.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);
  const items = open ? search(q) : [];
  const pick = v => { setOpen(false); setQ(""); btn.current?.focus(); onPick(v); };
  const onKey = e => {
    const list = [...root.current.querySelectorAll('[role="option"]')];
    const i = list.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); list[Math.min(i + 1, list.length - 1)]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); (i <= 0 ? root.current.querySelector("input") : list[i - 1])?.focus(); }
    else if (e.key === "Escape") { setOpen(false); btn.current?.focus(); }
    else if (e.key === "Enter" && i < 0 && items[0]) { e.preventDefault(); pick(items[0].value); }
  };
  return (
    <div className="relative min-w-0 flex-1" ref={root} onKeyDown={e => { e.stopPropagation(); if (open) onKey(e); }}>
      <button ref={btn} type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label} onClick={() => setOpen(o => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-[10px] border border-line px-2.5 text-left text-[0.86rem] hover:border-accent ${small ? "h-8 text-[0.8rem]" : "h-9"} ${open ? "border-accent" : ""}`}>
        <span className="min-w-0 truncate">{current}</span>
        <span className={`flex-none text-faint transition-transform ${open ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
      </button>
      {open && (
        <div className="anim-pop absolute left-0 right-0 top-[calc(100%+6px)] z-30 min-w-[220px] rounded-xl border border-line bg-panel p-1.5 shadow-soft">
          <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={t.dc.searchPh} aria-label={label}
            className="mb-1 h-8 w-full rounded-lg border border-line bg-sunk px-2.5 text-[0.84rem] focus:border-accent focus:outline-none" />
          <ul role="listbox" className="max-h-[min(300px,50vh)] overflow-y-auto [scrollbar-width:thin]">
            {items.length === 0 && <li className="px-2.5 py-2 text-[0.82rem] text-faint">{t.dc.noResult}</li>}
            {items.map(o => (
              <li key={o.value} role="option" aria-selected="false" tabIndex={-1} onClick={() => pick(o.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(o.value); } }}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[0.84rem] text-muted outline-none hover:bg-sunk hover:text-fg focus:bg-sunk focus:text-fg">
                {o.icon && <span className="grid size-7 flex-none place-items-center">{o.icon}</span>}
                <span className="truncate">{o.label}</span>
                {o.hint && <span className="ml-auto flex-none truncate pl-2 text-[0.68rem] text-faint">{o.hint}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
