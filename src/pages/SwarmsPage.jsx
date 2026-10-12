import { useEffect, useState } from "react";
import { pad } from "../lib/data.js";
import { nameOf, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { Icon, Sprite } from "../components/ui.jsx";
import { ALPHA_SLOT_MIN, LIVE_URL, REFRESH_MS, alphaSlot, alphaSlotsOf, fetchLive } from "../lib/live.js";

const ALPHAPEDIA = "https://alpha.pokemmotools.org";
const ALPHAPEDIA_DISCORD = "https://discord.gg/Qeuc9k4yMw";
const WIKI_SWARMS = "https://pokemmo.shoutwiki.com/wiki/Mass_Outbreak";

// Horloge partagée : se met à jour chaque seconde
function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

const hm = (d, lang) => d.toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-GB", { hour: "2-digit", minute: "2-digit" });
const hmUtc = d => d.toISOString().slice(11, 16);

function duration(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min ${String(sec).padStart(2, "0")}`;
}

function ago(d, now, lang) {
  if (!d) return "";
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const min = Math.round((d - now) / 60000);
  return Math.abs(min) < 60 ? rtf.format(min, "minute") : rtf.format(Math.round(min / 60), "hour");
}

export default function SwarmsPage() {
  const { t } = useLang();
  useEffect(() => {
    document.documentElement.style.setProperty("--h", 290);
    document.documentElement.style.setProperty("--cc", 0.13);
  }, []);

  return (
    <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] gap-8 px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${t.sw.title} · PokeMMO Dex`}</title>
      <div className="flex items-center gap-2.5">
        <a href="#/" className="hidden h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg max-[860px]:inline-flex">{Icon.left}{t.back}</a>
      </div>

      <div className="max-w-[64ch]">
        <h1 className="text-balance text-[clamp(2rem,4.6vw,3.2rem)] font-light leading-none tracking-[-0.045em]">{t.sw.title}</h1>
        <p className="mt-3 text-muted">{t.sw.intro}</p>
      </div>

      <AlphaClock />
      <Live />
      <Guide />

      <p className="max-w-[72ch] border-t border-line pt-4 text-[0.82rem] text-faint">
        {t.sw.sources}{" "}
        <a className="underline underline-offset-4 hover:text-fg" href={ALPHAPEDIA} target="_blank" rel="noreferrer">Alphapedia</a>,{" "}
        <a className="underline underline-offset-4 hover:text-fg" href={WIKI_SWARMS} target="_blank" rel="noreferrer">{t.sw.wiki}</a>. {t.sw.sourcesNote}
      </p>
    </div>
  );
}

// Créneaux alpha : état actuel, compte à rebours, frise des 24 h
function AlphaClock() {
  const { lang, t } = useLang();
  const now = useNow();
  const slot = alphaSlot(now);
  const slots = alphaSlotsOf(now);
  const dayMin = now.getUTCHours() * 60 + now.getUTCMinutes() + now.getUTCSeconds() / 60;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <section aria-labelledby="alpha-clock" className="grid gap-4 rounded-2xl border border-line bg-panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-1">
          <h2 id="alpha-clock" className="eyebrow">{t.sw.alphaSlots}</h2>
          <p className="flex items-center gap-2 text-[1.35rem] font-light tracking-tight">
            <span className={`size-2.5 flex-none rounded-full ${slot.active ? "bg-[oklch(0.65_0.16_150)] shadow-[0_0_0_4px_oklch(0.65_0.16_150/0.18)]" : "bg-faint"}`} aria-hidden="true" />
            {slot.active ? t.sw.slotOpen(slot.idx + 1) : t.sw.slotClosed}
          </p>
        </div>
        <div className="text-right">
          <b className="block font-mono text-[1.8rem] font-normal leading-none tabular-nums tracking-tight" aria-live="off">
            {duration((slot.active ? slot.end : slot.start) - now)}
          </b>
          <span className="text-[0.78rem] text-muted">
            {slot.active ? t.sw.endsAt(hm(slot.end, lang)) : t.sw.opensAt(slot.idx + 1, hm(slot.start, lang))}
          </span>
        </div>
      </div>

      {/* Frise de la journée en UTC */}
      <div>
        <div className="relative h-9 overflow-hidden rounded-lg bg-sunk" role="img" aria-label={t.sw.timelineLabel}>
          {[0, 6, 12, 18].map((h, i) => (
            <span key={h}
              className={`absolute inset-y-1 rounded-md ${slot.active && slot.idx === i ? "bg-accent" : "bg-accent-soft"}`}
              style={{ left: `calc(${(h / 24) * 100}% + 2px)`, width: `calc(${(ALPHA_SLOT_MIN / 1440) * 100}% - 4px)` }} />
          ))}
          <span className="absolute inset-y-0 w-[2px] bg-fg" style={{ left: `${(dayMin / 1440) * 100}%` }} aria-hidden="true" />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[0.68rem] text-faint">
          {["00:00", "06:00", "12:00", "18:00", "24:00"].map(x => <span key={x}>{x}</span>)}
        </div>
        <p className="mt-0.5 text-right text-[0.7rem] text-faint">UTC</p>
      </div>

      <ol className="grid grid-cols-4 gap-2 max-[640px]:grid-cols-2">
        {slots.map((s, i) => {
          const on = slot.active && slot.idx === i;
          return (
            <li key={i} className={`grid gap-0.5 rounded-xl border px-3 py-2.5 ${on ? "border-accent bg-accent-soft" : "border-line"}`}>
              <span className={`text-[0.74rem] ${on ? "font-medium text-accent-ink" : "text-muted"}`}>{t.sw.slotN(i + 1)}</span>
              <span className="font-mono text-[0.95rem] tabular-nums">{hm(s.start, lang)} – {hm(s.end, lang)}</span>
              <span className="font-mono text-[0.68rem] text-faint">{hmUtc(s.start)} – {hmUtc(s.end)} UTC</span>
            </li>
          );
        })}
      </ol>
      <p className="text-[0.76rem] text-faint">{t.sw.localTime(tz)}</p>
    </section>
  );
}

// Signalements en direct : uniquement si une source autorisée est configurée
function Live() {
  const { lang, t } = useLang();
  const [state, setState] = useState({ status: LIVE_URL ? "loading" : "off" });
  const now = useNow(30_000);

  useEffect(() => {
    if (!LIVE_URL) return;
    let ctrl;
    const load = () => {
      ctrl?.abort();
      ctrl = new AbortController();
      fetchLive(ctrl.signal)
        .then(data => setState({ status: "ok", data }))
        .catch(e => { if (e.name !== "AbortError") setState(s => (s.data ? { ...s, stale: true } : { status: "error" })); });
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => { clearInterval(id); ctrl?.abort(); };
  }, []);

  const links = (
    <div className="flex flex-wrap gap-2">
      <a href={`${ALPHAPEDIA}/swarm-list`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-4 text-[0.86rem] font-medium text-panel hover:opacity-90">{t.sw.seeSwarms} ↗</a>
      <a href={`${ALPHAPEDIA}/alpha-list`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 text-[0.86rem] text-muted hover:text-fg">{t.sw.seeAlphas} ↗</a>
      <a href={ALPHAPEDIA_DISCORD} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-4 text-[0.86rem] text-muted hover:text-fg">{t.sw.discord} ↗</a>
    </div>
  );

  if (state.status !== "ok") {
    return (
      <section aria-labelledby="live" className="grid gap-3 rounded-2xl border border-dashed border-line p-5">
        <h2 id="live" className="eyebrow">{t.sw.liveTitle}</h2>
        <p className="max-w-[68ch] text-muted">
          {state.status === "loading" ? t.loading : state.status === "error" ? t.sw.liveError : t.sw.liveOff}
        </p>
        {links}
      </section>
    );
  }

  const { swarms, alphas, updated } = state.data;
  const byRegion = t.regions.map((r, i) => ({ r, items: swarms.filter(s => s.region === i) }));
  return (
    <section aria-labelledby="live" className="grid gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="live" className="eyebrow">{t.sw.liveTitle}</h2>
        <span className="text-[0.76rem] text-faint">{state.stale ? t.sw.stale : t.sw.updated(ago(updated, now, lang))}</span>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
        {byRegion.map(({ r, items }) => (
          <li key={r} className="grid content-start gap-2 rounded-2xl border border-line bg-panel p-4">
            <span className="text-[0.78rem] text-muted">{r}</span>
            {items.length ? items.map((s, k) => <LiveRow key={k} e={s} now={now} />) : <span className="text-[0.84rem] text-faint">{t.sw.noSwarm}</span>}
          </li>
        ))}
      </ul>
      {alphas.length > 0 && (
        <div className="grid gap-2">
          <h3 className="text-[0.86rem] font-medium">{t.sw.lastAlphas}</h3>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2">
            {alphas.slice(0, 8).map((a, k) => (
              <li key={k} className="rounded-xl border border-line bg-panel px-3 py-2"><LiveRow e={a} now={now} showRegion /></li>
            ))}
          </ul>
        </div>
      )}
      {links}
    </section>
  );
}

function LiveRow({ e, now, showRegion = false }) {
  const { lang, t } = useLang();
  const body = (
    <>
      <span className="grid size-10 flex-none place-items-center">{e.p ? <Sprite p={e.p} className="size-10" fallbackClass="size-5" /> : null}</span>
      <span className="grid min-w-0 flex-1">
        <span className="truncate text-[0.92rem] font-medium">
          {e.p ? nameOf(e.p, lang) : e.name} {e.p && <span className="font-mono text-[0.68rem] font-normal text-faint">#{pad(e.p.id)}</span>}
        </span>
        <span className="truncate text-[0.76rem] text-muted">{[showRegion && e.region >= 0 ? t.regions[e.region] : "", e.location].filter(Boolean).join(" · ")}</span>
        {e.at && <span className="text-[0.7rem] text-faint">{ago(e.at, now, lang)}</span>}
      </span>
    </>
  );
  return e.p
    ? <a href={href({ page: "pokemon", id: e.p.id, tab: "lieux" })} className="-mx-1.5 flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-sunk">{body}</a>
    : <div className="flex items-center gap-2">{body}</div>;
}

// Explications : ce qu'on sait des essaims, des alphas et des rotations
function Guide() {
  const { t } = useLang();
  const blocks = [
    { title: t.sw.swarmsTitle, items: t.sw.swarmsFacts },
    { title: t.sw.alphasTitle, items: t.sw.alphasFacts },
    { title: t.sw.rotTitle, items: t.sw.rotFacts },
  ];
  return (
    <section aria-label={t.sw.guideLabel} className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
      {blocks.map(b => (
        <article key={b.title} className="grid content-start gap-2.5 rounded-2xl border border-line bg-panel p-5">
          <h2 className="text-[1.05rem] font-medium">{b.title}</h2>
          <ul className="grid gap-2 text-[0.88rem] leading-relaxed text-muted">
            {b.items.map((x, i) => (
              <li key={i} className="flex gap-2"><span className="mt-[0.6em] size-1.5 flex-none rounded-full bg-accent" aria-hidden="true" />{x}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
