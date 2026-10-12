# PokeMMO Dex

Pokédex et planificateur d'élevage pour **PokeMMO**, en français et en anglais. Gratuit, sans pub, sans compte et open source.

- Les 649 Pokémon des générations 1 à 5 avec les **stats, types et talents du client PokeMMO**, en vue **Fiche** (liste + fiche détaillée) ou **Cartes** (grille)
- **Créateur d'équipe** : 6 cases, verdict en une phrase, suggestions de Pokémon cliquables pour combler les faiblesses, tableau des faiblesses, couverture offensive (types ou attaques choisies), **4 attaques conseillées en un clic** (STAB + couverture, selon Attaque / Att. Spé.), partage par lien, bouton « Ajouter à l'équipe » sur chaque fiche
- **Hordes EV** : choisis la stat à monter, le site liste les spots de horde qui la donnent, les EV par horde, le nombre de hordes pour 252 et la distance au Centre Pokémon le plus proche (retour au Centre ou Baies Mepo), les CS nécessaires (Surf, Coupe, Force…), filtres « Sans / Avec Baies Mepo », « Sans CS », saison et moment de la journée (les variantes jour/nuit/saison d'un lieu sont réunies sur une seule carte, chaque espèce indique quand elle apparaît)
- **Lieux de capture** par région : méthode (herbes, surf, cannes…), rareté, hordes et niveaux, avec une page pour chaque lieu
- **Cartes des régions** (schémas dessinés pour le site) : le lieu mis en avant et le chemin depuis le Centre Pokémon le plus proche
- **Planificateur d'élevage** : tu saisis les Pokémon que tu as déjà et le plan part de là. Saisie rapide : un clic par IV à 31 (ou `31/31/x/31/31/31`), nature choisie avec ▲ / ▼, talents en boutons. Étapes à faire dans l'ordre, bouton « Fait » qui met ta boîte à jour, nature et talent conseillés, liste des Pokémon à trouver, objets et coût estimé. **Partage par lien** : le plan et les Pokémon tiennent dans l'adresse, sans serveur
- **Tutoriels** : vidéos YouTube classées par thème (débuter, argent, revanches d'arène, Ho-Oh et Red, élevage), liste dans `src/data/tutorials.js`
- **Capacités** : onglet sur chaque fiche (par niveau, CT/CS, tuteur, œuf, évolution, STAB signalé), page de chaque capacité avec tous les Pokémon qui l'apprennent, liste des 559 capacités avec filtre « CT / CS seulement ». Chargé à la demande (`src/data/moves.json`)
- **Baies** : les 64 Baies de PokeMMO classées par effet (baisse les EV, PP, soin, statut, résistance, combat…), avec les **3 graines à planter**, le temps de pousse et la récolte (`src/data/berries.json`, généré par `scripts/build-berries.mjs`)
- **Natures** : tableau des 25 natures (stat augmentée / baissée) et recherche
- **Talents** : description au survol (texte officiel français + détail), noms français officiels, page de chaque talent avec tous les Pokémon qui l'ont (normal ou caché) et liste des 169 talents
- Faiblesses (table des types Gen 5, sans Fée), évolutions, tiers PvP, EV donnés
- Filtres de la liste : région, type, tri, obtenables, **saison et moment de la journée** (Pokémon sauvages à ce moment-là)
- Recherche par nom FR ou EN, avec ou sans accents, ou par numéro (`94`, `094`, `#94`)
- Barre latérale sobre (lignes simples, icônes au trait, section « Outils » repliable), redimensionnable (glisser le bord, double-clic pour revenir) et masquable (bouton ou `Ctrl B`)
- Clavier : `Ctrl K` pour chercher, `↑` `↓` dans la liste, `←` `→` pour changer de Pokémon
- Thème clair et sombre, pages légales (mentions légales, confidentialité, cookies)

## Stack

React 19, Vite, Tailwind CSS 4. Pas de serveur : le site est statique et utilise un routeur par hash (`#/pokemon/94/elevage`), donc il tourne tel quel sur GitHub Pages.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # génère dist/
```

## Mise en ligne

Le workflow `.github/workflows/deploy.yml` construit et publie le site à chaque push sur `main`.
À faire une seule fois : **Settings → Pages → Source : GitHub Actions**.

## Données

`src/data/dex.json` (Pokémon, chargé au démarrage), `src/data/encounters.json` (lieux et rencontres, chargé seulement par les pages qui en ont besoin) et `src/data/moves.json` sont générés par `scripts/build-data.mjs` à partir de :

- [PokeMMO-Tools/pokemmo-data](https://github.com/PokeMMO-Tools/pokemmo-data) : Pokémon, stats, talents, groupes œuf, lieux et noms français, exportés du client PokeMMO
- [PokeMMOZone/PokeMMO-Data](https://github.com/PokeMMOZone/PokeMMO-Data) : tiers PvP, noms et descriptions des talents
- [smogon/pokemon-showdown](https://github.com/smogon/pokemon-showdown) : notes des talents et table des types Gen 5

Pour mettre à jour, clone ces trois dépôts à côté de celui-ci puis lance :

```bash
npm run data
```

Les sprites Noir & Blanc viennent de Pokémon Showdown.

## Structure

```
src/
  lib/        données, élevage (arbre, conseils), traductions, routeur, stockage local
  components/ barre latérale, menus déroulants, sprites
  pages/      fiche, cartes, capacités, équipe, lieux, page d'un lieu, élevage, hordes EV, tutoriels, pages légales
src/data/maps.js  schémas des 5 régions (lieux, coordonnées, liaisons)
scripts/      génération des données
```

## Licence

Code sous licence [MIT](LICENSE). Pokémon et les noms des Pokémon sont des marques de Nintendo, Creatures Inc., GAME FREAK inc. et The Pokémon Company. PokeMMO appartient à ses propriétaires. Ce projet de fan n'est affilié à aucun d'eux.
