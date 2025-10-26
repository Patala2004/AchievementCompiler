FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Install ts-node and typescript locally (or globally)
RUN npm install -g ts-node typescript

# Copy all source files
COPY . .

# Expose your server port
EXPOSE 3000

# Run the TypeScript file directly
CMD ["ts-node", "server.ts"]
