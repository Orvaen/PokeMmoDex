import { useEffect, useRef, useState } from "react";
import { TYPES, spriteUrl, spriteAniUrl } from "../lib/data.js";
import { typeName, useLang } from "../lib/i18n.js";

export const Icon = {
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>,
  moon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>,
  chevDown: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>,
  left: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>,
  right: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5 10 17l9-10" /></svg>,
  egg: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 3c-3.6 0-7 5.4-7 10a7 7 0 0 0 14 0c0-4.6-3.4-10-7-10z" /></svg>,
  sparkle: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></svg>,
  bolt: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>,
  pin: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>,
  github: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z" /></svg>,
};

// Sprite Noir & Blanc ; animé si demandé, puis repli sur l'image fixe, puis sur une pastille de la couleur du type
export function Sprite({ p, animated = false, shiny = false, className = "", fallbackClass = "size-7" }) {
  const [stage, setStage] = useState(0);
  useEffect(() => setStage(0), [p.id, animated, shiny]);
  const color = TYPES[p.types[0]].col;
  const src = animated && stage === 0 ? spriteAniUrl(p, shiny) : stage <= 1 ? spriteUrl(p, shiny) : null;
  if (!src) {
    return <span className={`block rounded-full border ${fallbackClass}`} style={{ background: `color-mix(in oklab, ${color} 22%, transparent)`, borderColor: `color-mix(in oklab, ${color} 40%, transparent)` }} />;
  }
  return <img src={src} alt="" loading="lazy" decoding="async" className={`pixel object-contain ${className}`} onError={() => setStage(s => (animated && s === 0 ? 1 : 2))} />;
}

export function TypePill({ t, size = "md" }) {
  const { lang } = useLang();
  const sz = size === "sm" ? "h-[23px] px-2.5 text-[0.75rem]" : "h-7 px-3 text-[0.82rem]";
  return (
    <span className={`type-pill inline-flex items-center gap-1.5 rounded-full font-medium ${sz}`} style={{ "--c": TYPES[t].col }}>
      <span className="size-[7px] rounded-full" style={{ background: TYPES[t].col }} />
      {typeName(t, lang)}
    </span>
  );
}

// Menu déroulant accessible au clavier, aux couleurs du site
export function Dropdown({ label, value, options, onChange, active = false, size = "sm", align = "left" }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const listRef = useRef(null);
  const btnRef = useRef(null);
  const current = options.find(o => !o.sep && o.value === value) || options.find(o => !o.sep);

  useEffect(() => {
    if (!open) return;
    const onDown = e => { if (!root.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    const sel = listRef.current?.querySelector('[aria-selected="true"]') || listRef.current?.querySelector('[role="option"]');
    sel?.focus();
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const pick = v => { setOpen(false); btnRef.current?.focus(); if (v !== value) onChange(v); };
  const onKey = e => {
    e.stopPropagation();
    const items = [...listRef.current.querySelectorAll('[role="option"]')];
    const i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(i + 1, items.length - 1)]?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[Math.max(i - 1, 0)]?.focus(); }
    else if (e.key === "Home") { e.preventDefault(); items[0]?.focus(); }
    else if (e.key === "End") { e.preventDefault(); items.at(-1)?.focus(); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (items[i]) pick(items[i].dataset.value); }
    else if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
    else if (e.key === "Tab") setOpen(false);
  };

  const h = size === "lg" ? "h-11 rounded-[11px] px-3.5" : "h-8 rounded-full pl-[11px] pr-[9px]";
  return (
    <div className="relative" ref={root}>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); e.stopPropagation(); setOpen(true); } }}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap border text-[0.82rem] transition-colors ${h} ${
          active ? "border-transparent bg-accent-soft text-accent-ink" : "border-line text-muted hover:bg-sunk hover:text-fg"
        } ${open ? "bg-sunk text-fg" : ""}`}
      >
        {current?.color && <span className="size-[7px] rounded-full" style={{ background: current.color }} />}
        <span>{active ? current?.short || current?.label : label}</span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>{Icon.chevDown}</span>
      </button>
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          onKeyDown={onKey}
          className={`anim-pop absolute top-[calc(100%+6px)] z-30 max-h-[min(360px,60vh)] min-w-[210px] overflow-y-auto rounded-xl border border-line bg-panel p-1.5 shadow-soft ${align === "right" ? "right-0" : "left-0"}`}
        >
          {options.map((o, i) =>
            o.sep ? (
              <li key={"sep" + i} role="presentation" className="mx-1 my-1.5 h-px bg-line" />
            ) : (
              <li
                key={o.value}
                role="option"
                tabIndex={-1}
                data-value={o.value}
                aria-selected={o.value === value}
                onClick={() => pick(o.value)}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.88rem] text-muted outline-none hover:bg-sunk hover:text-fg focus:bg-sunk focus:text-fg aria-selected:font-medium aria-selected:text-fg"
              >
                {o.color && <span className="size-2 flex-none rounded-full" style={{ background: o.color }} />}
                <span>{o.label}</span>
                {o.tag && <span className="ml-auto font-mono text-[0.7rem] text-faint">{o.tag}</span>}
                <span className={`flex-none text-accent ${o.tag ? "" : "ml-auto"} ${o.value === value ? "opacity-100" : "opacity-0"}`}>{Icon.check}</span>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

export function Section({ title, aside, children, className = "" }) {
  return (
    <section className={className}>
      <h3 className="eyebrow mb-4 flex items-center justify-between gap-3">
        <span>{title}</span>
        {aside && <span className="font-mono text-[0.78rem] normal-case tracking-normal text-muted">{aside}</span>}
      </h3>
      {children}
    </section>
  );
}
