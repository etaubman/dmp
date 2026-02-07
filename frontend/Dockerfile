# Data Manager Portal — frontend (Angular)
# Use this when running the Angular app in Docker (e.g. production build).
# For local dev, use: ng serve (see README).
FROM node:20-alpine AS base
WORKDIR /app

# Install Angular CLI and dependencies when package.json exists
COPY package*.json ./
RUN npm install --legacy-peer-deps 2>/dev/null || true

COPY . .
# For local dev: run from host with ng serve (see README).
# For production: uncomment below and add nginx to serve dist/frontend-app/browser.
# RUN npm run build -- --configuration=production
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
EXPOSE 4200
CMD ["npm", "run", "start:host"]
