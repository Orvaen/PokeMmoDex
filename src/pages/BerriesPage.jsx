import { useEffect, useMemo, useState } from "react";
import { STAT_COL, norm } from "../lib/data.js";
import { useLang } from "../lib/i18n.js";
import { Icon } from "../components/ui.jsx";
import DATA from "../data/berries.json";

// Familles de Baies (par nom anglais) ; les Baies EV indiquent la stat qu'elles baissent
const EV_STAT = { "Pomeg Berry": "hp", "Kelpsy Berry": "atk", "Qualot Berry": "def", "Hondew Berry": "spa", "Grepa Berry": "spd", "Tamato Berry": "spe" };
const GROUPS = {
  ev: Object.keys(EV_STAT),
  pp: ["Leppa Berry"],
  hp: ["Oran Berry", "Sitrus Berry", "Figy Berry", "Wiki Berry", "Mago Berry", "Aguav Berry", "Iapapa Berry", "Enigma Berry"],
  status: ["Cheri Berry", "Chesto Berry", "Pecha Berry", "Rawst Berry", "Aspear Berry", "Persim Berry", "Lum Berry"],
  resist: ["Occa", "Passho", "Wacan", "Rindo", "Yache", "Chople", "Kebia", "Shuca", "Coba", "Payapa", "Tanga", "Charti", "Kasib", "Haban", "Colbur", "Babiri", "Chilan"].map(x => x + " Berry"),
  battle: ["Liechi", "Ganlon", "Salac", "Petaya", "Apicot", "Starf", "Lansat", "Micle", "Custap", "Jaboca", "Rowap"].map(x => x + " Berry"),
};
const groupOf = en => Object.keys(GROUPS).find(g => GROUPS[g].includes(en)) || "other";
const ORDER = ["ev", "pp", "hp", "status", "resist", "battle", "other"];

// Couleur de chaque goût
const FLAVOR_COL = { spicy: "oklch(0.64 0.19 30)", dry: "oklch(0.6 0.14 255)", sweet: "oklch(0.7 0.15 350)", bitter: "oklch(0.62 0.14 150)", sour: "oklch(0.78 0.15 95)" };

const BERRIES = DATA.berries.map(b => ({ ...b, group: groupOf(b.en), slug: b.en.toLowerCase().replace(/\s+/g, "-") }))
  .sort((a, b) => ORDER.indexOf(a.group) - ORDER.indexOf(b.group) || a.id - b.id);

export default function BerriesPage({ group: initialGroup }) {
  const { lang, t } = useLang();
  const [group, setGroup] = useState(ORDER.includes(initialGroup) ? initialGroup : "");
  const [query, setQuery] = useState("");
  useEffect(() => setGroup(ORDER.includes(initialGroup) ? initialGroup : ""), [initialGroup]);
  useEffect(() => {
    document.documentElement.style.setProperty("--h", 350);
    document.documentElement.style.setProperty("--cc", 0.1);
  }, []);

  const q = norm(query.trim());
  const list = useMemo(() => BERRIES.filter(b => (!group || b.group === group) && (!q || norm(b.fr).includes(q) || norm(b.en).includes(q) || norm(b.desc.fr || "").includes(q) || norm(b.desc.en).includes(q))), [group, q]);
  const counts = Object.fromEntries(ORDER.map(g => [g, BERRIES.filter(b => b.group === g).length]));

  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-7 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${t.berriesTitle} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5">
        <a href="#/" className="hidden h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg max-[860px]:inline-flex">{Icon.left}{t.back}</a>
      </div>
      <div className="max-w-[66ch]">
        <h1 className="text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-light leading-none tracking-[-0.045em]">{t.berriesTitle}</h1>
        <p className="mt-3 text-muted">{t.berriesIntro}</p>
      </div>

      <div className="grid gap-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.berriesGroups}>
          {["", ...ORDER].map(g => (
            <button key={g || "all"} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}
              className={`h-8 rounded-full border px-3 text-[0.82rem] transition-colors ${group === g ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line text-muted hover:text-fg"}`}>
              {g ? t.berryGroups[g] : t.berriesAll} <span className="ml-0.5 font-mono text-[0.72rem] opacity-60">{g ? counts[g] : BERRIES.length}</span>
            </button>
          ))}
        </div>
        <label className="relative max-w-[340px]">
          <span className="sr-only">{t.berriesSearch}</span>
          <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-faint">{Icon.search}</span>
          <input id="berry-search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t.berriesSearch}
            className="h-10 w-full rounded-[11px] border border-line bg-panel pl-[38px] pr-3 text-[0.92rem] focus:border-accent focus:outline-none" />
        </label>
      </div>

      {list.length ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
          {list.map(b => <BerryCard key={b.id} b={b} />)}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-6 text-center text-muted">{t.berriesNone}</p>
      )}

      <div className="grid max-w-[70ch] gap-2 border-t border-line pt-4 text-[0.82rem] text-faint">
        <p>{t.berriesHow}</p>
        <p>{t.berriesSource}</p>
      </div>
    </div>
  );
}

function BerryIcon({ b }) {
  const [ok, setOk] = useState(true);
  const main = Object.entries(b.flavor).sort((x, y) => y[1] - x[1])[0][0];
  return (
    <span className="grid size-12 flex-none place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${FLAVOR_COL[main]} 16%, var(--panel))` }}>
      {ok ? <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${b.slug}.png`} alt="" loading="lazy" decoding="async" className="pixel size-9 object-contain" onError={() => setOk(false)} />
        : <span className="size-5 rounded-full" style={{ background: FLAVOR_COL[main] }} />}
    </span>
  );
}

function BerryCard({ b }) {
  const { lang, t } = useLang();
  const ev = EV_STAT[b.en];
  const recipe = b.recipes[0];
  const seedName = ([f, v]) => DATA.seeds[f + v][lang === "fr" ? "fr" : "en"].replace(/^Graine |\s?Seed$/g, "");
  return (
    <li>
      <article className="grid h-full content-start gap-3 rounded-2xl border border-line bg-panel p-4">
        <header className="flex items-start gap-3">
          <BerryIcon b={b} />
          <div className="min-w-0 flex-1">
            <h2 className="text-[1.02rem] font-medium leading-snug">{lang === "fr" ? b.fr : b.en}</h2>
            <p className="text-[0.76rem] text-faint">{lang === "fr" ? b.en : b.fr}</p>
          </div>
          <span className="flex-none rounded-full bg-sunk px-2.5 py-1 text-[0.7rem] font-medium text-muted">{t.berryGroups[b.group]}</span>
        </header>

        {ev && (
          <p className="rounded-xl px-3 py-2 text-[0.88rem] font-medium" style={{ background: `color-mix(in oklab, ${STAT_COL[ev]} 16%, var(--panel))` }}>
            {t.berryEv(t.stats[ev])}
          </p>
        )}
        <p className="text-[0.86rem] leading-relaxed text-muted">{(lang === "fr" && b.desc.fr) || b.desc.en}</p>

        <div className="grid gap-1.5 rounded-xl border border-line p-2.5">
          <span className="eyebrow">{t.berryRecipe}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {recipe.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[0.78rem] font-medium"
                style={{ background: `color-mix(in oklab, ${FLAVOR_COL[s[0]]} ${s[1] === 2 ? 30 : 15}%, var(--panel))` }}>
                <span className="flex gap-0.5">{Array.from({ length: s[1] }, (_, k) => <i key={k} className="size-1.5 rounded-full" style={{ background: FLAVOR_COL[s[0]] }} />)}</span>
                {seedName(s)}
              </span>
            ))}
          </div>
        </div>

        <p className="flex flex-wrap gap-x-4 gap-y-1 text-[0.78rem] text-muted">
          <span>{t.berryGrow(b.grow)}</span>
          <span>{t.berryHarvest(b.harvest[0], b.harvest[1])}</span>
        </p>
      </article>
    </li>
  );
}
