import { useState } from "react";
import { BY_ID } from "../lib/data.js";
import { nameOf, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { Sprite } from "./ui.jsx";

// « Tenu par » : Pokémon sauvages qui peuvent porter l'objet (à voler avec Larcin, Pickpocket…)
export default function Holders({ ids, max = 6 }) {
  const { lang, t } = useLang();
  const [all, setAll] = useState(false);
  const list = ids.map(id => BY_ID.get(id)).filter(Boolean);
  if (!list.length) return <p className="text-[0.76rem] text-faint">{t.heldByNone}</p>;
  const shown = all ? list : list.slice(0, max);
  return (
    <div className="grid gap-1">
      <span className="text-[0.74rem] text-faint">{t.heldBy}</span>
      <div className="flex flex-wrap gap-1">
        {shown.map(p => (
          <a key={p.id} href={href({ page: "pokemon", id: p.id })} className={`inline-flex items-center gap-1 rounded-full border border-line bg-panel py-0.5 pl-0.5 pr-2 text-[0.76rem] hover:border-accent ${p.obtainable ? "" : "opacity-55"}`}>
            <span className="grid size-6 place-items-center"><Sprite p={p} className="size-6" fallbackClass="size-3" /></span>
            {nameOf(p, lang)}
          </a>
        ))}
        {list.length > max && !all && (
          <button type="button" onClick={() => setAll(true)} className="rounded-full px-2 text-[0.76rem] text-accent-ink hover:underline">+{list.length - max}</button>
        )}
      </div>
    </div>
  );
}
