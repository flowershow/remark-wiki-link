export { getPermalinks } from "./getPermalinks";
import { slug } from "github-slugger";

// File type definitions
export type MarkdownFile = `.md`;

export type ImageFile =
  | `avif`
  | `bmp`
  | `gif`
  | `jpeg`
  | `jpg`
  | `png`
  | `svg`
  | `webp`;

export type AudioFile = `flac` | `m4a` | `mp3` | `ogg` | `wav` | `webm` | `3gp`;

export type VideoFile = `mkv` | `mov` | `mp4` | `ogv` | `webm`;

export type PdfFile = `pdf`;

export type SupportedFileType =
  | MarkdownFile
  | ImageFile
  | AudioFile
  | VideoFile
  | PdfFile;

export function isMarkdownFile(extension: string): extension is MarkdownFile {
  return extension === "md" || extension === "";
}

export function isImageFile(extension: string): extension is ImageFile {
  return ["avif", "bmp", "gif", "jpeg", "jpg", "png", "svg", "webp"].includes(
    extension,
  );
}

export function isAudioFile(extension: string): extension is AudioFile {
  return ["flac", "m4a", "mp3", "ogg", "wav", "webm", "3gp"].includes(
    extension,
  );
}

export function isVideoFile(extension: string): extension is VideoFile {
  return ["mkv", "mov", "mp4", "ogv", "webm"].includes(extension);
}

export function isPdfFile(extension: string): extension is PdfFile {
  return extension === "pdf";
}

export function isSupportedFileType(
  extension: string,
): extension is SupportedFileType {
  return (
    isMarkdownFile(extension) ||
    isImageFile(extension) ||
    isAudioFile(extension) ||
    isVideoFile(extension) ||
    isPdfFile(extension)
  );
}

/**
 * Regular expression to extract path and heading from a wiki-link target path.
 * Matches the entire string, capturing:
 * 1. The path part (everything before #, if any)
 * 2. The heading part (everything after #, if any)
 */
const WIKI_LINK_TARGET_PATTERN = /^(.*?)(?:#(.*))?$/u;

export const defaultUrlResolver = (filePath: string): string => {
  const [, rawPath = "", rawHeading = ""] =
    WIKI_LINK_TARGET_PATTERN.exec(filePath) ?? [];

  // Remove trailing /index and /README
  const normalizedPath = rawPath.replace(/\/?(index|README)$/, "");

  // Generate heading anchor if present
  const headingAnchor = rawHeading ? `#${slug(rawHeading)}` : "";

  // Special case: only heading anchor
  if (headingAnchor && !normalizedPath) {
    return headingAnchor;
  }

  return normalizedPath + headingAnchor;
};

export const findMatchingPermalink = ({
  path,
  permalinks,
  format,
}: {
  path: string;
  permalinks: string[];
  format?: "regular" | "shortestPossible";
}): string | undefined => {
  if (format === "shortestPossible") {
    console.log("SHORTEST");
    return permalinks.find((permalink) => permalink.endsWith(path));
  }

  return permalinks.find((permalink) => permalink === path);
};
