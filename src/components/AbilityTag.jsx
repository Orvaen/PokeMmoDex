import { useEffect, useId, useRef, useState } from "react";
import { abilityInfo } from "../lib/data.js";
import { abilName } from "../lib/breeding.js";
import { useLang } from "../lib/i18n.js";

// Talent avec sa description : au survol, au focus clavier, ou au toucher sur mobile
export default function AbilityTag({ name, hidden = false, size = "md", className = "" }) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const id = useId();
  const info = abilityInfo(name);
  const desc = info?.desc?.[lang] || info?.desc?.en || "";
  const detail = lang === "fr" && info?.desc?.en && info.desc.en !== desc ? info.desc.en : "";

  useEffect(() => {
    if (!open) return;
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = e => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  const sz = size === "sm" ? "px-2 py-0.5 text-[0.8rem]" : "px-3 py-2 text-[0.9rem]";
  return (
    <span ref={ref} className={`relative inline-flex ${className}`} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className={`inline-flex items-center gap-2 rounded-xl border bg-panel ${sz} ${open ? "border-accent" : "border-line"} cursor-help`}
      >
        {abilName(name, lang)}
        {hidden && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.7rem] font-medium text-accent-ink">{t.hidden}</span>}
        <span aria-hidden="true" className="grid size-4 place-items-center rounded-full border border-line text-[0.62rem] text-faint">i</span>
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="anim-pop absolute bottom-[calc(100%+8px)] left-0 z-40 grid w-[min(300px,80vw)] gap-1.5 rounded-xl border border-line bg-panel p-3 text-left shadow-soft"
        >
          <span className="text-[0.9rem] font-medium">
            {abilName(name, lang)}
            {lang === "fr" && info?.fr && info.fr !== name && <span className="ml-1.5 text-[0.76rem] font-normal text-faint">{name}</span>}
          </span>
          <span className="text-[0.84rem] leading-snug text-muted">{desc || t.abilityCustom}</span>
          {detail && <span className="border-t border-line pt-1.5 text-[0.76rem] leading-snug text-faint"><b className="font-medium">{t.abilityDetail} :</b> {detail}</span>}
        </span>
      )}
    </span>
  );
}
