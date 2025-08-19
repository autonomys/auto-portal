import { SubstrateDatasourceKind, SubstrateHandlerKind, SubstrateProject } from '@subql/types';
import * as dotenv from 'dotenv';
import path from 'path';

// Load the appropriate .env file
// Priority:
// 1) ENV_FILE (absolute or relative) if provided
// 2) .env.<ENV> if ENV is provided
// 3) default .env
const envFromMake = process.env.ENV_FILE
  ? path.resolve(__dirname, `../../infra/staking/${process.env.ENV_FILE}`)
  : process.env.ENV
    ? path.resolve(__dirname, `../../infra/staking/.env.${process.env.ENV}`)
    : path.resolve(__dirname, `../../infra/staking/.env`);
dotenv.config({ path: envFromMake });

// Can expand the Datasource processor types via the genreic param
const project: SubstrateProject = {
  specVersion: '1.0.0',
  version: '0.0.1',
  name: 'autonomys-staking',
  description: 'Autonomys Network - Staking',
  runner: {
    node: {
      name: '@subql/node',
      version: '>=5.2.9',
    },
    query: {
      name: '@subql/query',
      version: '*',
    },
  },
  schema: {
    file: './schema.graphql',
  },
  network: {
    /* The genesis hash of the network (hash of block 0) */
    chainId: process.env.CHAIN_ID!,
    /**
     * These endpoint(s) should be public non-pruned archive node
     * We recommend providing more than one endpoint for improved reliability, performance, and uptime
     * Public nodes may be rate limited, which can affect indexing speed
     * When developing your project we suggest getting a private API key
     * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
     * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
     */
    endpoint: (process.env.RPC_URLS || '').split(',').filter(Boolean),
  },
  dataSources: [
    {
      kind: SubstrateDatasourceKind.Runtime,
      startBlock: parseInt(process.env.START_BLOCK_STAKING!),
      mapping: {
        file: './dist/index.js',
        handlers: [
          {
            kind: SubstrateHandlerKind.Block,
            handler: 'handleBlock',
          },
        ],
      },
    },
  ],
};

// Must set default to the project instance
export default project;
