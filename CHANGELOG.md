# remark-wiki-link

## 2.1.0

### Minor Changes

- Fixes required to make it work with unified 11

## 2.0.4

### Patch Changes

- 0e1dc6c: Remove unneeded console logs.

## 2.0.3

### Patch Changes

- 285449a: Don't resolve embeds with urlResolver.

## 2.0.2

### Patch Changes

- b8f5b07: Fixed release process (missing build output).

## 2.0.1

### Patch Changes

- 4a7311f: Use github-slugger for generating heading slugs in the default `urlResolver` function.

## 2.0.0

### Major Changes

- 0783a73: BREAKING CHANGES:
  - Renamed configuration options for clarity:
    - `pathFormat` -> `format`
    - `wikiLinkClassName` -> `className`
    - `wikiLinkResolver` -> `urlResolver`
  - Changed format values:
    - `"raw"` -> `"regular"`
    - `"obsidian-short"` -> `"shortestPossible"`
    - Removed `"obsidian-absolute"` format
  - Removed deprecated options:
    - `hrefTransformer`
    - `markdownFolder`
  - Updated to work with micromark v4 and mdast-util-from-markdown v2

## 1.1.1

This was the last version of the package before it was moved to the PortalJS monorepo and published under the @portaljs/remark-wiki-link name.
