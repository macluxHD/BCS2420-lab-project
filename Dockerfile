# Use an official Node.js image
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Install packages to build sqlite3 from source
RUN apk add --no-cache py3-setuptools make g++

# Copy package files and install dependencies
COPY package.json .

# Copy the rest of the source code
COPY . .

RUN npm install -g npm
RUN npm install
RUN npm rebuild sqlite3 --build-from-source
RUN npm run init

# Install certificates for HTTPS
RUN apk add --no-cache curl

# Install mkcert
RUN curl -L -o /usr/local/bin/mkcert "https://dl.filippo.io/mkcert/latest?for=linux/amd64" \
    && chmod +x /usr/local/bin/mkcert
RUN mkcert -install
RUN mkdir certs && mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost

# Expose both HTTP and WebSocket ports
EXPOSE 3000

# Start the server
CMD ["npm", "start"]