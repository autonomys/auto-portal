FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package.json yarn.lock tsconfig.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY src ./src

# Build the application
RUN yarn build

# Run the application
CMD ["node", "dist/main.js"] 