#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Script to test the /api/register endpoint
curl -X POST "$NEXT_PUBLIC_APP_URL/api/register" \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User",
  "redirectUrl": "'"$NEXT_PUBLIC_APP_URL/verify"'"
}'