import { useEffect } from "react";
import { ENCOUNTERS, LOCATIONS, METHODS, TYPES, pad } from "../lib/data.js";
import { locName, nameOf, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { Icon, Section, Sprite, TypePill } from "../components/ui.jsx";
import { RarityChip } from "./LocationsTab.jsx";
import RegionMap, { BASE_INDEX, MapLegend, placeName } from "../components/RegionMap.jsx";
import { REGION_MAPS, accessPath, baseName } from "../data/maps.js";
import { hmName, hmsFor } from "../data/hms.js";

// Liens vers la page du lieu sur Poképédia (FR) et Bulbapedia (EN), qui montrent la vraie carte du jeu.
// On ne copie pas leurs images : on y renvoie.
const REGION_FR = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unys"];
const REGION_EN = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova"];
function wikiLinks(loc) {
  const en = baseName(loc.en), fr = baseName(loc.fr);
  const route = en.match(/^Route (\d+)$/);
  const q = route ? { fr: `Route ${route[1]} (${REGION_FR[loc.region]})`, en: `${REGION_EN[loc.region]} Route ${route[1]}` } : { fr, en: en.replace(/ Of /g, " of ") };
  return {
    pokepedia: `https://www.pokepedia.fr/index.php?search=${encodeURIComponent(q.fr)}&go=Lire`,
    bulbapedia: `https://bulbapedia.bulbagarden.net/w/index.php?search=${encodeURIComponent(q.en)}&go=Go`,
  };
}

// Carte de la région avec le lieu, et le chemin depuis le Centre Pokémon le plus proche
function AccessMap({ locKey, loc }) {
  const { lang, t } = useLang();
  const base = baseName(loc.en);
  const path = accessPath(loc.region, base);
  if (!path) return null;
  const map = REGION_MAPS[loc.region];
  const ferry = path.some((n, i) => i > 0 && map.edges.some(e => e.ferry && ((e.a === n && e.b === path[i - 1]) || (e.b === n && e.a === path[i - 1]))));
  const variants = (BASE_INDEX[loc.region][base] || []).filter(k => k !== locKey);
  const hms = hmsFor(locKey);
  return (
    <section className="grid grid-cols-[minmax(0,1fr)_minmax(240px,300px)] items-start gap-4 max-[1000px]:grid-cols-1">
      <div className="grid gap-2 rounded-2xl border border-line bg-panel p-3">
        <div className="overflow-x-auto"><RegionMap region={loc.region} focus={base} path={path} className="max-[640px]:min-w-[600px]" /></div>
        <MapLegend />
      </div>
      <div className="grid gap-4">
        <div className="rounded-2xl border border-line bg-panel p-4">
          <h2 className="eyebrow mb-3">{t.accessTitle}</h2>
          {path.length === 1 ? (
            <p className="text-[0.9rem] text-muted">{t.accessIsCity}</p>
          ) : (
            <>
              <p className="mb-3 text-[0.9rem] text-muted">{t.accessFrom(placeName(loc.region, path[0], lang))}</p>
              <ol className="grid gap-0">
                {path.map((n, i) => {
                  const keys = BASE_INDEX[loc.region][n];
                  const last = i === path.length - 1;
                  const label = placeName(loc.region, n, lang);
                  return (
                    <li key={n} className="relative grid grid-cols-[18px_minmax(0,1fr)] items-center gap-2.5 py-1.5">
                      {!last && <span className="absolute left-[8px] top-[22px] h-[calc(100%-8px)] w-0.5 bg-accent/35" />}
                      <span className={`relative z-[1] size-[18px] rounded-full border-2 ${last ? "border-accent bg-accent" : "border-accent bg-panel"}`} />
                      {keys && !last ? (
                        <a href={href({ page: "location", key: keys[0] })} className="truncate text-[0.9rem] hover:text-accent-ink">{label}</a>
                      ) : (
                        <span className={`truncate text-[0.9rem] ${last ? "font-medium" : ""}`}>{label}</span>
                      )}
                    </li>
                  );
                })}
              </ol>
              {ferry && <p className="mt-2 text-[0.8rem] text-faint">{t.ferryNote}</p>}
            </>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3 text-[0.84rem]">
            <span className="mr-1 text-muted">{t.evHmLabel}</span>
            {hms.length ? hms.map(({ hm, opt }) => (
              <span key={hm} className={`rounded-md px-2 py-0.5 text-[0.78rem] font-medium ${opt ? "border border-dashed border-line text-muted" : "bg-sunk"}`}>{hmName(hm, lang)}{opt ? ` (${t.hmOpt})` : ""}</span>
            )) : <span className="text-muted">✓ {t.evNoHm}</span>}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-4">
          <h2 className="eyebrow mb-2">{t.realMapTitle}</h2>
          <p className="mb-3 text-[0.84rem] text-muted">{t.realMapText}</p>
          <div className="flex flex-wrap gap-2">
            {(lang === "fr" ? ["pokepedia", "bulbapedia"] : ["bulbapedia", "pokepedia"]).map((k, i) => (
              <a
                key={k}
                href={wikiLinks(loc)[k]}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[0.84rem] ${i === 0 ? "bg-fg font-medium text-bg hover:bg-accent-ink" : "border border-line text-fg hover:border-accent"}`}
              >
                {k === "pokepedia" ? "Poképédia" : "Bulbapedia"} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
        {variants.length > 0 && (
          <div className="rounded-2xl border border-line bg-panel p-4">
            <h2 className="eyebrow mb-3">{t.otherTimes}</h2>
            <div className="flex flex-wrap gap-1.5">
              {variants.map(k => (
                <a key={k} href={href({ page: "location", key: k })} className="rounded-full bg-sunk px-3 py-1 text-[0.82rem] text-muted hover:text-fg">{locName(LOCATIONS[k], lang)}</a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function LocationPage({ locKey }) {
  const { lang, t } = useLang();
  const loc = LOCATIONS[locKey];
  const list = ENCOUNTERS[locKey] || [];

  // Teinte du lieu : celle du type le plus présent
  useEffect(() => {
    if (!list.length) return;
    const count = {};
    list.forEach(e => (count[e.p.types[0]] = (count[e.p.types[0]] || 0) + 1));
    const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
    document.documentElement.style.setProperty("--h", TYPES[top].h);
    document.documentElement.style.setProperty("--cc", Math.max(TYPES[top].c, 0.05));
  }, [locKey]);

  if (!loc) {
    return (
      <div className="grid h-full place-items-center p-8 text-center text-muted">
        <div><p>{t.unknownLocation}</p><a className="mt-3 inline-block text-accent-ink underline" href="#/">{t.home}</a></div>
      </div>
    );
  }

  const byMethod = new Map();
  for (const e of [...list].sort((a, b) => a.rarity - b.rarity || a.min - b.min || a.p.id - b.p.id)) {
    if (!byMethod.has(e.method)) byMethod.set(e.method, []);
    byMethod.get(e.method).push(e);
  }
  const name = locName(loc, lang);

  return (
    <div className="mx-auto grid max-w-[980px] grid-cols-[minmax(0,1fr)] gap-8 px-8 pb-14 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${name} · ${t.regions[loc.region]} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5">
        <button type="button" onClick={() => history.back()} className="inline-flex h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg">
          {Icon.left}{t.back}
        </button>
        <span className="font-mono text-[0.78rem] text-muted">{t.locationPage} · {t.regions[loc.region]}</span>
      </div>

      <div className="flex items-end gap-4">
        <span className="grid size-[76px] flex-none place-items-center rounded-[20px] bg-accent-soft text-accent-ink [&_svg]:size-8">{Icon.pin}</span>
        <div>
          <h1 className="text-balance text-[clamp(1.9rem,4.4vw,3.2rem)] font-light leading-none tracking-[-0.045em]">{name}</h1>
          <p className="mt-1.5 text-muted">{lang === "fr" ? loc.en : loc.fr} · {t.encountersHere(new Set(list.map(e => e.p.id)).size)}</p>
        </div>
      </div>

      <AccessMap locKey={locKey} loc={loc} />

      {[...byMethod.entries()].map(([method, rows]) => (
        <Section key={method} title={t.methods[METHODS[method]] || METHODS[method]} aside={String(rows.length)}>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2">
            {rows.map((e, i) => (
              <li key={i}>
                <a href={href({ page: "pokemon", id: e.p.id, tab: "lieux" })} className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-3 py-2 hover:border-accent">
                  <span className="grid size-12 flex-none place-items-center"><Sprite p={e.p} className="size-12" /></span>
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className="flex items-baseline gap-2">
                      <span className="truncate font-medium">{nameOf(e.p, lang)}</span>
                      <span className="font-mono text-[0.72rem] text-faint">#{pad(e.p.id)}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <RarityChip r={e.rarity} />
                      <span className="font-mono text-[0.74rem] text-faint">{t.levels(e.min, e.max)}</span>
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1">{e.p.types.map(ty => <TypePill key={ty} t={ty} size="sm" />)}</span>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      ))}
    </div>
  );
}
