#!/bin/bash

PROJECT_ROOT="$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

VERSION=${1:-dev}

if [ ! -d "$PROJECT_ROOT/dist" ]; then
  echo "Dist not found. Please build the project first."
  exit 1
fi

docker buildx build -t auth-service:$VERSION -f "$PROJECT_ROOT/docker/Dockerfile" "$PROJECT_ROOT/dist"