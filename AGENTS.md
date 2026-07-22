# Instructions pour les agents

Ce fichier s'applique à tout le dépôt. Les instructions plus proches d'un sous-dossier,
si elles sont ajoutées plus tard, complètent ou remplacent celles-ci pour ce sous-dossier.

## Projet et communication

- Vade Retro Companion est une application Expo/React Native en TypeScript pour Android et le web.
- Répondre à l'utilisateur en français, sauf demande contraire. Garder les identifiants de code en anglais.
- Expliquer le résultat et les choix importants, sans noyer l'utilisateur dans les détails d'outillage.
- Ne pas inventer une nouvelle architecture avant d'avoir inspecté l'existant.
- Préserver les modifications locales déjà présentes et éviter les refactorings sans rapport avec la demande.

## Environnement de référence

- Node.js : `24.16.0`.
- Expo SDK : `56`.
- Android : JDK 17 et SDK Android 36.
- Gestionnaire de paquets : npm, avec `package-lock.json` suivi dans Git.
- Installer les modules Expo avec `npx expo install <paquet>` afin de conserver les versions compatibles.

Commandes de validation usuelles :

```bash
npm run version:check
npm run typecheck
npm test
npm run export:web
```

Pour une modification ciblée, commencer par les tests concernés, puis exécuter la suite complète avant livraison.

## Architecture applicative

- Organiser le nouveau code par fonctionnalité dans `src/features/<feature>/`.
- Les écrans composent les fonctionnalités, mais ne doivent pas implémenter directement le stockage,
  la synchronisation ou le format ZIP.
- Utiliser les frontières existantes :
  - `CharacterRepository` pour le stockage interne des personnages ;
  - `MediaRepository` pour les médias durables et leur catalogue ;
  - `SyncRepository` pour le miroir Android incrémental ;
  - `ArchiveService` pour les imports, exports et migrations ZIP.
- Garder `App.tsx` comme orchestrateur. Extraire les nouvelles règles métier dans une feature ou un utilitaire testable.
- TypeScript strict est obligatoire. Éviter `any`, les assertions non justifiées et les erreurs silencieuses sans stratégie de repli.

## Personnages et médias

- Toute nouvelle référence d'image utilise `imageId?: MediaId`.
- Ne pas réintroduire `imageUrl` ou `imageModule` dans les nouveaux flux. Ils restent uniquement pour la migration legacy.
- Les médias sont globaux et dédupliqués par hash. Ne jamais créer un dossier média par personnage.
- Une image utilisée ne peut pas être supprimée. Afficher ses usages avant toute suppression.
- Android stocke les médias dans des fichiers durables ; le web utilise IndexedDB.
- Normalisation des imports : côté long maximal de 1600 px, WebP autour de 82 %, miniature de 320 px.
- Les listes et grilles utilisent les miniatures, `expo-image` et une virtualisation adaptée.
- `src/data/image-library.ts` est généré. Ne pas le modifier manuellement ; exécuter :

```bash
npm run generate:image-library
```

- `npm run optimize:assets` remplace des fichiers sources et est donc destructif. Ne l'exécuter que si la demande
  porte explicitement sur l'optimisation des assets, puis vérifier visuellement les images converties.

## Synchronisation Android

Le miroir de synchronisation respecte cette structure :

```text
VadeRetro/
├── index.json
├── index.previous.json
├── characters/character-<id>/character-<hash>.json
└── media/<hash>.webp
```

- Le dossier d'un personnage dépend exclusivement de son identifiant stable, jamais de son nom.
- Lire `index.json` en premier et n'ouvrir que les fiches modifiées.
- Écrire et vérifier les fiches/médias avant de mettre à jour l'index.
- Mettre l'index à jour avant de supprimer les anciens dossiers ou médias.
- En cas d'échec, conserver ou utiliser `index.previous.json`.
- Si les index sont absents ou invalides, reconstruire depuis les petites fiches sans supprimer de données.
- Supprimer un média uniquement lorsqu'aucune fiche ne le référence encore.
- Les ZIP sont des formats de transport, jamais le format de travail ou de synchronisation.
- `jszip` doit rester chargé avec `import("jszip")` uniquement pendant un import, export ou une migration explicite.
- Compatibilité obligatoire : JSON v1/v2 et ZIP v3 en lecture ; ZIP v4 pour le format actuel.
- Une migration d'ancien dossier ne supprime jamais les ZIP originaux automatiquement.

## Interface et expérience utilisateur

- Conserver les quatre espaces principaux : Accueil, Personnages, Histoire et Médiathèque.
- Conserver la séparation d'un personnage entre les modes `Jouer` et `Gérer`.
- Import, export, synchronisation et migration restent regroupés dans `Données et sauvegardes`.
- Respecter l'identité sombre et dorée actuelle ; réutiliser les tokens de `src/components/ui/design`.
- Tester au minimum un viewport bureau et un viewport mobile pour toute modification structurelle d'interface.
- Les actions tactiles doivent être suffisamment grandes, accessibles au clavier sur le web et munies de labels explicites.
- Préférer les composants natifs React Native et les icônes cohérentes aux caractères emoji utilisés comme contrôles.
- Éviter les listes non virtualisées, les images pleine résolution dans les cartes et les calculs coûteux à chaque rendu.

## Versionnement et publication

- La commande `npm run release -- patch|minor|major|X.Y.Z` est l'unique point d'entrée pour modifier la version publique.
- `package.json.version` est la source de lecture canonique, mais ne doit pas être modifiée manuellement.
- Ne jamais ajouter une version en dur dans `app.config.js`, `App.tsx`, Gradle ou un workflow.
- `app.config.js` et Gradle lisent `package.json`. Le `versionCode` Android est calculé par `scripts/versioning.js`.
- `package-lock.json` contient un miroir généré de la version et doit rester synchronisé.
- Toute divergence doit être détectée par `npm run version:check`.
- Documenter les changements destinés aux utilisateurs sous `Unreleased` dans `CHANGELOG.md`.
- Les notes de Release proviennent du changelog éditorial, jamais des messages de commit générés automatiquement.
- Les push sur `main` ou `master` exécutent seulement la CI. Seul un tag `vX.Y.Z` publie une Release.
- Ne jamais créer de commit, tag, push ou Release sans demande explicite de l'utilisateur.
- Quand une publication est explicitement demandée, utiliser :

```bash
npm run release -- patch   # ou minor, major, X.Y.Z
git push --follow-tags
```

- La commande `release` exige un dépôt propre, une section `Unreleased` non vide, exécute les contrôles,
  puis crée localement le commit et le tag. Elle ne pousse rien.
- Ne pas supprimer les anciennes Releases ou tags `apk-<sha>` sans audit et confirmation spécifique.
- Le manifest de mise à jour actuel est le schéma v2. Conserver la lecture du schéma v1 et le champ `notes`
  de compatibilité tant que d'anciens clients peuvent encore l'utiliser.

## Tests attendus

- Ajouter les tests au plus près de la fonctionnalité modifiée.
- Pour les repositories, tester les invariants et les scénarios d'échec, pas seulement le chemin nominal.
- Toute modification de synchronisation doit couvrir selon le cas : renommage sans changement de dossier,
  écriture ciblée, médias partagés, suppression sûre, interruption et reconstruction d'index.
- Toute modification de versionnement doit couvrir : calcul du `versionCode`, cohérence Expo/Gradle/package,
  refus d'un tag divergent et extraction du changelog.
- Toute modification du manifest doit couvrir les schémas v1 et v2, la limite de cinq highlights et l'absence de notes.
- Un build web réussi ne remplace pas le test Android. Si le SDK Android n'est pas disponible localement,
  le signaler clairement et s'appuyer sur le job Android de CI sans prétendre avoir construit l'APK.

## Critères de livraison

Avant de déclarer une tâche terminée :

- le comportement demandé est réellement implémenté ;
- les migrations et compatibilités nécessaires sont conservées ;
- `version:check`, TypeScript et les tests passent ;
- l'export web passe si l'interface ou le bundling a changé ;
- les changements visuels ont été inspectés sur les tailles pertinentes ;
- aucune donnée utilisateur, archive legacy, Release ou modification Git existante n'a été supprimée sans autorisation ;
- les limites de validation sont mentionnées explicitement dans le compte rendu final.
