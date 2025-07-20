FROM node:20-alpine

WORKDIR /app

# Copy root files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases

# Copy worker package.json

COPY packages/staking-worker/package.json ./packages/staking-worker/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source files
COPY packages/staking-worker/src ./packages/staking-worker/src
COPY packages/staking-worker/tsconfig.json ./packages/staking-worker/

# Build
RUN yarn workspace @auto-portal/staking-worker build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Switch to non-root user
USER nodejs

# Start the worker
CMD ["yarn", "workspace", "@auto-portal/staking-worker", "start"] 