// Conditions d'un lieu, lues dans son nom : « Route 39 (Night/Season1) » → nuit, été
export const TIMES = ["Morning", "Day", "Night"];
export function condOf(en) {
  const tags = (en.match(/\(([^)]*)\)/)?.[1] || "").split("/");
  const times = tags.filter(x => TIMES.includes(x));
  const season = tags.find(x => /^Season\d$/.test(x));
  return { times: times.length ? times : TIMES, season: season ? +season.slice(6) : null };
}
// time : "" | "Morning" | "Day" | "Night" ; season : "" | "0".."3"
export const fits = (cond, time, season) => (time === "" || cond.times.includes(time)) && (season === "" || cond.season === null || cond.season === +season);


// Libellé court des conditions : « Nuit · Été », « Matin, Jour · sauf hiver » ; "" si toujours
export function condLabel(conds, t) {
  const times = new Set(conds.flatMap(c => c.times));
  const seasons = conds.some(c => c.season === null) ? null : [...new Set(conds.map(c => c.season))].sort();
  const parts = [];
  if (times.size < 3) parts.push(TIMES.filter(x => times.has(x)).map(x => t.timesOfDay[x]).join(", "));
  if (seasons && seasons.length < 4) parts.push(seasons.length === 3 ? t.exceptSeason(t.seasons[[0, 1, 2, 3].find(i => !seasons.includes(i))]) : seasons.map(i => t.seasons[i]).join(", "));
  return parts.join(" · ");
}
