import { describe, expect, it } from "vitest";
import { qrSvg } from "./qr";

describe("qrSvg", () => {
  it("returns a scalable SVG without fixed size", async () => {
    const svg = await qrSvg("https://umar.social");
    expect(svg).toMatch(/^<svg[^>]+viewBox="0 0 \d+ \d+"/);
    expect(svg).not.toMatch(/<svg[^>]+width=/);
  });
});
