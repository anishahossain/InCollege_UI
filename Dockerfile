# Use Debian Bookworm (GnuCOBOL available on ARM64)
FROM node:20-bookworm

# Install GnuCOBOL compiler & runtime
RUN apt-get update && \
    apt-get install -y gnucobol && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Compile COBOL program into Linux binary
RUN cd cobol && cobc -x -free -o incollege InCollege.cob

# Install backend dependencies
RUN cd server && npm install

# Run the Node server
WORKDIR /app/server
EXPOSE 10000
CMD ["node", "server.js"]
