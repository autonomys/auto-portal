FROM node:20-alpine
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Enable corepack
RUN corepack enable

# Copy entire workspace
COPY . .

# Install all dependencies
RUN yarn install

# Build the staking-worker
RUN yarn build

# Set working directory to the staking-worker package
WORKDIR /app/packages/staking-worker

# Use node directly to run the built file
CMD ["node", "dist/main.js"] 