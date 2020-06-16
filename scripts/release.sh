#!/bin/bash

BASEDIR="$(cd "$(dirname "$0")/.."; pwd)";
if ! [[ $(git rev-parse --abbrev-ref HEAD) == \"master\" ]]; then
  echo \"Not on the master branch.\" && exit 1;
fi

if [[ "$VER" == "" ]]; then
  echo "Usage: VER=1.2.3 npm run release";
fi

echo Publishing v${VER}...

cp ./README.md ./packages/focal/README.md && cp ./README.md ./packages/focal-atom/README.md
cp ./LICENSE ./packages/focal/LICENSE && cp ./LICENSE ./packages/focal-atom/LICENSE

cd $BASEDIR/packages/focal-atom && npm publish https://github.com/grammarly/focal/releases/download/v$VER/grammarly-focal-atom-v$VER.tgz --access public --dry-run
cd $BASEDIR/packages/focal && npm publish https://github.com/grammarly/focal/releases/download/v$VER/grammarly-focal-v$VER.tgz --access public --dry-run

rm -rf $BASEDIR/packages/focal/README.md && rm -rf $BASEDIR/packages/focal-atom/README.md
rm -rf $BASEDIR/packages/focal/LICENSE && rm -rf $BASEDIR/packages/focal-atom/LICENSE

git push && git push --tags
