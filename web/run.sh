#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define color codes for pretty output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}      RoboAgent Website - Local Server Setup    ${NC}"
echo -e "${BLUE}===============================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo -e "Please install Node.js (version 18+ recommended) and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    echo -e "Please install npm and try again."
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js is installed ($NODE_VERSION)${NC}"

# Get the script's directory and navigate to it
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules not found. Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed successfully!${NC}"
else
    echo -e "${GREEN}✓ node_modules folder detected.${NC}"
fi

echo -e "${YELLOW}Starting Next.js development server...${NC}"
echo -e "${BLUE}Open http://localhost:3000 in your browser once the server is ready.${NC}"
echo -e "Press Ctrl+C to stop the server."
echo -e "${BLUE}===============================================${NC}"

# Run the development server
npm run dev
