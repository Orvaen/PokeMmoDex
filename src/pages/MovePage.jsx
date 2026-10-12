import { useEffect, useMemo, useState } from "react";
import { BY_ID, TYPES, pad } from "../lib/data.js";
import { nameOf, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { KINDS, moveName, useMoves } from "../lib/moves.js";
import { Icon, Sprite, TypePill } from "../components/ui.jsx";
import { CategoryBadge, Loading, TmBadge } from "../components/MoveBits.jsx";

export default function MovePage({ id }) {
  const { lang, t } = useLang();
  const data = useMoves();
  const [kind, setKind] = useState("all");
  const [q, setQ] = useState("");
  const [onlyObtainable, setOnlyObtainable] = useState(false);

  const idx = data?.byId.get(id);
  const mv = idx != null ? data.moves[idx] : null;

  useEffect(() => {
    if (!mv) return;
    document.documentElement.style.setProperty("--h", TYPES[mv.type].h);
    document.documentElement.style.setProperty("--cc", Math.max(TYPES[mv.type].c, 0.05));
  }, [mv]);

  // Un Pokémon par ligne, avec tous ses modes d'apprentissage
  const learners = useMemo(() => {
    if (!mv) return [];
    const byP = new Map();
    for (const l of data.learners[idx]) {
      const p = BY_ID.get(l.pid);
      if (!p) continue;
      if (!byP.has(p.id)) byP.set(p.id, { p, kinds: new Set(), level: null });
      const e = byP.get(p.id);
      e.kinds.add(l.kind);
      if (l.kind === "L") e.level = e.level == null ? l.level : Math.min(e.level, l.level);
    }
    return [...byP.values()].sort((a, b) => a.p.id - b.p.id);
  }, [mv, data, idx]);

  if (!data) return <Wrap><Loading /></Wrap>;
  if (!mv) return <Wrap><p className="py-16 text-center text-muted">{t.moveUnknown}</p></Wrap>;

  const counts = Object.fromEntries(KINDS.map(k => [k, learners.filter(l => l.kinds.has(k)).length]));
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const query = norm(q.trim());
  const shown = learners.filter(l =>
    (kind === "all" || l.kinds.has(kind)) &&
    (!onlyObtainable || l.p.obtainable) &&
    (!query || norm(l.p.fr).includes(query) || norm(l.p.en).includes(query) || String(l.p.id) === query)
  );
  const desc = mv.desc[lang] || mv.desc.en;
  const detail = lang === "fr" && mv.desc.en && mv.desc.en !== desc ? mv.desc.en : "";
  const chip = on => `h-8 rounded-full border px-3 text-[0.82rem] ${on ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:text-fg"}`;

  return (
    <Wrap>
      <title>{`${moveName(mv, lang)} · ${t.movesTitle} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5">
        <a href="#/capacites" className="inline-flex h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg">{Icon.left}{t.movesTitle}</a>
      </div>

      <div className="grid gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <TypePill t={mv.type} />
            <span className="inline-flex h-7 items-center rounded-full border border-line px-3"><CategoryBadge cat={mv.cat} withLabel /></span>
            {mv.tm && <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line px-3 text-[0.82rem]"><TmBadge tm={mv.tm} />{(mv.tm === "hm" ? t.hmLong : t.tmLong)} – {moveName(mv, lang)}</span>}
          </div>
          <h1 className="mt-3 text-balance text-[clamp(2.2rem,5.2vw,3.6rem)] font-light leading-none tracking-[-0.045em]">{moveName(mv, lang)}</h1>
          <p className="mt-1 text-faint">{lang === "fr" ? mv.en : mv.fr}</p>
        </div>
        <dl className="grid grid-cols-4 gap-px overflow-hidden rounded-2xl border border-line bg-line max-[520px]:grid-cols-2">
          {[[t.powerCol, mv.power === 1 ? t.varPower : mv.power ?? "—"], [t.accCol, mv.acc != null ? `${mv.acc} %` : "—"], [t.ppCol, mv.pp], [t.prioCol, mv.prio > 0 ? `+${mv.prio}` : mv.prio]].map(([k, v]) => (
            <div key={k} className="grid gap-0.5 bg-panel px-4 py-3"><dt className="eyebrow">{k}</dt><dd className="font-mono text-[1.4rem]">{v}</dd></div>
          ))}
        </dl>
        {(desc || detail) && (
          <div className="grid max-w-[70ch] gap-1.5">
            {desc && <p className="text-[0.98rem]">{desc}</p>}
            {detail && <p className="text-[0.84rem] text-faint"><b className="font-medium">{t.abilityDetail} :</b> {detail}</p>}
          </div>
        )}
      </div>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-[1.15rem] font-medium">{t.whoLearns(learners.length)}</h2>
          <label className="relative w-[240px] max-w-full">
            <span className="sr-only">{t.searchLabel}</span>
            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-faint">{Icon.search}</span>
            <input id="learner-search" value={q} onChange={e => setQ(e.target.value)} placeholder={t.search}
              className="h-9 w-full rounded-[10px] border border-line bg-panel pl-9 pr-3 text-[0.88rem] focus:border-accent focus:outline-none" />
          </label>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" aria-pressed={kind === "all"} className={chip(kind === "all")} onClick={() => setKind("all")}>{t.tutoAll} · {learners.length}</button>
          {KINDS.filter(k => counts[k]).map(k => (
            <button key={k} type="button" aria-pressed={kind === k} className={chip(kind === k)} onClick={() => setKind(k)}>{t.kindsShort[k]} · {counts[k]}</button>
          ))}
          <button type="button" aria-pressed={onlyObtainable} className={chip(onlyObtainable)} onClick={() => setOnlyObtainable(v => !v)}>{t.obtainable}</button>
        </div>
        {shown.length ? (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2">
            {shown.map(({ p, kinds, level }) => (
              <li key={p.id}>
                <a href={href({ page: "pokemon", id: p.id, tab: "capacites" })} className="flex items-center gap-2.5 rounded-xl border border-line bg-panel px-2.5 py-1.5 hover:border-accent">
                  <span className="grid size-11 flex-none place-items-center"><Sprite p={p} className="size-11" fallbackClass="size-5" /></span>
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className={`truncate text-[0.9rem] font-medium ${p.obtainable ? "" : "text-faint"}`}>{nameOf(p, lang)} <span className="font-mono text-[0.7rem] font-normal text-faint">#{pad(p.id)}</span></span>
                    <span className="flex flex-wrap gap-1">
                      {KINDS.filter(k => kinds.has(k)).map(k => (
                        <span key={k} className={`rounded-md px-1.5 py-px text-[0.68rem] font-medium ${k === "T" ? "bg-[oklch(0.62_0.13_255/0.14)] text-[oklch(0.5_0.13_255)]" : "bg-sunk text-muted"}`}>
                          {k === "L" ? t.levelAt(level) : k === "T" ? (mv.tm === "hm" ? t.hmShort : t.tmShort) : t.kindsShort[k]}
                        </span>
                      ))}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : <p className="rounded-xl bg-sunk p-4 text-muted">{t.noMatch}</p>}
      </section>
    </Wrap>
  );
}

function Wrap({ children }) {
  return <div className="mx-auto grid max-w-[1040px] grid-cols-[minmax(0,1fr)] gap-7 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">{children}</div>;
}
