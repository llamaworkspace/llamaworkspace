#!/bin/sh

set -e

# Check if any arguments are passed
if [ $# -eq 0 ]; then
  echo "Executing pre-start migrations..."
  npm run db:deploy
  echo "Initializing app..."
  npm run start
else
  # Arguments passed, execute them
  exec "$@"
fi