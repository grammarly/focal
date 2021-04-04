#!/bin/bash

echo Packaging...

cp ./README.md ./packages/focal/README.md && cp ./README.md ./packages/focal-atom/README.md
cp ./LICENSE ./packages/focal/LICENSE && cp ./LICENSE ./packages/focal-atom/LICENSE
# Copy AUTHORS, so it will be used as value for "contributors" in package.json
cp ./AUTHORS ./packages/focal/AUTHORS && cp ./AUTHORS ./packages/focal-atom/AUTHORS

cd ./packages/focal && npm pack && cd ../..
cd ./packages/focal-atom && npm pack && cd ../..
# yarn workspace @grammarly/focal-atom pack

rm -rf ./packages/focal/README.md && rm -rf ./packages/focal-atom/README.md
rm -rf ./packages/focal/LICENSE && rm -rf ./packages/focal-atom/LICENSE
rm -rf ./packages/focal/AUTHORS && rm -rf ./packages/focal-atom/AUTHORS
