import { codes } from "micromark-util-symbol";
import type {
  Code,
  Extension as SyntaxExtension,
  Tokenizer,
} from "micromark-util-types";

export interface SyntaxOptions {
  aliasDivider?: string;
}

// Micromark SyntaxExtension
// https://github.com/micromark/micromark#syntaxextension
function wikiLink(options?: SyntaxOptions): SyntaxExtension {
  const aliasDivider = options?.aliasDivider || "|";
  const aliasMarker = aliasDivider.charCodeAt(0);
  const embedStartMarker = codes.exclamationMark;
  const startMarker = codes.leftSquareBracket;
  const endMarker = codes.rightSquareBracket;

  const tokenize: Tokenizer = function (effects, ok, nok) {
    let hasData = false;
    let hasAlias = false;
    let rootToken: "embed" | "wikiLink";
    let markerToken: "embedMarker" | "wikiLinkMarker";

    let openingBracketCursor = 0; // Counts opening [
    let closingBracketCursor = 0; // Counts closing ]

    // recognize the start of a wiki link
    function start(code: Code) {
      if (code === startMarker || code === embedStartMarker) {
        if (code === startMarker) {
          rootToken = "wikiLink";
          markerToken = "wikiLinkMarker";
        } else if (code === embedStartMarker) {
          rootToken = "embed";
          markerToken = "embedMarker";
        }
        effects.enter(rootToken);
        effects.enter(markerToken);
        return consumeStart(code);
      } else {
        return nok(code);
      }
    }

    function consumeStart(code: Code) {
      // when coursor is at the first character after the start marker `[[`
      if (openingBracketCursor === 2) {
        effects.exit(markerToken);
        return consumeData(code);
      }

      if (code === startMarker || code === embedStartMarker) {
        if (code === startMarker) {
          openingBracketCursor++;
        }
        effects.consume(code);
        return consumeStart;
      } else {
        return nok(code);
      }
    }

    function consumeData(code: Code) {
      if (isEndOfLineOrFile(code)) {
        return nok(code);
      }

      effects.enter("wikiLinkData");
      effects.enter("wikiLinkTarget");
      return consumeTarget(code);
    }

    function consumeTarget(code: Code) {
      if (code === aliasMarker) {
        if (!hasData) return nok(code);
        effects.exit("wikiLinkTarget");
        effects.enter("wikiLinkAliasMarker");
        return consumeAliasMarker(code);
      }

      if (code === endMarker) {
        if (!hasData) return nok(code);
        effects.exit("wikiLinkTarget");
        effects.exit("wikiLinkData");
        effects.enter(markerToken);
        return consumeEnd(code);
      }

      if (isEndOfLineOrFile(code)) {
        return nok(code);
      }

      hasData = true;
      effects.consume(code);

      return consumeTarget;
    }

    function consumeAliasMarker(code: Code) {
      effects.consume(code);
      effects.exit("wikiLinkAliasMarker");
      effects.enter("wikiLinkAlias");
      return consumeAlias(code);
    }

    function consumeAlias(code: Code) {
      if (code === endMarker) {
        if (!hasAlias) return nok(code);
        effects.exit("wikiLinkAlias");
        effects.exit("wikiLinkData");
        effects.enter(markerToken);
        return consumeEnd(code);
      }

      if (isEndOfLineOrFile(code)) {
        return nok(code);
      }

      hasAlias = true;
      effects.consume(code);

      return consumeAlias;
    }

    function consumeEnd(code: Code) {
      if (closingBracketCursor === 2) {
        effects.exit(markerToken);
        effects.exit(rootToken);
        return ok(code);
      }

      if (code !== endMarker) {
        return nok(code);
      }

      effects.consume(code);
      closingBracketCursor++;

      return consumeEnd;
    }

    return start;
  };

  return {
    text: {
      [codes.leftSquareBracket]: { tokenize },
      [codes.exclamationMark]: { tokenize },
    },
  };
}

export { wikiLink as syntax };

function isEndOfLineOrFile(code: Code) {
  return (
    code === codes.carriageReturnLineFeed ||
    code === codes.carriageReturn ||
    code === codes.lineFeed ||
    code === codes.eof
  );
}
