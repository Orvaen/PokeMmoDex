# Posts Reddit

Série de 8 guides (en anglais) pour r/PokeMMO, générés à partir des données du site.

```bash
npm run reddit   # régénère reddit/posts/*.md
```

Chaque fichier contient le titre, le flair et le texte à coller dans l'éditeur Reddit en mode Markdown.
Publier dans l'ordre (01 → 08), un post toutes les 1 à 2 semaines : chaque post annonce le suivant.

Le script réutilise les modules du site (`src/lib`, `src/data`) ; `scripts/reddit/access-stub.mjs`
recopie `centerInfo` de `src/components/Access.jsx` sans JSX, à garder identique si la règle change.
