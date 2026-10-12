import { useEffect, useRef } from "react";
import { TYPES, pad } from "../lib/data.js";
import { nameOf, typeName, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { Dropdown, Icon, Sprite } from "./ui.jsx";

const TOOLS = [
  { key: "team", href: "#/equipe", pages: ["team"], full: "teamNav", col: "oklch(0.58 0.15 290)",
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true"><circle cx="6" cy="8" r="2.5" /><circle cx="12" cy="8" r="2.5" /><circle cx="18" cy="8" r="2.5" /><circle cx="6" cy="16" r="2.5" /><circle cx="12" cy="16" r="2.5" /><circle cx="18" cy="16" r="2.5" /></svg> },
  { key: "ev", href: "#/hordes-ev", pages: ["evhordes"], full: "evNav", col: "oklch(0.68 0.15 340)",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg> },
  { key: "moves", href: "#/capacites", pages: ["moves", "move"], full: "movesNav", col: "oklch(0.6 0.14 255)",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="3" /><path d="M8 10h8M8 14h5" /></svg> },
  { key: "natures", href: "#/natures", pages: ["natures"], full: "naturesNav", col: "oklch(0.62 0.13 150)",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m7 14 5-5 5 5" /><path d="m7 20 5-5 5 5" opacity=".45" /></svg> },
  { key: "tuto", href: "#/tutoriels", pages: ["tutorials"], full: "tutoTitle", col: "oklch(0.58 0.21 27)",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg> },
];

export const REPO = "https://github.com/rayan-studio/PokeMmoDex";

export default function Sidebar({ filters, setFilters, visible, currentId, onToggleTheme, route, view, setView, width, setWidth, hidden, onHide }) {
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
  const dirty = filters.q || filters.gen || filters.type || filters.sort !== "num-asc" || filters.obtainable;

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
      <div className="grid gap-3 border-b border-line px-[18px] pb-3 pt-[18px]">
        <div className="flex items-center gap-2.5">
          <a href="#/" className="flex items-center gap-2.5 font-medium tracking-tight">
            <span className="relative size-5 flex-none overflow-hidden rounded-full border-[1.5px] border-fg">
              <span className="absolute inset-x-0 top-0 h-1/2 border-b-[1.5px] border-fg bg-accent" />
              <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-fg bg-panel" />
            </span>
            {t.siteTitle}
          </a>
          <span className="flex-1" />
          <button type="button" onClick={onHide} aria-label={t.hidePanel} title={`${t.hidePanel} (Ctrl B)`} className="grid h-[30px] min-w-[30px] place-items-center rounded-lg border border-line text-muted hover:bg-sunk hover:text-fg max-[860px]:hidden">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M9.5 4.5v15M15.5 10l-2 2 2 2" /></svg>
          </button>
          <button type="button" onClick={() => setLang(lang === "fr" ? "en" : "fr")} aria-label={t.langLabel} className="grid h-[30px] min-w-[30px] place-items-center rounded-lg border border-line px-2 text-[0.76rem] font-medium text-muted hover:bg-sunk hover:text-fg">
            {t.langBtn}
          </button>
          <button type="button" onClick={onToggleTheme} aria-label={t.theme} className="grid h-[30px] min-w-[30px] place-items-center rounded-lg border border-line text-muted hover:bg-sunk hover:text-fg">
            {Icon.moon}
          </button>
        </div>

        <label className="relative">
          <span className="sr-only">{t.searchLabel}</span>
          <span className="absolute left-[13px] top-1/2 -translate-y-1/2 text-faint">{Icon.search}</span>
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
            className="h-[42px] w-full rounded-[11px] border border-transparent bg-sunk pl-[38px] pr-3 text-[0.95rem] placeholder:text-faint focus:border-accent focus:bg-panel focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-2 gap-1 rounded-[11px] bg-sunk p-1" role="group" aria-label={t.viewLabel}>
          {[["list", t.viewList, <svg key="l" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 6h3M4 12h3M4 18h3M10 6h10M10 12h10M10 18h10" /></svg>],
            ["cards", t.viewCards, <svg key="c" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></svg>]].map(([v, label, icon]) => (
            <a
              key={v}
              href="#/"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg text-[0.84rem] ${view === v ? "bg-panel font-medium text-fg shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-muted hover:text-fg"}`}
            >
              {icon}{label}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Dropdown
            label={t.region}
            value={filters.gen}
            active={!!filters.gen}
            onChange={v => set({ gen: v })}
            options={[{ value: "", label: t.allRegions }, { sep: true }, ...t.regions.map((r, i) => ({ value: String(i + 1), label: r, tag: `Gen ${i + 1}` }))]}
          />
          <Dropdown
            label={t.type}
            value={filters.type}
            active={!!filters.type}
            onChange={v => set({ type: v })}
            options={[{ value: "", label: t.allTypes }, { sep: true }, ...Object.keys(TYPES).map(k => ({ value: k, label: typeName(k, lang), color: TYPES[k].col }))]}
          />
          <Dropdown
            label={t.sortLbl}
            value={filters.sort}
            active={filters.sort !== "num-asc"}
            onChange={v => set({ sort: v })}
            options={[...sortKeys.slice(0, 3).map(k => ({ value: k, label: t.sort[k] })), { sep: true }, ...sortKeys.slice(3).map(k => ({ value: k, label: t.sort[k] }))]}
          />
          <button
            type="button"
            aria-pressed={filters.obtainable}
            onClick={() => set({ obtainable: !filters.obtainable })}
            className={`h-8 rounded-full border px-3 text-[0.82rem] transition-colors ${filters.obtainable ? "border-transparent bg-accent-soft text-accent-ink" : "border-line text-muted hover:bg-sunk hover:text-fg"}`}
          >
            {t.obtainable}
          </button>
        </div>
      </div>

      <div className="flex justify-between px-[18px] pb-1.5 pt-2.5 text-[0.74rem] uppercase tracking-[0.09em] text-faint">
        <span>{t.showing(visible.length)}</span>
        {dirty && (
          <button type="button" className="uppercase tracking-[0.09em] hover:text-fg" onClick={() => setFilters({ q: "", gen: "", type: "", sort: "num-asc", obtainable: false })}>
            {t.reset}
          </button>
        )}
      </div>

      <ul ref={listRef} onKeyDown={onListKey} hidden={view === "cards"} className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 [scrollbar-width:thin]">
        {visible.length ? (
          visible.map(p => (
            <li key={p.id} className="[content-visibility:auto] [contain-intrinsic-size:46px]">
              <a
                href={href({ page: "pokemon", id: p.id })}
                data-id={p.id}
                aria-current={p.id === currentId ? "true" : undefined}
                className={`group grid w-full grid-cols-[38px_40px_minmax(0,1fr)_auto] items-center gap-2 rounded-[10px] py-[3px] pl-2 pr-2.5 ${p.id === currentId ? "bg-accent-soft" : "hover:bg-sunk"}`}
              >
                <span className={`font-mono text-[0.72rem] tabular-nums ${p.id === currentId ? "text-accent-ink" : "text-faint"}`}>{pad(p.id)}</span>
                <span className="grid size-10 place-items-center"><Sprite p={p} className="size-10" /></span>
                <span className={`truncate text-[0.93rem] ${p.obtainable ? "" : "text-faint"}`}>{nameOf(p, lang)}</span>
                <span className="flex gap-[3px]">
                  {p.types.map(ty => <i key={ty} title={typeName(ty, lang)} className="size-2 rounded-full" style={{ background: TYPES[ty].col }} />)}
                </span>
              </a>
            </li>
          ))
        ) : (
          <li className="px-[18px] py-10 text-center text-[0.9rem] text-muted">{t.noMatch}</li>
        )}
      </ul>

      {view === "cards" && <div className="flex-1 max-[860px]:hidden" />}
      <nav aria-label={t.toolsNav} className={`grid grid-cols-5 gap-1 border-t border-line px-2 pt-2 ${view === "cards" ? "max-[860px]:hidden" : ""}`}>
        {TOOLS.map(tool => {
          const on = tool.pages.includes(route?.page);
          return (
            <a key={tool.href} href={tool.href} title={t[tool.full]} aria-current={on ? "page" : undefined}
              className={`grid min-w-0 justify-items-center gap-1 rounded-[10px] px-0.5 py-1.5 text-center ${on ? "bg-accent-soft text-accent-ink" : "text-muted hover:bg-sunk hover:text-fg"}`}>
              <span className="grid size-7 place-items-center rounded-lg text-white" style={{ background: tool.col }}>{tool.icon}</span>
              <span className={`w-full truncate text-[0.7rem] leading-tight ${on ? "font-medium" : ""}`}>{t.navShort[tool.key]}</span>
            </a>
          );
        })}
      </nav>
      <footer className={`px-[18px] pb-3 pt-2 text-[0.74rem] text-faint ${view === "cards" ? "max-[860px]:hidden" : ""}`}>
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

