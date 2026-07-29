# Needed for the Docker Image of the application

# Downloads a lightweight Linux image that has Node.js version 18 pre-installed
FROM node:20-alpine AS build 

# sets /app as the default working directory inside the container for all following commands
WORKDIR /app 

# copies package.json and package-locl.json into the container's /app directory
COPY package*.json ./

#runs npm install inside the container to install all dependencies in package.json
RUN npm install

# Copies the rest of the project files (src, public, ...)
COPY . .

# Runs build script; compiles all react components and code into HTML, CSS, and JS
RUN npm run build

# Use Nginx to serve static files; starts a brand new stage 
FROM nginx:alpine

# grabs the compiled dist folder from stage 1 and copies it into Nginx's default web folder
COPY --from=build /app/dist /usr/share/nginx/html

# documnets that the container will listen for incoming traffic on port 80 (standar HTTP web port)
EXPOSE 80

# tells the container to start the Nginx web server in the foreground when the container runs
CMD ["nginx", "-g", "daemon off;"]
