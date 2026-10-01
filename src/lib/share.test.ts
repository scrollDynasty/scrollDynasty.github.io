import { describe, expect, it, vi } from "vitest";
import { copyText, nativeShare } from "./share";

describe("copyText", () => {
  it("copies via the clipboard API", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(copyText("https://scrolldynasty.github.io", writeText)).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("https://scrolldynasty.github.io");
  });

  it("fails when the clipboard API is missing", async () => {
    await expect(copyText("x", undefined)).resolves.toBe("failed");
  });

  it("fails when the clipboard rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    await expect(copyText("x", writeText)).resolves.toBe("failed");
  });
});

describe("nativeShare", () => {
  const data = { title: "Umar", url: "https://scrolldynasty.github.io" };

  it("reports unsupported without a share function", async () => {
    await expect(nativeShare(data, undefined)).resolves.toBe("unsupported");
  });

  it("shares", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    await expect(nativeShare(data, share)).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith(data);
  });

  it("treats a dismissed share sheet as cancelled, not failed", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("dismissed", "AbortError"));
    await expect(nativeShare(data, share)).resolves.toBe("cancelled");
  });

  it("reports other errors as failed", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("blocked", "NotAllowedError"));
    await expect(nativeShare(data, share)).resolves.toBe("failed");
  });
});
