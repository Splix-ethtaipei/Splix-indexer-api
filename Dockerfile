# Use Node.js LTS (Long Term Support) version
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy .env file
COPY .env.api.prod .env

# Expose the port your API runs on (adjust if needed)
EXPOSE 3000

# Command to run the API
CMD ["npm", "run", "api"] 