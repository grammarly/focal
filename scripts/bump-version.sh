#!/bin/bash

# exit when any command fails
set -e

VER=$1

echo Bumping version to v${VER}...

cd packages/focal && yarn version --new-version $VER --no-git-tag-version && cd ../..
sed -i '' 's/grammarly\/focal":.*"\(.*\)$/grammarly\/focal": "'${VER}'"\1/g' packages/examples/all/package.json
sed -i '' 's/grammarly\/focal":.*"\(.*\)$/grammarly\/focal": "'${VER}'"\1/g' packages/examples/todomvc/package.json
sed -i '' 's/grammarly\/focal":.*"\(.*\)$/grammarly\/focal": "'${VER}'"\1/g' packages/test/package.json

echo Bumping version to v${VER}...

cd packages/focal-atom && yarn version --new-version $VER --no-git-tag-version && cd ../..
sed -i '' 's/grammarly\/focal-atom":.*"\(.*\)$/grammarly\/focal-atom": "^'${VER}'"\1/g' packages/focal/package.json
sed -i '' 's/grammarly\/focal-atom":.*"\(.*\)$/grammarly\/focal-atom": "'${VER}'"\1/g' packages/examples/all/package.json
sed -i '' 's/grammarly\/focal-atom":.*"\(.*\)$/grammarly\/focal-atom": "'${VER}'"\1/g' packages/examples/todomvc/package.json
sed -i '' 's/grammarly\/focal-atom":.*"\(.*\)$/grammarly\/focal-atom": "'${VER}'"\1/g' packages/test/package.json

# update yarn.lock
yarn && yarn build && yarn test

# commit changes
git add .
git commit -m "v$VER"
