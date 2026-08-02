#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ENV_FILE="$SCRIPT_DIR/.env"

if [ -e "$ENV_FILE" ]; then
    echo "$ENV_FILE already exists; refusing to overwrite secrets." >&2
    exit 1
fi

umask 077
POSTGRES_PASSWORD=$(openssl rand -hex 32)
LIVEKIT_API_KEY="API$(openssl rand -hex 8)"
LIVEKIT_API_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

cat > "$ENV_FILE" <<EOF
POSTGRES_USER=grit_app
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=grit_db

LIVEKIT_API_KEY=$LIVEKIT_API_KEY
LIVEKIT_API_SECRET=$LIVEKIT_API_SECRET
LIVEKIT_URL=https://grit-livekit.jun0.dev:7880

AWS_S3_ACCESS_KEY=change-me
AWS_S3_SECRET_KEY=change-me
AWS_S3_BUCKET_NAME=change-me

GOOGLE_CLIENT_ID=change-me
GOOGLE_CLIENT_SECRET=change-me
GOOGLE_REDIRECT_URI=http://localhost:8080/callback.html

JWT_SECRET=$JWT_SECRET
JWT_ACCESS_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=2592000000

OTEL_ENDPOINT=http://host.docker.internal:4318/v1/traces
EOF

chmod 600 "$ENV_FILE"
echo "Created $ENV_FILE. Replace every change-me value before starting backend or LiveKit."
