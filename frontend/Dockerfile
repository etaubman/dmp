# Data Manager Portal — frontend (Angular)
# Use this when running the Angular app in Docker (e.g. production build).
# For local dev, use: ng serve (see README).
FROM node:20-alpine AS base
WORKDIR /app

# Install Angular CLI and dependencies when package.json exists
COPY package*.json ./
RUN npm install --legacy-peer-deps 2>/dev/null || true

COPY . .
# Build step will be added when Angular app is scaffolded (Phase 3)
# RUN npm run build
# EXPOSE 80
# CMD ["npm", "run", "start:container"]

# Placeholder: keep container runnable for compose (sleep so container stays up)
CMD ["sh", "-c", "echo Frontend: add Angular app in Phase 3; use ng serve locally for now; sleep infinity"]
