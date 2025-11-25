import {
  Handle as ToMarkdownHandle,
  Options as ToMarkdownExtension,
  State,
  Unsafe,
} from "mdast-util-to-markdown";

interface ToMarkdownOptions {
  aliasDivider?: string;
}

function toMarkdown(opts: ToMarkdownOptions = {}): ToMarkdownExtension {
  const aliasDivider = opts.aliasDivider || ":";

  const unsafe: Unsafe[] = [
    {
      character: "[",
      inConstruct: ["phrasing", "label", "reference"],
    },
    {
      character: "]",
      inConstruct: ["label", "reference"],
    },
  ];

  const handler: ToMarkdownHandle = function (node, parent, state) {
    const exit = state.enter("wikiLink");

    const nodeValue = state.safe(node.value, { before: "[", after: "]" });
    const nodeAlias = state.safe(node.data.alias, { before: "[", after: "]" });

    let value;
    if (nodeAlias !== nodeValue) {
      value = `[[${nodeValue}${aliasDivider}${nodeAlias}]]`;
    } else {
      value = `[[${nodeValue}]]`;
    }

    exit();

    return value;
  };

  const embedHandler: ToMarkdownHandle = (node, parent, state) => {
    const exit = state.enter('embed');

    const nodeValue = state.safe(node.value, { before: '[', after: ']' });
    const nodeAlias = state.safe(node.data.alias, { before: '[', after: ']' });

    const value = nodeAlias !== nodeValue ? `![[${nodeValue}${aliasDivider}${nodeAlias}]]` : `![[${nodeValue}]]`;

    exit()

    return value
  }

  return {
    unsafe,
    handlers: {
      wikiLink: handler,
      embed: embedHandler
    },
  };
}

export { toMarkdown };
