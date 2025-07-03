import { syntax, SyntaxOptions } from "./syntax";
import { fromMarkdown } from "./fromMarkdown";
import { toMarkdown } from "./toMarkdown";
import type { Processor } from "unified";

let warningIssued = false;

export interface Options {
  format?:
    | "regular" // (default) link paths will be treated as is (absolute or relative, depending on how they are written)
    | "shortestPossible"; // link paths will be treated as "shortest-possible" absolute paths (e.g. "[[abc]]" would be matched to blog/abc permalink if provided in permalinks array)
  permalinks?: string[]; // list of URLs used to match wikilinks
  className?: string; // class to be added to all wikilinks (and embeds)
  newClassName?: string; // class to added to wikilink (and embeds) that don't have matching permalinks
  urlResolver?: (name: string) => string; // resolve wikilink (or embed) path to a URL path (where target is: [[target|alias]] or ![[target]])
}

function remarkWikiLink(this: Processor, opts: Options & SyntaxOptions = {}) {
  const data: any = this.data();

  function add(field: any, value: any) {
    if (data[field]) data[field].push(value);
    else data[field] = [value];
  }

  if (
    !warningIssued &&
    ((this.parser &&
      this.parser.prototype &&
      this.parser.prototype.blockTokenizers) ||
      (this.compiler &&
        this.compiler.prototype &&
        this.compiler.prototype.visitors))
  ) {
    warningIssued = true;
    console.warn(
      "[remark-wiki-link] Warning: please upgrade to remark 13 to use this plugin",
    );
  }

  // mdast-util-to-markdown extensions
  add("toMarkdownExtensions", toMarkdown(opts));
  // micromark extensions
  add("micromarkExtensions", syntax(opts));
  // mdast-util-from-markdown extensions
  add("fromMarkdownExtensions", fromMarkdown(opts));
}

export default remarkWikiLink;
export { remarkWikiLink };
