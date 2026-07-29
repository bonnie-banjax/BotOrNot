FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy compiled frontend assets
COPY --from=build /app/dist /usr/share/nginx/html
# Copy Nginx proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# tells the container to start the Nginx web server in the foreground when the container runs
CMD ["nginx", "-g", "daemon off;"]
