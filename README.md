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

Apres une modification de `app.json`, synchroniser les fichiers natifs :

```bash
npx expo prebuild --platform android
```

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
