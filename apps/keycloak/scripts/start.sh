#!/bin/bash
# Script pour démarrer Keycloak en arrière-plan

echo "🔐 Starting Keycloak in dev mode..."
docker compose up -d keycloak
echo "Keycloak is up and running ! Visit http://localhost:8080"
