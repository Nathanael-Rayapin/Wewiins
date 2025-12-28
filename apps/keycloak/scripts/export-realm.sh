#!/bin/bash
set -e

REALM_NAME="wewiins"
EXPORT_DIR="./keycloak-export"
CONTAINER_NAME="keycloak-dev"

echo "📁 Creating export directory..."
mkdir -p ${EXPORT_DIR}

echo "🚀 Exporting realm '${REALM_NAME}' from running container..."
docker exec ${CONTAINER_NAME} /opt/keycloak/bin/kc.sh export \
  --realm ${REALM_NAME} \
  --dir /tmp/export \
  --users skip

echo "📦 Copying export to host..."
docker cp ${CONTAINER_NAME}:/tmp/export/${REALM_NAME}-realm.json ${EXPORT_DIR}/

echo "✅ Export finished: ${EXPORT_DIR}/${REALM_NAME}-realm.json"