#!/bin/sh
set -e

# Auto-generate secrets if not set
DATA_DIR="/app/data"
mkdir -p "$DATA_DIR"

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "change-me-to-a-random-string-at-least-32-chars" ]; then
  SECRET_FILE="$DATA_DIR/.jwt_secret"
  if [ -f "$SECRET_FILE" ]; then
    export JWT_SECRET=$(cat "$SECRET_FILE")
  else
    export JWT_SECRET=$(head -c 32 /dev/urandom | base64 | tr -d '/+=' | head -c 32)
    echo "$JWT_SECRET" > "$SECRET_FILE"
    chmod 600 "$SECRET_FILE"
  fi
  echo "JWT_SECRET auto-generated (stored in data/.jwt_secret)"
fi

if [ -z "$ENCRYPTION_KEY" ] || [ "$ENCRYPTION_KEY" = "change-me-to-a-random-string-at-least-32-chars" ]; then
  KEY_FILE="$DATA_DIR/.encryption_key"
  if [ -f "$KEY_FILE" ]; then
    export ENCRYPTION_KEY=$(cat "$KEY_FILE")
  else
    export ENCRYPTION_KEY=$(head -c 32 /dev/urandom | base64 | tr -d '/+=' | head -c 32)
    echo "$ENCRYPTION_KEY" > "$KEY_FILE"
    chmod 600 "$KEY_FILE"
  fi
  echo "ENCRYPTION_KEY auto-generated (stored in data/.encryption_key)"
fi

exec node server.js "$@"
