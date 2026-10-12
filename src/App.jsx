import { useEffect, useMemo, useState } from "react";
import { ALL, BY_ID, TYPES, norm, pad } from "./lib/data.js";
import { LangContext, STRINGS, nameOf, useLang } from "./lib/i18n.js";
import { useRoute } from "./lib/router.js";
import { useStored } from "./lib/storage.js";
import Sidebar from "./components/Sidebar.jsx";
import PokemonPage from "./pages/PokemonPage.jsx";
import LocationPage from "./pages/LocationPage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import TutorialsPage from "./pages/TutorialsPage.jsx";
import EvHordesPage from "./pages/EvHordesPage.jsx";
import CardsPage from "./pages/CardsPage.jsx";
import NaturesPage from "./pages/NaturesPage.jsx";

const DEFAULT_ID = 6;

function matches(p, f) {
  if (f.gen && p.gen !== +f.gen) return false;
  if (f.type && !p.types.includes(f.type)) return false;
  if (f.obtainable && !p.obtainable) return false;
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
  const [filters, setFilters] = useState({ q: "", gen: "", type: "", sort: "num-asc", obtainable: false });
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

  const visible = useMemo(() => {
    const [key, dir] = filters.sort.split("-");
    return ALL.filter(p => matches(p, filters)).sort((a, b) => {
      let d = key === "num" ? a.id - b.id : key === "name" ? nameOf(a, lang).localeCompare(nameOf(b, lang), lang) : key === "bst" ? a.bst - b.bst : a.stats[key] - b.stats[key];
      if (dir === "desc") d = -d;
      return d || a.id - b.id;
    });
  }, [filters, lang]);

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
  else if (route.page === "natures") main = <NaturesPage />;
  else main = <NotFound />;

  // Remonte en haut à chaque changement de page
  const scrollKey = route.page + (route.id || route.key || route.slug || "") + (route.tab || "");
  useEffect(() => { document.getElementById("main")?.scrollTo(0, 0); }, [scrollKey]);

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <div className={`grid h-full grid-cols-[minmax(300px,380px)_minmax(0,1fr)] max-[860px]:grid-cols-1 ${cardsHome ? "max-[860px]:grid-rows-[auto_minmax(0,1fr)]" : ""}`}>
        <Sidebar filters={filters} setFilters={setFilters} visible={visible} currentId={pokemon?.id} onToggleTheme={toggleTheme} route={route} view={view} setView={setView} />
        <main
          id="main"
          className={`min-h-0 overflow-y-auto ${
            cardsHome
              ? "max-[860px]:border-t max-[860px]:border-line"
              : `max-[860px]:fixed max-[860px]:inset-0 max-[860px]:z-20 max-[860px]:bg-bg max-[860px]:pb-[env(safe-area-inset-bottom)] max-[860px]:pt-[env(safe-area-inset-top)] max-[860px]:transition-transform max-[860px]:duration-300 ${open ? "" : "max-[860px]:invisible max-[860px]:translate-x-full"}`
          }`}
        >
          {main}
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
