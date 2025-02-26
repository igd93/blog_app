# ./frontend/Dockerfile.dev
FROM node:20-alpine
WORKDIR /app

# Install dependencies first to leverage caching
COPY package*.json ./
RUN yarn install

# Copy the source code and expose the dev port
COPY . .
EXPOSE 5173

# Run the Vite development server with hot reloading
CMD ["yarn", "dev"]
