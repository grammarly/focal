#!/bin/bash

echo Packaging...

# Copy AUTHORS, so it will be used as value for "contributors" in package.json
# TODO: That doesn't work, find a better way to setup contributors
cp ./AUTHORS ./packages/focal/AUTHORS && cp ./AUTHORS ./packages/focal-atom/AUTHORS

cd ./packages/focal && npm pack && cd ../..
cd ./packages/focal-atom && npm pack && cd ../..
# yarn workspace @grammarly/focal-atom pack

rm -rf ./packages/focal/AUTHORS && rm -rf ./packages/focal-atom/AUTHORS
