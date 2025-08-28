# Hasura GraphQL Engine for Auto Portal

This directory contains the Hasura configuration for the Auto Portal staking indexer.

## Overview

Hasura provides a GraphQL API layer on top of the PostgreSQL database populated by the SubQuery indexer. This matches the production indexer deployment and provides:

- **Auto-generated GraphQL API** from database schema
- **Advanced filtering, sorting, and pagination**
- **Aggregations and relationships**
- **Real-time subscriptions**
- **GraphQL console for testing**

## Quick Start

1. **Start all services** (if not already running):

   ```bash
   cd infra/staking
   docker compose up -d
   ```

2. **Apply/Reload Metadata**:

   ```bash
   # Apply metadata from repo to running Hasura
   make hasura-apply

   # Or just reload metadata/caches without changing files
   make hasura-reload

   # If needed, restart Hasura (cli-migrations image reapplies metadata on boot)
   make hasura-restart
   ```

3. **Access Hasura Console**:
   - URL: http://localhost:8080/console
   - Admin Secret: `devsecret`

## GraphQL Endpoint

```
http://localhost:8080/v1/graphql
```

Include the admin secret in headers:

```
x-hasura-admin-secret: devsecret
```

## Example Queries

### Get Operator Registrations

```graphql
query GetOperatorRegistrations {
  operator_registrations(limit: 10, where: { processed: { _eq: true } }, order_by: { id: asc }) {
    id
    owner
    domain_id
    signing_key
    minimum_nominator_stake
    nomination_tax
    block_height
  }
}
```

### Get Operator with Nominators

```graphql
query GetOperatorDetails($operatorId: String!) {
  staking_operators_by_pk(id: $operatorId) {
    id
    address
    domain_id
    status
    total_rewards_collected

    # Get related nominators
    nominators(where: { status: { _eq: "ACTIVE" } }) {
      id
      address
      known_shares
      total_deposits
    }
  }
}
```

### Aggregate Queries

```graphql
query OperatorStats {
  staking_operators_aggregate(where: { status: { _eq: "REGISTERED" } }) {
    aggregate {
      count
      avg {
        nomination_tax
      }
    }
  }
}
```

## Schema Notes

Hasura exposes tables exactly as they exist in PostgreSQL with snake_case naming:

- `operator_registrations` (SubQL entity: OperatorRegistration)
- `operator_deregistrations` (SubQL entity: OperatorDeregistration)
- `nominator_deposits` (SubQL entity: NominatorDeposit)
- `nominator_withdrawals` (SubQL entity: NominatorWithdrawal)
- `operators` (processed/aggregated data)
- `nominators` (processed/aggregated data)

## Development Tips

1. **Use the Console** to explore the schema and test queries
2. **Export metadata** after making changes (optional, if CLI available):
   ```bash
   hasura metadata export --endpoint http://localhost:8080 --admin-secret devsecret
   ```
3. **Check relationships** in the Data tab to understand table connections
4. **Use subscriptions** for real-time updates

## Troubleshooting

- **Tables not showing**: Run `make hasura-apply` then `make hasura-reload`
- **Permission denied**: Include the admin secret in your requests
- **Connection refused**: Ensure all services are running with `docker compose ps`
