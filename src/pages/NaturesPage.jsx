import { useEffect, useState } from "react";
import { STAT_COL } from "../lib/data.js";
import { NATURES, natureFor } from "../lib/breeding.js";
import { useLang } from "../lib/i18n.js";
import { Icon } from "../components/ui.jsx";

// Les 5 stats touchées par les natures (les PV ne changent jamais)
const ROWS = ["atk", "def", "spa", "spd", "spe"];

export default function NaturesPage() {
  const { lang, t } = useLang();
  const [hover, setHover] = useState(null); // [plus, minus]
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.documentElement.style.setProperty("--h", 95);
    document.documentElement.style.setProperty("--cc", 0.1);
  }, []);

  const name = k => (lang === "fr" ? NATURES[k][2] : k);
  const other = k => (lang === "fr" ? k : NATURES[k][2]);
  const q = query.trim().toLowerCase();
  const match = k => !q || name(k).toLowerCase().includes(q) || other(k).toLowerCase().includes(q);

  return (
    <div className="mx-auto grid max-w-[980px] grid-cols-[minmax(0,1fr)] gap-7 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${t.naturesTitle} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5">
        <a href="#/" className="hidden h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg max-[860px]:inline-flex">{Icon.left}{t.back}</a>
      </div>
      <div className="max-w-[64ch]">
        <h1 className="text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-light leading-none tracking-[-0.045em]">{t.naturesTitle}</h1>
        <p className="mt-3 text-muted">{t.naturesIntro}</p>
      </div>

      <label className="relative max-w-[320px]">
        <span className="sr-only">{t.naturesSearch}</span>
        <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-faint">{Icon.search}</span>
        <input id="nature-search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t.naturesSearch}
          className="h-10 w-full rounded-[11px] border border-line bg-panel pl-[38px] pr-3 text-[0.92rem] focus:border-accent focus:outline-none" />
      </label>

      {/* Tableau : ligne = stat augmentée, colonne = stat diminuée */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-separate border-spacing-1.5 text-center">
          <thead>
            <tr>
              <th className="w-[110px] text-left align-bottom text-[0.72rem] font-medium leading-tight text-faint">
                <span className="text-[oklch(0.6_0.14_150)]">▲ {t.naturesUp}</span><br /><span className="text-[oklch(0.6_0.18_25)]">▼ {t.naturesDown} →</span>
              </th>
              {ROWS.map(m => (
                <th key={m} scope="col" className={`rounded-lg px-1 py-1.5 text-[0.8rem] font-medium ${hover?.[1] === m ? "text-fg" : "text-muted"}`}>
                  <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: STAT_COL[m] }} />−{t.short[m]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(p => (
              <tr key={p}>
                <th scope="row" className={`text-left text-[0.8rem] font-medium ${hover?.[0] === p ? "text-fg" : "text-muted"}`}>
                  <span className="inline-flex items-center gap-1.5"><i className="size-2 rounded-full" style={{ background: STAT_COL[p] }} />+{t.stats[p]}</span>
                </th>
                {ROWS.map(m => {
                  const neutral = p === m;
                  const k = neutral ? ["Hardy", "Docile", "Bashful", "Quirky", "Serious"][ROWS.indexOf(p)] : natureFor(p, m);
                  const lit = hover && (hover[0] === p || hover[1] === m);
                  const dim = !match(k);
                  return (
                    <td key={m}
                      onMouseEnter={() => setHover([p, m])} onMouseLeave={() => setHover(null)}
                      className={`rounded-xl border px-2 py-2.5 transition-colors ${neutral ? "border-dashed border-line bg-transparent" : lit ? "border-accent/50 bg-accent-soft" : "border-line bg-panel"} ${dim ? "opacity-25" : ""}`}>
                      <div className={`text-[0.92rem] ${neutral ? "text-faint" : "font-medium"}`}>{name(k)}</div>
                      <div className="text-[0.68rem] text-faint">{neutral ? t.neutral : other(k)}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Liste, pratique sur téléphone et pour la recherche */}
      <section className="grid gap-3">
        <h2 className="eyebrow">{t.naturesList}</h2>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
          {Object.keys(NATURES).filter(match).sort((a, b) => name(a).localeCompare(name(b), lang)).map(k => {
            const [up, down] = NATURES[k];
            return (
              <li key={k} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-panel px-3 py-2">
                <span className="grid">
                  <b className="text-[0.92rem] font-medium">{name(k)}</b>
                  <span className="text-[0.7rem] text-faint">{other(k)}</span>
                </span>
                {up ? (
                  <span className="grid text-right font-mono text-[0.74rem]">
                    <span className="text-[oklch(0.6_0.14_150)]">▲ {t.short[up]}</span>
                    <span className="text-[oklch(0.6_0.18_25)]">▼ {t.short[down]}</span>
                  </span>
                ) : <span className="text-[0.76rem] text-faint">{t.neutral}</span>}
              </li>
            );
          })}
        </ul>
      </section>
      <p className="max-w-[70ch] border-t border-line pt-4 text-[0.82rem] text-faint">{t.naturesNote}</p>
    </div>
  );
}
