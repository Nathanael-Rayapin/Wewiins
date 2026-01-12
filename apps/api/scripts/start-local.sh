#!/bin/bash

# ⚠️ IMPORTANT :
# Si vous êtes sous Windows, il faut lancer ce script avec bash :
#   bash start-local.sh
# Et il faut lancer la commande depuis la **racine du projet**, là où se trouve :
#   - le fichier pom.xml
#   - le fichier .env.local

set -a
source .env.local
set +a
mvn spring-boot:run -Dspring-boot.run.profiles=local
