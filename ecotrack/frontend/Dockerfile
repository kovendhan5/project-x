# Use Node.js as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Install a lightweight web server to serve the app
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", "build", "-l", "3000"]