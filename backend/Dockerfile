# Use a lightweight, official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your backend code into the container
COPY . .

# Expose the port your Node server runs on (assumed 3001 based on your React code)
EXPOSE 3001

# Start the server (Adjust 'server.js' if your main file is named differently, like 'index.js')
CMD ["node", "server.js"]