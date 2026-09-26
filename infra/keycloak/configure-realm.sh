#!/usr/bin/env bash
#
# Idempotent realm configuration for the "project" custom Keycloak theme:
# sets the login theme, the display name shown as the login page wordmark,
# and enables en+ro so the theme's msg()/i18n calls have both locales to pick from.
#
# Usage: ./configure-realm.sh (run after Keycloak is up and the theme jar is mounted)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="$ROOT_DIR/infra/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[configure-realm] $ENV_FILE is missing." >&2
  exit 1
fi

KEYCLOAK_ADMIN_PASSWORD="$(grep '^KEYCLOAK_ADMIN_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)"

KCADM="/opt/keycloak/bin/kcadm.sh"
EXEC=(docker compose -f "$ROOT_DIR/infra/docker-compose.yml" exec -T keycloak "$KCADM")

"${EXEC[@]}" config credentials --server http://localhost:8080 --realm master --user admin --password "$KEYCLOAK_ADMIN_PASSWORD" >/dev/null

"${EXEC[@]}" update realms/project \
  -s loginTheme=project \
  -s displayName=Project \
  -s internationalizationEnabled=true \
  -s 'supportedLocales=["en","ro"]' \
  -s defaultLocale=en

echo "[configure-realm] realm \"project\": loginTheme=project, displayName=Project, en+ro enabled."
