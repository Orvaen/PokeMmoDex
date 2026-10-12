import { LOCATIONS } from "../lib/encounters.js";
import { useLang } from "../lib/i18n.js";
import { href } from "../lib/router.js";
import { AREAS, EXTRA_FR, REGION_MAPS, baseName } from "../data/maps.js";

// Index : région → nom de base → clés des lieux dans les données (variantes jour/nuit, saisons…)
export const BASE_INDEX = REGION_MAPS.map(() => ({}));
for (const [key, loc] of Object.entries(LOCATIONS)) {
  (BASE_INDEX[loc.region][baseName(loc.en)] ||= []).push(key);
}

export function placeName(region, base, lang) {
  if (lang !== "fr") return base;
  const key = BASE_INDEX[region]?.[base]?.[0];
  if (key) return baseName(LOCATIONS[key].fr);
  return EXTRA_FR[base] || base;
}

const S = 8; // pixels par unité du schéma
const shortLabel = name => {
  const m = name.match(/^Route (\d+)$/);
  return m ? m[1] : null;
};

/**
 * Schéma d'une région.
 * highlight : noms de base à mettre en avant (lieux où vit le Pokémon)
 * focus     : lieu principal (page d'un lieu)
 * path      : chemin d'accès, de la ville au lieu
 * hover     : lieu survolé dans la liste à côté
 */
export default function RegionMap({ region, highlight = [], focus = null, path = [], hover = null, className = "" }) {
  const { lang } = useLang();
  const map = REGION_MAPS[region];
  if (!map) return null;
  const areas = AREAS[region];
  if (areas.length === 1) return <AreaMap region={region} area={areas[0]} {...{ highlight, focus, path, hover, className }} />;
  // Plusieurs zones : on montre celles qui contiennent le lieu ou les lieux mis en avant
  const wanted = [focus, ...highlight].filter(Boolean);
  const shown = areas.filter(a => wanted.some(n => map.nodes[n] && a.test(map.nodes[n])));
  return (
    <div className="grid gap-3">
      {(shown.length ? shown : [areas[0]]).map(a => (
        <div key={a.id}>
          {shown.length > 1 && <p className="eyebrow mb-1">{a[lang] || a.en}</p>}
          <AreaMap region={region} area={a} {...{ highlight, focus, path, hover, className }} />
        </div>
      ))}
    </div>
  );
}

function AreaMap({ region, area, highlight, focus, path, hover, className }) {
  const { lang } = useLang();
  const full = REGION_MAPS[region];
  const keep = Object.fromEntries(Object.entries(full.nodes).filter(([, n]) => area.test(n)));
  const map = { nodes: keep, edges: full.edges.filter(e => keep[e.a] && keep[e.b]) };
  const nodes = Object.values(map.nodes);
  const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
  const pad = 7;
  const minX = Math.min(...xs) - pad, minY = Math.min(...ys) - pad;
  const w = (Math.max(...xs) - minX + pad) * S, h = (Math.max(...ys) - minY + pad) * S;
  const X = x => (x - minX) * S, Y = y => (y - minY) * S;

  const hi = new Set(highlight);
  const onPath = new Set(path);
  const pathEdges = new Set();
  for (let i = 0; i < path.length - 1; i++) pathEdges.add([path[i], path[i + 1]].sort().join("|"));

  const nodeLink = n => {
    const keys = BASE_INDEX[region][n.name];
    return keys ? href({ page: "location", key: keys[0] }) : null;
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`h-auto w-full select-none ${className}`} role="img" aria-label={focus ? placeName(region, focus, lang) : undefined}>
      {/* Liaisons */}
      {map.edges.map(({ a, b, ferry }) => {
        const A = map.nodes[a], B = map.nodes[b];
        const active = pathEdges.has([a, b].sort().join("|"));
        const water = A.kind === "w" || B.kind === "w";
        return (
          <line
            key={a + b}
            x1={X(A.x)} y1={Y(A.y)} x2={X(B.x)} y2={Y(B.y)}
            stroke={active ? "var(--accent)" : water || ferry ? "oklch(0.7 0.08 235 / 0.55)" : "var(--line)"}
            strokeWidth={active ? 11 : ferry ? 3.5 : 9}
            strokeDasharray={ferry ? "10 9" : undefined}
            strokeLinecap="round"
          />
        );
      })}

      {/* Lieux */}
      {nodes.map(n => {
        const isFocus = n.name === focus;
        const isHi = hi.has(n.name) || n.name === hover;
        const isPath = onPath.has(n.name);
        const strong = isFocus || isHi;
        const fill = strong ? "var(--accent)" : isPath ? "var(--accent-soft)" : n.kind === "c" ? "var(--panel)" : n.kind === "w" ? "oklch(0.78 0.07 235)" : n.kind === "d" ? "var(--sunk)" : "var(--panel)";
        const stroke = strong ? "var(--accent-ink)" : isPath ? "var(--accent)" : n.kind === "c" ? "var(--fg)" : "var(--faint)";
        const x = X(n.x), y = Y(n.y);
        const label = placeName(region, n.name, lang);
        const short = shortLabel(n.name);
        const showLabel = n.kind === "c" || strong || isPath;
        const link = nodeLink(n);
        const shape =
          n.kind === "c" ? <rect x={x - 13} y={y - 13} width="26" height="26" rx="7" fill={fill} stroke={stroke} strokeWidth="3" />
          : n.kind === "d" ? <rect x={x - 10} y={y - 10} width="20" height="20" rx="3" transform={`rotate(45 ${x} ${y})`} fill={fill} stroke={stroke} strokeWidth="2.5" />
          : <circle cx={x} cy={y} r={strong ? 12 : 8.5} fill={fill} stroke={stroke} strokeWidth="2.5" />;
        const body = (
          <g style={{ cursor: link ? "pointer" : "default" }}>
            <title>{label}</title>
            {isFocus && <circle cx={x} cy={y} r="26" fill="none" stroke="var(--accent)" strokeWidth="3" opacity="0.5" />}
            {shape}
            {short && !showLabel && <text x={x} y={y + 30} textAnchor="middle" fill="var(--faint)" style={{ font: "500 15px var(--font-mono)" }}>{short}</text>}
            {showLabel && (
              <text
                x={x}
                y={y - 20}
                textAnchor="middle"
                fill={strong ? "var(--fg)" : "var(--muted)"}
                stroke="var(--bg)"
                strokeWidth="6"
                paintOrder="stroke"
                style={{ font: `${strong ? 600 : 500} ${strong ? 22 : n.kind === "c" ? 19 : 16}px var(--font-sans)` }}
              >
                {short && !strong ? short : label}
              </text>
            )}
          </g>
        );
        return link ? <a key={n.name} href={link} aria-label={label}>{body}</a> : <g key={n.name}>{body}</g>;
      })}
    </svg>
  );
}

export function MapLegend() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const item = (shape, label) => <span className="inline-flex items-center gap-1.5">{shape}{label}</span>;
  return (
    <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[0.72rem] text-faint">
      {item(<svg width="12" height="12"><rect x="1" y="1" width="10" height="10" rx="3" fill="var(--panel)" stroke="var(--fg)" strokeWidth="1.5" /></svg>, fr ? "Ville" : "Town")}
      {item(<svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="var(--panel)" stroke="var(--faint)" strokeWidth="1.5" /></svg>, "Route")}
      {item(<svg width="12" height="12"><circle cx="6" cy="6" r="4" fill="oklch(0.78 0.07 235)" stroke="var(--faint)" strokeWidth="1.5" /></svg>, fr ? "Mer" : "Sea")}
      {item(<svg width="12" height="12"><rect x="2.5" y="2.5" width="7" height="7" transform="rotate(45 6 6)" fill="var(--sunk)" stroke="var(--faint)" strokeWidth="1.5" /></svg>, fr ? "Grotte, forêt, bâtiment" : "Cave, forest, building")}
      {item(<svg width="18" height="12"><line x1="1" y1="6" x2="17" y2="6" stroke="oklch(0.7 0.08 235)" strokeWidth="2" strokeDasharray="4 3" /></svg>, fr ? "Bateau" : "Ferry")}
      <span>{fr ? "Schéma simplifié, pas à l'échelle" : "Simplified diagram, not to scale"}</span>
    </div>
  );
}
