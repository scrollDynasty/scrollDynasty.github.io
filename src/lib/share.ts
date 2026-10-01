export type CopyResult = "copied" | "failed";
export type ShareResult = "shared" | "cancelled" | "unsupported" | "failed";

export async function copyText(
  text: string,
  writeText?: (text: string) => Promise<void>,
): Promise<CopyResult> {
  if (!writeText) return "failed";
  try {
    await writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}

export async function nativeShare(
  data: ShareData,
  share?: (data: ShareData) => Promise<void>,
): Promise<ShareResult> {
  if (!share) return "unsupported";
  try {
    await share(data);
    return "shared";
  } catch (error) {
    // The user closing the share sheet rejects with AbortError — not a failure.
    return error instanceof Error && error.name === "AbortError" ? "cancelled" : "failed";
  }
}
