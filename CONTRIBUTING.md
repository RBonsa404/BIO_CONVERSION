# Guide de contribution

## Conventions de dev

* Utiliser Lombok pour la génération des getters/setters quand nécessaire.
* Ne pas exposer directement les entités JPA dans les contrôleurs, utiliser des DTOs.
* Toujours valider les entrées avec Bean Validation (`@Valid`, `@NotBlank`, etc.).
* Les erreurs REST doivent passer par `GlobalExceptionHandler`.

## Workflows git

* `main` : branche principale
* `develop` : branche de dev
* Créez une branche de feature (`feature/nom-de-la-feature`) pour vos développements.
