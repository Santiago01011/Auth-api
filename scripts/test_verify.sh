#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Set the token
TOKEN="1238f9f0b69848165e77"

# Construct the URL
URL="${PUBLIC_APP_URL}/api/verify?token=${TOKEN}"

# Test the endpoint
echo "Testing verification endpoint: $URL"

# Send the GET request
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$URL")

# Extract the HTTP status code
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | awk -F: '{print $2}')

# Extract the response body
BODY=$(echo "$RESPONSE" | sed -e 's/HTTP_STATUS:.*//g')

# Print the results
echo "Response status: $HTTP_STATUS"
echo "Response body: $BODY"