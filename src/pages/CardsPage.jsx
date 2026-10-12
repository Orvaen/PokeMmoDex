import { TYPES, pad } from "../lib/data.js";
import { nameOf, useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { Sprite, TypePill } from "../components/ui.jsx";

// Vue « Cartes » : la grille des Pokémon filtrés, sur toute la largeur
export default function CardsPage({ visible }) {
  const { lang, t } = useLang();
  return (
    <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)] gap-5 px-6 pb-16 pt-5 max-[860px]:px-3 max-[860px]:pt-3">
      <title>{`Pokédex · PokeMMO Dex`}</title>
      {visible.length ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-3 max-[520px]:grid-cols-2 max-[520px]:gap-2">
          {visible.map(p => <Card key={p.id} p={p} />)}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">{t.noMatch}</p>
      )}
    </div>
  );
}

function Card({ p }) {
    const { lang, t } = useLang();
    const col = TYPES[p.types[0]].col;
    return (
      <li className="[content-visibility:auto] [contain-intrinsic-size:250px]">
        <a
          href={href({ page: "pokemon", id: p.id })}
          className="group grid h-full content-start gap-2.5 rounded-2xl border border-line bg-panel p-3 text-center transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:shadow-soft"
          style={{ "--c": col }}
        >
          <div className="flex items-center justify-between font-mono text-[0.72rem] text-faint">
            <span>#{pad(p.id)}</span>
            <span className={`rounded-full px-2 py-px font-sans text-[0.68rem] ${p.tier ? "border border-line text-muted" : "text-faint"}`}>{p.tier || t.untiered}</span>
          </div>
          <div
            className="mx-auto grid aspect-square w-full max-w-[120px] place-items-center rounded-full"
            style={{ background: `radial-gradient(circle at 50% 60%, color-mix(in oklab, ${col} 22%, transparent), transparent 70%)` }}
          >
            <Sprite p={p} className="size-[88px] transition-transform duration-200 group-hover:scale-110" fallbackClass="size-10" />
          </div>
          <div className="grid gap-0.5">
            <span className={`truncate text-[1rem] font-medium tracking-tight ${p.obtainable ? "" : "text-faint"}`}>{nameOf(p, lang)}</span>
            <span className="font-mono text-[0.72rem] text-faint">{t.bst} {p.bst}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            {p.types.map(ty => <TypePill key={ty} t={ty} size="sm" />)}
          </div>
          <dl className="mt-0.5 grid grid-cols-3 border-t border-line pt-2 text-[0.68rem] text-faint">
            {[["hp", p.stats.hp], ["atk", p.stats.atk], ["spe", p.stats.spe]].map(([k, v]) => (
              <div key={k} className="grid">
                <dt>{t.short[k]}</dt>
                <dd className="font-mono text-[0.84rem] text-fg">{v}</dd>
              </div>
            ))}
          </dl>
        </a>
      </li>
    );
  }
