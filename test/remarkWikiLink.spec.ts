import markdown from "remark-parse";
import { unified } from "unified";
import { select } from "unist-util-select";
import { visit } from "unist-util-visit";
import { Node } from "unist";

import wikiLinkPlugin from "../src/lib/remarkWikiLink";

describe("remark-wiki-link", () => {
  describe("Parses a wikilink", () => {
    test("that has a matching permalink", () => {
      const processor = unified()
        .use(markdown)
        .use(wikiLinkPlugin, {
          permalinks: ["Wiki Link"],
        });

      let ast = processor.parse("[[Wiki Link]]");

      expect(select("wikiLink", ast)).not.toEqual(null);

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
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("[[New Page]]");

      expect(select("wikiLink", ast)).not.toEqual(null);

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
      const processor = unified().use(markdown).use(wikiLinkPlugin);

      let ast = processor.parse("[[Wiki Link#Some Heading]]");

      expect(select("wikiLink", ast)).not.toEqual(null);

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

    describe("Parses an embed", () => {
      test("image", () => {
        const processor = unified().use(markdown).use(wikiLinkPlugin);

        let ast = processor.parse("![[My Image.jpg]]");

        expect(select("embed", ast)).not.toEqual(null);

        visit(ast, "embed", (node) => {
          expect(node.value).toEqual("My Image.jpg");
          expect(node.data?.path).toEqual("My Image.jpg");
          expect(node.data?.alias).toEqual(undefined);
          expect(node.data?.existing).toEqual(false);
          expect(node.data.hProperties?.className).toBe("internal new");
          expect(node.data.hProperties?.src).toBe("My Image.jpg");
          expect(node.data.hProperties?.alt).toBe("My Image");
        });
      });
    });
  });
});
