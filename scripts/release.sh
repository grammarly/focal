#!/bin/bash

VER=$1

echo "Releasing version $1"

cd packages/focal && yarn version --new-version $VER --no-git-tag-version && cd ../..
sed -i '' 's/grammarly\/focal":.*$/grammarly\/focal": "'${VER}'",/g' packages/examples/all/package.json
sed -i '' 's/grammarly\/focal":.*$/grammarly\/focal": "'${VER}'",/g' packages/examples/todomvc/package.json
sed -i '' 's/grammarly\/focal":.*$/grammarly\/focal": "'${VER}'",/g' packages/test/package.json
# yarn
git add .
git commit -m "v$VER"
