// Accès à un spot : Centre Pokémon le plus proche, conseil Centre / Baies Mepo, CS nécessaires.
// Utilisé par les pages Hordes EV et Chasse shiny.
import { LOCATIONS } from "../lib/encounters.js";
import { useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { placeName } from "./RegionMap.jsx";
import { REGION_MAPS, accessPath, baseName, hasCenter } from "../data/maps.js";
import { hmName } from "../data/hms.js";

// Distance au Centre Pokémon le plus proche, en nombre de zones à traverser
export function centerInfo(locKey) {
  const loc = LOCATIONS[locKey];
  const base = baseName(loc.en);
  const map = REGION_MAPS[loc.region];
  const path = accessPath(loc.region, base);
  if (!path || !hasCenter(map.nodes[path[0]])) return null;
  const ferry = path.some((n, i) => i > 0 && map.edges.some(e => e.ferry && ((e.a === n && e.b === path[i - 1]) || (e.b === n && e.a === path[i - 1]))));
  const steps = path.length - 1;
  const advice = steps <= 1 && !ferry ? "center" : steps === 2 && !ferry ? "both" : "leppa";
  return { city: path[0], steps, ferry, advice };
}
// Bloc « Accès » : Centre le plus proche (avec conseil Centre / Baies Mepo) et CS nécessaires
export const ADV_STYLE = {
  center: "bg-[oklch(0.62_0.13_150/0.16)] text-[oklch(0.56_0.13_150)]",
  both: "bg-[oklch(0.75_0.13_80/0.2)] text-[oklch(0.6_0.12_70)]",
  leppa: "bg-[oklch(0.62_0.17_25/0.15)] text-[oklch(0.6_0.17_25)]",
};
export function CenterRow({ c, region }) {
  const { lang, t } = useLang();
  const ce = c.center;
  const label = !ce ? t.evCenterUnknown : ce.steps === 0 ? t.evCenterHere : t.evCenterAt(placeName(region, ce.city, lang), ce.steps);
  const adv = ce && { center: t.evAdvCenter, both: t.evAdvBoth, leppa: t.evAdvLeppa }[ce.advice];
  return (
    <a href={href({ page: "location", key: c.loc })} title={t.accessTitle} className="grid gap-1.5 rounded-xl border border-line px-3 py-2.5 text-[0.8rem] transition-colors hover:border-accent">
      <span className="flex items-center gap-2">
        <span className="eyebrow flex-1">{t.evAccess}</span>
        {adv && <span className={`flex-none rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${ADV_STYLE[ce.advice]}`}>{adv}</span>}
      </span>
      <span className="flex items-center gap-2 text-muted">
        {CROSS}
        <span className="min-w-0 flex-1 leading-snug">{label}{ce?.ferry ? ` · ${t.evFerry}` : ""}</span>
      </span>
      <span className="flex flex-wrap items-center gap-1.5 text-muted">
        <span className="w-[14px] flex-none text-center font-mono text-[0.62rem] font-semibold tracking-tight">{t.evHmLabel}</span>
        {c.hms.length ? c.hms.map(({ hm, opt }) => (
          <span key={hm} className={`rounded-md px-1.5 py-px text-[0.72rem] font-medium ${opt ? "border border-dashed border-line text-muted" : "bg-sunk text-fg"}`}>
            {hmName(hm, lang)}{opt ? ` (${t.hmOpt})` : ""}
          </span>
        )) : <span className="text-[0.76rem]">✓ {t.evNoHm}</span>}
      </span>
    </a>
  );
}
const CROSS = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="flex-none"><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><path d="M12 8v8M8 12h8" /></svg>;
