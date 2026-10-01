import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/content/profile";
import { imageMime } from "./imageMime";

/** Avatar from /public as a data URL, for ImageResponse renders at build time. */
export async function avatarDataUrl(): Promise<string> {
  const file = await readFile(join(process.cwd(), "public", profile.avatar.src));
  return `data:${imageMime(profile.avatar.src)};base64,${file.toString("base64")}`;
}
