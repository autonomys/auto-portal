#!/bin/bash

# Script to track all staking schema tables in Hasura
# This should be run after Hasura is up and running

# Load environment variables
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

HASURA_URL="http://localhost:${HASURA_GRAPHQL_PORT:-8080}"
ADMIN_SECRET="${HASURA_GRAPHQL_ADMIN_SECRET:-devsecret}"

# Wait for Hasura to be ready
until curl -s -f "${HASURA_URL}/healthz" > /dev/null; do
  sleep 1
done

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