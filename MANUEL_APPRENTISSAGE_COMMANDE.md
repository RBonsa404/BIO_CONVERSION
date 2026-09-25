# MANUEL D'APPRENTISSAGE ET DE RÉVISION — MODULE B (CYCLE DE COMMANDE)
**Projet BioConversion — Orange Digital Center Burkina Faso**  
**Auteur :** BONSA Abdoul Rachid  
**Volet :** Cycle de Vie de la Commande, Machine à États & Réservation de Stock  

---

## 📑 Table des Matières
1. [Contexte Métier & Périmètre Fonctionnel](#1-contexte-métier--périmètre-fonctionnel)
2. [Machine à États & Cycle de Vie (`StatutCommande`)](#2-machine-à-états--cycle-de-vie-statutcommande)
3. [Contrat d'API Inter-Modules (Consommé & Exposé)](#3-contrat-dapi-inter-modules-consommé--exposé)
4. [Cas Limites & Robustesse Technique](#4-cas-limites--robustesse-technique)
5. [Endpoints REST Exposés](#5-endpoints-rest-exposés)
6. [Guide des Fichiers & Architecture](#6-guide-des-fichiers--architecture)
7. [Stratégie de Tests & Validation](#7-stratégie-de-tests--validation)

---

## 1. Contexte Métier & Périmètre Fonctionnel

### User Stories Assignées :
- **B-MUST-4** : Création d'une commande par un éleveur avec vérification du stock disponible et génération d'un accusé de réception immédiat avec numéro de commande unique.
- **B-MUST-6** : Réservation atomique du stock au moment de la commande avec prix unitaire figé (`prixUnitaireFige`).
- **B-MUST-7** : Confirmation de la commande par le producteur et gestion des transitions de statut.
- **B-MUST-8** : Gestion automatique du délai de 12h pour la confirmation producteur avec bascule vers `NON_CONFIRMEE` et déclenchement d'une proposition de réacheminement vers d'autres producteurs à proximité.
- **CDC §2.2.2** : Annulation autorisée pour l'éleveur dans un délai de 12h post-commande ; au-delà, orientation vers un traitement manuel assisté.

### Découpage du Dispatch & Isolation :
- **Entités propriétaires d'Abdoul Rachid** : `Commande` (Classe 7), `LigneCommande` (Classe 7b), `StatutCommande` (Enum).
- **Entités consommées en lecture / contrat de service** : `Produit` (Classe 6 — Chaïda OUATTARA), `Eleveur` (Classe 3 — Module D).
- **Contrat inter-module préservé** : `marquerCommandePayee` (Module C — Paiement Orange Money).

---

## 2. Machine à États & Cycle de Vie (`StatutCommande`)

### A. Liste des Statuts
- `EN_ATTENTE` : Commande créée par l'éleveur, stock réservé, en attente de confirmation par le producteur.
- `CONFIRME` : Validée par le producteur dans le délai de 12h.
- `PAYE` : Paiement validé par Orange Money via webhook (Module C).
- `EXPEDIE` : Colis expédié par le producteur.
- `LIVRE` : Réception confirmée par l'éleveur.
- `REFUSE` : Refusée par le producteur (restitution immédiate du stock réservé).
- `NON_CONFIRMEE` : Expirée automatiquement au bout de 12h sans réponse du producteur (restitution du stock + proposition d'alternatives).
- `ANNULE` : Annulée par l'éleveur sous 12h (restitution du stock réservé).

### B. Matrice des Transitions Autorisées

```
               ┌─────────────┐
               │ EN_ATTENTE  │
               └──────┬──────┘
         ┌────────────┼────────────┬─────────────┐
         │ (12h exp.) │ (producteur│ (producteur │ (éleveur <12h)
         ▼            ▼            ▼             ▼
  ┌─────────────┐ ┌──────────┐ ┌─────────┐  ┌─────────┐
  │NON_CONFIRMEE│ │ CONFIRME │ │ REFUSE  │  │ ANNULE  │
  └─────────────┘ └─────┬────┘ └─────────┘  └─────────┘
                        │ (Module C: marquerCommandePayee)
                        ▼
                   ┌──────────┐
                   │   PAYE   │
                   └────┬─────┘
                        │
                        ▼
                   ┌──────────┐
                   │ EXPEDIE  │
                   └────┬─────┘
                        │
                        ▼
                   ┌──────────┐
                   │  LIVRE   │
                   └──────────┘
```

> **Règle absolue :** La transition vers `PAYE` ne peut JAMAIS être effectuée manuellement via `changerStatutCommande`. Elle est strictement réservée à `CommandeService.marquerCommandePayee(Long commandeId)`.

---

## 3. Contrat d'API Inter-Modules (Consommé & Exposé)

### A. Contrat Consommé côté Catalogue (Chaïda OUATTARA)
1. **Vérification du stock et prix** :
   - Via `ProduitDto` / `MarketplaceService.consulterCatalogueProducteurDto(producteurId)`.
2. **Réservation et Décrémentation de stock** :
   - Appel de `MarketplaceService.modifierStock(produitId, nouveauStock)`.
3. **Restitution de stock** :
   - En cas d'annulation, refus ou expiration, le stock est réincrémenté via `MarketplaceService.modifierStock(...)`.

### B. Contrat Exposé vers Module C (Paiement)
- **Interface** : `CommandeService`
- **Méthode** : `Commande marquerCommandePayee(Long commandeId)`
- **Comportement** : Vérifie l'existence de la commande, valide son éligibilité (non annulée/non refusée) et applique le statut `StatutCommande.PAYE`.

### C. Contrat Exposé vers Module D (Notifications & Réseau)
- **Point d'extension Réacheminement** : `List<ProducteurLocaliseDto> proposerProducteursAlternatifs(Commande commande)`
- **Comportement** : Lorsqu'une commande passe à `NON_CONFIRMEE`, le système interroge les producteurs de la même région disposant de stock pour proposer une réaffectation sans ré-initier le panier.

---

## 4. Cas Limites & Robustesse Technique

### A. Protection Anti Double-Soumission (Fenêtre de 30 secondes)
- **Problème** : Multiples clics sur mobile ou rejeu réseau 3G/4G créant des doublons de commande et de réservation de stock.
- **Solution** : Implémentation du service `IdempotencyService`.
  - Transmission d'une clé d'idempotence via l'en-tête HTTP `X-Idempotency-Key` (ou dans le corps de requête).
  - Verrouillage atomique en mémoire avec TTL de 30 secondes.
  - Si une requête identique arrive dans les 30 secondes, elle retourne immédiatement la commande créée sans re-décrémenter le stock.

### B. Job Planifié d'Expiration 12h (`CommandeExpirationScheduler`)
- Activation de `@EnableScheduling` sur `BioConversionApplication`.
- Exécution périodique via `@Scheduled(fixedRateString = "${app.scheduling.commande-expiration-rate:60000}")`.
- Requête JPA : `findByStatutAndDateCommandeBefore(StatutCommande.EN_ATTENTE, now - 12h)`.
- Opération atomique : passage à `NON_CONFIRMEE`, restitution du stock et log de réacheminement.
- Résistant aux redémarrages (état persistant en base PostgreSQL).

---

## 5. Endpoints REST Exposés

Tous les retours sont normalisés sous le format `ApiResponse<T>`.

| Méthode | URI | Description | Rôles Autorisés |
|---|---|---|---|
| `POST` | `/api/v1/marketplace/commandes` | Créer une commande (décrémente le stock) | `ROLE_ELEVEUR`, `ROLE_ADMINISTRATEUR` |
| `PATCH` | `/api/v1/marketplace/commandes/{id}/statut` | Modifier le statut selon la machine à états | `ROLE_PRODUCTEUR`, `ROLE_ELEVEUR`, `ROLE_ADMINISTRATEUR` |
| `POST` | `/api/v1/marketplace/commandes/{id}/confirmer` | Confirmer la commande (dans les 12h) | `ROLE_PRODUCTEUR`, `ROLE_ADMINISTRATEUR` |
| `POST` | `/api/v1/marketplace/commandes/{id}/annuler` | Annuler la commande (sous 12h) | `ROLE_ELEVEUR`, `ROLE_ADMINISTRATEUR` |
| `GET` | `/api/v1/marketplace/commandes/{id}` | Consulter le détail d'une commande | `ROLE_ELEVEUR`, `ROLE_PRODUCTEUR`, `ROLE_ADMINISTRATEUR` |
| `GET` | `/api/v1/marketplace/commandes/eleveur/{eleveurId}` | Lister l'historique d'un éleveur (paginé) | `ROLE_ELEVEUR`, `ROLE_ADMINISTRATEUR` |
| `GET` | `/api/v1/marketplace/commandes/producteur/{producteurId}` | Lister les commandes d'un producteur (paginé) | `ROLE_PRODUCTEUR`, `ROLE_ADMINISTRATEUR` |

---

## 6. Guide des Fichiers & Architecture

| Fichier | Emplacement | Rôle |
|---|---|---|
| `Commande.java` | `com.bioconversion.marketplace` | Entité JPA Commande, génération numéro unique, calcul montant total |
| `LigneCommande.java` | `com.bioconversion.marketplace` | Entité JPA Ligne, figeage du prix unitaire, calcul sous-total |
| `StatutCommande.java` | `com.bioconversion.marketplace` | Enum des statuts avec `NON_CONFIRMEE` |
| `CommandeRepository.java` | `com.bioconversion.marketplace` | Repository JPA avec requêtes d'expiration et de filtrage |
| `MarketplaceService.java` | `com.bioconversion.marketplace` | Interface du contrat service Marketplace & Commande |
| `MarketplaceServiceImpl.java` | `com.bioconversion.marketplace` | Implémentation métier, machine à états, gestion des stocks |
| `IdempotencyService.java` | `com.bioconversion.marketplace` | Gestionnaire d'idempotence et verrou anti double-clic 30s |
| `CommandeExpirationScheduler.java` | `com.bioconversion.marketplace` | Job planifié d'expiration automatique 12h |
| `MarketplaceController.java` | `com.bioconversion.marketplace` | Contrôleur REST HTTP |
| `V4__add_non_confirmee_statut_commande.sql` | `db/migration` | Migration PostgreSQL pour l'ajout de `NON_CONFIRMEE` à l'enum SQL |

---

## 7. Stratégie de Tests & Validation

La suite de tests comprend 3 niveaux de tests rigoureux :

1. **Tests Unitaires Purs (`JUnit 5 + Mockito`)** :
   - `CommandeCalculTest.java` : Précision des calculs de montants et sous-totaux.
   - `MarketplaceServiceCommandeTest.java` : Validation de l'ensemble des règles métier, décrémentation/restitution du stock, machine à états, protection double-soumission 30s, délais de 12h.
2. **Tests d'Intégration JPA (`@DataJpaTest`)** :
   - `CommandeRepositoryTest.java` : Persistance relationnelle en cascade, requêtes d'expiration et pagination.
3. **Tests Fonctionnels REST (`@WebMvcTest + MockMvc`)** :
   - `MarketplaceCommandeControllerTest.java` : Simulation HTTP sur les endpoints de commande, validation des DTOs, headers `X-Idempotency-Key` et codes retours HTTP 200 / `ApiResponse`.

### Exécution :
```bash
mvn test
```
*Résultat attendu : 33 tests exécutés avec succès (0 échec, 0 erreur).*
