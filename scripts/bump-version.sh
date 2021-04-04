#!/bin/bash

BASEDIR="$(cd "$(dirname "$0")/.."; pwd)";
if ! [[ $(git rev-parse --abbrev-ref HEAD) == \"master\" ]]; then
  echo \"Not on the master branch.\" && exit 1;
fi

if [[ "$VER" == "" ]]; then
  echo "Usage: VER=1.2.3 npm run release";
fi

echo Bumping version to v${VER}...

cd packages/focal && yarn version --new-version $VER --no-git-tag-version && cd ../..
sed -i '' 's/grammarly\/focal":.*$/grammarly\/focal": "'${VER}'",/g' packages/examples/all/package.json
sed -i '' 's/grammarly\/focal":.*$/grammarly\/focal": "'${VER}'",/g' packages/examples/todomvc/package.json
sed -i '' 's/grammarly\/focal":.*$/grammarly\/focal": "'${VER}'",/g' packages/test/package.json

echo Bumping version to v${VER}...

cd packages/focal-atom && yarn version --new-version $VER --no-git-tag-version && cd ../..
sed -i '' 's/grammarly\/focal":.*$/grammarly\/focal": "'${VER}'",/g' packages/examples/all/package.json
sed -i '' 's/grammarly\/focal":.*$/grammarly\/focal": "'${VER}'",/g' packages/examples/todomvc/package.json
sed -i '' 's/grammarly\/focal":.*$/grammarly\/focal": "'${VER}'",/g' packages/test/package.json

# update yarn.lock
yarn

# commit changes
git add .
git commit -m "v$VER"

# push changes and tag
git push && git push --tags
