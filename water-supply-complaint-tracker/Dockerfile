# Stage 1: Build React application
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build the app in API mode: it calls the Spring Boot backend through Nginx's
# /api proxy instead of using browser localStorage. .env files are not part of
# the build (git- and docker-ignored), so these defaults must be set here.
# Override with: docker build --build-arg VITE_DATA_SOURCE=local .
ARG VITE_DATA_SOURCE=api
ARG VITE_API_BASE_URL=/api
ENV VITE_DATA_SOURCE=$VITE_DATA_SOURCE \
    VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve React using Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
