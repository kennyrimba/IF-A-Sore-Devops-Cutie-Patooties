# Use Node.js image
FROM node:18-alpine

# Create app directory in container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project into the container
COPY . .

# Expose necessary port (often 3000 for Next.js)
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
