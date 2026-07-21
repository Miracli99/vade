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

## APK Android autonome

Pour generer un APK qui fonctionne sans Metro :

```bash
npm run android:release
```

Cette commande necessite un JDK 17 configure dans `JAVA_HOME`.

L'APK est produit dans `android/app/build/outputs/apk/release/`. Un APK `debug`
attend Metro et affiche une erreur `Unable to load script` s'il est lance seul.

La configuration Expo dynamique se trouve dans `app.config.js`. La version publique ne
doit jamais y être saisie : elle provient uniquement de `package.json`.

Pour vérifier Expo, Gradle et le changelog :

```bash
npm run version:check
```

## Publier une version

Documenter d'abord les changements dans la section `Unreleased` de `CHANGELOG.md`,
puis les valider dans Git. Préparer ensuite une version locale :

```bash
npm run release -- minor
```

La commande accepte `patch`, `minor`, `major` ou une version exacte comme `0.3.0`.
Elle vérifie le projet, crée le commit et le tag `vX.Y.Z`, mais ne pousse rien. Après
inspection, publier avec :

```bash
git push --follow-tags
```

Les push ordinaires exécutent uniquement la CI. Seul un tag `vX.Y.Z` crée une GitHub
Release, publie l'APK et met à jour le manifest de téléchargement.

## Structure

- `App.tsx` : point d'entree Expo
- `src/screens/CharacterSheetScreen.tsx` : ecran principal
- `src/types/game.ts` : modele de donnees `Vade Retro`
- `src/data/sampleCharacters.ts` : donnees d'exemple

## Suite logique

- persistance locale des personnages
- creation / edition d'un personnage
- fiche de combat complete avec jets, effets temporaires et historique
- export / import ZIP autonome (`character.json` + images), avec import des anciens JSON
