#!/bin/bash

# Exit on error
set -e

echo "Setting up Ninio Application..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  echo "Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "Please update .env.local with your Supabase credentials."
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p cypress/screenshots
mkdir -p cypress/videos
mkdir -p cypress/fixtures
mkdir -p src/tests/unit
mkdir -p src/tests/integration

echo "Setup complete! You can now run the application with 'npm run dev'."
echo "To run tests, use 'npm test' or 'npm run cypress'."
