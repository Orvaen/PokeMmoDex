import { useMemo, useState } from "react";
import { Icon, Section } from "../components/ui.jsx";
import { Loading, MoveTable, TmBadge } from "../components/MoveBits.jsx";
import { useLang } from "../lib/i18n.js";
import { KINDS, moveName, useMoves } from "../lib/moves.js";

// Onglet « Capacités » d'un Pokémon
export default function MovesTab({ p }) {
  const { lang, t } = useLang();
  const data = useMoves();
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    if (!data) return [];
    const rows = data.learn[p.id] || [];
    const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const query = norm(q.trim());
    const out = {};
    for (const [idx, kind, level] of rows) {
      const mv = data.moves[idx];
      if (query && !norm(mv.fr).includes(query) && !norm(mv.en).includes(query)) continue;
      (out[kind] ||= []).push({ mv, level });
    }
    return KINDS.filter(k => out[k]).map(k => {
      const list = out[k];
      if (k === "L") list.sort((a, b) => a.level - b.level || moveName(a.mv, lang).localeCompare(moveName(b.mv, lang)));
      else list.sort((a, b) => moveName(a.mv, lang).localeCompare(moveName(b.mv, lang), lang));
      return { kind: k, list };
    });
  }, [data, p.id, q, lang]);

  if (!data) return <Loading />;
  const total = (data.learn[p.id] || []).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-balance text-[clamp(1.7rem,3.6vw,2.5rem)] font-light leading-[1.05] tracking-[-0.04em]">{t.movesOf}</h1>
          <p className="mt-1 text-[0.86rem] text-muted">{t.movesCount(total)}</p>
        </div>
        <label className="relative w-[260px] max-w-full">
          <span className="sr-only">{t.movesSearch}</span>
          <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-faint">{Icon.search}</span>
          <input id="moves-search" value={q} onChange={e => setQ(e.target.value)} placeholder={t.movesSearch}
            className="h-10 w-full rounded-[11px] border border-line bg-panel pl-9 pr-3 text-[0.9rem] focus:border-accent focus:outline-none" />
        </label>
      </div>
      {groups.length ? groups.map(({ kind, list }) => (
        <Section key={kind} title={t.kinds[kind]} aside={String(list.length)}>
          <MoveTable
            stab={p.types}
            extraLabel={kind === "L" ? t.levelShort : kind === "T" ? t.tmCol : null}
            rows={list.map(({ mv, level }) => ({ mv, extra: kind === "L" ? level : kind === "T" ? <TmBadge tm={mv.tm || "tm"} /> : null }))}
          />
        </Section>
      )) : <p className="rounded-xl bg-sunk p-4 text-muted">{t.movesNone}</p>}
      <p className="text-[0.78rem] text-faint">{t.movesNote}</p>
    </>
  );
}
