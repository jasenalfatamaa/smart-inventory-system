# Stage 1: Base
FROM node:20 AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
# Explicitly force esbuild binary download
RUN node node_modules/esbuild/install.js

# Stage 2: Test
FROM base AS test
COPY index.html .
COPY tsconfig.json .
COPY vite.config.ts .
COPY vitest.config.ts .
COPY tailwind.config.js .
COPY postcss.config.js .
COPY metadata.json .
COPY App.tsx .
COPY context.tsx .
COPY index.tsx .
COPY geminiService.ts .
COPY types.ts .
COPY index.css .
COPY components ./components
COPY pages ./pages
COPY src ./src

# Run tests to ensure quality before building
RUN npm test -- --run

# Stage 3: Build
FROM test AS build
RUN npm run build

# Stage 4: Production
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
