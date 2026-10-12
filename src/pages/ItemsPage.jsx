import { useEffect, useMemo, useState } from "react";
import { TYPES, norm } from "../lib/data.js";
import { typeName, useLang } from "../lib/i18n.js";
import { Icon, TypePill } from "../components/ui.jsx";
import Holders from "../components/Holders.jsx";
import DATA from "../data/items.json";

const KINDS = ["item", "plate", "incense", "gem"];
// Noms des images PokeAPI quand ils diffèrent du nom du jeu
const SLUG = { Silverpowder: "silver-powder", SilverPowder: "silver-powder", Blackglasses: "black-glasses", BlackGlasses: "black-glasses", Nevermeltice: "never-melt-ice", NeverMeltIce: "never-melt-ice", Twistedspoon: "twisted-spoon", TwistedSpoon: "twisted-spoon" };
const slug = en => SLUG[en] || en.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function ItemsPage() {
  const { lang, t } = useLang();
  const [type, setType] = useState("");
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    document.documentElement.style.setProperty("--h", type ? TYPES[type].h : 60);
    document.documentElement.style.setProperty("--cc", type ? Math.max(TYPES[type].c, 0.05) : 0.08);
  }, [type]);

  const query = norm(q.trim());
  const groups = useMemo(() => {
    const list = DATA.typeBoost.filter(i => (!type || i.type === type) && (!kind || i.kind === kind) && (!query || norm(i.fr).includes(query) || norm(i.en).includes(query)));
    const by = new Map();
    for (const i of list) { if (!by.has(i.type)) by.set(i.type, []); by.get(i.type).push(i); }
    return [...by.entries()];
  }, [type, kind, query]);
  const chip = on => `h-8 rounded-full border px-3 text-[0.82rem] ${on ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:text-fg"}`;

  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-7 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${t.itemsTitle} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5">
        <a href="#/" className="hidden h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg max-[860px]:inline-flex">{Icon.left}{t.back}</a>
      </div>
      <div className="max-w-[66ch]">
        <h1 className="text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-light leading-none tracking-[-0.045em]">{t.itemsTitle}</h1>
        <p className="mt-3 text-muted">{t.itemsIntro}</p>
      </div>

      <div className="grid gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.type}>
          <button type="button" aria-pressed={!type} onClick={() => setType("")} className={chip(!type)}>{t.allTypes}</button>
          {Object.keys(TYPES).map(k => (
            <button key={k} type="button" aria-pressed={type === k} onClick={() => setType(type === k ? "" : k)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[0.82rem] ${type === k ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:text-fg"}`}>
              <i className="size-2 rounded-full" style={{ background: TYPES[k].col }} />{typeName(k, lang)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" aria-pressed={!kind} onClick={() => setKind("")} className={chip(!kind)}>{t.itemKindAll}</button>
          {KINDS.map(k => <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(kind === k ? "" : k)} className={chip(kind === k)}>{t.itemKinds[k]}</button>)}
          <label className="relative ml-auto w-full max-w-[260px]">
            <span className="sr-only">{t.itemsSearch}</span>
            <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-faint">{Icon.search}</span>
            <input id="item-search" value={q} onChange={e => setQ(e.target.value)} placeholder={t.itemsSearch}
              className="h-9 w-full rounded-[10px] border border-line bg-panel pl-[38px] pr-3 text-[0.88rem] focus:border-accent focus:outline-none" />
          </label>
        </div>
      </div>

      {groups.length ? groups.map(([ty, list]) => (
        <section key={ty} className="grid gap-3">
          <h2 className="flex items-center gap-2"><TypePill t={ty} /><span className="text-[0.8rem] text-faint">{t.itemsFor(list.length)}</span></h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
            {list.map(i => <ItemCard key={i.en} i={i} />)}
          </ul>
        </section>
      )) : <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">{t.itemsNone}</p>}

      <div className="grid max-w-[70ch] gap-2 border-t border-line pt-4 text-[0.82rem] text-faint">
        <p>{t.itemsNote}</p>
        <p>{t.itemsSource}</p>
      </div>
    </div>
  );
}

function ItemCard({ i }) {
  const { lang, t } = useLang();
  const [ok, setOk] = useState(true);
  const col = TYPES[i.type].col;
  return (
    <li>
      <article className="grid h-full content-start gap-3 rounded-2xl border border-line bg-panel p-4">
        <header className="flex items-start gap-3">
          <span className="grid size-12 flex-none place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${col} 16%, var(--panel))` }}>
            {ok ? <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${slug(i.en)}.png`} alt="" loading="lazy" decoding="async" className="pixel size-9 object-contain" onError={() => setOk(false)} />
              : <span className="size-5 rounded-full" style={{ background: col }} />}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[1.02rem] font-medium leading-snug">{lang === "fr" ? i.fr : i.en}</h3>
            <p className="text-[0.76rem] text-faint">{lang === "fr" ? i.en : i.fr} · {t.itemKinds[i.kind]}</p>
          </div>
          <span className="flex-none rounded-full px-2.5 py-1 font-mono text-[0.8rem] font-medium" style={{ background: `color-mix(in oklab, ${col} 22%, var(--panel))` }}>+{i.pct} %</span>
        </header>
        {i.consumed && <p className="rounded-lg bg-sunk px-2.5 py-1.5 text-[0.78rem] text-muted">{t.itemConsumed}</p>}
        <p className="text-[0.86rem] leading-relaxed text-muted">{(lang === "fr" && i.desc.fr) || i.desc.en}</p>
        <Holders ids={i.holders} />
      </article>
    </li>
  );
}
