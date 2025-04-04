#!/bin/bash

# Exit on error
set -e

# Get environment from argument or default to production
ENVIRONMENT=${1:-production}

echo "Deploying Ninio Application to $ENVIRONMENT environment..."

# Run tests
echo "Running tests..."
npm test

# Build the application
echo "Building application..."
npm run build

# Deploy based on environment
if [ "$ENVIRONMENT" = "production" ]; then
  echo "Deploying to production..."
  # Add your production deployment commands here
  # Example: aws s3 sync dist/ s3://your-bucket-name/ --delete
elif [ "$ENVIRONMENT" = "staging" ]; then
  echo "Deploying to staging..."
  # Add your staging deployment commands here
  # Example: aws s3 sync dist/ s3://your-staging-bucket/ --delete
else
  echo "Unknown environment: $ENVIRONMENT"
  exit 1
fi

echo "Deployment complete!"
