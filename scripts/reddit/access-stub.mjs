// Copie de centerInfo (src/components/Access.jsx) sans le JSX, pour l'exécuter dans Node.
// À garder identique à l'original si la règle change.
import { LOCATIONS } from "../../src/lib/encounters.js";
import { REGION_MAPS, accessPath, baseName, hasCenter } from "../../src/data/maps.js";

export function centerInfo(locKey) {
  const loc = LOCATIONS[locKey];
  const base = baseName(loc.en);
  const map = REGION_MAPS[loc.region];
  const path = accessPath(loc.region, base);
  if (!path || !hasCenter(map.nodes[path[0]])) return null;
  const ferry = path.some((n, i) => i > 0 && map.edges.some(e => e.ferry && ((e.a === n && e.b === path[i - 1]) || (e.b === n && e.a === path[i - 1]))));
  const steps = path.length - 1;
  const advice = steps <= 1 && !ferry ? "center" : steps === 2 && !ferry ? "both" : "leppa";
  return { city: path[0], steps, ferry, advice };
}
