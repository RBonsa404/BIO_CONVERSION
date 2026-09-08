# Architecture du projet

## Vue d'ensemble

Le projet s'appuie sur une architecture classique en 3 couches (Contrôleurs REST, Services métier, Repositories JPA).

## Modèle de données et héritage

L'entité `Utilisateur` est la classe mère abstraite avec la stratégie `InheritanceType.JOINED`. 

* `Producteur` : contient le nom de l'exploitation, la capacité de production, l'état de validation du compte et la localisation associée.
* `Eleveur` : contient le type d'élevage et une adresse / localisation optionnelle.
* `Administrateur` : compte admin avec matricule.

Les entités métier liées sont :
* `Capteur` et `AlerteIoT` pour la supervision des bacs.
* `Produit`, `Commande` et `LigneCommande` pour le module Marketplace.
* `Paiement` et `Facture` pour le règlement Orange Money.

## Sécurité JWT

L'authentification s'effectue par numéro de téléphone et mot de passe (haché avec BCrypt). Les jetons JWT sont générés après validation et transmis dans le header HTTP `Authorization: Bearer <token>`.
