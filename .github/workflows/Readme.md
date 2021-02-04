# CI powered by GitHub Actions

## Release

1. Create pull-request for relese "Release vX.X.X"
2. Run in root `yarn bump-release X.X.X`
3. yarn bump-release will bump focal version, update deps in private packages and create a commit
4. Merge and manually create [GitHub Release](https://github.com/grammarly/focal/releases)
5. On release "publish" GitHub Actions will trigger build and attach tarball to "Release". For details see `release.yml`

## Tests

For each push into pull_reusets CI runs tests. Check `tests.yml` for details.
