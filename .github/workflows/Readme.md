# CI powered by GitHub Actions

## Release

For each tag `v*` that is pushed into `master` branch CI creates ["Release"](https://github.com/grammarly/focal/releases) and attaches package tarball `grammarly-focal-v*.tgz`. For details see `release.yml`

## Tests

For each push into pull_reusets CI runs tests. Check `tests.yml` for details.
