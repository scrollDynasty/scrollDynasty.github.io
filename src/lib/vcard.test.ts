import { describe, expect, it } from "vitest";
import { profile } from "@/content/profile";
import { buildVCard, escapeVCard, foldLine } from "./vcard";

const unfold = (card: string) => card.replace(/\r\n /g, "");

describe("escapeVCard", () => {
  it("escapes backslash, comma, semicolon and newlines", () => {
    expect(escapeVCard("a\\b,c;d\ne")).toBe("a\\\\b\\,c\\;d\\ne");
  });
});

describe("foldLine", () => {
  it("leaves short lines alone", () => {
    expect(foldLine("FN:Umar")).toBe("FN:Umar");
  });

  it("folds so that no physical line exceeds 75 octets", () => {
    const line = `NOTE:${"Ж".repeat(60)}`; // 5 + 120 octets
    const folded = foldLine(line);
    for (const part of folded.split("\r\n")) {
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
    }
    expect(folded.replace(/\r\n /g, "")).toBe(line);
  });
});

describe("buildVCard", () => {
  const card = buildVCard(profile);

  it("is a CRLF-delimited vCard 3.0", () => {
    expect(card.startsWith("BEGIN:VCARD\r\nVERSION:3.0\r\n")).toBe(true);
    expect(card.endsWith("END:VCARD\r\n")).toBe(true);
    expect(card.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });

  it("contains name, contacts and escaped organisation", () => {
    const text = unfold(card);
    expect(text).toContain("N:Matyokubov;Umar;;;\r\n");
    expect(text).toContain("FN:Umar Matyokubov\r\n");
    expect(text).toContain("ORG:Yeb-Ich\\, strawberry.house\r\n");
    expect(text).toContain("TEL;TYPE=CELL:+998936744994\r\n");
    expect(text).toContain("EMAIL;TYPE=INTERNET:ymarumar502@gmail.com\r\n");
    expect(text).toContain(
      "X-SOCIALPROFILE;TYPE=linkedin:https://www.linkedin.com/in/umar-matyokubov-044b41337\r\n",
    );
  });
});
