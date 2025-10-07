# @flowershow/remark-wiki-link

Parse and render wiki-style links in markdown especially Obsidian style links.

🚧 TODO better docs and usage instructions/examples

## What is this ?

Using obsidian, when we type in wiki link syntax for eg. `[[wiki_link]]` it would parse them as anchors.

## Features supported

- [x] Support `[[Internal link]]`
- [x] Support `[[Internal link|With custom text]]`
- [x] Support `[[Internal link#heading]]`
- [x] Support `[[Internal link#heading|With custom text]]`
- [x] Support `![[Document.pdf]]`
- [x] Support `![[Image.png]]`

* Supported image formats are jpg, jpeg, png, apng, webp, gif, svg, bmp, ico
* Unsupported image formats will display a raw wiki link string, e.g. `[[Image.xyz]]`.

Future support:

- [ ] Support `![[Audio.mp3]]`
- [ ] Support `![[Video.mp4]]`
- [ ] Support `![[Embed note]]`
- [ ] Support `![[Embed note#heading]]`

## Installation

```bash
npm install @flowershow/remark-wiki-link
```

## Usage

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import wikiLinkPlugin from "@flowershow/remark-wiki-link";

const processor = unified().use(remarkParse).use(wikiLinkPlugin);
```

## Configuration options

### `format`

Type: `"regular" | "shortestPossible"`
Default: `"regular"`

- `"regular"`: Link paths will be treated as is (absolute or relative, depending on how they are written)
- `"shortestPossible"`: Link paths will be treated as "shortest-possible" absolute paths (e.g. `[[abc]]` would be matched to blog/abc permalink if provided in permalinks array)

### `permalinks`

Type: `Array<string>`
Default: `[]`

A list of URLs used to match wikilinks. Wikilink without a matching permalink will have `new` class.

(When using `format: "shortestPossible"`, this list is used to resolve shortened paths to their full paths.)

### `className`

Type: `string`
Default: `"internal"`

Class name added to all wiki link and embed nodes.

### `newClassName`

Type: `string`
Default: `"new"`

Class name added to nodes for which no matching permalink (passed in `permalinks` option) was found.

### `urlResolver`

Type: `(name: string) => string`
Default: `(name: string) => name`

A function that resolves a wikilink (or embed) target to a URL path. The target is the part in `[[target|alias]]` or `![[target]]`.

### `aliasDivider`

Type: `string`
Default: `"|"`

The character used to separate the link target from its alias in wiki links. For example in `[[target|alias]]`, the divider is `|`.

## Generating list of permalinks

If you're using shortest possible path format for your wiki links, you need to set `option.format: "shortestPossible"` and provide the plugin with a list of permalinks that point to files in your content folder as `option.permalinks`. You can generate this list using your own script or use a file system utility like `glob`:

```javascript
import { unified } from "unified";
import remarkParse from "remark-parse";
import wikiLinkPlugin from "@flowershow/remark-wiki-link";
import glob from "glob";

const permalinks = glob
  .sync("**/*.md", { cwd: "content" })
  .map((path) => path.replace(/\.md$/, ""));

const processor = unified().use(remarkParse).use(wikiLinkPlugin, {
  format: "shortestPossible",
  permalinks,
});
```

## Running tests

```bash
npm test
```
