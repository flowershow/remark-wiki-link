import { syntax } from "../src/lib/syntax";
import { html } from "../src/lib/html";
import { micromark } from "micromark";

describe("micromark-extension-wiki-link", () => {
  describe("Parses a wikilink", () => {
    test("that has a matching permalink", () => {
      const serialized = micromark("[[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html({ permalinks: ["Wiki Link"] })],
      });
      expect(serialized).toBe(
        '<p><a href="Wiki Link" class="internal">Wiki Link</a></p>',
      );
    });

    test("that doesn't have a matching permalink", () => {
      const serialized = micromark("[[New Page]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe(
        '<p><a href="New Page" class="internal new">New Page</a></p>',
      );
    });

    test("with a heading", () => {
      const serialized = micromark("[[Wiki Link#Some Heading]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe(
        '<p><a href="Wiki Link#some-heading" class="internal new">Wiki Link#Some Heading</a></p>',
      );
    });

    test("with heading and alias", () => {
      const serialized = micromark(
        "[[Wiki Link#Some Heading|Alias]]",
        "ascii",
        {
          extensions: [syntax()],
          htmlExtensions: [html()],
        },
      );
      expect(serialized).toBe(
        '<p><a href="Wiki Link#some-heading" class="internal new">Alias</a></p>',
      );
    });

    test("with a heading with special characters", () => {
      const serialized = micromark(
        "[[Wiki Link#Some.Heading.With-♥-Unicode and spaces]]",
        "ascii",
        {
          extensions: [syntax()],
          htmlExtensions: [html()],
        },
      );
      expect(serialized).toBe(
        '<p><a href="Wiki Link#someheadingwith--unicode-and-spaces" class="internal new">Wiki Link#Some.Heading.With-♥-Unicode and spaces</a></p>',
      );
    });

    test("to a heading on the same page", () => {
      const serialized = micromark("[[#Heading On Same Page]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe(
        '<p><a href="#heading-on-same-page" class="internal">#Heading On Same Page</a></p>',
      );
    });

    test("with an alias", () => {
      const serialized = micromark("[[Wiki Link|Alias]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe(
        '<p><a href="Wiki Link" class="internal new">Alias</a></p>',
      );
    });

    test("with Obsidian-style shortest possible path format and a matching permalink", () => {
      const serialized = micromark("[[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            permalinks: ["/some/folder/Wiki Link"],
            format: "shortestPossible",
          }),
        ],
      });
      expect(serialized).toBe(
        '<p><a href="/some/folder/Wiki Link" class="internal">Wiki Link</a></p>',
      );
    });
  });

  describe("Parses an embed", () => {
    test("image", () => {
      const serialized = micromark("![[My Image.jpg]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe(
        '<p><img src="My Image.jpg" alt="My Image" class="internal new" /></p>',
      );
    });

    test("image with a matching permalink", () => {
      const serialized = micromark("![[My Image.jpg]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            permalinks: ["My Image.jpg"],
          }),
        ],
      });
      expect(serialized).toBe(
        '<p><img src="My Image.jpg" alt="My Image" class="internal" /></p>',
      );
    });

    test("pdf", () => {
      const serialized = micromark("![[My Document.pdf]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe(
        '<p><iframe width="100%" src="My Document.pdf#toolbar=0" title="My Document" class="internal new" /></p>',
      );
    });

    test("unsupported file format", () => {
      const serialized = micromark("![[My Image.xyz]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe(
        '<p><a href="My Image.xyz" class="internal new unsupported">My Image.xyz</a></p>',
      );
    });

    test("image with a matching permalink", () => {
      const serialized = micromark("![[My Image.jpg]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html({ permalinks: ["My Image.jpg"] })],
      });
      expect(serialized).toBe(
        '<p><img src="My Image.jpg" alt="My Image" class="internal" /></p>',
      );
    });

    test("image with a matching permalink and shortestPossible path format", () => {
      const serialized = micromark("![[My Image.jpg]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            format: "shortestPossible",
            permalinks: ["/assets/My Image.jpg"],
          }),
        ],
      });
      expect(serialized).toBe(
        '<p><img src="/assets/My Image.jpg" alt="My Image" class="internal" /></p>',
      );
    });

    test("image with width", () => {
      const serialized = micromark("![[My Image.jpg|200]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html({ permalinks: ["My Image.jpg"] })],
      });
      expect(serialized).toBe(
        '<p><img src="My Image.jpg" alt="My Image" class="internal" width="200" height="200" /></p>',
      );
    });

    test("image with width and height", () => {
      const serialized = micromark("![[My Image.jpg|200x300]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html({ permalinks: ["My Image.jpg"] })],
      });
      expect(serialized).toBe(
        '<p><img src="My Image.jpg" alt="My Image" class="internal" width="200" height="300" /></p>',
      );
    });

    test("markdown note transclusion as a regular wiki link (with extra class)", () => {
      const serialized = micromark("![[Some Page]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe(
        '<p><a href="Some Page" class="internal new transclusion">Some Page</a></p>',
      );
    });
  });

  describe("Doesn't parse invalid wiki links", () => {
    test("empty wikilink", () => {
      const serialized = micromark("[[]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe("<p>[[]]</p>");
    });

    test("with single brackets", () => {
      const serialized = micromark("[Wiki Link]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe("<p>[Wiki Link]</p>");
    });

    test("with 1 missing closing bracket", () => {
      const serialized = micromark("[[Wiki Link]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe("<p>[[Wiki Link]</p>");
    });

    test("with 2 missing closing brackets", () => {
      const serialized = micromark("[[Wiki Link", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe("<p>[[Wiki Link</p>");
    });

    test("with 1 missing opening bracket", () => {
      const serialized = micromark("[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe("<p>[Wiki Link]]</p>");
    });
  });

  describe("Supports config options", () => {
    test("custom classes", () => {
      const serialized = micromark("[[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            className: "test-wiki-link",
            newClassName: "test-new",
          }),
        ],
      });
      expect(serialized).toBe(
        '<p><a href="Wiki Link" class="test-wiki-link test-new">Wiki Link</a></p>',
      );
    });

    test("custom alias divider", () => {
      const serialized = micromark("[[Wiki Link:Alias Name]]", "ascii", {
        extensions: [syntax({ aliasDivider: ":" })],
        htmlExtensions: [html()],
      });
      expect(serialized).toBe(
        '<p><a href="Wiki Link" class="internal new">Alias Name</a></p>',
      );
    });

    test("custom urlResolver", () => {
      const serialized = micromark("[[Wiki Link]]", "ascii", {
        extensions: [syntax()],
        htmlExtensions: [
          html({
            urlResolver: (page) => page.replace(/\s+/, "-").toLowerCase(),
          }),
        ],
      });
      expect(serialized).toBe(
        '<p><a href="wiki-link" class="internal new">Wiki Link</a></p>',
      );
    });
  });
});
