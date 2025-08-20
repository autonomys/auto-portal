#!/bin/bash

# Script to track all staking schema tables in Hasura
# This should be run after Hasura is up and running

# Safely load environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Load env from ENV_FILE if provided, otherwise default to .env if present
ENV_FILE_PATH="${ENV_FILE:-${PROJECT_DIR}/.env}"
# If ENV_FILE is a relative path, resolve it relative to PROJECT_DIR
case "${ENV_FILE_PATH}" in
  /*) ;; # absolute path
  *) ENV_FILE_PATH="${PROJECT_DIR}/${ENV_FILE_PATH}" ;;
esac

if [ -f "${ENV_FILE_PATH}" ]; then
    set -a
    # shellcheck disable=SC1090
    source "${ENV_FILE_PATH}"
    set +a
fi

HASURA_URL="http://localhost:${HASURA_GRAPHQL_PORT:-8080}"
ADMIN_SECRET="${HASURA_GRAPHQL_ADMIN_SECRET:-devsecret}"

# Wait for Hasura to be ready with timeout
echo "Waiting for Hasura to be ready..."
TIMEOUT=60  # 60 seconds timeout
COUNTER=0
until curl -s -f "${HASURA_URL}/healthz" > /dev/null; do
  sleep 1
  COUNTER=$((COUNTER + 1))
  if [ $COUNTER -ge $TIMEOUT ]; then
    echo "❌ Timeout: Hasura is not responding after ${TIMEOUT} seconds"
    echo "   Check if Hasura is running: docker compose ps | grep hasura"
    exit 1
  fi
done
echo "✅ Hasura is ready"

# First, add the database source if it doesn't exist
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: ${ADMIN_SECRET}" \
  -d '{
    "type": "pg_add_source",
    "args": {
      "name": "staking",
      "configuration": {
        "connection_info": {
          "database_url": {
            "from_env": "HASURA_GRAPHQL_DATABASE_URL"
          }
        }
      }
    }
  }' \
  "${HASURA_URL}/v1/metadata" > /dev/null 2>&1 || true

# List of tables to track
TABLES=(
  "bundle_submissions"
  "domain_instantiations"
  "domains"
  "nominator_deposits"
  "nominator_withdrawals"
  "nominators"
  "nominators_unlocked_events"
  "operator_deregistrations"
  "operator_epoch_share_prices"
  "operator_registrations"
  "operator_rewards"
  "operator_tax_collections"
  "operators"
  "runtime_creations"
  "storage_fund_accounts"
  "unlocked_events"
  "withdrawals"
)

# Track each table
echo "Tracking ${#TABLES[@]} tables..."
for table in "${TABLES[@]}"; do
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-hasura-admin-secret: ${ADMIN_SECRET}" \
    -d "{
      \"type\": \"pg_track_table\",
      \"args\": {
        \"source\": \"staking\",
        \"schema\": \"staking\",
        \"name\": \"${table}\",
        \"configuration\": {
          \"custom_name\": \"${table}\"
        }
      }
    }" \
    "${HASURA_URL}/v1/metadata" > /dev/null 2>&1 || true
done 
echo "✅ Table tracking complete" 