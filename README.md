# Auto Portal

A staking portal for the Autonomys Network that enables operators and nominators to seamlessly stake AI3 tokens.

## ⚠️ Development Status

**This project is under active development and is NOT ready for production use.**

The application is currently in the development phase and should not be used for real staking operations. Features are incomplete, APIs may change, and the codebase is rapidly evolving.

## What is Auto Portal?

Auto Portal is a user-friendly web interface for staking on the Autonomys Network, providing:

- **Operator Discovery**: Browse and compare domain operators
- **Staking Interface**: Simple token staking with transparent fee breakdowns
- **Portfolio Management**: Track positions, rewards, and transaction history
- **Withdrawal Flow**: Two-step withdrawal process with clear status tracking

## Architecture

This is a TypeScript monorepo with:

- **Web App** (`apps/portal/`) - React frontend with Tailwind CSS
- **Indexer** (`apps/indexer/`) - Backend service for historical data
- **Shared Packages** (`packages/`) - Common utilities and types

## Development

### Prerequisites

- Node.js ≥18.0.0
- Yarn ≥4.0.0

### Getting Started

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

### Available Scripts

- `yarn dev` - Start web frontend
- `yarn build` - Build all packages
- `yarn lint` - Run linting
- `yarn type-check` - Run TypeScript checks

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **State Management**: Zustand
- **Blockchain**: Auto SDK, Polkadot.js API
- **Wallets**: SubWallet, Talisman, Polkadot.js Extension

## License

MIT

---

**Remember: This is development software. Do not use for real staking operations.**
