# Frontend Gaps - Écarts Maquette / Backend

Ce document documente les fonctionnalités présentes dans la maquette HTML mais non encore implémentées côté backend.

## Écarts identifiés

### 0. Panier multi-produits (écran 6)

**Décision produit :** le panier multi-produits est souhaité comme évolution, mais ne fait pas partie de cette correction de navigation. Le flux actuel crée une commande pour un seul produit; aucun panier n'est implémenté ici.

**Action requise :** concevoir et implémenter ultérieurement un panier multi-produits, puis vérifier son impact sur la création, la livraison et la facturation des commandes.

### 1. Notes et avis producteurs (écrans 5 et 6)

**Description :** La maquette affiche des étoiles de notation et des compteurs d'avis (ex. "(18 avis)") sur les fiches producteurs.

**État backend :** Aucune entité `Avis` ou système de rating n'existe dans le code backend actuel.

**Solution appliquée :** L'UI affiche ces éléments avec des données statiques/mock clairement identifiées (`// TODO_BACKEND: endpoint avis manquant`).

**Action requise backend :** 
- Créer une entité `Avis` (rating, commentaire, date, utilisateur)
- Exposer des endpoints pour : 
  - GET `/api/v1/producteurs/{id}/avis` - Lister les avis d'un producteur
  - POST `/api/v1/producteurs/{id}/avis` - Ajouter un avis
  - GET `/api/v1/producteurs/{id}/note-moyenne` - Obtenir la note moyenne

---

### 2. Mode de livraison (écran 7)

**Description :** L'écran de commande propose plusieurs modes de livraison : livraison par le producteur, par transporteur, ou retrait sur place.

**État backend :** L'entité `Commande` ne contient aucun champ équivalent pour le mode de livraison.

**Solution appliquée :** L'UI inclut ces options mais aucune n'est envoyée à l'API actuelle. La valeur sera stockée localement en attendant l'ajout backend.

**Action requise backend :**
- Ajouter un champ `modeLivraison` à l'entité `Commande` (enum: `PRODUCTEUR`, `TRANSPORTEUR`, `RETRAIT`)
- Mettre à jour les DTOs de création de commande
- Gérer la logique métier associée (frais de livraison, délais)

---

### 3. Paiement "Espèces à la livraison" (écran 7)

**Description :** L'écran de paiement propose une option "Espèces à la livraison" en plus du paiement mobile Orange Money.

**État backend :** Le backend ne gère que le flux Orange Money (webhook de confirmation). Aucun support pour le paiement en espèces.

**Solution appliquée :** L'option est affichée mais désactivée avec un badge "Bientôt disponible". Pas de simulation de faux succès de paiement.

**Action requise backend :**
- Ajouter un champ `methodePaiement` à l'entité `Paiement` (enum: `ORANGE_MONEY`, `ESPECES_LIVRAISON`)
- Implémenter le workflow spécifique au paiement en espèces (statut, validation à la livraison)
- Adapter les webhooks/règles de transition de statut

---

### 4. Module Litiges (écran 10)

**Description :** Le dashboard administrateur inclut une section "Litiges signalés" pour gérer les conflits entre producteurs et éleveurs.

**État backend :** Aucune entité `Litige` n'existe dans le code backend.

**Solution appliquée :** L'écran admin est construit avec des données mock et un état vide propre par défaut. Ne bloque pas le reste du dashboard.

**Action requise backend :**
- Créer une entité `Litige` (type, description, statut, commande associée, parties impliquées)
- Exposer des endpoints pour :
  - GET `/api/v1/admin/litiges` - Lister les litiges
  - POST `/api/v1/litiges` - Signaler un litige
  - PATCH `/api/v1/litiges/{id}` - Modifier le statut/la résolution

---

### 5. Upload CNIB + formation suivie (écrans 3 et 4)

**Description :** Les formulaires d'inscription incluent un composant d'upload de pièce d'identité (CNIB) et une case à cocher "Formation suivie".

**État backend :** Le champ `cheminPieceIdentite` existe en base de données mais aucun endpoint d'upload n'est exposé pour gérer le transfert de fichier.

**Solution appliquée :** Un composant dropzone complet est implémenté (drag & drop, JPG/PNG/PDF, 5 Mo max, aperçu). L'appel HTTP est commenté avec `// TODO_BACKEND` en attendant l'endpoint.

**Action requise backend :**
- Créer un endpoint `POST /api/v1/upload/piece-identite` (multipart/form-data)
- Valider le type de fichier et la taille (max 5 Mo)
- Stocker le fichier sur le système de fichiers ou cloud storage
- Retourner l'URL/chemin à utiliser lors de l'inscription
- Ajouter un champ `formationSuivie` (boolean) aux DTOs d'inscription

---

## Remarques générales

- L'UI est construite avec fidélité maximale à la maquette fournie
- Toutes les fonctionnalités backend existantes sont branchées (authentification, marketplace, commande, paiement Orange Money)
- Les écarts documentés ci-dessus sont isolés et n'empêchent pas l'utilisation des fonctionnalités principales
- Le code frontend contient des marqueurs `// TODO_BACKEND` pour faciliter l'intégration future
