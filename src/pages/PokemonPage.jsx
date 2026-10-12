import { useEffect, useState } from "react";
import { STATS, TYPES, effectiveness, evoStages, pad } from "../lib/data.js";
import { abilName } from "../lib/breeding.js";
import { nameOf, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { Icon, Section, Sprite, TypePill } from "../components/ui.jsx";
import LocationsTab from "./LocationsTab.jsx";
import Breeding from "./Breeding.jsx";
import AbilityTag from "../components/AbilityTag.jsx";
import MovesTab from "./MovesTab.jsx";
import { useStored } from "../lib/storage.js";

export default function PokemonPage({ p, tab, plan, prev, next }) {
  const { lang, t } = useLang();

  // ← → pour passer au Pokémon précédent ou suivant
  useEffect(() => {
    const onKey = e => {
      if (e.target.closest("input, [role=listbox], [aria-haspopup]")) return;
      if (e.key === "ArrowRight" && next) location.hash = href({ page: "pokemon", id: next.id, tab }).slice(1);
      if (e.key === "ArrowLeft" && prev) location.hash = href({ page: "pokemon", id: prev.id, tab }).slice(1);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [prev, next, tab]);

  const tabs = [
    { id: "fiche", label: t.tabDex },
    { id: "capacites", label: t.tabMoves, icon: Icon.bolt },
    { id: "lieux", label: t.tabLocations, icon: Icon.pin },
    { id: "elevage", label: t.tabBreed, icon: Icon.egg },
  ];
  const title = `${nameOf(p, lang)} · ${tab === "elevage" ? t.tabBreed : tab === "lieux" ? t.tabLocations : tab === "capacites" ? t.tabMoves : "Pokédex"} · PokeMMO Dex`;

  return (
    <div className="mx-auto grid max-w-[980px] grid-cols-[minmax(0,1fr)] gap-[34px] px-8 pb-14 pt-[22px] max-[860px]:gap-7 max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{title}</title>
      <meta name="description" content={`${nameOf(p, lang)} (#${pad(p.id)}) dans PokeMMO : stats, types, lieux de capture et plan d'élevage.`} />

      <div className="flex items-center gap-2.5">
        <a href="#/" className="hidden h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg max-[860px]:inline-flex">
          {Icon.left}{t.back}
        </a>
        <div role="tablist" className="inline-flex min-w-0 gap-0.5 overflow-x-auto rounded-[11px] bg-sunk p-[3px] [scrollbar-width:none]">
          {tabs.map(x => (
            <a
              key={x.id}
              role="tab"
              aria-selected={tab === x.id}
              href={href({ page: "pokemon", id: p.id, tab: x.id })}
              className={`inline-flex h-[30px] flex-none items-center gap-1.5 rounded-lg px-3 text-[0.84rem] max-[560px]:px-2.5 ${tab === x.id ? "bg-panel text-fg shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-muted hover:text-fg"}`}
            >
              <span className="max-[560px]:hidden">{x.icon}</span>{x.label}
            </a>
          ))}
        </div>
        <span className="flex-1" />
        {[prev, next].map((q, i) =>
          q ? (
            <a key={i} href={href({ page: "pokemon", id: q.id, tab })} aria-label={i ? t.next : t.prev} className="inline-flex h-[34px] max-[560px]:hidden max-w-[46vw] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] text-muted hover:text-fg">
              {i === 0 && Icon.left}
              <span className="truncate max-[860px]:hidden">{nameOf(q, lang)}</span>
              {i === 1 && Icon.right}
            </a>
          ) : (
            <span key={i} />
          )
        )}
      </div>

      {tab === "capacites" ? <MovesTab p={p} /> : tab === "lieux" ? <LocationsTab p={p} /> : tab === "elevage" ? <Breeding key={p.id + (plan || "")} p={p} shared={plan} /> : <Overview p={p} />}
    </div>
  );
}

function Overview({ p }) {
  const { lang, t } = useLang();
  const [shiny, setShiny] = useState(false);
  const [team, setTeam] = useStored("team", []);
  const inTeam = team.some(s => s?.id === p.id);
  const eff = effectiveness(p.types);
  const order = Object.keys(TYPES).sort((a, b) => eff[b] - eff[a]);
  const weak = Object.values(eff).filter(m => m > 1).length;
  const stages = evoStages(p);
  const ev = Object.entries(p.yields).map(([k, v]) => `${v} ${t.short[k]}`).join(" · ");
  const abilities = p.abilities.map((a, i) => (a ? { a, hidden: i === 2 } : null)).filter(Boolean).filter((x, i, arr) => arr.findIndex(y => y.a === x.a) === i);

  return (
    <>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(220px,300px)] items-center gap-7 max-[860px]:grid-cols-1">
        <div>
          <div aria-hidden="true" className="outline-num font-mono text-[clamp(3.4rem,9vw,6.5rem)] font-light leading-[0.9] tracking-[-0.04em]">{pad(p.id)}</div>
          <h1 className="mb-0.5 mt-2.5 text-balance text-[clamp(2.2rem,5.2vw,3.8rem)] font-light leading-none tracking-[-0.045em]">{nameOf(p, lang)}</h1>
          <p className="mb-4 text-faint">{lang === "fr" ? p.en : p.fr} · #{pad(p.id)}</p>
          <div className="flex flex-wrap gap-1.5">
            {p.types.map(ty => <TypePill key={ty} t={ty} />)}
            <span className="inline-flex h-7 items-center rounded-full border border-line px-3 font-mono text-[0.78rem] text-muted">{p.tier || t.untiered}</span>
          </div>
          {!p.obtainable && <p className="mt-3 inline-block rounded-lg bg-sunk px-2.5 py-1 text-[0.82rem] text-muted">{t.notObtainable}</p>}
          <dl className="mt-[22px] flex flex-wrap gap-x-[22px] gap-y-3">
            {[[t.bst, p.bst], [t.gen, p.gen], [t.matchups, `${weak} ×2+`], [t.evYield, ev || "—"]].map(([k, v]) => (
              <div key={k} className="grid">
                <dt className="eyebrow">{k}</dt>
                <dd className="font-mono text-[1.05rem]">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-[22px] flex flex-wrap gap-2">
            <a href={href({ page: "pokemon", id: p.id, tab: "elevage" })} className="inline-flex h-10 items-center gap-2 rounded-xl bg-fg px-4 text-[0.9rem] font-medium text-bg hover:bg-accent-ink">
              {Icon.egg}{t.planBreed}
            </a>
            <a href={href({ page: "pokemon", id: p.id, tab: "lieux" })} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-panel px-4 text-[0.9rem] text-fg hover:border-accent">
              {Icon.pin}{t.seeLocations}
            </a>
            {inTeam ? (
              <a href="#/equipe" className="inline-flex h-10 items-center gap-2 rounded-xl border border-accent bg-accent-soft px-4 text-[0.9rem] font-medium text-accent-ink">✓ {t.inTeam(team.length)}</a>
            ) : team.length >= 6 ? (
              <a href="#/equipe" className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-panel px-4 text-[0.9rem] text-muted hover:border-accent">{t.teamFull}</a>
            ) : (
              <button type="button" onClick={() => setTeam(cur => [...cur.filter(Boolean), { id: p.id, moves: [] }])} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-panel px-4 text-[0.9rem] text-fg hover:border-accent">
                + {t.addToTeam} <span className="font-mono text-[0.76rem] text-faint">{team.length}/6</span>
              </button>
            )}
          </div>
        </div>
        <div className="disc-bg relative grid aspect-square max-w-full place-items-center rounded-full max-[860px]:order-first max-[860px]:mx-auto max-[860px]:w-[min(260px,70vw)]">
          <span className="absolute inset-[8%] rounded-full border border-dashed" style={{ borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)" }} />
          <Sprite key={p.id + (shiny ? "s" : "")} p={p} animated shiny={shiny} className="anim-rise relative z-[1] h-[62%] w-[62%]" fallbackClass="size-[34%]" />
          <button
            type="button"
            aria-pressed={shiny}
            onClick={() => setShiny(s => !s)}
            className={`absolute bottom-[6%] left-1/2 z-[2] inline-flex h-9 whitespace-nowrap -translate-x-1/2 items-center gap-1.5 rounded-full border px-3.5 text-[0.84rem] font-medium shadow-soft transition-colors ${
              shiny ? "border-transparent bg-[oklch(0.82_0.14_85)] text-[oklch(0.3_0.08_70)]" : "border-line bg-panel text-muted hover:text-fg"
            }`}
          >
            {Icon.sparkle}{shiny ? t.normalBtn : t.shinyBtn}
          </button>
        </div>
      </div>

      <Section title={t.baseStats} aside={`${t.total} ${p.bst}`}>
        <div className="grid grid-cols-[minmax(0,260px)_minmax(0,1fr)] items-center gap-8 max-[860px]:grid-cols-1 max-[860px]:justify-items-center">
          <Radar s={p.stats} />
          <div className="grid w-full gap-[11px]">
            {STATS.map(k => (
              <div key={k} className="grid grid-cols-[86px_34px_minmax(0,1fr)] items-center gap-3 text-[0.88rem] text-muted">
                <span>{t.stats[k]}</span>
                <b className="text-right font-mono font-normal tabular-nums text-fg">{p.stats[k]}</b>
                <span className="h-1.5 overflow-hidden rounded-full bg-sunk">
                  <i className="block h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.min(100, (p.stats[k] / 200) * 100)}%` }} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title={t.abilities}>
        <div className="flex flex-wrap gap-2">
          {abilities.map(({ a, hidden }) => <AbilityTag key={a} name={a} hidden={hidden} />)}
        </div>
      </Section>

      <Section title={t.matchups}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-1.5">
          {order.map(ty => {
            const m = eff[ty];
            const cls = m === 4 ? "font-medium text-fg" : m === 2 ? "text-fg" : m === 0 ? "opacity-50" : m < 1 ? "opacity-75" : "opacity-50";
            const bg = m === 4 ? "color-mix(in oklab, oklch(0.62 0.17 28) 30%, var(--panel))" : m === 2 ? "color-mix(in oklab, oklch(0.62 0.17 28) 16%, var(--panel))" : "var(--sunk)";
            return (
              <div key={ty} className={`flex items-center justify-between gap-1.5 rounded-[10px] px-2.5 py-2 text-[0.8rem] text-muted ${cls}`} style={{ background: bg }}>
                <span className={`flex min-w-0 items-center gap-1.5 ${m === 0 ? "line-through" : ""}`}>
                  <i className="size-[7px] flex-none rounded-full" style={{ background: TYPES[ty].col }} />
                  {lang === "fr" ? TYPES[ty].fr : ty}
                </span>
                <b className={`font-mono text-[0.78rem] font-normal ${m > 0 && m < 1 ? "text-[oklch(0.6_0.12_150)]" : ""}`}>×{m === 0.5 ? "½" : m === 0.25 ? "¼" : m}</b>
              </div>
            );
          })}
        </div>
      </Section>

      {stages.flat().length > 1 && (
        <Section title={t.evo}>
          <div className="flex flex-wrap items-center gap-2">
            {stages.map((st, i) => (
              <div key={i} className="contents">
                {i > 0 && <span className="text-faint" aria-hidden="true">→</span>}
                <div className="grid gap-1.5">
                  {st.map(({ p: q, how }) => (
                    <a
                      key={q.id}
                      href={href({ page: "pokemon", id: q.id })}
                      aria-current={q.id === p.id ? "true" : undefined}
                      className={`grid min-w-[104px] justify-items-center gap-0.5 rounded-[14px] border px-3.5 pb-2.5 pt-2 text-[0.82rem] ${
                        q.id === p.id ? "border-transparent bg-accent-soft font-medium text-accent-ink" : "border-line bg-panel text-muted hover:border-accent hover:text-fg"
                      }`}
                    >
                      <span className="grid size-14 place-items-center"><Sprite p={q} className="size-14" /></span>
                      {nameOf(q, lang)}
                      {how && <span className="text-[0.7rem] font-normal text-faint">{evoText(how, t, lang)}</span>}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <p className="text-[0.78rem] text-faint">{t.note}</p>
    </>
  );
}

function evoText(e, t, lang) {
  const f = t.evoHow[e.how];
  const item = e.item ? (lang === "fr" ? e.item.fr : e.item.en) : "";
  return f ? f(e.val, item) : t.evoOther;
}

function Radar({ s }) {
  const { t } = useLang();
  const order = ["hp", "atk", "def", "spe", "spd", "spa"], R = 92, C = 130, MAX = 200;
  const pt = (i, r) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  };
  const poly = r => order.map((_, i) => pt(i, r).map(v => v.toFixed(1)).join(",")).join(" ");
  const shape = order.map((k, i) => pt(i, (Math.max(6, Math.min(s[k], MAX)) / MAX) * R).map(v => v.toFixed(1)).join(",")).join(" ");
  return (
    <svg viewBox="0 0 260 260" role="img" aria-label={order.map(k => `${t.stats[k]} ${s[k]}`).join(", ")} className="h-auto w-full max-w-[260px] overflow-visible">
      {[0.25, 0.5, 0.75, 1].map(f => <polygon key={f} points={poly(R * f)} fill="none" stroke="var(--line)" />)}
      {order.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="var(--line)" />; })}
      <polygon points={shape} fill="color-mix(in oklab, var(--accent) 26%, transparent)" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
      {order.map((k, i) => {
        const [x, y] = pt(i, R + 22);
        return (
          <g key={k}>
            <text x={x} y={y - 3} textAnchor="middle" fill="var(--muted)" style={{ font: "500 10px var(--font-sans)", letterSpacing: ".06em" }}>{t.radar[k]}</text>
            <text x={x} y={y + 10} textAnchor="middle" fill="var(--fg)" style={{ font: "400 11px var(--font-mono)" }}>{s[k]}</text>
          </g>
        );
      })}
    </svg>
  );
}
