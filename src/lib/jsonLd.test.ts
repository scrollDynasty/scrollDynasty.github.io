import { describe, expect, it } from "vitest";
import { profile } from "@/content/profile";
import { personJsonLd, serializeJsonLd } from "./jsonLd";

describe("personJsonLd", () => {
  const data = personJsonLd(profile);

  it("describes the person with absolute URLs and sameAs links", () => {
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Umar Matyokubov",
      url: "https://umar.social",
      image: "https://umar.social/avatar.jpg",
      sameAs: profile.accounts.map((a) => a.url),
    });
  });

  it("never exposes email or phone", () => {
    const json = JSON.stringify(data);
    expect(json).not.toContain(profile.contacts.email);
    expect(json).not.toContain(profile.contacts.phone);
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so the payload cannot close the script tag", () => {
    const out = serializeJsonLd({ bio: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ bio: "</script><script>alert(1)</script>" });
  });
});
