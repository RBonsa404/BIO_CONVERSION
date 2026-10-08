# BioConversion Frontend - Relooking

Refonte de l'interface Angular de la plateforme BioConversion : page d'accueil, écran de connexion, barre latérale commune et corrections de navigation.

Branche : `feature/relooking`

## Contenu de la branche

* `accueil/` : nouvelle page d'accueil (un seul écran sur ordinateur).
* `connexion/` : écran de connexion retravaillé, même identité visuelle.
* `EspaceLayoutComponent` : layout commun des pages connectées, avec la barre latérale.
* `public/` : logo (`logo.png`) et photos du carrousel (`carousel/`).

## Page d'accueil

* Texte à gauche, carrousel de photos à droite, footer mince.
* Titre « Bienvenue sur BioConversion » avec effet machine à écrire.
* Choix du profil en 3 cartes : Producteur, Pisciculteur, Aviculteur.
* Nouveau logo dans la barre de navigation.
* Carrousel de 8 photos (aller-retour, points de navigation).
* Icônes Flaticon / UIcons pour les profils et les engagements.
* Carrousel des engagements : un par un, toutes les 3 secondes, points cliquables, pause au survol.
* Crédit Flaticon / Freepik dans le footer.
* Animations désactivées avec `prefers-reduced-motion`.
* Mobile et tablette : affichage empilé.

## Barre latérale (espace connecté)

* Fixe sur ordinateur, rétractable en mode icônes.
* État réduit mémorisé avec `localStorage`.
* Commune à toutes les pages connectées grâce à `EspaceLayoutComponent`.
* Menu adapté au rôle : Producteur, Éleveur (Pisciculteur / Aviculteur), Administrateur.
* Onglet Profil présent, surlignage des liens corrigé.
* Mobile : menu horizontal conservé en haut.
* Suppression du double affichage de la barre sur le dashboard producteur.

## Points corrigés après la fusion dans `main`

| Sujet | Problème relevé | Correction |
| --- | --- | --- |
| Navigation | Tableau de bord, Commandes et Statistiques ouvraient la même page | Une route et une page par onglet (`/dashboard/producteur`, `/dashboard/commandes`, `/dashboard/statistiques`), plus `/dashboard/produits` |
| Navigation | Pas de retour vers l'accueil depuis l'espace connecté | Lien « Accueil » dans la barre latérale ; le logo y mène aussi |
| Onglet Profil | Ne menait vers rien | Page `/profil` : informations, mot de passe, session |
| Compte | Pas de moyen de changer de compte | « Changer de profil » et « Se déconnecter » en bas de la barre latérale et sur la page Profil |
| Sécurité | Routes de l'espace connecté accessibles sans connexion | `authGuard` sur tout l'espace connecté et garde de rôle sur chaque page |
| Images | Photos du carrousel en PNG, trop lourdes (12 Mo) | Converties en WebP (1,4 Mo), logo compris |
| Accueil | Lien « Accès administrateur » visible de tous | Supprimé ; un visiteur déjà connecté voit « Mon espace » |
| Admin | Double barre latérale sur `/admin` | Seule celle d'`EspaceLayoutComponent` est conservée |
| Mobile | Aucun accès à la déconnexion | Les actions du compte suivent le menu horizontal |

Reste à fournir : le vrai numéro WhatsApp du pied de page (le bouton est masqué tant qu'il est vide) et
l'adresse e-mail de contact définitive — voir `frontend/README.md`.

Évolution possible : passer d'un compte à l'autre sans ressaisir le mot de passe. Cela demande de lier les comptes côté backend, à décider avec l'équipe.

## Tests à effectuer

* Connexion avec chaque rôle (producteur, pisciculteur, aviculteur, administrateur).
* La barre latérale reste affichée pendant la navigation, une seule à la fois.
* L'état réduit est conservé après rechargement.
* Un seul lien est surligné à la fois.
* Tableau de bord, Commandes et Statistiques mènent chacun à leur page.
* Un accès à l'Accueil existe depuis l'espace connecté.
* L'onglet Profil et « Changer de profil » fonctionnent.
* Accueil : logo, photos, carrousels et footer visibles sans défiler sur ordinateur, rendu correct sur mobile.

## Commit principal

`feat(front): barre latérale fixe et rétractable, icônes Flaticon`
