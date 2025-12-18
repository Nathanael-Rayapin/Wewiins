#!/bin/bash
# Script pour arrêter Keycloak et ses services liés

echo "🔐 Stopping Docker Compose containers..."
docker compose down
echo "Containers stopped."
