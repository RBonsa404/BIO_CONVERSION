# API REST - BioConversion

## Authentification

### Inscription
`POST /api/v1/auth/register`

```json
{
  "nom": "Kaboré",
  "prenom": "Paul",
  "telephone": "+22670000000",
  "motDePasse": "password123",
  "typeRole": "PRODUCTEUR",
  "province": "Kadiogo",
  "ville": "Ouagadougou"
}
```

### Connexion
`POST /api/v1/auth/login`

```json
{
  "telephone": "+22670000000",
  "motDePasse": "password123"
}
```

Réponse :
```json
{
  "success": true,
  "message": "Authentification réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresInMs": 86400000,
    "user": {
      "id": 1,
      "nom": "Kaboré",
      "prenom": "Paul",
      "telephone": "+22670000000",
      "role": "PRODUCTEUR"
    }
  }
}
```

## Supervision IoT

`POST /api/v1/iot/telemetrie?codeCapteur=CAP-001&temperature=32.5&humidite=60`

## Marketplace

`GET /api/v1/marketplace/produits`

## Paiements

`POST /api/v1/paiements/initier?commandeId=1&telephone=+22670000000`
`POST /api/v1/paiements/webhook/orange-money`

## Producteurs

`GET /api/v1/producteurs`
`PUT /api/v1/producteurs/{id}/valider?approuve=true` (Admin uniquement)
