import {
  defaultUrlResolver,
  findMatchingPermalink,
  isImageFile,
  isMarkdownFile,
  isPdfFile,
} from "../utils";
import type { CompileData, Handle, HtmlExtension } from "micromark-util-types";
import { Options } from "./remarkWikiLink";

// Micromark HtmlExtension
// https://github.com/micromark/micromark#htmlextension
function html(opts: Options = {}): HtmlExtension {
  const format = opts.format || "regular";
  const permalinks = opts.permalinks || [];
  const className = opts.className || "internal";
  const newClassName = opts.newClassName || "new";
  const urlResolver = opts.urlResolver || defaultUrlResolver;

  function top(stack: CompileData["wikiLinkStack"]) {
    return stack[stack.length - 1];
  }

  const enterWikiLink: Handle = function (this, token) {
    let stack = this.getData("wikiLinkStack");
    if (!stack) this.setData("wikiLinkStack", (stack = []));

    stack.push({
      target: undefined,
      alias: undefined,
    });
  };

  const exitWikiLinkTarget: Handle = function (this, token) {
    const target = this.sliceSerialize(token);
    const current = top(this.getData("wikiLinkStack"));
    current.target = target;
  };

  const exitWikiLinkAlias: Handle = function (this, token) {
    const alias = this.sliceSerialize(token);
    const current = top(this.getData("wikiLinkStack"));
    current.alias = alias;
  };

  const exitWikiLink: Handle = function (this, token) {
    const node = top(this.getData("wikiLinkStack"));

    const { target, alias } = node;

    if (!target) {
      throw new Error("Target is required");
    }

    const resolvedPath = urlResolver(target);
    const [, basePath = "", headingId = ""] =
      resolvedPath.match(/^(.*?)(#.*)?$/u) || [];

    const matchingPermalink = findMatchingPermalink({
      path: basePath,
      permalinks,
      format,
    });
    const finalPath = matchingPermalink ?? basePath;
    const existing = Boolean(
      matchingPermalink || (finalPath.length === 0 && headingId),
    );

    let classNames = className;
    if (!existing) {
      classNames += " " + newClassName;
    }

    if (token.type !== "embed") {
      const text = alias ?? target;
      this.tag(`<a href="${finalPath + headingId}" class="${classNames}">`);
      this.raw(text);
      this.tag("</a>");
      return;
    } else {
      const [, name = "", extension = ""] =
        target.match(/^(.+?)(?:\.([^.]+))?$/) ?? [];

      if (isMarkdownFile(extension)) {
        this.tag(
          `<a href="${finalPath + headingId}" class="${classNames} transclusion">`,
        );
        this.raw(name);
        this.tag("</a>");
        return;
      }

      if (isImageFile(extension)) {
        let imgAttributes = `src="${finalPath}" alt="${name}" class="${classNames}"`;

        const [, width, height] = alias?.match(/^(\d+)(?:x(\d+))?$/) ?? [];
        if (width) {
          imgAttributes += ` width="${width}" height="${height ?? width}"`;
        }

        this.tag(`<img ${imgAttributes} />`);
        return;
      }

      if (isPdfFile(extension)) {
        this.tag(
          `<iframe width="100%" src="${finalPath}#toolbar=0" title="${name}" class="${classNames}" />`,
        );
        return;
      }

      // Unsupported file formats
      this.tag(`<a href="${finalPath}" class="${classNames} unsupported">`);
      this.raw(target);
      this.tag("</a>");
    }
  };

  return {
    enter: {
      wikiLink: enterWikiLink,
      embed: enterWikiLink,
    },
    exit: {
      wikiLinkTarget: exitWikiLinkTarget,
      wikiLinkAlias: exitWikiLinkAlias,
      wikiLink: exitWikiLink,
      embed: exitWikiLink,
    },
  };
}

export { html };
