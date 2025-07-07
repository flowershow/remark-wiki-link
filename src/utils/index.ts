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

export const defaultUrlResolver = (targetPath: string): string => {
  const [, path = "", heading = ""] =
    targetPath.match(/^(.*?)(?:#(.*))?$/u) ?? [];

  let transformedPath = path.replace(/\/(index|README)$/, "");

  const transformedHeading = heading && slug(heading);

  if (transformedPath === "index" || transformedPath === "README") {
    transformedPath = "";
  }

  if (transformedHeading && !transformedPath) {
    return "#" + transformedHeading;
  }

  return `${transformedPath}${transformedHeading && "#" + transformedHeading}`;
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
    return permalinks.find((permalink) => permalink.endsWith(path));
  }

  return permalinks.find((permalink) => permalink === path);
};
