#!/usr/bin/env bash
# Publica la PWA en el bucket de Cloud Storage que sirve el balanceador HTTPS.
# Requiere la infraestructura creada con comercio_api/deploy (01-infra y 03-load-balancer).
#
#   ./deploy/deploy-web.sh
#
# Variables opcionales: PROJECT_ID, WEB_BUCKET, URL_MAP
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_ID="${PROJECT_ID:-$(gcloud config get-value project 2>/dev/null)}"
[[ -n "$PROJECT_ID" ]] || { echo "Define el proyecto: gcloud config set project <PROJECT_ID>"; exit 1; }
WEB_BUCKET="${WEB_BUCKET:-${PROJECT_ID}-web}"
URL_MAP="${URL_MAP:-comercio-lb}"
DIST="$APP_DIR/dist/01-app-comercio/browser"
gc() { gcloud --project="$PROJECT_ID" --quiet "$@"; }

echo "==> Compilando (producción)"
(cd "$APP_DIR" && npx ng build --configuration production)

# Archivos que deben revalidarse siempre: si se cachean, los usuarios no reciben la nueva versión
NO_CACHE='^(index\.html|index\.csr\.html|ngsw\.json|ngsw-worker\.js|safety-worker\.js|worker-basic\.min\.js|manifest\.webmanifest)$'

echo "==> Subiendo recursos a gs://$WEB_BUCKET"
# 1) Todo menos los archivos de entrada, con caché moderada (iconos, logo, etc.)
gc storage rsync "$DIST" "gs://$WEB_BUCKET" --recursive \
  --delete-unmatched-destination-objects --exclude="$NO_CACHE" \
  --cache-control="public, max-age=3600"
# 2) JS/CSS con hash en el nombre: inmutables, caché de 1 año
HASHED=""
for f in $(cd "$DIST" && ls | grep -E '^(main|chunk|polyfills|styles)-[A-Za-z0-9_-]+\.(js|css)$' || true); do
  HASHED="$HASHED gs://$WEB_BUCKET/$f"
done
if [[ -n "$HASHED" ]]; then
  # shellcheck disable=SC2086
  gc storage objects update $HASHED \
    --cache-control="public, max-age=31536000, immutable" >/dev/null
fi
# 3) Archivos de entrada al final, para no publicar un index que apunte a archivos aún no subidos
for f in index.html index.csr.html ngsw.json ngsw-worker.js safety-worker.js worker-basic.min.js manifest.webmanifest; do
  if [[ -f "$DIST/$f" ]]; then
    gc storage cp "$DIST/$f" "gs://$WEB_BUCKET/$f" --cache-control="no-cache" >/dev/null
  fi
done

echo "==> Invalidando la caché de Cloud CDN"
gc compute url-maps invalidate-cdn-cache "$URL_MAP" --global --path="/*" --async >/dev/null ||
  echo "    (sin balanceador todavía: se omite)"

echo "==> PWA publicada en gs://$WEB_BUCKET"
