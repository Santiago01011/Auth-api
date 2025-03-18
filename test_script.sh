#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Script to test the /api/register endpoint
curl -X POST "$NEXT_PUBLIC_APP_URL/api/register" \
-H "Content-Type: application/json" \
-d '{
  "email": "test.email",
  "password": "password",
  "username": "test_user",
  "redirectUrl": "'"$NEXT_PUBLIC_APP_URL/verify"'"
}'