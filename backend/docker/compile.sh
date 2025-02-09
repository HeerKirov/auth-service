#!/bin/bash

PROJ_PATH="$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."
NODE_IMAGE=node:22.12.0-slim

if [ "$(uname)" = "Darwin" ]; then
  YARN_CACHE_DIR=$HOME/Library/Caches/Yarn
elif [ "$(uname)" = "Linux" ]; then
  YARN_CACHE_DIR=$HOME/.cache/yarn
else
  echo "Unsupported system $(uname), cannot specify yarn cache dir."
  exit 1
fi

if [ -d "$PROJ_PATH/dist" ]; then
  rm -rf "$PROJ_PATH/dist"
fi

docker run --rm \
  -u $(id -u):$(id -g) \
  -v "$PROJ_PATH":/app \
  -v "$YARN_CACHE_DIR":/root/.cache/yarn \
  -w /app \
  $NODE_IMAGE \
  sh -c "yarn config set registry https://registry.npmmirror.com/ && yarn install --frozen-lockfile && yarn build"
