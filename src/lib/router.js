import { useEffect, useState } from "react";

// Routeur par hash : marche sur GitHub Pages sans configuration serveur.
//   #/                       → accueil (liste)
//   #/pokemon/94             → fiche
//   #/pokemon/94/lieux       → lieux
//   #/pokemon/94/elevage     → élevage (?plan=… : plan partagé par lien)
//   #/lieu/<clé>             → page d'un lieu
//   #/tutoriels, #/hordes-ev
//   #/a-propos, #/mentions-legales, #/confidentialite, #/cookies
export const LEGAL_PAGES = ["a-propos", "mentions-legales", "confidentialite", "cookies"];
const TABS = ["fiche", "lieux", "elevage"];

export function parseHash(hash) {
  const [rawPath, query = ""] = hash.replace(/^#\/?/, "").split("?");
  const h = decodeURIComponent(rawPath);
  const plan = new URLSearchParams(query).get("plan");
  // anciens liens : #94 et #breed-94
  const old = h.match(/^(breed-)?(\d+)$/);
  if (old) return { page: "pokemon", id: +old[2], tab: old[1] ? "elevage" : "fiche" };
  const parts = h.split("/").filter(Boolean);
  if (!parts.length) return { page: "home" };
  if (parts[0] === "pokemon" && /^\d+$/.test(parts[1] || "")) return { page: "pokemon", id: +parts[1], tab: TABS.includes(parts[2]) ? parts[2] : "fiche", plan };
  if (parts[0] === "lieu" && parts[1]) return { page: "location", key: parts.slice(1).join("/") };
  if (parts[0] === "tutoriels") return { page: "tutorials" };
  if (parts[0] === "hordes-ev") return { page: "evhordes" };
  if (LEGAL_PAGES.includes(parts[0])) return { page: "legal", slug: parts[0] };
  return { page: "notfound" };
}

export function href(route) {
  if (route.page === "pokemon") return `#/pokemon/${route.id}${route.tab && route.tab !== "fiche" ? "/" + route.tab : ""}`;
  if (route.page === "location") return `#/lieu/${encodeURIComponent(route.key)}`;
  if (route.page === "legal") return `#/${route.slug}`;
  if (route.page === "tutorials") return "#/tutoriels";
  if (route.page === "evhordes") return "#/hordes-ev";
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
