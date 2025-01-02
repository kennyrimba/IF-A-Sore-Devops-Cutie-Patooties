# Use Node.js image
FROM node:18-alpine

# Set Node options globally
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build the app with increased memory limit
RUN npm run build

# Expose port
EXPOSE 3000

# Start command without shell wrapper
CMD ["node", "server.js"]