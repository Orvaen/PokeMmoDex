import { useEffect, useMemo, useRef, useState } from "react";
import { ALL, BY_ID, TYPES, norm, pad } from "../lib/data.js";
import { nameOf, typeName, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { useStored } from "../lib/storage.js";
import { moveName, useMoves } from "../lib/moves.js";
import { TEAM_SIZE, analyzeTeam, autoMoves, decodeTeam, encodeTeam, resistersOf, suggestFor } from "../lib/team.js";
import { Icon, Sprite, TypePill } from "../components/ui.jsx";
import { CategoryBadge } from "../components/MoveBits.jsx";

const btn = "inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[0.84rem]";
const MULT_LABEL = { 4: "×4", 2: "×2", 1: "", 0.5: "½", 0.25: "¼", 0: "0" };

export default function TeamPage({ shared }) {
  const { lang, t } = useLang();
  const [stored, setStored] = useStored("team", []);
  const sharedTeam = useMemo(() => decodeTeam(shared), [shared]);
  const [tmp, setTmp] = useState(sharedTeam || []);
  const isShared = !!sharedTeam;
  const [team, setTeam] = isShared ? [tmp, setTmp] : [stored, setStored];
  const [picking, setPicking] = useState(null); // index de la case en cours de choix
  const [copied, setCopied] = useState(false);
  const movesData = useMoves();

  useEffect(() => {
    document.documentElement.style.setProperty("--h", 280);
    document.documentElement.style.setProperty("--cc", 0.1);
  }, []);

  const slots = Array.from({ length: TEAM_SIZE }, (_, i) => team[i] || null);
  const members = slots.filter(Boolean).map(s => ({
    p: BY_ID.get(s.id),
    moves: movesData ? (s.moves || []).map(id => movesData.moves[movesData.byId.get(id)]).filter(Boolean) : [],
  })).filter(m => m.p);
  const ids = members.map(m => m.p.id);
  const a = members.length ? analyzeTeam(members) : null;

  const setSlot = (i, value) => setTeam(cur => {
    const next = Array.from({ length: TEAM_SIZE }, (_, k) => cur[k] || null);
    next[i] = value;
    return next.filter(Boolean);
  });
  const addPokemon = id => {
    if (team.length >= TEAM_SIZE) return;
    setTeam(cur => [...cur.filter(Boolean), { id, moves: [] }]);
  };
  // Complète les attaques manquantes de chaque membre
  const fillAll = () => setTeam(cur => cur.map(s => {
    if (!s || !BY_ID.get(s.id) || (s.moves || []).length >= 4) return s;
    const p = BY_ID.get(s.id);
    const have = (s.moves || []).map(id => movesData.moves[movesData.byId.get(id)]).filter(Boolean);
    return { ...s, moves: [...(s.moves || []), ...autoMoves(p, learnable(p, movesData), have)] };
  }));
  const link = `${location.origin}${location.pathname}#/equipe?t=${encodeTeam(team)}`;
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { document.getElementById("team-link")?.select(); }
  };

  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-7 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${t.teamTitle} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5">
        <a href="#/" className="hidden h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg max-[860px]:inline-flex">{Icon.left}{t.back}</a>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-[60ch]">
          <h1 className="text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-light leading-none tracking-[-0.045em]">{t.teamTitle}</h1>
          <p className="mt-3 text-muted">{t.teamIntro}</p>
        </div>
        {members.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {movesData && slots.some(s => s && (s.moves || []).length < 4) && (
              <button type="button" className={`${btn} bg-accent-soft font-medium text-accent-ink hover:brightness-95`} onClick={fillAll}>✨ {t.autoMovesAll}</button>
            )}
            {!isShared && <button type="button" className={`${btn} border border-line text-muted hover:text-fg`} onClick={() => setTeam([])}>{t.teamClear}</button>}
          </div>
        )}
      </div>

      {isShared && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent bg-accent-soft p-4">
          <p className="text-[0.92rem]">{t.teamShared}</p>
          <div className="flex gap-2">
            <button type="button" className={`${btn} bg-fg font-medium text-bg`} onClick={() => { setStored(sharedTeam); location.hash = "/equipe"; }}>{t.teamKeep}</button>
            <a href="#/equipe" className={`${btn} border border-line bg-panel`}>{t.backToMine}</a>
          </div>
        </section>
      )}

      {/* Les 6 cases */}
      <ol className="grid grid-cols-6 gap-2.5 max-[1100px]:grid-cols-3 max-[520px]:grid-cols-2">
        {slots.map((s, i) => (
          <li key={i} className="min-w-0">
            {picking === i ? (
              <Picker exclude={ids} onPick={id => { setSlot(i, { id, moves: [] }); setPicking(null); }} onClose={() => setPicking(null)} />
            ) : s && BY_ID.get(s.id) ? (
              <Slot slot={s} index={i} movesData={movesData} onChange={v => setSlot(i, v)} onRemove={() => setSlot(i, null)} onReplace={() => setPicking(i)} />
            ) : (
              <button type="button" onClick={() => setPicking(i)}
                className="grid h-full min-h-[190px] w-full place-items-center rounded-2xl border-2 border-dashed border-line text-faint transition-colors hover:border-accent hover:text-accent-ink">
                <span className="grid justify-items-center gap-1.5">
                  <span className="grid size-10 place-items-center rounded-full bg-sunk text-[1.4rem] leading-none">+</span>
                  <span className="text-[0.84rem]">{i === 0 && !members.length ? t.teamStart : t.teamAdd}</span>
                </span>
              </button>
            )}
          </li>
        ))}
      </ol>

      {!a ? (
        <div className="rounded-2xl border border-line bg-panel p-6 text-center">
          <p className="text-muted">{t.teamEmpty}</p>
          <p className="mt-3 text-[0.84rem] text-faint">{t.teamTip}</p>
        </div>
      ) : (
        <>
          {/* Verdict */}
          <section className="grid gap-3 rounded-2xl border border-line bg-panel p-5">
            <h2 className="text-[1.1rem] font-medium">{t.verdict}</h2>
            {a.problems.length ? (
              <ul className="grid gap-3">
                {a.problems.map(pb => (
                  <li key={pb.atk} className={`grid gap-2.5 rounded-xl p-3.5 ${pb.level === "high" ? "bg-[oklch(0.65_0.18_25/0.12)]" : "bg-[oklch(0.8_0.14_80/0.16)]"}`}>
                    <p className="text-[0.95rem]">
                      <span className={`mr-2 inline-block size-2.5 rounded-full align-middle ${pb.level === "high" ? "bg-[oklch(0.6_0.2_25)]" : "bg-[oklch(0.75_0.15_70)]"}`} />
                      {t.problemLine(typeName(pb.atk, lang), pb.weak, pb.resist)}
                    </p>
                    {members.length < TEAM_SIZE && (
                      <div className="grid gap-2">
                        <p className="text-[0.84rem] text-muted">
                          {t.fixWith}{" "}
                          {resistersOf(pb.atk).slice(0, 5).map(ty => <span key={ty} className="mr-1 inline-block align-middle"><TypePill t={ty} size="sm" /></span>)}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestFor(pb.atk, ids).map(sp => (
                            <button key={sp.id} type="button" onClick={() => addPokemon(sp.id)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel py-0.5 pl-1 pr-3 text-[0.84rem] hover:border-accent">
                              <span className="grid size-7 place-items-center"><Sprite p={sp} className="size-7" fallbackClass="size-4" /></span>
                              + {nameOf(sp, lang)}
                              {sp.tier && <span className="font-mono text-[0.66rem] text-faint">{sp.tier}</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl bg-[oklch(0.7_0.14_150/0.14)] p-3.5 text-[0.95rem]"><span className="mr-2 inline-block size-2.5 rounded-full bg-[oklch(0.65_0.15_150)] align-middle" />{t.noProblem}</p>
            )}
            {a.uncovered.length > 0 ? (
              <p className="text-[0.92rem] text-muted">
                {t.uncoveredLine}{" "}
                {a.uncovered.map(o => <span key={o.def} className="mr-1 inline-block align-middle"><TypePill t={o.def} size="sm" /></span>)}
              </p>
            ) : <p className="text-[0.92rem] text-muted">✓ {t.allCovered}</p>}
          </section>

          {/* Tableau des faiblesses */}
          <section className="grid gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[1.1rem] font-medium">{t.defTitle}</h2>
              <p className="text-[0.8rem] text-faint">{t.defHint}</p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
              <table className="w-full min-w-[620px] text-center text-[0.82rem]">
                <thead>
                  <tr className="border-b border-line">
                    <th className="px-3 py-2 text-left text-[0.7rem] font-medium uppercase tracking-[0.09em] text-faint">{t.attackType}</th>
                    {members.map(m => (
                      <th key={m.p.id} className="px-1 py-1.5">
                        <a href={href({ page: "pokemon", id: m.p.id })} title={nameOf(m.p, lang)} className="mx-auto grid size-9 place-items-center"><Sprite p={m.p} className="size-9" fallbackClass="size-5" /></a>
                      </th>
                    ))}
                    <th className="px-2 py-2 text-[0.7rem] font-medium uppercase tracking-[0.09em] text-faint">{t.weakCol}</th>
                    <th className="px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.09em] text-faint">{t.resistCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {a.defense.map(row => (
                    <tr key={row.atk} className={`border-b border-line last:border-0 ${row.level === "high" ? "bg-[oklch(0.65_0.18_25/0.08)]" : ""}`}>
                      <td className="px-3 py-1.5 text-left"><TypePill t={row.atk} size="sm" /></td>
                      {row.cells.map((x, i) => (
                        <td key={i} className="px-1 py-1">
                          <span className={`mx-auto grid h-7 w-10 place-items-center rounded-md font-mono text-[0.78rem] ${
                            x >= 4 ? "bg-[oklch(0.6_0.2_25)] font-semibold text-white" : x > 1 ? "bg-[oklch(0.65_0.18_25/0.22)] font-medium" : x === 0 ? "bg-[oklch(0.55_0.03_250/0.25)] text-muted" : x < 1 ? "bg-[oklch(0.7_0.14_150/0.22)]" : "text-faint"
                          }`}>{MULT_LABEL[x] ?? x}</span>
                        </td>
                      ))}
                      <td className={`px-2 py-1.5 font-mono ${row.weak >= 3 ? "font-semibold text-[oklch(0.58_0.19_25)]" : row.weak ? "" : "text-faint"}`}>{row.weak}</td>
                      <td className={`px-3 py-1.5 font-mono ${row.resist >= 2 ? "font-semibold text-[oklch(0.55_0.13_150)]" : row.resist ? "" : "text-faint"}`}>{row.resist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Couverture offensive */}
          <section className="grid gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[1.1rem] font-medium">{t.offTitle}</h2>
              <p className="text-[0.8rem] text-faint">{members.some(m => m.moves.length) ? t.offHintMoves : t.offHintTypes}</p>
            </div>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2">
              {[...a.offense].sort((x, y) => x.best - y.best).map(o => (
                <li key={o.def} className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 ${o.best > 1 ? "border-line bg-panel" : "border-[oklch(0.65_0.18_25/0.4)] bg-[oklch(0.65_0.18_25/0.08)]"}`}>
                  <TypePill t={o.def} size="sm" />
                  {o.best > 1 ? (
                    <span className="flex -space-x-2">
                      {o.by.slice(0, 4).map(p => <span key={p.id} title={nameOf(p, lang)} className="grid size-7 place-items-center rounded-full bg-sunk ring-2 ring-panel"><Sprite p={p} className="size-7" fallbackClass="size-3" /></span>)}
                    </span>
                  ) : <span className="text-[0.76rem] font-medium text-[oklch(0.58_0.19_25)]">{o.best === 0 ? t.immuneAll : t.notCovered}</span>}
                </li>
              ))}
            </ul>
          </section>

          {/* Partage */}
          {!isShared && (
            <section className="grid gap-2 rounded-2xl border border-line bg-panel p-4">
              <h2 className="text-[1rem] font-medium">{t.teamShare}</h2>
              <div className="flex flex-wrap gap-2">
                <input id="team-link" readOnly value={link} onFocus={e => e.target.select()}
                  className="h-9 min-w-0 flex-1 basis-[260px] rounded-[9px] border border-line bg-sunk px-2.5 font-mono text-[0.76rem] text-muted" />
                <button type="button" className={`${btn} bg-fg font-medium text-bg hover:bg-accent-ink`} onClick={copy}>{copied ? `✓ ${t.copied}` : t.copyLink}</button>
              </div>
            </section>
          )}
          <p className="text-[0.78rem] text-faint">{t.teamNote}</p>
        </>
      )}
    </div>
  );
}

// Case remplie : le Pokémon, ses types et ses attaques (facultatives)
function Slot({ slot, index, movesData, onChange, onRemove, onReplace }) {
  const { lang, t } = useLang();
  const p = BY_ID.get(slot.id);
  const [adding, setAdding] = useState(false);
  const moves = movesData ? (slot.moves || []).map(id => movesData.moves[movesData.byId.get(id)]).filter(Boolean) : [];
  const col = TYPES[p.types[0]].col;
  return (
    <div className="grid h-full content-start gap-2 rounded-2xl border border-line bg-panel p-3" style={{ background: `linear-gradient(180deg, color-mix(in oklab, ${col} 12%, var(--panel)), var(--panel) 55%)` }}>
      <div className="flex items-center justify-between font-mono text-[0.7rem] text-faint">
        <span>{index + 1}</span>
        <span className="flex gap-1">
          <button type="button" onClick={onReplace} title={t.teamReplace} aria-label={t.teamReplace} className="grid size-6 place-items-center rounded-md hover:bg-sunk hover:text-fg">⇄</button>
          <button type="button" onClick={onRemove} title={t.remove} aria-label={t.remove} className="grid size-6 place-items-center rounded-md hover:bg-sunk hover:text-fg">✕</button>
        </span>
      </div>
      <a href={href({ page: "pokemon", id: p.id })} className="grid justify-items-center gap-1 text-center">
        <span className="grid size-[72px] place-items-center"><Sprite p={p} className="size-[72px]" fallbackClass="size-9" /></span>
        <span className="w-full truncate text-[0.95rem] font-medium">{nameOf(p, lang)}</span>
      </a>
      <div className="flex flex-wrap justify-center gap-1">{p.types.map(ty => <TypePill key={ty} t={ty} size="sm" />)}</div>
      <div className="grid gap-1 border-t border-line pt-2">
        {moves.map(mv => (
          <span key={mv.id} className="group flex items-center gap-1.5 rounded-md bg-panel/70 px-1.5 py-0.5 text-[0.76rem]">
            <i className="size-2 flex-none rounded-full" style={{ background: TYPES[mv.type].col }} />
            <span className="min-w-0 flex-1 truncate">{moveName(mv, lang)}</span>
            <button type="button" aria-label={t.remove} onClick={() => onChange({ ...slot, moves: slot.moves.filter(x => x !== mv.id) })} className="text-faint hover:text-fg">✕</button>
          </span>
        ))}
        {moves.length < 4 && (adding && movesData ? (
          <MovePicker p={p} movesData={movesData} exclude={slot.moves || []} left={4 - moves.length}
            onPick={id => { const next = [...(slot.moves || []), id]; onChange({ ...slot, moves: next }); if (next.length >= 4) setAdding(false); }} onClose={() => setAdding(false)} />
        ) : (
          <div className="grid gap-1">
            {movesData && (
              <button type="button" onClick={() => onChange({ ...slot, moves: [...(slot.moves || []), ...autoMoves(p, learnable(p, movesData), moves)] })}
                className="rounded-md bg-accent-soft px-1.5 py-1 text-left text-[0.76rem] font-medium text-accent-ink hover:brightness-95">✨ {t.autoMoves}</button>
            )}
            <button type="button" onClick={() => setAdding(true)} className="rounded-md px-1.5 py-1 text-left text-[0.76rem] text-faint hover:bg-sunk hover:text-fg">+ {moves.length ? t.moreMoves : t.addAttack}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recherche d'un Pokémon pour une case
function Picker({ exclude, onPick, onClose }) {
  const { lang, t } = useLang();
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const close = e => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [onClose]);
  const query = norm(q.trim());
  const list = ALL.filter(p => !exclude.includes(p.id) && (!query || p.keyFr.includes(query) || p.keyEn.includes(query) || String(p.id) === query))
    .sort((a, b) => (query ? 0 : (b.tier ? 1 : 0) - (a.tier ? 1 : 0)) || (b.obtainable - a.obtainable) || a.id - b.id)
    .slice(0, 7);
  return (
    <div ref={ref} className="grid h-full min-h-[190px] content-start gap-1.5 rounded-2xl border-2 border-accent bg-panel p-2 shadow-soft">
      <input id="team-pick" autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={t.search}
        onKeyDown={e => { if (e.key === "Enter" && list[0]) onPick(list[0].id); if (e.key === "Escape") onClose(); }}
        className="h-9 w-full rounded-lg border border-line bg-sunk px-2.5 text-[0.88rem] focus:border-accent focus:outline-none" />
      <ul className="grid gap-0.5">
        {list.map(p => (
          <li key={p.id}>
            <button type="button" onClick={() => onPick(p.id)} className="flex w-full items-center gap-1.5 rounded-lg px-1 py-0.5 text-left text-[0.84rem] hover:bg-sunk">
              <span className="grid size-7 flex-none place-items-center"><Sprite p={p} className="size-7" fallbackClass="size-4" /></span>
              <span className="min-w-0 flex-1 truncate">{nameOf(p, lang)}</span>
              <span className="font-mono text-[0.66rem] text-faint">{p.tier || pad(p.id)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Capacités offensives que le Pokémon peut apprendre (STAB et puissance d'abord)
function learnable(p, movesData) {
  const seen = new Set();
  return (movesData.learn[p.id] || []).map(([idx]) => movesData.moves[idx])
    .filter(mv => mv.cat !== "N" && mv.power && !seen.has(mv.id) && seen.add(mv.id))
    .sort((a, b) => (p.types.includes(b.type) - p.types.includes(a.type)) || b.power - a.power);
}

// Recherche d'une attaque parmi celles que le Pokémon peut apprendre (STAB et puissance d'abord)
function MovePicker({ p, movesData, exclude, left, onPick, onClose }) {
  const { lang, t } = useLang();
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    const close = e => { if (!ref.current?.contains(e.target)) onClose(); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [onClose]);
  const options = useMemo(() => learnable(p, movesData), [p, movesData]);
  const query = norm(q.trim());
  const list = options.filter(mv => !exclude.includes(mv.id) && (!query || norm(mv.fr).includes(query) || norm(mv.en).includes(query))).slice(0, 6);
  return (
    <div ref={ref} className="grid gap-1 rounded-lg border border-accent bg-panel p-1.5">
      <input id={`move-pick-${p.id}`} autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder={t.movesSearch}
        onKeyDown={e => { if (e.key === "Enter" && list[0]) onPick(list[0].id); if (e.key === "Escape") onClose(); }}
        className="h-8 w-full rounded-md border border-line bg-sunk px-2 text-[0.8rem] focus:border-accent focus:outline-none" />
      <div className="flex items-center justify-between px-1 text-[0.68rem] text-faint">
        <span>{t.movesKeepOpen.replace("{n}", left)}</span>
        <button type="button" onClick={onClose} className="text-accent-ink hover:underline">{t.done}</button>
      </div>
      {list.map(mv => (
        <button key={mv.id} type="button" onClick={() => onPick(mv.id)} className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-left text-[0.76rem] hover:bg-sunk">
          <i className="size-2 flex-none rounded-full" style={{ background: TYPES[mv.type].col }} />
          <span className="min-w-0 flex-1 truncate">{moveName(mv, lang)}</span>
          <CategoryBadge cat={mv.cat} />
          <span className="font-mono text-[0.68rem] text-faint">{mv.power}</span>
        </button>
      ))}
    </div>
  );
}
