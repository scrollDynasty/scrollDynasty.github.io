const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/** MIME type for images that next/og's ImageResponse can embed (JPEG and PNG only). */
export function imageMime(path: string): string {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME_BY_EXTENSION[extension];
  if (!mime) throw new Error(`Unsupported image format for ImageResponse: ${path}`);
  return mime;
}
