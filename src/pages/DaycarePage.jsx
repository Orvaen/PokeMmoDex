import { useEffect, useMemo } from "react";
import { BY_ID, TYPES } from "../lib/data.js";
import { breedInfo } from "../lib/breeding.js";
import { nameOf, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { Icon } from "../components/ui.jsx";
import DaycareSim from "./DaycareSim.jsx";

const START = 1; // Bulbizarre si rien n'est encore enregistré

// Outil « Pension » : le simulateur avec n'importe quels parents, sans passer par une fiche
export default function DaycarePage({ id }) {
  const { lang, t } = useLang();
  const d = t.dc;
  const p = BY_ID.get(id) || BY_ID.get(START);
  const info = useMemo(() => breedInfo(p), [p]);

  useEffect(() => {
    const ty = TYPES[p.types[0]];
    document.documentElement.style.setProperty("--h", ty.h);
    document.documentElement.style.setProperty("--cc", Math.max(ty.c, 0.08));
  }, [p.id]);

  const head = (
    <>
      <div className="flex items-center gap-2.5">
        <a href="#/" className="hidden h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg max-[860px]:inline-flex">{Icon.left}{t.back}</a>
      </div>
      <div className="max-w-[64ch]">
        <h1 className="text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-light leading-none tracking-[-0.045em]">{d.pageTitle}</h1>
        <p className="mt-3 text-[0.95rem] text-muted">{d.pageIntro}</p>
      </div>
    </>
  );
  // Lien vers l'arbre complet de l'espèce obtenue
  const footer = pair => pair.ok && pair.baby.eggGroups && !pair.baby.eggGroups.includes("ditto") && (
    <a href={href({ page: "pokemon", id: pair.baby.id, tab: "elevage" })} onClick={() => { try { localStorage.setItem("pmdex:breedMode", JSON.stringify("plan")); } catch { /* rien */ } }}
      className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-[0.88rem] hover:border-accent">
      <span><b className="font-medium">{d.toPlanner(nameOf(pair.baby, lang))}</b><span className="block text-[0.8rem] text-muted">{d.toPlannerHint}</span></span>
      <span className="text-accent-ink">{Icon.right}</span>
    </a>
  );

  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-7 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${d.pageTitle} · PokeMMO Dex`}</title>
      <meta name="description" content={d.pageIntro} />
      <DaycareSim key={id || "free"} p={p} info={info} head={head} storeKey="daycareTool" free={!id} footer={footer} />
    </div>
  );
}
