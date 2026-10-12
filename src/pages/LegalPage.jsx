import { useEffect } from "react";
import { useLang } from "../lib/i18n.js";
import { clearAll, STORAGE_KEYS } from "../lib/storage.js";
import { REPO } from "../components/Sidebar.jsx";
import { Icon } from "../components/ui.jsx";
import dex from "../data/dex.json";

const UPDATED = { fr: "12 octobre 2026", en: "October 12, 2026" };
const ext = (url, label) => <a href={url} target="_blank" rel="noreferrer">{label}</a>;

const STORAGE_TABLE = {
  fr: { lang: "Langue choisie", theme: "Thème clair ou sombre", ivs: "IV cochés dans le planificateur d'élevage", natured: "Option « nature » de l'élevage", prices: "Prix saisis pour l'estimation du coût", box: "Pokémon que tu as ajoutés pour l'élevage (espèce, genre, IV, nature, talent)", shareName: "Pseudo affiché quand tu partages un plan", view: "Affichage choisi (fiche ou cartes)", evStat: "Dernière stat choisie dans Hordes EV" },
  en: { lang: "Chosen language", theme: "Light or dark theme", ivs: "IVs ticked in the breeding planner", natured: "Breeding \"nature\" option", prices: "Prices entered for the cost estimate", box: "Pokémon you added for breeding (species, gender, IVs, nature, ability)", shareName: "Name shown when you share a plan", view: "Chosen view (sheet or cards)", evStat: "Last stat picked in EV Hordes" },
};

function StorageList({ lang }) {
  return (
    <ul>
      {STORAGE_KEYS.map(k => <li key={k}><code>pmdex:{k}</code> : {STORAGE_TABLE[lang][k]}</li>)}
    </ul>
  );
}

const PAGES = {
  "a-propos": {
    fr: {
      title: "À propos",
      body: lang => (
        <>
          <p>PokeMMO Dex est un Pokédex et un planificateur d'élevage pour <strong>PokeMMO</strong>, pensé d'abord pour les joueurs francophones. Il est <strong>gratuit, sans publicité, sans compte et open source</strong>.</p>
          <h2>Code source et licence</h2>
          <p>Le code est publié sous licence MIT sur {ext(REPO, "GitHub")}. Tu peux le lire, le copier, le modifier et proposer des améliorations. Pour signaler une erreur dans les données ou un bug, ouvre une {ext(REPO + "/issues", "issue")}.</p>
          <h2>D'où viennent les données</h2>
          <ul>
            <li>Stats, types, talents, groupes œuf, lieux de capture et noms français : {ext("https://github.com/PokeMMO-Tools/pokemmo-data", "PokeMMO-Tools/pokemmo-data")}, des données exportées du client PokeMMO.</li>
            <li>Tiers PvP : {ext("https://github.com/PokeMMOZone/PokeMMO-Data", "PokeMMOZone/PokeMMO-Data")}.</li>
            <li>Notes des talents et table des types de 5e génération : {ext("https://github.com/smogon/pokemon-showdown", "Pokémon Showdown")} (licence MIT).</li>
            <li>Sprites : sprites Noir & Blanc hébergés par {ext("https://play.pokemonshowdown.com", "Pokémon Showdown")}.</li>
          </ul>
          <p>Données générées le {dex.generated}. Elles peuvent avoir du retard sur la dernière mise à jour du jeu.</p>
          <h2>Marques</h2>
          <p>Pokémon et les noms des Pokémon sont des marques de Nintendo, Creatures Inc., GAME FREAK inc. et The Pokémon Company. PokeMMO appartient à ses propriétaires. Ce site est un projet de fan indépendant, sans lien avec eux et non approuvé par eux.</p>
        </>
      ),
    },
    en: {
      title: "About",
      body: () => (
        <>
          <p>PokeMMO Dex is a Pokédex and breeding planner for <strong>PokeMMO</strong>. It is <strong>free, ad-free, account-free and open source</strong>.</p>
          <h2>Source code and license</h2>
          <p>The code is released under the MIT license on {ext(REPO, "GitHub")}. You can read, copy, change it and suggest improvements. To report a data error or a bug, open an {ext(REPO + "/issues", "issue")}.</p>
          <h2>Where the data comes from</h2>
          <ul>
            <li>Stats, types, abilities, egg groups, locations and French names: {ext("https://github.com/PokeMMO-Tools/pokemmo-data", "PokeMMO-Tools/pokemmo-data")}, data exported from the PokeMMO client.</li>
            <li>PvP tiers: {ext("https://github.com/PokeMMOZone/PokeMMO-Data", "PokeMMOZone/PokeMMO-Data")}.</li>
            <li>Ability ratings and the Generation 5 type chart: {ext("https://github.com/smogon/pokemon-showdown", "Pokémon Showdown")} (MIT license).</li>
            <li>Sprites: Black & White sprites hosted by {ext("https://play.pokemonshowdown.com", "Pokémon Showdown")}.</li>
          </ul>
          <p>Data generated on {dex.generated}. It may lag behind the latest game update.</p>
          <h2>Trademarks</h2>
          <p>Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc., GAME FREAK inc. and The Pokémon Company. PokeMMO belongs to its owners. This site is an independent fan project, not affiliated with or endorsed by them.</p>
        </>
      ),
    },
  },

  "mentions-legales": {
    fr: {
      title: "Mentions légales",
      body: () => (
        <>
          <h2>Éditeur</h2>
          <p>PokeMMO Dex est un projet personnel, non commercial et open source publié par <strong>rayan-studio</strong>. Contact : via les {ext(REPO + "/issues", "issues du dépôt GitHub")}.</p>
          <h2>Hébergement</h2>
          <p>Le site est hébergé par <strong>GitHub Pages</strong>, service de GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis. {ext("https://github.com/contact", "github.com/contact")}</p>
          <h2>Propriété intellectuelle</h2>
          <p>Le code source du site est publié sous licence MIT. Les marques, noms et images liés à Pokémon appartiennent à Nintendo, Creatures Inc., GAME FREAK inc. et The Pokémon Company. PokeMMO appartient à ses propriétaires. Ce site n'est ni affilié à ces sociétés, ni approuvé par elles.</p>
          <p>Les données proviennent de projets communautaires cités sur la page {<a href="#/a-propos">À propos</a>}, chacun sous sa propre licence.</p>
          <h2>Responsabilité</h2>
          <p>Les informations sont fournies telles quelles, sans garantie d'exactitude ni d'exhaustivité. Les prix et plans d'élevage sont des estimations : vérifie toujours dans le jeu avant de dépenser de l'argent ou des Pokémon.</p>
          <h2>Données personnelles</h2>
          <p>Le site ne collecte aucune donnée personnelle. Détails sur la page {<a href="#/confidentialite">Confidentialité</a>}.</p>
        </>
      ),
    },
    en: {
      title: "Legal notice",
      body: () => (
        <>
          <h2>Publisher</h2>
          <p>PokeMMO Dex is a personal, non-commercial, open-source project published by <strong>rayan-studio</strong>. Contact: through the {ext(REPO + "/issues", "GitHub repository issues")}.</p>
          <h2>Hosting</h2>
          <p>The site is hosted by <strong>GitHub Pages</strong>, a service of GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States. {ext("https://github.com/contact", "github.com/contact")}</p>
          <h2>Intellectual property</h2>
          <p>The site's source code is released under the MIT license. Pokémon trademarks, names and images belong to Nintendo, Creatures Inc., GAME FREAK inc. and The Pokémon Company. PokeMMO belongs to its owners. This site is not affiliated with or endorsed by these companies.</p>
          <p>The data comes from community projects listed on the {<a href="#/a-propos">About</a>} page, each under its own license.</p>
          <h2>Liability</h2>
          <p>Information is provided as is, with no guarantee of accuracy or completeness. Prices and breeding plans are estimates: always check in game before spending money or Pokémon.</p>
          <h2>Personal data</h2>
          <p>The site collects no personal data. Details on the {<a href="#/confidentialite">Privacy</a>} page.</p>
        </>
      ),
    },
  },

  confidentialite: {
    fr: {
      title: "Politique de confidentialité",
      body: lang => (
        <>
          <p>En bref : <strong>aucun compte, aucun formulaire, aucune statistique de visite, aucune publicité, aucun traceur.</strong> Le site ne collecte ni ne vend aucune donnée personnelle.</p>
          <h2>Ce qui reste dans ton navigateur</h2>
          <p>Pour retenir tes réglages, le site enregistre quelques préférences dans le stockage local de ton navigateur (localStorage). Elles ne quittent jamais ton appareil et personne d'autre n'y a accès :</p>
          <StorageList lang={lang} />
          <h2>Services tiers contactés par ton navigateur</h2>
          <p>Pour afficher la page, ton navigateur se connecte à ces services. Comme pour tout site web, ils reçoivent ton adresse IP et des informations techniques (navigateur, page demandée) :</p>
          <ul>
            <li><strong>GitHub Pages</strong> (hébergement) : {ext("https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement", "déclaration de confidentialité de GitHub")}.</li>
            <li><strong>Google Fonts</strong> (polices Geist et Geist Mono) : {ext("https://policies.google.com/privacy", "règles de confidentialité de Google")}.</li>
            <li><strong>Pokémon Showdown</strong> (images des Pokémon) : {ext("https://pokemonshowdown.com/privacy", "politique de Pokémon Showdown")}.</li>
            <li><strong>YouTube</strong> (miniatures de la page Tutoriels, chargées seulement sur cette page ; les vidéos s'ouvrent sur YouTube) : {ext("https://policies.google.com/privacy", "règles de confidentialité de Google")}.</li>
          </ul>
          <h2>Tes droits</h2>
          <p>Comme le site ne détient aucune donnée sur toi, il n'y a rien à consulter ou à supprimer de notre côté. Tu peux effacer tes préférences locales à tout moment depuis la page {<a href="#/cookies">Cookies</a>}. Pour toute question, ouvre une {ext(REPO + "/issues", "issue sur GitHub")}. Tu peux aussi contacter l'autorité de protection des données de ton pays (la CNIL en France, l'APD en Belgique).</p>
        </>
      ),
    },
    en: {
      title: "Privacy policy",
      body: lang => (
        <>
          <p>In short: <strong>no account, no forms, no visitor analytics, no ads, no trackers.</strong> The site collects and sells no personal data.</p>
          <h2>What stays in your browser</h2>
          <p>To remember your settings, the site saves a few preferences in your browser's local storage (localStorage). They never leave your device and nobody else can see them:</p>
          <StorageList lang={lang} />
          <h2>Third-party services your browser contacts</h2>
          <p>To show the page, your browser connects to these services. As with any website, they receive your IP address and technical details (browser, requested page):</p>
          <ul>
            <li><strong>GitHub Pages</strong> (hosting): {ext("https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement", "GitHub privacy statement")}.</li>
            <li><strong>Google Fonts</strong> (Geist and Geist Mono fonts): {ext("https://policies.google.com/privacy", "Google privacy policy")}.</li>
            <li><strong>Pokémon Showdown</strong> (Pokémon images): {ext("https://pokemonshowdown.com/privacy", "Pokémon Showdown policy")}.</li>
            <li><strong>YouTube</strong> (thumbnails on the Tutorials page, loaded only there; videos open on YouTube): {ext("https://policies.google.com/privacy", "Google privacy policy")}.</li>
          </ul>
          <h2>Your rights</h2>
          <p>Since the site holds no data about you, there is nothing to access or delete on our side. You can clear your local preferences at any time from the {<a href="#/cookies">Cookies</a>} page. For any question, open a {ext(REPO + "/issues", "GitHub issue")}. You can also contact your country's data protection authority.</p>
        </>
      ),
    },
  },

  cookies: {
    fr: {
      title: "Cookies",
      body: lang => (
        <>
          <p><strong>Le site ne dépose aucun cookie</strong> : ni cookie de mesure d'audience, ni cookie publicitaire, ni cookie de réseau social. C'est pour ça qu'il n'y a pas de bandeau de consentement.</p>
          <h2>Stockage local</h2>
          <p>Le site garde seulement tes préférences dans le stockage local de ton navigateur. Ce stockage sert uniquement au fonctionnement que tu as demandé (retenir ta langue, ton thème, tes réglages d'élevage) et n'est lu par aucun tiers :</p>
          <StorageList lang={lang} />
          <h2>Effacer tes préférences</h2>
          <ClearButton lang={lang} />
        </>
      ),
    },
    en: {
      title: "Cookies",
      body: lang => (
        <>
          <p><strong>The site sets no cookies</strong>: no analytics, advertising or social media cookies. That's why there is no consent banner.</p>
          <h2>Local storage</h2>
          <p>The site only keeps your preferences in your browser's local storage. It is used only for features you asked for (remembering your language, theme and breeding settings) and no third party reads it:</p>
          <StorageList lang={lang} />
          <h2>Clear your preferences</h2>
          <ClearButton lang={lang} />
        </>
      ),
    },
  },
};

function ClearButton({ lang }) {
  return (
    <p>
      <button
        type="button"
        onClick={() => { clearAll(); location.hash = "/"; location.reload(); }}
        className="mt-1 inline-flex h-10 items-center rounded-xl border border-line bg-panel px-4 text-[0.9rem] text-fg hover:border-accent"
      >
        {lang === "fr" ? "Effacer mes préférences et ma boîte, puis recharger" : "Clear my preferences and box, then reload"}
      </button>
    </p>
  );
}

export default function LegalPage({ slug }) {
  const { lang, t } = useLang();
  const page = PAGES[slug][lang];
  useEffect(() => {
    document.documentElement.style.setProperty("--h", 145);
    document.documentElement.style.setProperty("--cc", 0.1);
  }, []);
  return (
    <article className="prose-legal mx-auto max-w-[72ch] px-8 pb-16 pt-[22px] max-[860px]:px-4 max-[860px]:pt-3.5">
      <title>{`${page.title} · PokeMMO Dex`}</title>
      <a href="#/" className="inline-flex h-[34px] items-center gap-1.5 rounded-[10px] border border-line bg-panel px-3 text-[0.82rem] !text-muted !no-underline hover:!text-fg">{Icon.left}{t.home}</a>
      <h1 className="mt-6 text-balance text-[clamp(2rem,4.4vw,3rem)] font-light leading-none tracking-[-0.045em] text-fg">{page.title}</h1>
      <p className="!mt-2 !text-[0.82rem] !text-faint">{lang === "fr" ? "Dernière mise à jour" : "Last updated"} : {UPDATED[lang]}</p>
      <div className="mt-6">{page.body(lang)}</div>
      <p className="!mt-10 border-t border-line pt-4 !text-[0.8rem] !text-faint">{t.disclaimer}</p>
    </article>
  );
}
