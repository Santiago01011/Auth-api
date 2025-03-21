#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Script to test the /api/login endpoint
curl -X POST "$PUBLIC_APP_URL/api/login" \
-H "Content-Type: application/json" \
-d '{
  "email": "testreject.com",
  "password": "boca",
  "username": "testReject"
}'
