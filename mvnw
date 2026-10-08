#!/bin/sh
# Maven Wrapper Script for Unix/macOS
# Ce fichier doit avoir le droit d'exécution : chmod +x mvnw

set -e

MAVEN_WRAPPER_JAR=".mvn/wrapper/maven-wrapper.jar"
MAVEN_WRAPPER_PROPERTIES=".mvn/wrapper/maven-wrapper.properties"

# Lire l'URL de distribution
DISTRIBUTION_URL=$(grep "distributionUrl" "$MAVEN_WRAPPER_PROPERTIES" | cut -d'=' -f2-)

# Télécharger Maven si nécessaire
MAVEN_HOME="${HOME}/.m2/wrapper/dists/$(basename $DISTRIBUTION_URL .zip)"
if [ ! -d "$MAVEN_HOME" ]; then
    echo "Downloading Maven from $DISTRIBUTION_URL"
    mkdir -p "$MAVEN_HOME"
    curl -fsSL "$DISTRIBUTION_URL" -o "/tmp/maven.zip"
    unzip -q "/tmp/maven.zip" -d "$MAVEN_HOME"
    rm "/tmp/maven.zip"
fi

MAVEN_BIN=$(find "$MAVEN_HOME" -name "mvn" -type f | head -1)
exec "$MAVEN_BIN" "$@"
