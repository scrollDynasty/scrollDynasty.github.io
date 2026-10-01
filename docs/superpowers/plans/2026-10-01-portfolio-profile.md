# Portfolio Profile Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Self-hosted, statically generated one-page profile replacing the rented Gravatar page at umar.social.

**Architecture:** Next.js 16 App Router, every route prerendered at build time. All personal data lives in `src/content/profile.ts`; pure helpers in `src/lib/` (unit-tested with Vitest) feed server components; only the interactive bits (avatar/QR toggle, dialogs, share panel) are client components.

**Tech Stack:** Next.js 16.3, React 19.2 (React Compiler on), Tailwind CSS 4, TypeScript, `qrcode`, `lucide-react` (UI icons, ISC), `simple-icons` (GitHub/Telegram logos, CC0), Vitest.

**Spec:** `docs/superpowers/specs/2026-10-01-portfolio-profile-design.md`

## Global Constraints

- Page language: Russian, `<html lang="ru">`.
- No Gravatar code, branding, ads, analytics or third-party trackers.
- Email and phone must NOT appear in JSON-LD; only in the Contacts dialog and the vCard.
- All personal data comes from `src/content/profile.ts` — no hard-coded personal strings in components.
- Every route static (`○` in `next build` output); `npm run lint`, `npm test`, `npm run build` pass.
- External links: `target="_blank" rel="me noopener noreferrer"`.
- Layout works from 360px width; dialogs keyboard-accessible (Esc closes, focus returns to trigger).
- Next 16 API notes (from `node_modules/next/dist/docs/`): `viewport` export instead of `metadata.themeColor`; `next/image` `priority` is deprecated → use `fetchPriority="high"`; route handlers are not cached unless `export const dynamic = "force-static"`; JSON-LD must escape `<` as `<`.

## Review Focus

- Company string contains a comma ("Yeb-Ich, strawberry.house") → vCard `ORG` must escape it, otherwise phones split it into org units. Test in Task 2.
- vCard lines longer than 75 octets (LinkedIn URL) must be folded per RFC 6350/2425 or some importers truncate. Test in Task 2.
- User dismisses the native share sheet → no error and no surprise copy. Test in Task 4.
- Clipboard API missing (insecure context, old browsers) or rejected → visible "copy manually" message and URL selected. Test in Task 4.
- JSON-LD containing `<` (e.g. bio with `</script>`) must not break out of the script tag; email/phone must not leak. Test in Task 3.

---

### Task 1: Test tooling, profile data, `displayUrl`

**Files:**
- Modify: `package.json` (scripts + deps)
- Create: `vitest.config.mts`
- Create: `src/content/profile.ts`
- Create: `src/lib/displayUrl.ts`
- Test: `src/lib/displayUrl.test.ts`

**Interfaces:**
- Produces: `Profile`, `Account`, `AccountKind`, `profile` from `@/content/profile`; `displayUrl(url: string): string` from `@/lib/displayUrl`.

- [ ] **Step 1: Install dependencies**

```bash
npm install qrcode lucide-react simple-icons
npm install -D vitest @types/qrcode
npm pkg set scripts.test="vitest run"
```

- [ ] **Step 2: Vitest config** — `vitest.config.mts`

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Profile data** — `src/content/profile.ts`

```ts
export type AccountKind = "linkedin" | "github" | "telegram";

export interface Account {
  kind: AccountKind;
  label: string;
  url: string;
}

export interface Profile {
  siteUrl: string;
  name: string;
  fullName: string;
  roles: string;
  companies: string;
  location: string;
  address: { locality: string; country: string };
  bio: string;
  avatar: { src: string; width: number; height: number };
  /** Path in /public; null renders the gradient cover. */
  cover: string | null;
  accounts: Account[];
  contacts: { telegram: string; email: string; phone: string };
}

export const profile: Profile = {
  siteUrl: "https://umar.social",
  name: "Umar",
  fullName: "Umar Matyokubov",
  roles: "Full-stack developer / Mobile developer",
  companies: "Yeb-Ich, strawberry.house",
  location: "Uzbekistan/Tashkent",
  address: { locality: "Tashkent", country: "UZ" },
  bio: "CEO founder Yeb-Ich",
  avatar: { src: "/avatar.png", width: 640, height: 640 },
  cover: null,
  accounts: [
    {
      kind: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/umar-matyokubov-044b41337",
    },
    { kind: "github", label: "GitHub", url: "https://github.com/scrollDynasty" },
    { kind: "telegram", label: "Telegram", url: "https://t.me/scroll_be" },
  ],
  contacts: {
    telegram: "https://t.me/scroll_be",
    email: "ymarumar502@gmail.com",
    phone: "+998936744994",
  },
};
```

- [ ] **Step 4: Write the failing test** — `src/lib/displayUrl.test.ts`

```ts
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
```

- [ ] **Step 5: Run to verify it fails** — `npm test` → FAIL, cannot resolve `./displayUrl`.

- [ ] **Step 6: Implement** — `src/lib/displayUrl.ts`

```ts
/** Human-friendly link label: no protocol, no `www.`, no trailing slash. */
export function displayUrl(url: string): string {
  const { host, pathname, search } = new URL(url);
  const path = pathname.replace(/\/+$/, "");
  return `${host.replace(/^www\./, "")}${path}${search}`;
}
```

- [ ] **Step 7: Run tests** — `npm test` → 3 passed.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.mts src/content src/lib
git commit -m "feat: add profile data, displayUrl helper and vitest setup"
```

---

### Task 2: vCard builder and `/contact.vcf`

**Files:**
- Create: `src/lib/vcard.ts`
- Test: `src/lib/vcard.test.ts`
- Create: `src/app/contact.vcf/route.ts`

**Interfaces:**
- Consumes: `Profile`, `profile` (Task 1).
- Produces: `escapeVCard(value: string): string`, `foldLine(line: string): string`, `buildVCard(p: Profile): string`; route `GET /contact.vcf`.

- [ ] **Step 1: Write the failing test** — `src/lib/vcard.test.ts`

```ts
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
```

- [ ] **Step 2: Run to verify it fails** — `npm test` → FAIL, cannot resolve `./vcard`.

- [ ] **Step 3: Implement** — `src/lib/vcard.ts`

```ts
import type { Profile } from "@/content/profile";

const MAX_LINE_OCTETS = 75;
const encoder = new TextEncoder();

/** Escapes a vCard text value (RFC 6350 §3.4). */
export function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/** Folds a content line at 75 octets without splitting multi-byte characters (RFC 6350 §3.2). */
export function foldLine(line: string): string {
  const parts: string[] = [];
  let current = "";
  let octets = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    // Continuation lines start with a space, which counts toward the limit.
    const limit = parts.length === 0 ? MAX_LINE_OCTETS : MAX_LINE_OCTETS - 1;
    if (octets + size > limit) {
      parts.push(current);
      current = "";
      octets = 0;
    }
    current += char;
    octets += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function buildVCard(p: Profile): string {
  const [given, ...rest] = p.fullName.split(" ");
  const family = rest.join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(family)};${escapeVCard(given)};;;`,
    `FN:${escapeVCard(p.fullName)}`,
    `ORG:${escapeVCard(p.companies)}`,
    `TITLE:${escapeVCard(p.roles)}`,
    `TEL;TYPE=CELL:${p.contacts.phone}`,
    `EMAIL;TYPE=INTERNET:${p.contacts.email}`,
    `URL:${p.siteUrl}`,
    ...p.accounts.map((a) => `X-SOCIALPROFILE;TYPE=${a.kind}:${a.url}`),
    `NOTE:${escapeVCard(p.bio)}`,
    "END:VCARD",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
```

- [ ] **Step 4: Run tests** — `npm test` → all pass.

- [ ] **Step 5: Route handler** — `src/app/contact.vcf/route.ts`

```ts
import { profile } from "@/content/profile";
import { buildVCard } from "@/lib/vcard";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildVCard(profile), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="umar.vcf"',
    },
  });
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/vcard.ts src/lib/vcard.test.ts src/app/contact.vcf
git commit -m "feat: generate vCard and serve it at /contact.vcf"
```

---

### Task 3: JSON-LD and QR helpers

**Files:**
- Create: `src/lib/jsonLd.ts`, `src/lib/qr.ts`
- Test: `src/lib/jsonLd.test.ts`, `src/lib/qr.test.ts`

**Interfaces:**
- Consumes: `Profile`, `profile` (Task 1).
- Produces: `personJsonLd(p: Profile): Record<string, unknown>`, `serializeJsonLd(data: unknown): string`, `qrSvg(text: string): Promise<string>`.

- [ ] **Step 1: Write the failing tests**

`src/lib/jsonLd.test.ts`:

```ts
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
      image: "https://umar.social/avatar.png",
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
```

`src/lib/qr.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { qrSvg } from "./qr";

describe("qrSvg", () => {
  it("returns a scalable SVG without fixed size", async () => {
    const svg = await qrSvg("https://umar.social");
    expect(svg).toMatch(/^<svg[^>]+viewBox="0 0 \d+ \d+"/);
    expect(svg).not.toMatch(/<svg[^>]+width=/);
  });
});
```

- [ ] **Step 2: Run to verify they fail** — `npm test` → FAIL, modules not found.

- [ ] **Step 3: Implement**

`src/lib/jsonLd.ts`:

```ts
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
```

`src/lib/qr.ts`:

```ts
import QRCode from "qrcode";

/** Black-on-white SVG QR code sized by CSS (no width/height attributes). */
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
}
```

- [ ] **Step 4: Run tests** — `npm test` → all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/jsonLd.ts src/lib/jsonLd.test.ts src/lib/qr.ts src/lib/qr.test.ts
git commit -m "feat: add Person JSON-LD and QR code helpers"
```

---

### Task 4: Share and copy helpers

**Files:**
- Create: `src/lib/share.ts`
- Test: `src/lib/share.test.ts`

**Interfaces:**
- Produces: `copyText(text: string, writeText?: (text: string) => Promise<void>): Promise<CopyResult>`; `nativeShare(data: ShareData, share?: (data: ShareData) => Promise<void>): Promise<ShareResult>`; types `CopyResult = "copied" | "failed"`, `ShareResult = "shared" | "cancelled" | "unsupported" | "failed"`.

- [ ] **Step 1: Write the failing test** — `src/lib/share.test.ts`

```ts
import { describe, expect, it, vi } from "vitest";
import { copyText, nativeShare } from "./share";

describe("copyText", () => {
  it("copies via the clipboard API", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await expect(copyText("https://umar.social", writeText)).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("https://umar.social");
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
  const data = { title: "Umar", url: "https://umar.social" };

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
```

- [ ] **Step 2: Run to verify it fails** — `npm test` → FAIL, cannot resolve `./share`.

- [ ] **Step 3: Implement** — `src/lib/share.ts`

```ts
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
```

- [ ] **Step 4: Run tests** — `npm test` → all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/share.ts src/lib/share.test.ts
git commit -m "feat: add clipboard and Web Share helpers"
```

---

### Task 5: Theme, root layout, metadata, security headers

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `next.config.ts`
- Delete: `src/app/favicon.ico`, `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`

**Interfaces:**
- Consumes: `profile` (Task 1).
- Produces: Tailwind color utilities `bg-bg`, `bg-card`, `border-line`, `divide-line`, `text-fg`, `text-muted`, `text-accent`, `border-accent`, `text-verified`; font utility `font-sans` (Inter, latin + cyrillic).

- [ ] **Step 1: Theme** — replace `src/app/globals.css`

```css
@import "tailwindcss";

:root {
  --bg: #1b1430;
  --card: #1f1d47;
  --line: #34306a;
  --fg: #ffffff;
  --muted: #b8b3d9;
  --accent: #e33cf0;
  --verified: #7b6cf6;
}

@theme inline {
  --color-bg: var(--bg);
  --color-card: var(--card);
  --color-line: var(--line);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-verified: var(--verified);
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
}

html {
  color-scheme: dark;
}

/* Lock page scroll while a modal dialog is open. */
html:has(dialog[open]) {
  overflow: hidden;
}

body {
  background: var(--bg);
  color: var(--fg);
}

dialog::backdrop {
  background: rgb(0 0 0 / 0.6);
}
```

- [ ] **Step 2: Root layout** — replace `src/app/layout.tsx`

```tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { profile } from "@/content/profile";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: `${profile.name} | ${profile.location} | ${profile.companies}`,
  description: profile.bio,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: profile.name,
    title: profile.name,
    description: profile.bio,
    locale: "ru_RU",
    firstName: profile.name,
  },
  twitter: {
    card: "summary_large_image",
    title: profile.name,
    description: profile.bio,
  },
};

export const viewport: Viewport = {
  themeColor: "#1b1430",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Security headers** — replace `next.config.ts`

```ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
```

- [ ] **Step 4: Remove boilerplate assets**

```bash
git rm src/app/favicon.ico public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
```

- [ ] **Step 5: Verify** — `npm run lint` passes (page.tsx still boilerplate; it is replaced in Task 6).

- [ ] **Step 6: Commit**

```bash
git add -A src/app/globals.css src/app/layout.tsx next.config.ts
git commit -m "feat: dark theme, root metadata and security headers"
```

---

### Task 6: Profile UI — icons, avatar/QR toggle, cards, page

**Files:**
- Create: `src/components/icons.tsx`, `src/components/AvatarQrToggle.tsx`, `src/components/ProfileCard.tsx`, `src/components/VerifiedAccounts.tsx`
- Modify: `src/app/page.tsx` (replace boilerplate)

**Interfaces:**
- Consumes: `profile`, `Profile`, `Account`, `AccountKind` (Task 1); `displayUrl` (Task 1); `personJsonLd`, `serializeJsonLd`, `qrSvg` (Task 3); theme utilities (Task 5).
- Produces: `AccountIcon({ kind, className })`, `VerifiedBadge({ label, className })`, `AvatarQrToggle({ avatar, alt, qrSvg })`, `ProfileCard({ profile, qrSvg, actions })` where `actions: ReactNode` is rendered as the button row, `VerifiedAccounts({ accounts })`.

- [ ] **Step 1: Icons** — `src/components/icons.tsx`

```tsx
import { siGithub, siTelegram } from "simple-icons";
import type { AccountKind } from "@/content/profile";

// Own drawing — simple-icons no longer ships the LinkedIn mark.
const LINKEDIN_PATH =
  "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" +
  "M8.3 6.2a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3z" +
  "M7 10.3h2.6V18H7z" +
  "M11.2 10.3h2.5v1.1c.4-.7 1.3-1.3 2.6-1.3 2 0 3 1.3 3 3.7V18h-2.6v-3.8c0-1.1-.4-1.8-1.3-1.8-1 0-1.6.7-1.6 1.8V18h-2.6z";

const ICONS: Record<AccountKind, { path: string; evenOdd?: boolean }> = {
  linkedin: { path: LINKEDIN_PATH, evenOdd: true },
  github: { path: siGithub.path },
  telegram: { path: siTelegram.path },
};

export function AccountIcon({ kind, className }: { kind: AccountKind; className?: string }) {
  const icon = ICONS[kind];
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d={icon.path} fillRule={icon.evenOdd ? "evenodd" : undefined} />
    </svg>
  );
}

export function VerifiedBadge({ label, className }: { label: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={label} className={className}>
      <title>{label}</title>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path
        d="m7.5 12.5 3 3 6-6.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Avatar/QR toggle** — `src/components/AvatarQrToggle.tsx`

```tsx
"use client";

import { QrCode, UserRound } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Profile } from "@/content/profile";

interface AvatarQrToggleProps {
  avatar: Profile["avatar"];
  alt: string;
  qrSvg: string;
}

export function AvatarQrToggle({ avatar, alt, qrSvg }: AvatarQrToggleProps) {
  const [showQr, setShowQr] = useState(false);

  return (
    <div className="relative size-28">
      <div className="size-full overflow-hidden rounded-full bg-white ring-4 ring-card">
        {showQr ? (
          <span
            role="img"
            aria-label="QR-код профиля"
            className="block size-full p-3 [&>svg]:size-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        ) : (
          <Image
            src={avatar.src}
            alt={alt}
            width={224}
            height={224}
            sizes="112px"
            fetchPriority="high"
            className="size-full object-cover"
          />
        )}
      </div>
      <button
        type="button"
        aria-pressed={showQr}
        aria-label={showQr ? "Показать фото" : "Показать QR-код"}
        onClick={() => setShowQr((v) => !v)}
        className="absolute -right-1 top-1 grid size-9 place-items-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur transition hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {showQr ? <UserRound className="size-4" aria-hidden /> : <QrCode className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Profile card** — `src/components/ProfileCard.tsx`

```tsx
import Image from "next/image";
import type { ReactNode } from "react";
import type { Profile } from "@/content/profile";
import { AvatarQrToggle } from "./AvatarQrToggle";
import { AccountIcon, VerifiedBadge } from "./icons";

interface ProfileCardProps {
  profile: Profile;
  qrSvg: string;
  actions: ReactNode;
}

export function ProfileCard({ profile, qrSvg, actions }: ProfileCardProps) {
  return (
    <section aria-labelledby="profile-name" className="overflow-hidden rounded-2xl bg-card">
      <div className="relative h-28 bg-[linear-gradient(135deg,#3b1d6e_0%,#1f1d47_55%,#5b1166_100%)]">
        {profile.cover && (
          <Image src={profile.cover} alt="" fill sizes="(min-width: 448px) 416px, 100vw" className="object-cover" />
        )}
      </div>

      <div className="px-6 pb-6">
        <div className="-mt-14">
          <AvatarQrToggle avatar={profile.avatar} alt={`Фото: ${profile.name}`} qrSvg={qrSvg} />
        </div>

        <h1 id="profile-name" className="mt-3 text-3xl font-bold">
          {profile.name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {profile.roles}, {profile.companies}
        </p>
        <p className="text-sm text-muted">{profile.location}</p>

        <div className="mt-5 flex items-center gap-3">
          <VerifiedBadge label="Подтверждённые аккаунты" className="size-5 text-verified" />
          <span aria-hidden="true" className="text-muted">
            —
          </span>
          <ul className="flex items-center gap-3">
            {profile.accounts.map((account) => (
              <li key={account.url}>
                <a
                  href={account.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label={account.label}
                  title={account.label}
                  className="block rounded transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <AccountIcon kind={account.kind} className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-5 text-sm">{profile.bio}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">{actions}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Verified accounts** — `src/components/VerifiedAccounts.tsx`

```tsx
import type { Account } from "@/content/profile";
import { displayUrl } from "@/lib/displayUrl";
import { AccountIcon, VerifiedBadge } from "./icons";

export function VerifiedAccounts({ accounts }: { accounts: Account[] }) {
  return (
    <section aria-labelledby="verified-title" className="rounded-2xl bg-card p-6">
      <h2 id="verified-title" className="text-base font-semibold">
        Подтверждённые учётные записи
      </h2>
      <ul className="mt-4 divide-y divide-line">
        {accounts.map((account) => (
          <li key={account.url} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AccountIcon kind={account.kind} className="size-4" />
              {account.label}
              <VerifiedBadge label="Подтверждено" className="size-4 text-verified" />
            </div>
            <a
              href={account.url}
              target="_blank"
              rel="me noopener noreferrer"
              className="mt-1 block break-all pl-6 text-sm text-accent hover:underline"
            >
              {displayUrl(account.url)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 5: Page** — replace `src/app/page.tsx` (buttons are placeholders until Task 7 wires the dialogs)

```tsx
import { ProfileCard } from "@/components/ProfileCard";
import { VerifiedAccounts } from "@/components/VerifiedAccounts";
import { profile } from "@/content/profile";
import { personJsonLd, serializeJsonLd } from "@/lib/jsonLd";
import { qrSvg } from "@/lib/qr";

export default async function Home() {
  const qr = await qrSvg(profile.siteUrl);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd(profile)) }}
      />
      <ProfileCard profile={profile} qrSvg={qr} actions={null} />
      <VerifiedAccounts accounts={profile.accounts} />
    </main>
  );
}
```

- [ ] **Step 6: Verify** — `npm run lint && npm run build`; build output lists `/` as static (`○`). Open `npm run dev` page at 375px and desktop: avatar shows, QR toggle flips both ways, links open in new tab.

- [ ] **Step 7: Commit**

```bash
git add src/components src/app/page.tsx
git commit -m "feat: profile card, verified accounts and avatar/QR toggle"
```

---

### Task 7: Share and Contacts dialogs

**Files:**
- Create: `src/components/Modal.tsx`, `src/components/SharePanel.tsx`, `src/components/ContactsList.tsx`
- Modify: `src/app/page.tsx` (pass real `actions`)

**Interfaces:**
- Consumes: `copyText`, `nativeShare` (Task 4); `displayUrl` (Task 1); `AccountIcon` (Task 6); `ProfileCard` `actions` prop (Task 6).
- Produces: `Modal({ triggerLabel, title, children })`, `SharePanel({ url, title, qrSvg })`, `ContactsList({ contacts })`.

- [ ] **Step 1: Modal** — `src/components/Modal.tsx`

```tsx
"use client";

import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";

interface ModalProps {
  triggerLabel: string;
  title: string;
  children: ReactNode;
}

/** Button + native modal <dialog>: Esc, backdrop click and the close button dismiss it; the browser restores focus. */
export function Modal({ triggerLabel, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-md border border-accent/60 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          // Clicks on the <dialog> box itself (outside the content wrapper) land on the backdrop.
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-card p-0 text-fg shadow-2xl"
      >
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            <form method="dialog">
              <button
                aria-label="Закрыть"
                className="rounded p-1 text-muted transition hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X className="size-5" aria-hidden />
              </button>
            </form>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
```

- [ ] **Step 2: Share panel** — `src/components/SharePanel.tsx`

```tsx
"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import { copyText, nativeShare, type CopyResult } from "@/lib/share";

interface SharePanelProps {
  url: string;
  title: string;
  qrSvg: string;
}

const noopSubscribe = () => () => {};
const canShare = () => typeof navigator.share === "function";

export function SharePanel({ url, title, qrSvg }: SharePanelProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [copyStatus, setCopyStatus] = useState<CopyResult | "idle">("idle");
  // false on the server and during hydration, real value afterwards — no mismatch.
  const shareSupported = useSyncExternalStore(noopSubscribe, canShare, () => false);

  async function handleCopy() {
    const result = await copyText(url, navigator.clipboard?.writeText.bind(navigator.clipboard));
    setCopyStatus(result);
    if (result === "failed") inputRef.current?.select();
    else setTimeout(() => setCopyStatus("idle"), 2000);
  }

  async function handleShare() {
    const result = await nativeShare({ title, url }, navigator.share?.bind(navigator));
    if (result === "failed") await handleCopy();
  }

  return (
    <div className="flex flex-col gap-4">
      <span
        role="img"
        aria-label="QR-код ссылки на профиль"
        className="mx-auto block size-40 rounded-lg bg-white p-2 [&>svg]:size-full"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />

      <div className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Ссылка на профиль
        </label>
        <input
          id={inputId}
          ref={inputRef}
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-md border border-line bg-bg px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-accent/60 px-3 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
        >
          {copyStatus === "copied" ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copyStatus === "copied" ? "Скопировано" : "Копировать"}
        </button>
      </div>

      <p role="status" className="min-h-4 text-xs text-muted">
        {copyStatus === "failed" ? "Не удалось скопировать — ссылка выделена, скопируйте её вручную." : ""}
      </p>

      {shareSupported && (
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Share2 className="size-4" aria-hidden />
          Поделиться через…
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Contacts list** — `src/components/ContactsList.tsx`

```tsx
import { Download, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";
import type { Profile } from "@/content/profile";
import { displayUrl } from "@/lib/displayUrl";
import { AccountIcon } from "./icons";

interface ContactItem {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

export function ContactsList({ contacts }: { contacts: Profile["contacts"] }) {
  const items: ContactItem[] = [
    {
      icon: <AccountIcon kind="telegram" className="size-4" />,
      label: "Telegram",
      value: displayUrl(contacts.telegram),
      href: contacts.telegram,
      external: true,
    },
    {
      icon: <Mail className="size-4" aria-hidden />,
      label: "Электронная почта",
      value: contacts.email,
      href: `mailto:${contacts.email}`,
    },
    {
      icon: <Phone className="size-4" aria-hidden />,
      label: "Телефон",
      value: contacts.phone,
      href: `tel:${contacts.phone}`,
    },
  ];

  return (
    <div>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.label} className="flex gap-3">
            <span className="mt-0.5 text-muted">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{item.label}</p>
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "me noopener noreferrer" } : {})}
                className="break-all text-sm text-accent hover:underline"
              >
                {item.value}
              </a>
            </div>
          </li>
        ))}
      </ul>
      <a
        href="/contact.vcf"
        download
        className="mt-6 flex items-center justify-center gap-2 rounded-md border border-accent/60 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Download className="size-4" aria-hidden />
        Добавить в контакты (vCard)
      </a>
    </div>
  );
}
```

- [ ] **Step 4: Wire into page** — in `src/app/page.tsx` add imports and replace `actions={null}`:

```tsx
import { ContactsList } from "@/components/ContactsList";
import { Modal } from "@/components/Modal";
import { SharePanel } from "@/components/SharePanel";
```

```tsx
      <ProfileCard
        profile={profile}
        qrSvg={qr}
        actions={
          <>
            <Modal triggerLabel="Поделиться" title="Поделиться профилем">
              <SharePanel url={profile.siteUrl} title={profile.name} qrSvg={qr} />
            </Modal>
            <Modal triggerLabel="Контакты" title="Контакты">
              <ContactsList contacts={profile.contacts} />
            </Modal>
          </>
        }
      />
```

- [ ] **Step 5: Verify** — `npm run lint && npm run build`; in the browser: each dialog opens, closes on Esc / backdrop / ✕ with focus back on its trigger; Copy shows «Скопировано»; vCard downloads as `umar.vcf`; page does not scroll behind an open dialog.

- [ ] **Step 6: Commit**

```bash
git add src/components src/app/page.tsx
git commit -m "feat: share and contacts dialogs with vCard download"
```

---

### Task 8: OG image, favicons, sitemap, robots

**Files:**
- Create: `src/lib/avatarDataUrl.ts`, `src/app/opengraph-image.tsx`, `src/app/icon.tsx`, `src/app/apple-icon.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`

**Interfaces:**
- Consumes: `profile` (Task 1).
- Produces: `avatarDataUrl(): Promise<string>`; routes `/opengraph-image`, `/icon`, `/apple-icon`, `/sitemap.xml`, `/robots.txt`.

- [ ] **Step 1: Avatar loader** — `src/lib/avatarDataUrl.ts`

```ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/content/profile";

/** Avatar from /public as a data URL, for ImageResponse renders at build time. */
export async function avatarDataUrl(): Promise<string> {
  const file = await readFile(join(process.cwd(), "public", profile.avatar.src));
  return `data:image/png;base64,${file.toString("base64")}`;
}
```

- [ ] **Step 2: OG image** — `src/app/opengraph-image.tsx`

```tsx
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { avatarDataUrl } from "@/lib/avatarDataUrl";

export const alt = `${profile.name} — ${profile.roles}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const avatar = await avatarDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: 96,
          background: "linear-gradient(135deg, #3b1d6e 0%, #1b1430 60%, #5b1166 100%)",
          color: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} width={320} height={320} alt="" style={{ borderRadius: 9999, border: "8px solid #1f1d47" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 620 }}>
          <div style={{ fontSize: 96, fontWeight: 700 }}>{profile.name}</div>
          <div style={{ fontSize: 40, color: "#b8b3d9" }}>{profile.roles}</div>
          <div style={{ fontSize: 36, color: "#e33cf0" }}>{profile.companies}</div>
        </div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 3: Favicons** — `src/app/icon.tsx`

```tsx
import { ImageResponse } from "next/og";
import { avatarDataUrl } from "@/lib/avatarDataUrl";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const avatar = await avatarDataUrl();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} width={64} height={64} alt="" style={{ borderRadius: 9999 }} />
      </div>
    ),
    size,
  );
}
```

`src/app/apple-icon.tsx` (iOS rounds the corners itself, so the image stays square):

```tsx
import { ImageResponse } from "next/og";
import { avatarDataUrl } from "@/lib/avatarDataUrl";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const avatar = await avatarDataUrl();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} width={180} height={180} alt="" />
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 4: Sitemap and robots**

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: profile.siteUrl, changeFrequency: "monthly", priority: 1 }];
}
```

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${profile.siteUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 5: Verify** — `npm run build` lists `/opengraph-image`, `/icon`, `/apple-icon`, `/sitemap.xml`, `/robots.txt`, `/contact.vcf` as static. With `npm run start`, open `/opengraph-image` and `/icon` — images render; page `<head>` has `og:image`, `link rel="icon"`, canonical.

- [ ] **Step 6: Commit**

```bash
git add src/lib/avatarDataUrl.ts src/app/opengraph-image.tsx src/app/icon.tsx src/app/apple-icon.tsx src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: OG image, favicons, sitemap and robots"
```

---

### Task 9: Final verification and README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README** — replace with: what the project is, `npm run dev` / `npm test` / `npm run build`, "edit `src/content/profile.ts` to change data; put `public/cover.jpg` and set `cover: "/cover.jpg"` for a cover image", deploy notes (Vercel, point umar.social DNS, then cancel Gravatar custom domain).

- [ ] **Step 2: Full check** — `npm test && npm run lint && npm run build` all green; every route `○`.

- [ ] **Step 3: Browser check** with `npm run start` at 360px, 375px and desktop: no horizontal scroll, long LinkedIn URL wraps, QR toggle, both dialogs (Esc / backdrop / ✕, focus return), copy, vCard download, no console errors.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README for the portfolio profile"
```
