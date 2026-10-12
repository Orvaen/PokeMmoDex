import { useEffect, useRef } from "react";
import { TYPES, pad } from "../lib/data.js";
import { nameOf, typeName, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { Dropdown, Icon, Sprite } from "./ui.jsx";
import { useStored } from "../lib/storage.js";
import { TIMES } from "../lib/conditions.js";

const ico = d => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const TOOLS = [
  { key: "team", href: "#/equipe", pages: ["team"], label: "teamNav", icon: ico(<><circle cx="8" cy="9" r="3" /><circle cx="16.5" cy="10" r="2.5" /><path d="M3 19c.6-3 2.6-4.5 5-4.5s4.4 1.5 5 4.5M14 15.2c.8-.5 1.6-.7 2.5-.7 2 0 3.6 1.3 4 4" /></>) },
  { key: "ev", href: "#/hordes-ev", pages: ["evhordes"], label: "evNav", icon: ico(<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />) },
  { key: "shiny", href: "#/shiny", pages: ["shiny"], label: "shinyNav", icon: ico(<><path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" /><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" /></>) },
  { key: "swarms", href: "#/essaims", pages: ["swarms"], label: "swarmNav", icon: ico(<><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" /><path d="M4 4.5 6.5 7M20 4.5 17.5 7" /></>) },
  { key: "berries", href: "#/baies", pages: ["berries"], label: "berriesNav", icon: ico(<><circle cx="12" cy="14.5" r="5.5" /><path d="M12 9V6.5c0-1.4 1-2.5 2.5-3M12 7.5C10.5 5 8 4.8 6.5 5.5 7 7.5 9 8.8 12 8.5" /></>) },
  { key: "items", href: "#/objets", pages: ["items"], label: "itemsNav", icon: ico(<><path d="M5 9h14l-1.2 10.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z" /><path d="M9 9V7a3 3 0 0 1 6 0v2" /></>) },
  { key: "abilities", href: "#/talents", pages: ["abilities", "ability"], label: "abilitiesNav", icon: ico(<><path d="M12 3.5 14.4 9l5.6.5-4.3 3.7 1.3 5.6L12 15.9l-5 2.9 1.3-5.6L4 9.5 9.6 9z" /></>) },
  { key: "moves", href: "#/capacites", pages: ["moves", "move"], label: "movesNav", icon: ico(<><rect x="4" y="5" width="16" height="14" rx="3" /><path d="M8 10h8M8 14h5" /></>) },
  { key: "natures", href: "#/natures", pages: ["natures"], label: "naturesNav", icon: ico(<><path d="m7 11 5-5 5 5" /><path d="m7 18 5-5 5 5" opacity=".5" /></>) },
  { key: "tuto", href: "#/tutoriels", pages: ["tutorials"], label: "tutoTitle", icon: ico(<><rect x="3.5" y="5.5" width="17" height="13" rx="3" /><path d="m10.5 9.5 4 2.5-4 2.5z" /></>) },
];

const row = on => `flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-[0.88rem] transition-colors ${on ? "bg-sunk font-medium text-fg" : "text-muted hover:bg-sunk/70 hover:text-fg"}`;
const ghostBtn = "grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-sunk hover:text-fg";

export const REPO = "https://github.com/rayan-studio/PokeMmoDex";

export default function Sidebar({ filters, setFilters, visible, currentId, onToggleTheme, route, view, setView, width, setWidth, hidden, onHide }) {
  const [toolsOpen, setToolsOpen] = useStored("sidebarTools", true);
  // Redimensionnement à la souris (poignée sur le bord droit) ou au clavier (flèches)
  const MIN_W = 260, MAX_W = 560;
  const clampW = w => Math.round(Math.min(MAX_W, Math.max(MIN_W, w)));
  const startResize = e => {
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const move = ev => setWidth(clampW(ev.clientX));
    const up = ev => {
      handle.releasePointerCapture(ev.pointerId);
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
  };
  const { lang, t, setLang } = useLang();
  const listRef = useRef(null);
  const searchRef = useRef(null);
  const set = patch => setFilters(f => ({ ...f, ...patch }));
  const dirty = filters.q || filters.gen || filters.type || filters.sort !== "num-asc" || filters.obtainable || filters.season || filters.time;

  // Garde la ligne sélectionnée visible
  useEffect(() => {
    listRef.current?.querySelector(`[data-id="${currentId}"]`)?.scrollIntoView({ block: "nearest" });
  }, [currentId]);

  // Ctrl/Cmd + K : recherche
  useEffect(() => {
    const onKey = e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); searchRef.current?.focus(); searchRef.current?.select(); }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const onListKey = e => {
    const a = e.target.closest("a[data-id]");
    if (!a) return;
    const li = a.parentElement;
    const next = e.key === "ArrowDown" ? li.nextElementSibling : e.key === "ArrowUp" ? li.previousElementSibling : null;
    const b = next?.querySelector("a[data-id]");
    if (b) { e.preventDefault(); b.focus(); b.click(); }
  };

  const sortKeys = Object.keys(t.sort);
  const onDex = route?.page === "home" || route?.page === "pokemon";
  const mobileCards = view === "cards" ? "max-[860px]:hidden" : "";
  return (
    <aside className={`relative flex min-h-0 min-w-0 flex-col border-r border-line bg-panel max-[860px]:border-r-0 ${hidden ? "min-[861px]:hidden" : ""}`}>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={t.resizePanel}
        aria-valuemin={MIN_W}
        aria-valuemax={MAX_W}
        aria-valuenow={width}
        tabIndex={0}
        title={t.resizeHint}
        onPointerDown={startResize}
        onDoubleClick={() => setWidth(340)}
        onKeyDown={e => {
          if (e.key === "ArrowLeft") { e.preventDefault(); setWidth(w => clampW(w - 20)); }
          if (e.key === "ArrowRight") { e.preventDefault(); setWidth(w => clampW(w + 20)); }
        }}
        className="group absolute -right-[5px] top-0 z-20 h-full w-[10px] cursor-col-resize touch-none max-[860px]:hidden"
      >
        <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-transparent transition-colors group-hover:bg-accent group-focus-visible:bg-accent group-active:bg-accent" />
      </div>

      {/* En-tête : logo et réglages discrets */}
      <div className="flex items-center gap-1 px-3 pb-2 pt-3">
        <a href="#/" className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-[0.95rem] font-medium tracking-tight">
          <span className="relative size-[18px] flex-none overflow-hidden rounded-full border-[1.5px] border-fg">
            <span className="absolute inset-x-0 top-0 h-1/2 border-b-[1.5px] border-fg bg-accent" />
            <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-fg bg-panel" />
          </span>
          <span className="truncate">{t.siteTitle}</span>
        </a>
        <button type="button" onClick={() => setLang(lang === "fr" ? "en" : "fr")} aria-label={t.langLabel} className={`${ghostBtn} text-[0.74rem] font-medium`}>{t.langBtn}</button>
        <button type="button" onClick={onToggleTheme} aria-label={t.theme} className={ghostBtn}>{Icon.moon}</button>
        <button type="button" onClick={onHide} aria-label={t.hidePanel} title={`${t.hidePanel} (Ctrl B)`} className={`${ghostBtn} max-[860px]:hidden`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="M9.5 4.5v15" /></svg>
        </button>
      </div>

      {/* Recherche, présentée comme une ligne */}
      <div className="px-3">
        <label className="group relative block">
          <span className="sr-only">{t.searchLabel}</span>
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint">{Icon.search}</span>
          <input
            ref={searchRef}
            id="search"
            type="search"
            autoComplete="off"
            spellCheck={false}
            value={filters.q}
            placeholder={t.search}
            onChange={e => set({ q: e.target.value })}
            onKeyDown={e => {
              if (e.key === "Enter" && visible[0]) location.hash = href({ page: "pokemon", id: visible[0].id }).slice(1);
              if (e.key === "ArrowDown") { e.preventDefault(); listRef.current?.querySelector("a[data-id]")?.focus(); }
            }}
            className="h-9 w-full rounded-lg border border-line bg-transparent pl-[34px] pr-12 text-[0.88rem] placeholder:text-faint hover:bg-sunk/50 focus:border-accent focus:bg-panel focus:outline-none"
          />
          {!filters.q && <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-line px-1.5 font-sans text-[0.68rem] text-faint max-[860px]:hidden">Ctrl K</kbd>}
        </label>
      </div>

      {/* Navigation : lignes simples, icônes au trait */}
      <nav aria-label={t.toolsNav} className={`grid gap-px px-3 pt-2 ${mobileCards}`}>
        <div className={`group ${row(onDex)} pr-1`}>
          <a href="#/" className="flex min-w-0 flex-1 items-center gap-2.5 self-stretch">
            {ico(<><circle cx="12" cy="12" r="8" /><path d="M4 12h5M15 12h5" /><circle cx="12" cy="12" r="2.5" /></>)}
            <span className="truncate">{t.pokedexNav}</span>
          </a>
          <span className="flex rounded-md p-0.5" role="group" aria-label={t.viewLabel}>
            {[["list", t.viewList, <path key="l" d="M5 7h14M5 12h14M5 17h14" />], ["cards", t.viewCards, <g key="c"><rect x="4.5" y="4.5" width="6" height="6" rx="1.5" /><rect x="13.5" y="4.5" width="6" height="6" rx="1.5" /><rect x="4.5" y="13.5" width="6" height="6" rx="1.5" /><rect x="13.5" y="13.5" width="6" height="6" rx="1.5" /></g>]].map(([v, label, d]) => (
              <a key={v} href="#/" title={label} aria-label={label} aria-pressed={view === v} onClick={() => setView(v)}
                className={`grid size-6 place-items-center rounded-md transition-colors ${view === v ? "bg-panel text-fg shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-faint hover:text-fg"}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">{d}</svg>
              </a>
            ))}
          </span>
        </div>
        <button type="button" onClick={() => setToolsOpen(o => !o)} aria-expanded={toolsOpen} aria-label={t.toggleTools}
          className="group mt-2 flex h-6 items-center gap-1 px-2.5 text-left text-[0.74rem] text-faint hover:text-muted">
          {t.toolsNav}
          <span className={`opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 ${toolsOpen ? "" : "-rotate-90 opacity-100"}`}>{Icon.chevDown}</span>
        </button>
        {toolsOpen && TOOLS.map(tool => {
          const on = tool.pages.includes(route?.page);
          return (
            <a key={tool.key} href={tool.href} aria-current={on ? "page" : undefined} className={row(on)}>
              {tool.icon}
              <span className="truncate">{t[tool.label]}</span>
            </a>
          );
        })}
      </nav>

      {/* Liste des Pokémon */}
      <div className="flex items-center gap-0.5 px-3 pb-1 pt-3">
        <span className="px-2.5 text-[0.74rem] text-faint">{t.showing(visible.length)}</span>
        <span className="flex-1" />
        {dirty && <button type="button" className="h-6 rounded-md px-1.5 text-[0.74rem] text-faint hover:bg-sunk hover:text-fg" onClick={() => setFilters({ q: "", gen: "", type: "", sort: "num-asc", obtainable: false, season: "", time: "" })}>{t.reset}</button>}
      </div>
      <div className="flex flex-wrap gap-0.5 px-3 pb-1.5">
        <Dropdown size="ghost" label={t.region} value={filters.gen} active={!!filters.gen} onChange={v => set({ gen: v })}
          options={[{ value: "", label: t.allRegions }, { sep: true }, ...t.regions.map((r, i) => ({ value: String(i + 1), label: r, tag: `Gen ${i + 1}` }))]} />
        <Dropdown size="ghost" label={t.type} value={filters.type} active={!!filters.type} onChange={v => set({ type: v })}
          options={[{ value: "", label: t.allTypes }, { sep: true }, ...Object.keys(TYPES).map(k => ({ value: k, label: typeName(k, lang), color: TYPES[k].col }))]} />
        <Dropdown size="ghost" label={t.sortLbl} value={filters.sort} active={filters.sort !== "num-asc"} onChange={v => set({ sort: v })}
          options={[...sortKeys.slice(0, 3).map(k => ({ value: k, label: t.sort[k] })), { sep: true }, ...sortKeys.slice(3).map(k => ({ value: k, label: t.sort[k] }))]} />
        <Dropdown size="ghost" label={t.seasonLbl} value={filters.season} active={!!filters.season} onChange={v => set({ season: v })}
          options={[{ value: "", label: t.allSeasons }, { sep: true }, ...t.seasons.map((x, i) => ({ value: String(i), label: x }))]} />
        <Dropdown size="ghost" label={t.timeLbl} value={filters.time} active={!!filters.time} onChange={v => set({ time: v })}
          options={[{ value: "", label: t.allTimes }, { sep: true }, ...TIMES.map(x => ({ value: x, label: t.timesOfDay[x] }))]} />
        <button type="button" aria-pressed={filters.obtainable} onClick={() => set({ obtainable: !filters.obtainable })}
          className={`inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[0.82rem] transition-colors hover:bg-sunk ${filters.obtainable ? "font-medium text-fg" : "text-muted hover:text-fg"}`}>
          <span className={`grid size-3.5 place-items-center rounded-[4px] border ${filters.obtainable ? "border-fg bg-fg text-panel" : "border-faint"}`}>
            {filters.obtainable && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>}
          </span>
          {t.obtainable}
        </button>
      </div>

      <ul ref={listRef} onKeyDown={onListKey} hidden={view === "cards"} className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:thin]">
        {visible.length ? (
          visible.map(p => {
            const on = p.id === currentId;
            return (
              <li key={p.id} className="[content-visibility:auto] [contain-intrinsic-size:38px]">
                <a
                  href={href({ page: "pokemon", id: p.id })}
                  data-id={p.id}
                  aria-current={on ? "true" : undefined}
                  className={`group flex h-[38px] w-full items-center gap-2 rounded-lg pl-1 pr-2.5 transition-colors ${on ? "bg-sunk text-fg" : "text-muted hover:bg-sunk/70 hover:text-fg"}`}
                >
                  <span className="grid size-8 flex-none place-items-center"><Sprite p={p} className="size-8" fallbackClass="size-4" /></span>
                  <span className={`min-w-0 flex-1 truncate text-[0.88rem] ${on ? "font-medium" : ""} ${p.obtainable ? "" : "opacity-55"}`}>{nameOf(p, lang)}</span>
                  <span className="font-mono text-[0.68rem] tabular-nums text-faint">{pad(p.id)}</span>
                </a>
              </li>
            );
          })
        ) : (
          <li className="px-3 py-10 text-center text-[0.88rem] text-muted">{t.noMatch}</li>
        )}
      </ul>

      {view === "cards" && <div className="flex-1 max-[860px]:hidden" />}
      <footer className={`border-t border-line px-5 pb-3 pt-2.5 text-[0.72rem] text-faint ${mobileCards}`}>
        <nav className="flex flex-wrap gap-x-3 gap-y-1">
          <a className="hover:text-fg" href="#/a-propos">{t.footer.about}</a>
          <a className="hover:text-fg" href="#/mentions-legales">{t.footer.legal}</a>
          <a className="hover:text-fg" href="#/confidentialite">{t.footer.privacy}</a>
          <a className="hover:text-fg" href="#/cookies">{t.footer.cookies}</a>
          <a className="inline-flex items-center gap-1 hover:text-fg" href={REPO} target="_blank" rel="noreferrer">{Icon.github}{t.footer.source}</a>
        </nav>
      </footer>
    </aside>
  );
}
