import type { Profile } from "@/content/profile";

/** schema.org Person. Email and phone are intentionally omitted (scraper exposure). */
export function personJsonLd(p: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.fullName,
    alternateName: p.name,
    url: p.siteUrl,
    image: new URL(p.avatar.src, p.siteUrl).toString(),
    jobTitle: p.roles,
    description: p.bio,
    address: {
      "@type": "PostalAddress",
      addressLocality: p.address.locality,
      addressCountry: p.address.country,
    },
    sameAs: p.accounts.map((a) => a.url),
  };
}

/** JSON for a <script type="application/ld+json"> body, safe against `</script>` injection. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
