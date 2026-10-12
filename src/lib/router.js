import { useEffect, useState } from "react";

// Routeur par hash : marche sur GitHub Pages sans configuration serveur.
//   #/                       → accueil (liste)
//   #/pokemon/94             → fiche
//   #/pokemon/94/lieux       → lieux
//   #/pokemon/94/elevage     → élevage (?plan=… : plan partagé par lien)
//   #/lieu/<clé>             → page d'un lieu
//   #/pokemon/94/capacites  → capacités du Pokémon
//   #/capacites, #/capacite/89 → liste des capacités, page d'une capacité
//   #/equipe (?t=… : équipe partagée par lien)
//   #/tutoriels, #/hordes-ev, #/natures, #/baies (?c=ev : une famille), #/talents, #/talent/<nom>
//   #/a-propos, #/mentions-legales, #/confidentialite, #/cookies
export const LEGAL_PAGES = ["a-propos", "mentions-legales", "confidentialite", "cookies"];
const TABS = ["fiche", "capacites", "lieux", "elevage"];

export function parseHash(hash) {
  const [rawPath, query = ""] = hash.replace(/^#\/?/, "").split("?");
  const h = decodeURIComponent(rawPath);
  const params = new URLSearchParams(query);
  const plan = params.get("plan");
  // anciens liens : #94 et #breed-94
  const old = h.match(/^(breed-)?(\d+)$/);
  if (old) return { page: "pokemon", id: +old[2], tab: old[1] ? "elevage" : "fiche" };
  const parts = h.split("/").filter(Boolean);
  if (!parts.length) return { page: "home" };
  if (parts[0] === "pokemon" && /^\d+$/.test(parts[1] || "")) return { page: "pokemon", id: +parts[1], tab: TABS.includes(parts[2]) ? parts[2] : "fiche", plan };
  if (parts[0] === "lieu" && parts[1]) return { page: "location", key: parts.slice(1).join("/") };
  if (parts[0] === "tutoriels") return { page: "tutorials" };
  if (parts[0] === "hordes-ev") return { page: "evhordes" };
  if (parts[0] === "natures") return { page: "natures" };
  if (parts[0] === "talents") return { page: "abilities" };
  if (parts[0] === "talent" && parts[1]) return { page: "ability", name: parts.slice(1).join("/") };
  if (parts[0] === "baies") return { page: "berries", group: params.get("c") || "" };
  if (parts[0] === "capacites") return { page: "moves" };
  if (parts[0] === "equipe") return { page: "team", team: params.get("t") };
  if (parts[0] === "capacite" && /^\d+$/.test(parts[1] || "")) return { page: "move", id: +parts[1] };
  if (LEGAL_PAGES.includes(parts[0])) return { page: "legal", slug: parts[0] };
  return { page: "notfound" };
}

export function href(route) {
  if (route.page === "pokemon") return `#/pokemon/${route.id}${route.tab && route.tab !== "fiche" ? "/" + route.tab : ""}`;
  if (route.page === "location") return `#/lieu/${encodeURIComponent(route.key)}`;
  if (route.page === "legal") return `#/${route.slug}`;
  if (route.page === "tutorials") return "#/tutoriels";
  if (route.page === "evhordes") return "#/hordes-ev";
  if (route.page === "natures") return "#/natures";
  if (route.page === "abilities") return "#/talents";
  if (route.page === "ability") return `#/talent/${encodeURIComponent(route.name)}`;
  if (route.page === "berries") return "#/baies" + (route.group ? "?c=" + route.group : "");
  if (route.page === "moves") return "#/capacites";
  if (route.page === "team") return "#/equipe";
  if (route.page === "move") return `#/capacite/${route.id}`;
  return "#/";
}

export const go = route => { location.hash = href(route).slice(1); };

export function useRoute() {
  const [hash, setHash] = useState(() => location.hash);
  useEffect(() => {
    const onChange = () => setHash(location.hash);
    addEventListener("hashchange", onChange);
    return () => removeEventListener("hashchange", onChange);
  }, []);
  return parseHash(hash);
}
