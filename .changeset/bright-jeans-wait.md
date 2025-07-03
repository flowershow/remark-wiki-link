---
"remark-wiki-link-plus": major
---

BREAKING CHANGES:
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
