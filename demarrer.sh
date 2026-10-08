#!/usr/bin/env sh
# Lance BioConversion sur ce poste sans PostgreSQL ni Docker (profil "local", base H2).
# Prérequis : Java 17 ou plus, Node.js 22 ou plus.
set -e
cd "$(dirname "$0")"

command -v java >/dev/null 2>&1 || { echo "Java 17 ou plus est requis : https://adoptium.net"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Node.js 22 ou plus est requis : https://nodejs.org"; exit 1; }

echo "[1/2] Construction du frontend..."
(
  cd frontend
  [ -d node_modules ] || npm ci --no-audit --no-fund
  npm run build
)

echo "[2/2] Démarrage de l'application sur http://localhost:8080 (Ctrl+C pour arrêter)"
exec ./mvnw -q spring-boot:run -Dspring-boot.run.profiles=local
