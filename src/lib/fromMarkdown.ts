import type {
  Extension as FromMarkdownExtension,
  Handle,
} from "mdast-util-from-markdown";
import {
  defaultUrlResolver,
  findMatchingPermalink,
  isImageFile,
  isMarkdownFile,
  isPdfFile,
} from "../utils";
import { Embed, WikiLink } from "mdast";
import { Options } from "./remarkWikiLink";

function fromMarkdown(opts: Options = {}): FromMarkdownExtension {
  const format = opts.format || "shortestPossible";
  const permalinks = opts.permalinks || [];
  const className = opts.className || "internal";
  const newClassName = opts.newClassName || "new";
  const urlResolver = opts.urlResolver || defaultUrlResolver;

  function top(stack: any): WikiLink | Embed {
    return stack[stack.length - 1];
  }

  const enterWikiLink: Handle = function (this, token) {
    this.enter(
      {
        type: token.type === "embed" ? "embed" : "wikiLink",
        value: "",
        data: {},
      },
      token,
    );
  };

  const exitWikiLinkTarget: Handle = function (this, token) {
    const target = this.sliceSerialize(token);
    const current = top(this.stack);
    current.value = target;
  };

  const exitWikiLinkAlias: Handle = function (this, token) {
    const alias = this.sliceSerialize(token);
    const current = top(this.stack);
    current.data.alias = alias;
  };

  const exitWikiLink: Handle = function (this, token) {
    const wikiLink = top(this.stack);

    // if (!wikiLink || !wikiLink.data) {
    //   throw new Error("Missing wikilink data");
    // }

    const {
      value,
      data: { alias },
    } = wikiLink;

    if (!value) {
      throw new Error("Empty node value");
    }

    const resolvedPath = token.type === "embed" ? value : urlResolver(value);
    const [, basePath = "", headingId = ""] =
      token.type === "embed"
        ? [, value]
        : resolvedPath.match(/^(.*?)(#.*)?$/u) || [];

    const matchingPermalink = findMatchingPermalink({
      path: basePath,
      permalinks,
      format,
    });
    const finalPath = matchingPermalink ?? basePath;
    const existing = Boolean(
      matchingPermalink ?? (finalPath.length === 0 && headingId),
    );

    let classNames = className;
    if (!existing) {
      classNames += " " + newClassName;
    }

    wikiLink.data.existing = existing;
    wikiLink.data.path = finalPath + headingId;

    if (token.type !== "embed") {
      const text = alias ?? value;
      wikiLink.data.hName = "a";
      wikiLink.data.hProperties = {
        href: finalPath + headingId,
        className: classNames,
      };
      wikiLink.data.hChildren = [{ type: "text", value: text }];
    } else {
      const [, name = "", extension = ""] =
        value.match(/^(.+?)(?:\.([^.]+))?$/) ?? [];

      if (isMarkdownFile(extension)) {
        wikiLink.data.hName = "a";
        wikiLink.data.hProperties = {
          className: classNames + " transclusion",
          src: finalPath,
        };
        wikiLink.data.hChildren = [{ type: "text", value: name }];
      } else if (isImageFile(extension)) {
        const [match, width, height] = alias?.match(/^(\d+)(?:x(\d+))?$/) ?? [];
        if (match) {
          wikiLink.data.alias = undefined;
        }
        wikiLink.data.hName = "img";
        wikiLink.data.hProperties = {
          src: finalPath,
          alt: name,
          className: classNames,
          width: width ?? undefined,
          height: height ?? width ?? undefined,
        };
      } else if (isPdfFile(extension)) {
        wikiLink.data.hName = "iframe";
        wikiLink.data.hProperties = {
          width: "100%",
          src: `${finalPath}#toolbar=0`,
          title: name,
          className: classNames,
        };
      } else {
        // Unsupported file formats
        wikiLink.data.hName = "a";
        wikiLink.data.hProperties = {
          href: finalPath,
          className: classNames + " unsupported",
        };
        wikiLink.data.hChildren = [{ type: "text", value }];
      }
    }

    this.exit(token);
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

export { fromMarkdown };
