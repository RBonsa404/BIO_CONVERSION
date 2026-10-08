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

## Points à corriger

| Sujet | Problème | À faire |
| --- | --- | --- |
| Navigation | Tableau de bord, Commandes et Statistiques ouvrent la même page | Une route et une page par onglet |
| Navigation | Pas de retour vers l'accueil depuis l'espace connecté | Ajouter un lien « Accueil » |
| Onglet Profil | Ne mène vers rien | Créer une page Profil (nom, téléphone, rôle) |
| Compte | Pas de moyen de changer de compte | Ajouter « Changer de profil » et « Se déconnecter » |
| Sécurité | `/marketplace` et `authGuard` | Vérifier la protection de la route |
| Images | Photos du carrousel en PNG, trop lourdes | Convertir en WebP |
| Footer | Numéro WhatsApp et e-mail provisoires | Mettre les vrais |

### Changer de profil

Pour une personne qui a deux comptes (par exemple producteur et éleveur), ajouter en bas de la barre latérale :

* **Se connecter** : pour un visiteur non connecté.
* **Changer de profil** : déconnecte puis ramène à l'écran de connexion pour entrer avec l'autre compte.
* **Se déconnecter**.

Évolution possible : passer d'un compte à l'autre sans ressaisir le mot de passe. Cela demande de lier les comptes côté backend, à décider avec l'équipe.

## Attention

* Conflit possible avec la branche `fix-validation-admin` sur la page `/admin` (`admin.service.ts`) : à résoudre après sa fusion dans `main`.
* Après la fusion avec `feature/icons-flaticon`, vérifier que l'accueil tient toujours sur un écran et que le crédit Flaticon ne fait pas déborder le footer.

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
NEW

## Points à corriger

Les onglets Tableau de bord, Commandes et Statistiques ouvrent la même page. Il faut une route et une page par onglet.

Il n’y a pas de retour vers l’accueil depuis l’espace connecté. Il faut ajouter un lien « Accueil ».

L’onglet Profil ne mène vers rien. Il faut créer une page Profil (nom, téléphone, rôle).

Il n’y a pas de moyen de changer de compte. Il faut ajouter « Changer de profil » et « Se déconnecter ».

Il faut vérifier la protection de la route /marketplace avec authGuard.

Les photos du carrousel sont en PNG et trop lourdes. Il faut les convertir en WebP.

Le numéro WhatsApp et l’e-mail du footer sont provisoires. Il faut mettre les vrais.

L’accès utilisateur est affiché sur la page d’accueil. Il faut le supprimer.

La page /admin affiche une double barre latérale. Il faut supprimer la barre propre à la page admin et garder uniquement celle
d’EspaceLayoutComponent.
