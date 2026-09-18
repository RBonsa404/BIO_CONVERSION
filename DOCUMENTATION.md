# DOCUMENTATION DU PROJET — BIO CONVERSION (Module B : Marketplace)

## 1. Contexte du Projet & Périmètre
- **Application** : Plateforme numérique de bio-conversion par larves de mouches soldats noires (BSFL) — Orange Digital Center Burkina Faso.
- **Périmètre Développé** : Module B — Marketplace, Volet "Catalogue et Recherche Producteurs" (Responsable : Chaïda OUATTARA).
- **Stack Technique** : Java 17, Spring Boot 3, Spring Data JPA, PostgreSQL, JUnit 5, Mockito.
- **Acteurs & Entités** : 
  - `Producteur` (Classe 2 - Lecture seule du Module D)
  - `Localisation` (Classes 10a / 10b - Référentiel géographique)
  - `Produit` (Classe 6 - Larves et Résidus/Déchets de production)

---

## 2. Architecture & Stratégie de Tests selon les Diagrammes Officiels

### A. Différence entre Tests Unitaires et Tests d'Intégration PostgreSQL
Conformément aux diagrammes de séquence officiels (interaction avec la colonne violette "Base de données") et au diagramme de classes (entité 10a `Localisation`) :

1. **Test Unitaire Pur (`JUnit 5 + Mockito`)** :
   - *Utilisation* : Test de la logique métier et du calcul de distance Haversine dans le service (`MarketplaceServiceTest.java`, `MarketplaceServiceCatalogueTest.java`, `MarketplaceServiceStockTest.java`).
   - *Caractéristiques* : Utilise des mocks (`@Mock`) sans connexion réseau ni base de données, exécution ultra-rapide.

2. **Test d'Intégration PostgreSQL (`@DataJpaTest`)** :
   - *Utilisation* : Validation de la persistance réelle en base de données PostgreSQL pour les Repositories (`LocalisationRepository`, `ProducteurRepository`, `ProduitRepository`).
   - *Caractéristiques* : Connecté à PostgreSQL (`bioconversion_db`), teste la création des clés primaires, les contraintes de colonnes et effectue un `ROLLBACK` automatique après chaque test pour garder la base de données propre.

3. **Test Fonctionnel REST (`@WebMvcTest + MockMvc`)** :
   - *Utilisation* : Simulation des appels HTTP GET/POST/PATCH reçus par les contrôleurs REST (`MarketplaceControllerTest.java`).
   - *Caractéristiques* : Vérifie le statut HTTP 200 OK, la structure JSON de la réponse et l'exigence de temps de réponse < 2s sur réseau 3G (CDC §4.1).

---

## 3. Guide des Fichiers de l'Étape 1 (Localisation & Géolocalisation)

```
src/main/java/com/bioconversion/geo/
└── Localisation.java                    <-- Entité 10a (latitude, longitude, ville, province) + calculerDistance()

src/main/java/com/bioconversion/geo/
└── LocalisationRepository.java          <-- Repository JPA d'accès à la table PostgreSQL 'localisation'

src/main/java/com/bioconversion/marketplace/dto/
└── ProducteurLocaliseDto.java          <-- DTO Filtre Réseau pour l'affichage de la carte mobile

src/test/java/com/bioconversion/geo/
└── LocalisationRepositoryTest.java      <-- Test d'intégration PostgreSQL (@DataJpaTest)

src/test/java/com/bioconversion/marketplace/
├── MarketplaceServiceTest.java          <-- Test unitaire du service géolocalisé avec Mockito (B-MUST-1 & Dispatch p.4)
└── MarketplaceControllerTest.java       <-- Test fonctionnel REST de l'endpoint HTTP GET avec MockMvc (CDC §4.1)
```

### Explication des Fichiers de l'Étape 1 :
- **`ProducteurLocaliseDto.java`** : Objet de transfert réseau léger. Il filtre les données de l'entité `Producteur` pour ne transmettre à l'application mobile que les 7 champs nécessaires à l'affichage des points sur la carte (`producteurId`, `nomExploitation`, `ville`, `province`, `latitude`, `longitude`, `distanceKm`), garantissant la confidentialité des données personnelles (CIL §3.4.1) et un temps de réponse < 2s sur réseau 3G (CDC §4.1).
- **`LocalisationRepositoryTest.java`** : Test d'intégration JPA avec PostgreSQL (`@DataJpaTest`). Il utilise `TestEntityManager` pour vérifier que la table PostgreSQL `localisation` accepte bien la création et la lecture d'un point géographique avec rollback automatique.
- **`MarketplaceServiceTest.java`** : Test unitaire Mockito du service métier. Il simule des producteurs à Koubri et Bobo-Dioulasso et valide qu'une recherche dans un rayon de 50 km autour de Ouagadougou ne conserve que le producteur de Koubri.
- **`MarketplaceControllerTest.java`** : Test fonctionnel HTTP MockMvc. Il simule l'appel GET par l'application mobile et valide que la réponse JSON est formatée avec le statut `SUCCESS` et un code HTTP `200 OK`.

---

## 4. Guide des Fichiers de l'Étape 2 (Produits, Larves & Résidus de Production)

```
src/main/java/com/bioconversion/marketplace/
├── TypeProduit.java                    <-- Énumération EnumType.STRING (LARVE, RESIDU_PRODUCTION) — B-MUST-5
└── Produit.java                        <-- Entité JPA 6 (nomProduit, quantiteStock, prix, typeProduit, disponibilite)

src/main/java/com/bioconversion/marketplace/dto/
└── ProduitDto.java                     <-- DTO de consultation du catalogue & Contrat API pour le Module Commande

src/test/java/com/bioconversion/marketplace/
├── ProduitRepositoryTest.java          <-- Test d'intégration PostgreSQL de la persistance Larves & Résidus (@DataJpaTest)
└── MarketplaceServiceCatalogueTest.java <-- Test unitaire Mockito de la génération du catalogue ProduitDto (B-MUST-2)
```

### Explication des Fichiers de l'Étape 2 :
- **`TypeProduit.java`** : Énumération Java listant les deux types de produits autorisés à la vente sur la Marketplace (`LARVE` et `RESIDU_PRODUCTION`). Elle permet aux producteurs de valoriser l'intégralité de leur production (User Story B-MUST-5).
- **`Produit.java`** : Entité JPA liée à la table PostgreSQL `produit` (Classe 6 du diagramme). Utilise l'annotation `@Enumerated(EnumType.STRING)` pour persister en clair le type de produit dans PostgreSQL sans risque d'incompatibilité en cas d'évolution.
- **`ProduitDto.java`** : DTO représentant un produit du catalogue (larves ou compost/résidus). Il sert de contrat d'API officiel entre ton volet Catalogue et le volet Commande de ton binôme Abdoul Rachid pour la vérification des stocks avant réservation (B-MUST-2 & B-MUST-4).
- **`ProduitRepositoryTest.java`** : Test d'intégration JPA avec PostgreSQL (`@DataJpaTest`). Il valide l'insertion et la lecture en base de données de produits de type `LARVE` (avec prix fixé librement - B-MUST-3) et de type `RESIDU_PRODUCTION` (compost/engrais organique - B-MUST-5).
- **`MarketplaceServiceCatalogueTest.java`** : Test unitaire Mockito du service métier. Il valide que la consultation du catalogue par un éleveur génère correctement la liste de `ProduitDto` contenant à la fois les larves et les résidus avec leurs prix et stocks.

---

## 5. Guide des Fichiers de l'Étape 3 (Mises à jour des Disponibilités en Temps Réel)

```
src/test/java/com/bioconversion/marketplace/
└── MarketplaceServiceStockTest.java    <-- Test unitaire Mockito de la modification de stock et de prix en temps réel (B-SHOULD-1 & B-MUST-3)
```

### Explication des Fichiers de l'Étape 3 :
- **`MarketplaceServiceStockTest.java`** : Test unitaire Mockito validant la mise à jour partielle en temps réel du stock (`modifierStock()`) et la modification libre des prix sans plafond (`modifierPrix()`), ainsi que la levée d'une exception `ResourceNotFoundException` si le produit ciblé n'existe pas en base de données.
