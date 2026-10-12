import { useEffect, useMemo, useState } from "react";
import { ALL, abilityInfo, norm, pad } from "../lib/data.js";
import { abilName } from "../lib/breeding.js";
import { nameOf, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { Icon, Sprite, TypePill } from "../components/ui.jsx";

// Talent → Pokémon qui l'ont (emplacement 3 = talent caché)
export const HOLDERS = (() => {
  const map = new Map();
  for (const p of ALL) p.abilities.forEach((a, i) => {
    if (!a) return;
    if (!map.has(a)) map.set(a, []);
    const list = map.get(a);
    const cur = list.find(x => x.p === p);
    if (cur) cur.hidden &&= i === 2;
    else list.push({ p, hidden: i === 2 });
  });
  return map;
})();

const backBtn = "hidden h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg max-[860px]:inline-flex";
const chip = on => `h-8 rounded-full border px-3 text-[0.82rem] ${on ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:text-fg"}`;
const descOf = (name, lang) => { const i = abilityInfo(name); return i?.desc?.[lang] || i?.desc?.en || ""; };

// Liste de tous les talents
export function AbilitiesListPage() {
  const { lang, t } = useLang();
  const [q, setQ] = useState("");
  useEffect(() => {
    document.documentElement.style.setProperty("--h", 200);
    document.documentElement.style.setProperty("--cc", 0.08);
  }, []);
  const rows = useMemo(() => {
    const query = norm(q.trim());
    return [...HOLDERS.entries()]
      .map(([name, list]) => ({ name, list, label: abilName(name, lang) }))
      .filter(r => !query || norm(r.label).includes(query) || norm(r.name).includes(query) || norm(descOf(r.name, lang)).includes(query))
      .sort((a, b) => a.label.localeCompare(b.label, lang));
  }, [q, lang]);
  return (
    <div className="mx-auto grid max-w-[1000px] grid-cols-[minmax(0,1fr)] gap-6 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${t.abilitiesTitle} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5"><a href="#/" className={backBtn}>{Icon.left}{t.back}</a></div>
      <div className="max-w-[64ch]">
        <h1 className="text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-light leading-none tracking-[-0.045em]">{t.abilitiesTitle}</h1>
        <p className="mt-3 text-muted">{t.abilitiesIntro}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative w-full max-w-[340px]">
          <span className="sr-only">{t.abilitiesSearch}</span>
          <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-faint">{Icon.search}</span>
          <input id="ability-search" value={q} onChange={e => setQ(e.target.value)} placeholder={t.abilitiesSearch}
            className="h-10 w-full rounded-[11px] border border-line bg-panel pl-[38px] pr-3 text-[0.92rem] focus:border-accent focus:outline-none" />
        </label>
        <span className="ml-auto text-[0.8rem] text-faint">{t.abilitiesCount(rows.length)}</span>
      </div>
      <ul className="grid gap-1.5">
        {rows.map(r => (
          <li key={r.name}>
            <a href={href({ page: "ability", name: r.name })} className="grid grid-cols-[minmax(150px,220px)_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-line bg-panel px-4 py-2.5 hover:border-accent max-[640px]:grid-cols-[minmax(0,1fr)_auto]">
              <span className="truncate font-medium">{r.label}</span>
              <span className="truncate text-[0.84rem] text-muted max-[640px]:hidden">{descOf(r.name, lang) || t.abilityCustom}</span>
              <span className="whitespace-nowrap font-mono text-[0.74rem] text-faint">{t.abilityHolders(r.list.length)}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Page d'un talent : description et tous les Pokémon qui l'ont
export default function AbilityPage({ name }) {
  const { lang, t } = useLang();
  const [onlyOk, setOnlyOk] = useState(false);
  const [mode, setMode] = useState(""); // "" tous, "normal", "hidden"
  useEffect(() => {
    document.documentElement.style.setProperty("--h", 200);
    document.documentElement.style.setProperty("--cc", 0.08);
  }, []);
  const list = HOLDERS.get(name);
  if (!list) return <p className="p-8 text-muted">{t.notFound}</p>;
  const info = abilityInfo(name);
  const desc = descOf(name, lang);
  const detail = lang === "fr" && info?.desc?.en && info.desc.en !== desc ? info.desc.en : "";
  const shown = list.filter(x => (!onlyOk || x.p.obtainable) && (!mode || (mode === "hidden") === x.hidden)).sort((a, b) => a.p.id - b.p.id);
  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-6 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${abilName(name, lang)} · ${t.abilitiesTitle} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5">
        <a href="#/talents" className="inline-flex h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg">{Icon.left}{t.abilitiesTitle}</a>
      </div>
      <div className="grid max-w-[70ch] gap-3">
        <p className="eyebrow">{t.abilityEyebrow}</p>
        <h1 className="text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-light leading-none tracking-[-0.045em]">
          {abilName(name, lang)}
          {lang === "fr" && info?.fr && <span className="ml-3 align-middle text-[1rem] font-normal tracking-normal text-faint">{name}</span>}
        </h1>
        <p className="text-[1.02rem] text-muted">{desc || t.abilityCustom}</p>
        {detail && <p className="text-[0.86rem] text-faint"><b className="font-medium">{t.abilityDetail} :</b> {detail}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {[["", t.abilityAll], ["normal", t.abilityNormal], ["hidden", t.abilityHiddenOnly]].map(([v, l]) => (
          <button key={v || "all"} type="button" aria-pressed={mode === v} onClick={() => setMode(v)} className={chip(mode === v)}>{l}</button>
        ))}
        <button type="button" aria-pressed={onlyOk} onClick={() => setOnlyOk(v => !v)} className={chip(onlyOk)}>{t.obtainable}</button>
        <span className="ml-auto text-[0.8rem] text-faint">{t.abilityHolders(shown.length)}</span>
      </div>
      {!shown.length && <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">{t.abilityNone}</p>}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-2">
        {shown.map(({ p, hidden }) => (
          <li key={p.id}>
            <a href={href({ page: "pokemon", id: p.id })} className={`flex items-center gap-2.5 rounded-xl border border-line bg-panel py-1.5 pl-1.5 pr-3 hover:border-accent ${p.obtainable ? "" : "opacity-55"}`}>
              <span className="grid size-12 flex-none place-items-center"><Sprite p={p} className="size-12" fallbackClass="size-6" /></span>
              <span className="grid min-w-0 flex-1 gap-1">
                <span className="truncate text-[0.9rem] font-medium">{nameOf(p, lang)} <span className="font-mono text-[0.7rem] font-normal text-faint">#{pad(p.id)}</span></span>
                <span className="flex flex-wrap gap-1">
                  {p.types.map(ty => <TypePill key={ty} t={ty} size="sm" />)}
                  {hidden && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.68rem] font-medium text-accent-ink">{t.hidden}</span>}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
