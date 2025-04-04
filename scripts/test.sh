#!/bin/bash

# Exit on error
set -e

echo "Running tests for Ninio Application..."

# Run Jest tests
echo "Running unit tests..."
npm test

# Run Cypress tests
echo "Running end-to-end tests..."
npm run cypress:run

echo "All tests completed successfully!"
