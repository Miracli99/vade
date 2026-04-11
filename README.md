# Vade Retro Companion

MVP Expo pour gerer un ou plusieurs personnages `Vade Retro` sur Android et sur le web.

## Fonctionnalites du MVP

- selection de plusieurs personnages
- suivi rapide des `PV`, `PSY` et de l'`Armure`
- positions de combat `Focus`, `Combat`, `Defensif`
- cout des dons recalcule automatiquement selon la posture
- affichage des stats, competences, equipements et inventaire

## Lancement

```bash
npm install
npm run start
```

Puis :

- `a` dans Expo pour Android
- `w` dans Expo pour le web

## Structure

- `App.tsx` : point d'entree Expo
- `src/screens/CharacterSheetScreen.tsx` : ecran principal
- `src/types/game.ts` : modele de donnees `Vade Retro`
- `src/data/sampleCharacters.ts` : donnees d'exemple

## Suite logique

- persistance locale des personnages
- creation / edition d'un personnage
- fiche de combat complete avec jets, effets temporaires et historique
- export / import JSON pour partager une fiche
