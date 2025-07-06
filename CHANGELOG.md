# remark-wiki-link

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
