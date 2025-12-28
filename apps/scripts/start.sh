#!/bin/bash
set -e

echo "🔐 Starting Project in dev mode..."

if ! docker compose up -d; then
  echo "❌ Failed to start Project"
  exit 1
fi

echo "✅ Project is up and running! Visit http://localhost:8080 for Keycloak and http://localhost:4200 for Angular"
