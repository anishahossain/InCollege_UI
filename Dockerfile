# Use official Node + Debian image
FROM node:20-bullseye

# Install GnuCOBOL
RUN apt-get update && \
    apt-get install -y gnucobol && \
    rm -rf /var/lib/apt/lists/*

# Workdir for the app
WORKDIR /app

# Copy everything into the container
COPY . .

# Compile the COBOL program into a Linux binary
# Adjust filename if yours is different
RUN cd cobol && cobc -x -free -o incollege InCollege.cob

# Install backend dependencies
RUN cd server && npm install

# Set working dir for the server
WORKDIR /app/server

# Environment (not strictly necessary, but nice to have)
ENV NODE_ENV=production

# Expose port (Render still uses $PORT, but this is a hint)
EXPOSE 4000

# Start the Node server
CMD ["node", "server.js"]
