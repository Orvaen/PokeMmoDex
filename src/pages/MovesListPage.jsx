import { useEffect, useMemo, useState } from "react";
import { TYPES } from "../lib/data.js";
import { typeName, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { moveName, useMoves } from "../lib/moves.js";
import { useStored } from "../lib/storage.js";
import { Dropdown, Icon, TypePill } from "../components/ui.jsx";
import { CategoryBadge, Loading, TmBadge } from "../components/MoveBits.jsx";

// Toutes les capacités, avec un filtre CT/CS pour savoir qui peut apprendre une CT
export default function MovesListPage() {
  const { lang, t } = useLang();
  const data = useMoves();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [cat, setCat] = useState("");
  const [onlyTm, setOnlyTm] = useStored("onlyTm", false);
  const [sort, setSort] = useState("name");

  useEffect(() => {
    document.documentElement.style.setProperty("--h", type ? TYPES[type].h : 255);
    document.documentElement.style.setProperty("--cc", type ? Math.max(TYPES[type].c, 0.05) : 0.1);
  }, [type]);

  const rows = useMemo(() => {
    if (!data) return [];
    const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const query = norm(q.trim());
    const list = data.moves
      .map((mv, i) => ({ mv, n: new Set(data.learners[i].map(l => l.pid)).size }))
      .filter(({ mv }) => (!onlyTm || mv.tm) && (!type || mv.type === type) && (!cat || mv.cat === cat) && (!query || norm(mv.fr).includes(query) || norm(mv.en).includes(query)));
    const by = {
      name: (a, b) => moveName(a.mv, lang).localeCompare(moveName(b.mv, lang), lang),
      power: (a, b) => (b.mv.power ?? -1) - (a.mv.power ?? -1),
      learners: (a, b) => b.n - a.n,
    }[sort];
    return list.sort(by);
  }, [data, q, type, cat, onlyTm, sort, lang]);

  const chip = on => `h-8 rounded-full border px-3 text-[0.82rem] ${on ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:text-fg"}`;

  return (
    <div className="mx-auto grid max-w-[1040px] grid-cols-[minmax(0,1fr)] gap-6 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${t.movesTitle} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5">
        <a href="#/" className="hidden h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg max-[860px]:inline-flex">{Icon.left}{t.back}</a>
      </div>
      <div className="max-w-[64ch]">
        <h1 className="text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-light leading-none tracking-[-0.045em]">{t.movesTitle}</h1>
        <p className="mt-3 text-muted">{t.movesIntro}</p>
      </div>

      <div className="grid gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative w-[280px] max-w-full">
            <span className="sr-only">{t.movesSearch}</span>
            <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-faint">{Icon.search}</span>
            <input id="all-moves-search" value={q} onChange={e => setQ(e.target.value)} placeholder={t.movesSearch}
              className="h-10 w-full rounded-[11px] border border-line bg-panel pl-9 pr-3 text-[0.92rem] focus:border-accent focus:outline-none" />
          </label>
          <button type="button" aria-pressed={onlyTm} onClick={() => setOnlyTm(!onlyTm)}
            className={`inline-flex h-10 items-center gap-2 rounded-[11px] border px-3.5 text-[0.86rem] ${onlyTm ? "border-transparent bg-[oklch(0.62_0.13_255/0.16)] font-medium text-[oklch(0.45_0.13_255)]" : "border-line text-muted hover:text-fg"}`}>
            <TmBadge tm="tm" />{t.onlyTm}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Dropdown label={t.type} value={type} active={!!type} onChange={setType}
            options={[{ value: "", label: t.allTypes }, { sep: true }, ...Object.keys(TYPES).map(k => ({ value: k, label: typeName(k, lang), color: TYPES[k].col }))]} />
          {["P", "S", "N"].map(c => (
            <button key={c} type="button" aria-pressed={cat === c} className={chip(cat === c)} onClick={() => setCat(cat === c ? "" : c)}>
              <span className="inline-flex items-center gap-1.5"><CategoryBadge cat={c} />{t.cats[c]}</span>
            </button>
          ))}
          <Dropdown label={t.sortLbl} value={sort} active={sort !== "name"} onChange={setSort} align="right"
            options={[{ value: "name", label: t.sortName }, { value: "power", label: t.sortPower }, { value: "learners", label: t.sortLearners }]} />
          {data && <span className="ml-auto text-[0.8rem] text-faint">{t.movesFound(rows.length)}</span>}
        </div>
      </div>

      {!data ? <Loading /> : rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
          <table className="w-full min-w-[640px] text-left text-[0.88rem]">
            <thead>
              <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.09em] text-faint">
                <th className="px-3 py-2 font-medium">{t.moveCol}</th>
                <th className="px-2 py-2 font-medium">{t.type}</th>
                <th className="px-2 py-2 font-medium">{t.catCol}</th>
                <th className="px-2 py-2 text-right font-medium">{t.powerCol}</th>
                <th className="px-2 py-2 text-right font-medium">{t.accCol}</th>
                <th className="px-2 py-2 text-right font-medium">{t.ppCol}</th>
                <th className="px-3 py-2 text-right font-medium">{t.learnersCol}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ mv, n }) => (
                <tr key={mv.id} className="border-b border-line last:border-0 hover:bg-sunk">
                  <td className="px-3 py-1.5">
                    <a href={href({ page: "move", id: mv.id })} className="inline-flex items-center gap-1.5 font-medium hover:text-accent-ink">
                      {mv.tm && <TmBadge tm={mv.tm} />}{moveName(mv, lang)}
                    </a>
                  </td>
                  <td className="px-2 py-1.5"><TypePill t={mv.type} size="sm" /></td>
                  <td className="px-2 py-1.5"><CategoryBadge cat={mv.cat} /></td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">{mv.power === 1 ? t.varPower : mv.power ?? "—"}</td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">{mv.acc ?? "—"}</td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">{mv.pp}</td>
                  <td className="px-3 py-1.5 text-right">
                    <a href={href({ page: "move", id: mv.id })} className="font-mono tabular-nums text-accent-ink underline decoration-accent/30 underline-offset-4 hover:decoration-accent">{n}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="rounded-xl bg-sunk p-4 text-muted">{t.movesNone}</p>}
    </div>
  );
}
