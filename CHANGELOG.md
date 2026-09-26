# Changelog

Les changements importants de Vade Retro Companion sont documentés ici.

## [Unreleased]

### Nouveautés

### Améliorations

- Un indicateur animé signale les imports et exports en cours et empêche les lancements en double.

### Corrections

- Une erreur de chargement initial ne peut plus remplacer les personnages sauvegardés par les exemples.
- La synchronisation conserve les fiches et médias nécessaires à la restauration de l’index de secours.

## [0.2.11] - 2026-07-22

### Nouveautés

- Ajout d'une médiathèque centralisée pour gérer les images utilisées par les personnages.
- Ajout d'une synchronisation incrémentale organisée par dossiers de personnages.

### Améliorations

- Les médias partagés sont désormais mutualisés et référencés par un identifiant stable.
- Les archives ZIP sont réservées aux imports, exports et migrations ponctuelles.
- Les images embarquées et leurs miniatures utilisent WebP afin d'alléger l'application.

### Corrections

## [0.2.10] - 2026-06-21

### Nouveautés

- Ajout d'une section Buffs / Debuffs sur la fiche personnage.
- Les buffs actifs peuvent modifier l'attaque bonus, l'armure, les PV max et le bouclier.
- Les debuffs acceptent des valeurs négatives et sont pris en compte dans les statistiques affichées.
- Ajout du rang personnage de 5 à 1, avec le rang S comme rang le plus fort.
