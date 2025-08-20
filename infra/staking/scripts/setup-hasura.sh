#!/bin/bash

# Script to set up Hasura after services are running

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Safely load environment variables
if [ -f "${PROJECT_DIR}/.env" ]; then
    set -a
    source "${PROJECT_DIR}/.env"
    set +a
fi

# Check if services are running
if ! docker compose ps | grep -q "hasura.*Up"; then
    echo "❌ Hasura is not running. Please start services first with:"
    echo "   cd ${PROJECT_DIR} && docker compose up -d"
    exit 1
fi

# Run the track tables script, forwarding ENV_FILE if provided
ENV_FILE="${ENV_FILE}" "${PROJECT_DIR}/hasura/track-tables.sh"

echo ""
echo "✅ Hasura setup complete!"
echo ""
echo "📍 Access points:"
echo "   • GraphQL Endpoint: http://localhost:${HASURA_GRAPHQL_PORT:-8080}/v1/graphql"
echo "   • Hasura Console: http://localhost:${HASURA_GRAPHQL_PORT:-8080}/console"
if [ "${NODE_ENV:-development}" = "development" ]; then
    echo "   • Admin Secret: ${HASURA_GRAPHQL_ADMIN_SECRET:-devsecret}"
else
    echo "   • Admin Secret: [HIDDEN - check .env file]"
fi
echo ""
echo "🔍 Try this query in the console:"
echo "   query { operator_registrations(limit: 5) { id domain_id owner } }" 