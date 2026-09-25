# MANUEL D'APPRENTISSAGE ET DE RÉVISION — MODULE B (MARKETPLACE)
**Projet BioConversion — Orange Digital Center Burkina Faso**  
**Auteure :** Chaïda OUATTARA  
**Volet :** Catalogue et Recherche Producteurs  

---

## 📑 Table des Matières
1. [Contexte Métier & Architecture générale](#1-contexte-métier--architecture-générale)
2. [Pourquoi des DTOs et 3 types de tests ?](#2-pourquoi-des-dtos-et-3-types-de-tests-)
3. [Feuille de Route & Reconstitution Pas à Pas](#3-feuille-de-route--reconstitution-pas-à-pas)
4. [Guide des Fichiers du Projet (Où, Pourquoi, Comment)](#4-guide-des-fichiers-du-projet-où-pourquoi-comment)
5. [Contrat d'API avec le Binôme (Abdoul Rachid)](#5-contrat-dapi-avec-le-binôme-abdoul-rachid)
6. [Comment Exécuter et Tester l'Application](#6-comment-exécuter-et-tester-lapplication)

---

## 1. Contexte Métier & Architecture générale

### Vos User Stories Assignées :
- **B-MUST-1** : Localisation sur carte des producteurs les plus proches, avec un rayon de recherche paramétrable en kilomètres (retour $< 2$ s).
- **B-MUST-2** : Consultation des quantités de larves disponibles chez chaque producteur.
- **B-MUST-3** : Consultation des prix ; chaque producteur fixe librement son prix sans plafond imposé.
- **B-MUST-5** : Mise en vente des déchets/résidus de production (compost, engrais bio) au même titre que les larves.
- **B-SHOULD-1** : Disponibilités mises à jour en temps réel, latence $< 15$ minutes.

### Découpage du Dispatch & Isolation :
- **Vos entités propriétaires** : `Produit` (Classe 6), `Localisation` (Classes 10a/10b - calcul Haversine).
- **Entité en lecture seule** : `Producteur` (Classe 2 - Appartient au Module D de Yasmine Appoline & Seybou).
- **Entités interdites de modification** : `Commande` (Classe 7) et `LigneCommande` (Classe 7b) - Appartiennent à Abdoul Rachid.

---

## 2. Pourquoi des DTOs et 3 types de tests ?

### A. La différence entre Entité JPA et DTO
- **Entité JPA (`Produit.java`, `Localisation.java`)** : C'est le miroir de la base de données PostgreSQL. Elle contient **toutes** les colonnes de la table.
- **DTO (`ProducteurLocaliseDto.java`, `ProduitDto.java`)** : C'est l'objet de transfert réseau JSON.
  - **Raison 1 - Sécurité & CIL (§3.4.1)** : Empêche de fuiter le mot de passe haché ou la pièce d'identité du producteur sur le réseau mobile.
  - **Raison 2 - Performance 3G < 2s (CDC §4.1)** : Ne transporte que les 7 champs nécessaires à la carte, ultra-léger sur réseau rurale.
  - **Raison 3 - Boucles JSON** : Évite les erreurs de sérialisation circulaire entre objets liés.

### B. Les 3 Stratégies de Tests
1. **Test Unitaire Pur (`JUnit 5 + Mockito`)** :
   - Exemple : `MarketplaceServiceTest.java`
   - Teste la logique métier pure en mémoire sans toucher à la base de données.
2. **Test d'Intégration PostgreSQL (`@DataJpaTest`)** :
   - Exemples : `LocalisationRepositoryTest.java`, `ProduitRepositoryTest.java`
   - Se connecte à PostgreSQL (`bioconversion_db`), insère des lignes SQL réelles et effectue un `ROLLBACK` automatique après le test.
3. **Test Fonctionnel REST (`@WebMvcTest + MockMvc`)** :
   - Exemple : `MarketplaceControllerTest.java`
   - Simule les requêtes HTTP `GET`, `POST`, `PATCH` envoyées par l'application mobile et valide les réponses JSON `200 OK`.

---

## 3. Feuille de Route & Reconstitution Pas à Pas

### Étape 1 : Moteur Géographique (B-MUST-1)
1. Vérifier la formule Haversine dans `Localisation.java` (`calculerDistance`).
2. Écrire le test d'intégration PostgreSQL `LocalisationRepositoryTest.java`.
3. Créer le DTO `ProducteurLocaliseDto.java`.
4. Utiliser `producteurRepository.findByCompteValideTrue()` dans `MarketplaceServiceImpl.java`.
5. Exposer l'endpoint `GET /api/v1/marketplace/producteurs/recherche-geolocalisee` dans `MarketplaceController.java`.
6. Écrire les tests unitaires et fonctionnels (`MarketplaceServiceTest.java` & `MarketplaceControllerTest.java`).

### Étape 2 : Produits, Larves & Résidus (B-MUST-3, B-MUST-5, B-MUST-2)
1. Créer l'énumération `TypeProduit.java` (`LARVE`, `RESIDU_PRODUCTION`).
2. Ajouter le champ `typeProduit` avec `@Enumerated(EnumType.STRING)` dans `Produit.java`.
3. Écrire le test d'intégration PostgreSQL `ProduitRepositoryTest.java`.
4. Créer le DTO `ProduitDto.java`.
5. Implémenter `consulterCatalogueProducteurDto()` dans `MarketplaceServiceImpl.java`.
6. Écrire le test unitaire `MarketplaceServiceCatalogueTest.java`.

### Étape 3 : Mises à jour Temps Réel (B-SHOULD-1)
1. Utiliser les endpoints `@PatchMapping("/produits/{id}/stock")` et `@PatchMapping("/produits/{id}/prix")`.
2. Écrire le test unitaire Mockito `MarketplaceServiceStockTest.java`.

---

## 4. Guide des Fichiers du Projet (Où, Pourquoi, Comment)

| Fichier | Emplacement exact | Rôle & Explication |
| :--- | :--- | :--- |
| **`DOCUMENTATION.md`** | Racine du projet | Manuel de procédure obligatoire (Règle 8). |
| **`Localisation.java`** | `src/main/java/com/bioconversion/geo/` | Entité 10a + méthode Haversine `calculerDistance()`. |
| **`ProducteurLocaliseDto.java`** | `src/main/java/com/bioconversion/marketplace/dto/` | DTO réseau pour la carte mobile des producteurs. |
| **`ProduitDto.java`** | `src/main/java/com/bioconversion/marketplace/dto/` | DTO catalogue & Contrat API pour la Commande. |
| **`TypeProduit.java`** | `src/main/java/com/bioconversion/marketplace/` | Enum (`LARVE`, `RESIDU_PRODUCTION`). |
| **`Produit.java`** | `src/main/java/com/bioconversion/marketplace/` | Entité JPA 6 avec contraintes Bean Validation. |
| **`MarketplaceService.java`** | `src/main/java/com/bioconversion/marketplace/` | Interface du contrat de service. |
| **`MarketplaceServiceImpl.java`** | `src/main/java/com/bioconversion/marketplace/` | Moteur métier de géolocalisation et catalogue. |
| **`MarketplaceController.java`** | `src/main/java/com/bioconversion/marketplace/` | Contrôleur REST HTTP (`GET`, `POST`, `PATCH`). |
| **`LocalisationRepositoryTest.java`** | `src/test/java/com/bioconversion/geo/` | Test d'intégration PostgreSQL (`@DataJpaTest`). |
| **`ProduitRepositoryTest.java`** | `src/test/java/com/bioconversion/marketplace/` | Test d'intégration PostgreSQL (`@DataJpaTest`). |
| **`MarketplaceServiceTest.java`** | `src/test/java/com/bioconversion/marketplace/` | Test unitaire Mockito du rayon de 50 km. |
| **`MarketplaceServiceCatalogueTest.java`** | `src/test/java/com/bioconversion/marketplace/` | Test unitaire Mockito du catalogue Larves/Résidus. |
| **`MarketplaceServiceStockTest.java`** | `src/test/java/com/bioconversion/marketplace/` | Test unitaire Mockito de mise à jour du stock. |
| **`MarketplaceControllerTest.java`** | `src/test/java/com/bioconversion/marketplace/` | Test fonctionnel HTTP MockMvc. |

---

## 5. Contrat d'API avec le Binôme (Abdoul Rachid)

Pour que ton binôme Abdoul Rachid puisse valider l'existence et la quantité des stocks lors de la création d'une commande (`B-MUST-4`) :
1. **Endpoint à consommer** : `GET /api/v1/marketplace/produits/producteur/{producteurId}`
2. **DTO fourni** : `ProduitDto.java`
3. **Mise à jour du stock après réservation** : `PATCH /api/v1/marketplace/produits/{produitId}/stock?nouvelleQuantite=...`

---

## 6. Comment Exécuter et Tester l'Application

### Lancer tous les tests unitaires et d'intégration :
Dans le terminal (VS Code / PowerShell à la racine du projet) :
```bash
./mvnw test
```

### Exporter ce Manuel en PDF :
Dans VS Code / ton IDE :
1. Ouvre le fichier `MANUEL_APPRENTISSAGE_MODULE_B.md`.
2. Appuie sur `CTRL + SHIFT + P`.
3. Tape **`Markdown: Export to PDF`** ou **`Print`** pour générer ton fichier PDF personnel !
