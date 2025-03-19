#!/bin/bash

# Script to test the /api/register endpoint
curl -X POST "$PUBLIC_APP_URL/dev/api/register" \
-H "Content-Type: application/json" \
-d '{
  "email": "santiagozapata2002@gmail.com",
  "password": "bokita",
  "username": "santiago01011",
  "redirectUrl": "'"$PUBLIC_APP_URL/verify"'"
}'