FROM node:20-alpine
WORKDIR /app

# Install yarn globally
RUN npm install -g yarn

# Copy workspace root package.json and yarn.lock for workspace dependencies
COPY package.json yarn.lock ./
COPY packages/staking-worker/package.json ./packages/staking-worker/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install all workspace dependencies
RUN yarn install --frozen-lockfile

# Copy source code and build configs
COPY packages/staking-worker/src ./packages/staking-worker/src
COPY packages/staking-worker/tsconfig.json ./packages/staking-worker/
COPY packages/shared-types/src ./packages/shared-types/src
COPY packages/shared-types/tsconfig.json ./packages/shared-types/

# Build shared types first, then the worker
RUN yarn workspace @auto-portal/shared-types build
RUN yarn workspace @auto-portal/staking-worker build

# Set working directory to the worker package
WORKDIR /app/packages/staking-worker

# Run the application
CMD ["node", "dist/main.js"] 