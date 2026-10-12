import { useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { moveName } from "../lib/moves.js";
import { TypePill } from "./ui.jsx";

const CAT_STYLE = {
  P: { col: "oklch(0.66 0.16 45)", d: "M12 3 14.5 9.5 21 12 14.5 14.5 12 21 9.5 14.5 3 12 9.5 9.5z" },
  S: { col: "oklch(0.62 0.14 255)", d: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" },
  N: { col: "oklch(0.62 0.02 250)", d: "M5 12a7 7 0 1 0 14 0 7 7 0 0 0-14 0z" },
};

export function CategoryBadge({ cat, withLabel = false }) {
  const { t } = useLang();
  const s = CAT_STYLE[cat] || CAT_STYLE.N;
  return (
    <span title={t.cats[cat]} className="inline-flex items-center gap-1 text-[0.76rem] text-muted">
      <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true"><path d={s.d} fill={s.col} fillRule="evenodd" /></svg>
      {withLabel ? t.cats[cat] : <span className="sr-only">{t.cats[cat]}</span>}
    </span>
  );
}

export function TmBadge({ tm }) {
  const { t } = useLang();
  if (!tm) return null;
  return <span className="rounded-md bg-[oklch(0.62_0.13_255/0.14)] px-1.5 py-px text-[0.68rem] font-semibold text-[oklch(0.5_0.13_255)]">{tm === "hm" ? t.hmShort : t.tmShort}</span>;
}

/**
 * Tableau de capacités.
 * rows : [{ mv, extra }] — extra : contenu de la première colonne (niveau, CT…)
 * stab : types du Pokémon, pour signaler le bonus de même type
 */
export function MoveTable({ rows, extraLabel, stab = [] }) {
  const { lang, t } = useLang();
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
      <table className="w-full min-w-[560px] text-left text-[0.88rem]">
        <thead>
          <tr className="border-b border-line text-[0.7rem] uppercase tracking-[0.09em] text-faint">
            {extraLabel && <th className="w-[64px] px-3 py-2 font-medium">{extraLabel}</th>}
            <th className="px-3 py-2 font-medium">{t.moveCol}</th>
            <th className="px-2 py-2 font-medium">{t.type}</th>
            <th className="px-2 py-2 font-medium">{t.catCol}</th>
            <th className="px-2 py-2 text-right font-medium">{t.powerCol}</th>
            <th className="px-2 py-2 text-right font-medium">{t.accCol}</th>
            <th className="px-3 py-2 text-right font-medium">{t.ppCol}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ mv, extra }, i) => {
            const isStab = stab.includes(mv.type) && mv.cat !== "N";
            return (
              <tr key={mv.id + "-" + i} onClick={e => { if (!e.target.closest("a")) location.hash = href({ page: "move", id: mv.id }).slice(1); }} className="group cursor-pointer border-b border-line last:border-0 hover:bg-sunk">
                {extraLabel && <td className="px-3 py-1.5 font-mono text-[0.8rem] text-muted">{extra}</td>}
                <td className="px-3 py-1.5">
                  <a href={href({ page: "move", id: mv.id })} className="inline-flex items-center gap-1.5 font-medium underline decoration-line underline-offset-4 group-hover:text-accent-ink group-hover:decoration-accent">
                    {moveName(mv, lang)}
                    {isStab && <span title={t.stabHint} className="rounded bg-accent-soft px-1 text-[0.62rem] font-semibold text-accent-ink">STAB</span>}
                  </a>
                </td>
                <td className="px-2 py-1.5"><TypePill t={mv.type} size="sm" /></td>
                <td className="px-2 py-1.5"><CategoryBadge cat={mv.cat} /></td>
                <td className="px-2 py-1.5 text-right font-mono tabular-nums">{mv.power === 1 ? t.varPower : mv.power ?? "—"}</td>
                <td className="px-2 py-1.5 text-right font-mono tabular-nums">{mv.acc ?? "—"}</td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums">{mv.pp}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Loading({ label }) {
  const { t } = useLang();
  return (
    <div className="grid place-items-center gap-3 py-16 text-muted">
      <span className="anim-spin size-6 rounded-full border-2 border-line border-t-accent" />
      {label ?? t.loadingMoves}
    </div>
  );
}
