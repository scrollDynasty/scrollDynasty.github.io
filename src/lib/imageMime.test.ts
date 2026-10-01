import { describe, expect, it } from "vitest";
import { imageMime } from "./imageMime";

describe("imageMime", () => {
  it("maps common image extensions", () => {
    expect(imageMime("/avatar.jpg")).toBe("image/jpeg");
    expect(imageMime("/avatar.JPEG")).toBe("image/jpeg");
    expect(imageMime("/avatar.png")).toBe("image/png");
  });

  it("rejects formats ImageResponse cannot render", () => {
    expect(() => imageMime("/avatar.webp")).toThrow(/unsupported/i);
  });
});
