#!/bin/sh

set -e

# Function to handle termination signals
_term() {
  echo "Caught termination signal, shutting down..."
  # Send SIGTERM to the child process
  kill -TERM "$child" 2>/dev/null
}

# Trap termination signals
trap _term SIGTERM SIGINT

# Check if any arguments are passed
if [ $# -eq 0 ]; then
  echo "Executing pre-start migrations..."
  node 
  npm run db:deploy
  echo "Initializing app..."
  npm run start &
  child=$!
  wait "$child"
else
  # Arguments passed, execute them
  exec "$@"
fi