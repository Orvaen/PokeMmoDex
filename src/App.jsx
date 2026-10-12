import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { ALL, BY_ID, TYPES, norm, pad } from "./lib/data.js";
import { LangContext, STRINGS, nameOf, useLang } from "./lib/i18n.js";
import { useRoute } from "./lib/router.js";
import { useStored } from "./lib/storage.js";
import Sidebar from "./components/Sidebar.jsx";
import PokemonPage from "./pages/PokemonPage.jsx";
const LocationPage = lazy(() => import("./pages/LocationPage.jsx"));
const LegalPage = lazy(() => import("./pages/LegalPage.jsx"));
const TutorialsPage = lazy(() => import("./pages/TutorialsPage.jsx"));
const EvHordesPage = lazy(() => import("./pages/EvHordesPage.jsx"));
const SwarmsPage = lazy(() => import("./pages/SwarmsPage.jsx"));
import CardsPage from "./pages/CardsPage.jsx";
const NaturesPage = lazy(() => import("./pages/NaturesPage.jsx"));
const MovesListPage = lazy(() => import("./pages/MovesListPage.jsx"));
const MovePage = lazy(() => import("./pages/MovePage.jsx"));
const TeamPage = lazy(() => import("./pages/TeamPage.jsx"));
const BerriesPage = lazy(() => import("./pages/BerriesPage.jsx"));
const ItemsPage = lazy(() => import("./pages/ItemsPage.jsx"));
const AbilityPage = lazy(() => import("./pages/AbilitiesPage.jsx"));
const AbilitiesListPage = lazy(() => import("./pages/AbilitiesPage.jsx").then(m => ({ default: m.AbilitiesListPage })));
import { Loading } from "./components/MoveBits.jsx";

const DEFAULT_ID = 6;

function matches(p, f) {
  if (f.gen && p.gen !== +f.gen) return false;
  if (f.type && !p.types.includes(f.type)) return false;
  if (f.obtainable && !p.obtainable) return false;
  if (f.season || f.time) {
    if (!p.wild) return false;
    if (f.enc && !f.enc.wildAt(p, f.time, f.season)) return false;
  }
  const raw = f.q.trim().replace(/^#/, "");
  if (!raw) return true;
  if (/^\d+$/.test(raw)) return String(p.id).startsWith(String(+raw)) || pad(p.id).startsWith(raw);
  const q = norm(raw);
  return p.keyFr.includes(q) || p.keyEn.includes(q);
}

export default function App() {
  const [lang, setLang] = useStored("lang", navigator.language?.startsWith("fr") === false ? "en" : "fr");
  const [theme, setTheme] = useStored("theme", null);
  const [view, setView] = useStored("view", "list");
  // Barre latérale : largeur réglable et repliable (sur ordinateur)
  const [sideW, setSideW] = useStored("sidebarW", 340);
  const [sideHidden, setSideHidden] = useStored("sidebarHidden", false);
  useEffect(() => {
    const onKey = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") { e.preventDefault(); setSideHidden(h => !h); } };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
  const [filters, setFilters] = useState({ q: "", gen: "", type: "", sort: "num-asc", obtainable: false, season: "", time: "" });
  const route = useRoute();
  const t = STRINGS[lang];

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [theme]);
  const toggleTheme = () => {
    const dark = theme ? theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(dark ? "light" : "dark");
  };

  // Filtres saison / moment : il faut les rencontres, chargées à la demande
  const [enc, setEnc] = useState(null);
  useEffect(() => { if ((filters.season || filters.time) && !enc) import("./lib/encounters.js").then(setEnc); }, [filters.season, filters.time]);

  const visible = useMemo(() => {
    const [key, dir] = filters.sort.split("-");
    const f = { ...filters, enc };
    return ALL.filter(p => matches(p, f)).sort((a, b) => {
      let d = key === "num" ? a.id - b.id : key === "name" ? nameOf(a, lang).localeCompare(nameOf(b, lang), lang) : key === "bst" ? a.bst - b.bst : a.stats[key] - b.stats[key];
      if (dir === "desc") d = -d;
      return d || a.id - b.id;
    });
  }, [filters, lang, enc]);

  const cardsHome = route.page === "home" && view === "cards";
  const pokemon = route.page === "pokemon" ? BY_ID.get(route.id) : route.page === "home" && !cardsHome ? BY_ID.get(DEFAULT_ID) : null;

  // La teinte de l'interface suit le type principal du Pokémon affiché
  useEffect(() => {
    if (!pokemon) return;
    const ty = TYPES[pokemon.types[0]];
    document.documentElement.style.setProperty("--h", ty.h);
    document.documentElement.style.setProperty("--cc", Math.max(ty.c, 0.05));
  }, [pokemon]);

  const list = pokemon && visible.includes(pokemon) ? visible : ALL;
  const i = pokemon ? list.indexOf(pokemon) : -1;
  const open = route.page !== "home" && !cardsHome;

  let main;
  if (cardsHome) main = <CardsPage visible={visible} />;
  else if (route.page === "pokemon" && !pokemon) main = <NotFound />;
  else if (pokemon) main = <PokemonPage p={pokemon} tab={route.tab || "fiche"} plan={route.plan} prev={list[i - 1]} next={list[i + 1]} />;
  else if (route.page === "location") main = <LocationPage locKey={route.key} />;
  else if (route.page === "legal") main = <LegalPage slug={route.slug} />;
  else if (route.page === "tutorials") main = <TutorialsPage />;
  else if (route.page === "evhordes") main = <EvHordesPage />;
  else if (route.page === "swarms") main = <SwarmsPage />;
  else if (route.page === "natures") main = <NaturesPage />;
  else if (route.page === "items") main = <ItemsPage />;
  else if (route.page === "abilities") main = <AbilitiesListPage />;
  else if (route.page === "ability") main = <AbilityPage name={route.name} />;
  else if (route.page === "berries") main = <BerriesPage group={route.group} />;
  else if (route.page === "moves") main = <MovesListPage />;
  else if (route.page === "move") main = <MovePage id={route.id} />;
  else if (route.page === "team") main = <TeamPage key={route.team || "mine"} shared={route.team} />;
  else main = <NotFound />;

  // Remonte en haut à chaque changement de page
  const scrollKey = route.page + (route.id || route.key || route.slug || route.name || "") + (route.tab || "");
  useEffect(() => { document.getElementById("main")?.scrollTo(0, 0); }, [scrollKey]);

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <div
        style={{ "--sbw": sideHidden ? "0px" : `${sideW}px` }}
        className={`grid h-full grid-cols-[var(--sbw)_minmax(0,1fr)] max-[860px]:grid-cols-1 ${cardsHome ? "max-[860px]:grid-rows-[auto_minmax(0,1fr)]" : ""}`}
      >
        <Sidebar filters={filters} setFilters={setFilters} visible={visible} currentId={pokemon?.id} onToggleTheme={toggleTheme} route={route} view={view} setView={setView}
          width={sideW} setWidth={setSideW} hidden={sideHidden} onHide={() => setSideHidden(true)} />
        {sideHidden && (
          <button type="button" onClick={() => setSideHidden(false)} aria-label={t.showPanel} title={`${t.showPanel} (Ctrl B)`}
            className="fixed left-3 top-[calc(env(safe-area-inset-top,0px)+12px)] z-30 grid size-9 place-items-center rounded-[10px] border border-line bg-panel text-muted shadow-soft hover:text-fg max-[860px]:hidden">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        )}
        <main
          id="main"
          className={`min-h-0 overflow-y-auto min-[861px]:col-start-2 min-[861px]:row-start-1 ${sideHidden ? "min-[861px]:pl-12" : ""} ${
            cardsHome
              ? "max-[860px]:border-t max-[860px]:border-line"
              : `max-[860px]:fixed max-[860px]:inset-0 max-[860px]:z-20 max-[860px]:bg-bg max-[860px]:pb-[env(safe-area-inset-bottom)] max-[860px]:pt-[env(safe-area-inset-top)] max-[860px]:transition-transform max-[860px]:duration-300 ${open ? "" : "max-[860px]:invisible max-[860px]:translate-x-full"}`
          }`}
        >
          <Suspense fallback={<Loading label={t.loading} />}>{main}</Suspense>
        </main>
      </div>
    </LangContext.Provider>
  );
}

function NotFound() {
  const { t } = useLang();
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <title>{`${t.notFound} · PokeMMO Dex`}</title>
      <div>
        <p className="text-muted">{t.notFound}</p>
        <a href="#/" className="mt-3 inline-block text-accent-ink underline underline-offset-4">{t.home}</a>
      </div>
    </div>
  );
}
