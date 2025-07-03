import { visit } from "unist-util-visit";
import { Node, Data } from "unist";
import { syntax } from "../src/lib/syntax";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { fromMarkdown as wikiLinkFromMarkdown } from "../src/lib/fromMarkdown";
import { toMarkdown as wikiLinkToMarkdown } from "../src/lib/toMarkdown";
import { WikiLink } from "mdast";

// function assertWikiLink(obj: Node): asserts obj is WikiLink {
//   if (obj.type !== "wikiLink" && obj.type !== "wikiEmbed") {
//     throw new Error("Not a wiki link or embed");
//   }
// }

describe("mdast-util-wiki-link-plus", () => {
  describe("(fromMarkdown) Parses a wikilink", () => {
    test("that has a matching permalink", () => {
      const ast = fromMarkdown("[[Wiki Link]]", {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLinkFromMarkdown({
            permalinks: ["Wiki Link"],
          }),
        ],
      });

      visit(ast, "wikiLink", (node) => {
        expect(node.value).toBe("Wiki Link");
        expect(node.data.path).toBe("Wiki Link");
        expect(node.data.alias).toBe(undefined);
        expect(node.data.existing).toBe(true);
        expect(node.data.hName).toBe("a");
        expect(node.data.hProperties?.className).toBe("internal");
        expect(node.data.hProperties?.href).toBe("Wiki Link");
        expect(node.data.hChildren?.[0].value).toBe("Wiki Link");
      });
    });

    test("that doesn't have a matching permalink", () => {
      const ast = fromMarkdown("[[New Page]]", {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLinkFromMarkdown({
            permalinks: [],
          }),
        ],
      });

      visit(ast, "wikiLink", (node) => {
        expect(node.value).toBe("New Page");
        expect(node.data.path).toBe("New Page");
        expect(node.data.alias).toBe(undefined);
        expect(node.data.existing).toBe(false);
        expect(node.data.hName).toBe("a");
        expect(node.data.hProperties?.className).toBe("internal new");
        expect(node.data.hProperties?.href).toBe("New Page");
        expect(node.data.hChildren?.[0].value).toBe("New Page");
      });
    });

    test("with a heading", () => {
      const ast = fromMarkdown("[[Wiki Link#Some Heading]]", {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLinkFromMarkdown({
            permalinks: [],
          }),
        ],
      });

      visit(ast, "wikiLink", (node) => {
        expect(node.value).toBe("Wiki Link#Some Heading");
        expect(node.data.path).toBe("Wiki Link#some-heading");
        expect(node.data.alias).toBe(undefined);
        expect(node.data.existing).toBe(false);
        expect(node.data.hName).toBe("a");
        expect(node.data.hProperties?.className).toBe("internal new");
        expect(node.data.hProperties?.href).toBe("Wiki Link#some-heading");
        expect(node.data.hChildren?.[0].value).toBe("Wiki Link#Some Heading");
      });
    });

    test("with heading and alias", () => {
      const ast = fromMarkdown("[[Wiki Link#Some Heading|Alias]]", {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLinkFromMarkdown({
            permalinks: [],
          }),
        ],
      });

      visit(ast, "wikiLink", (node) => {
        expect(node.value).toBe("Wiki Link#Some Heading");
        expect(node.data.path).toBe("Wiki Link#some-heading");
        expect(node.data.alias).toBe("Alias");
        expect(node.data.existing).toBe(false);
        expect(node.data.hName).toBe("a");
        expect(node.data.hProperties?.className).toBe("internal new");
        expect(node.data.hProperties?.href).toBe("Wiki Link#some-heading");
        expect(node.data.hChildren?.[0].value).toBe("Alias");
      });
    });

    test("to a heading on the same page", () => {
      const ast = fromMarkdown("[[#Some Heading]]", {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLinkFromMarkdown({
            permalinks: [],
          }),
        ],
      });

      visit(ast, "wikiLink", (node) => {
        expect(node.value).toBe("#Some Heading");
        expect(node.data.path).toBe("#some-heading");
        expect(node.data.alias).toBe(undefined);
        expect(node.data.existing).toBe(true);
        expect(node.data.hName).toBe("a");
        expect(node.data.hProperties?.className).toBe("internal");
        expect(node.data.hProperties?.href).toBe("#some-heading");
        expect(node.data.hChildren?.[0].value).toBe("#Some Heading");
      });
    });

    test("with an alias", () => {
      const ast = fromMarkdown("[[Wiki Link|Alias]]", {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLinkFromMarkdown({
            permalinks: [],
          }),
        ],
      });

      visit(ast, "wikiLink", (node) => {
        expect(node.value).toBe("Wiki Link");
        expect(node.data.path).toBe("Wiki Link");
        expect(node.data.alias).toBe("Alias");
        expect(node.data.existing).toBe(false);
        expect(node.data.hName).toBe("a");
        expect(node.data.hProperties?.className).toBe("internal new");
        expect(node.data.hProperties?.href).toBe("Wiki Link");
        expect(node.data.hChildren?.[0].value).toBe("Alias");
      });
    });

    test("with Obsidian-style shortest possible path format and a matching permalink", () => {
      const ast = fromMarkdown("[[Wiki Link]]", {
        extensions: [syntax()],
        mdastExtensions: [
          wikiLinkFromMarkdown({
            format: "shortestPossible",
            permalinks: ["/some/folder/Wiki Link"],
          }),
        ],
      });

      visit(ast, "wikiLink", (node) => {
        expect(node.value).toBe("Wiki Link");
        expect(node.data.path).toBe("/some/folder/Wiki Link");
        expect(node.data.alias).toBe(undefined);
        expect(node.data.existing).toBe(true);
        expect(node.data.hName).toBe("a");
        expect(node.data.hProperties?.className).toBe("internal");
        expect(node.data.hProperties?.href).toBe("/some/folder/Wiki Link");
        expect(node.data.hChildren?.[0].value).toBe("Wiki Link");
      });
    });
  });

  describe("Parses an embed", () => {
    test("image", () => {
      const ast = fromMarkdown("![[My Image.jpg]]", {
        extensions: [syntax()],
        mdastExtensions: [wikiLinkFromMarkdown()],
      });

      visit(ast, "embed", (node) => {
        expect(node.value).toBe("My Image.jpg");
        expect(node.data.path).toBe("My Image.jpg");
        expect(node.data.alias).toBe(undefined);
        expect(node.data.existing).toBe(false);
        expect(node.data.hName).toBe("img");
        expect(node.data.hProperties?.className).toBe("internal new");
        expect(node.data.hProperties?.src).toBe("My Image.jpg");
        expect(node.data.hProperties?.alt).toBe("My Image");
      });
    });

    test("image with dimensions", () => {
      const ast = fromMarkdown("![[My Image.jpg|200x300]]", {
        extensions: [syntax()],
        mdastExtensions: [wikiLinkFromMarkdown()],
      });

      visit(ast, "embed", (node) => {
        expect(node.value).toBe("My Image.jpg");
        expect(node.data.path).toBe("My Image.jpg");
        expect(node.data.alias).toBe(undefined);
        expect(node.data.existing).toBe(false);
        expect(node.data.hName).toBe("img");
        expect(node.data.hProperties?.className).toBe("internal new");
        expect(node.data.hProperties?.src).toBe("My Image.jpg");
        expect(node.data.hProperties?.width).toBe("200");
        expect(node.data.hProperties?.height).toBe("300");
        expect(node.data.hProperties?.alt).toBe("My Image");
      });
    });

    test("pdf", () => {
      const ast = fromMarkdown("![[My File.pdf]]", {
        extensions: [syntax()],
        mdastExtensions: [wikiLinkFromMarkdown()],
      });

      visit(ast, "embed", (node) => {
        expect(node.value).toBe("My File.pdf");
        expect(node.data.path).toBe("My File.pdf");
        expect(node.data.alias).toBe(undefined);
        expect(node.data.existing).toBe(false);
        expect(node.data.hName).toBe("iframe");
        expect(node.data.hProperties?.className).toBe("internal new");
        expect(node.data.hProperties?.src).toBe("My File.pdf#toolbar=0");
        expect(node.data.hProperties?.title).toBe("My File");
      });
    });
  });

  //   describe("configuration options", () => {
  //     test("uses pathTransformer", () => {
  //       const kebab = (name: string) => name.replace(" ", "_").toLowerCase()

  //       const ast = fromMarkdown("[[A Page]]", {
  //         extensions: [syntax()],
  //         mdastExtensions: [
  //           wikiLinkFromMarkdown({
  //             pathTransformer: kebab,
  //             permalinks: ["a-page"],
  //           }),
  //         ],
  //       });

  //       visit(ast, "wikiLink", (node: Node) => {
  //         expect(node.data.existing).toBe(true);
  //         expect(node.data.path).toBe("a-page");
  //         expect(node.data.hProperties?.href).toBe("a-page");
  //       });
  //     });

  //     test("uses newClassName", () => {
  //       const ast = fromMarkdown("[[A Page]]", {
  //         extensions: [syntax()],
  //         mdastExtensions: [
  //           wikiLinkFromMarkdown({
  //             permalinks: [],
  //             newClassName: "new_page",
  //           }),
  //         ],
  //       });

  //       visit(ast, "wikiLink", (node: Node) => {
  //         expect(node.data.hProperties?.className).toBe("internal new_page");
  //       });
  //     });

  //     test("uses className", () => {
  //       const ast = fromMarkdown("[[A Page]]", {
  //         extensions: [syntax()],
  //         mdastExtensions: [
  //           wikiLinkFromMarkdown({
  //             className: "wiki_link",
  //             permalinks: [],
  //           }),
  //         ],
  //       });

  //       visit(ast, "wikiLink", (node: Node) => {
  //         expect(node.data.hProperties?.className).toBe("wiki_link");
  //       });
  //     });
  //   });
  // });

  // describe("toMarkdown", () => {
  //   test("stringifies wiki links", () => {
  //     const ast = fromMarkdown("[[Wiki Link]]", {
  //       extensions: [syntax()],
  //       mdastExtensions: [wikiLink.fromMarkdown()],
  //     });

  //     const stringified = toMarkdown(ast, {
  //       extensions: [wikiLink.toMarkdown()],
  //     }).trim();

  //     assert.equal(stringified, "[[Wiki Link]]");
  //   });

  //   test("stringifies aliased wiki links", () => {
  //     const ast = fromMarkdown("[[Real Page:Page Alias]]", {
  //       extensions: [syntax()],
  //       mdastExtensions: [wikiLink.fromMarkdown()],
  //     });

  //     const stringified = toMarkdown(ast, {
  //       extensions: [wikiLink.toMarkdown()],
  //     }).trim();

  //     assert.equal(stringified, "[[Real Page:Page Alias]]");
  //   });

  //   describe("configuration options", () => {
  //     test("uses aliasDivider", () => {
  //       const ast = fromMarkdown("[[Real Page:Page Alias]]", {
  //         extensions: [syntax()],
  //         mdastExtensions: [wikiLink.fromMarkdown()],
  //       });

  //       const stringified = toMarkdown(ast, {
  //         extensions: [wikiLink.toMarkdown({ aliasDivider: "|" })],
  //       }).trim();

  //       assert.equal(stringified, "[[Real Page|Page Alias]]");
  //     });
  //   });
  // });
});
