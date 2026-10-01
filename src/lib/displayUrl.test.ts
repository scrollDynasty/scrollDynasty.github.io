import { describe, expect, it } from "vitest";
import { displayUrl } from "./displayUrl";

describe("displayUrl", () => {
  it("strips protocol and www", () => {
    expect(displayUrl("https://www.linkedin.com/in/umar-matyokubov-044b41337")).toBe(
      "linkedin.com/in/umar-matyokubov-044b41337",
    );
  });

  it("drops a trailing slash", () => {
    expect(displayUrl("https://t.me/scroll_be/")).toBe("t.me/scroll_be");
  });

  it("returns the bare host for a root URL", () => {
    expect(displayUrl("https://github.com/")).toBe("github.com");
  });
});
