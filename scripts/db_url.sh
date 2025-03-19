#!/bin/bash
## This script works for get the dinamic ngrok url and update the .env file with the correct database url, is only for development purposes
# Load environment variables from .env file
if [ -f .env ]; then
  set -o allexport # Enable exporting all variables
  source .env      # Source the .env file
  set +o allexport # Disable exporting all variables
fi

# Fetch the ngrok URL from the ngrok container's API
NGROK_URL=$(curl -s http://ngrok:4040/api/tunnels | jq -r '.tunnels[] | select(.proto == "tcp") | .public_url')

# Check if the URL was fetched successfully
if [ -z "$NGROK_URL" ]; then
  echo "Failed to fetch ngrok URL. Is ngrok running?"
  exit 1
fi

echo "Ngrok URL fetched: $NGROK_URL"

# Remove the 'tcp://' prefix from the URL
DATABASE_HOST_PORT=${NGROK_URL#tcp://}

# Update the .env file with the new ngrok URL
if [ -f .env ]; then
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DATABASE_HOST_PORT/$DB_NAME|" .env
  echo "Updated .env file with new ngrok URL."
  echo $DATABASE_URL
else
  echo ".env file not found. Create it first."
  exit 1
fi