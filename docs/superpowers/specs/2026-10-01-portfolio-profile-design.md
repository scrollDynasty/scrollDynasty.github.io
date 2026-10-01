# Portfolio profile page — design

Date: 2026-10-01
Status: approved in chat, pending written-spec review

## Goal

Replace the rented Gravatar profile with a self-hosted page that
offers the same structure and features. Independent implementation: own markup,
styles and icons; no Gravatar code, branding, ads or trackers.

Success criteria:

- One page with the same sections and interactions as the current profile.
- Fully static (SSG); `next build` and `npm run lint` pass.
- Works at phone width (≥ 360px) and desktop; dialogs usable by keyboard.
- All personal data edited in one file.

Out of scope: projects/skills sections, blog, gallery, CMS, analytics, i18n
(the page is Russian only, like the current one).

## Stack

Next.js 16 (App Router) + React 19 + Tailwind CSS 4 — already in the repo.
New dependencies: `qrcode` (QR SVG at build time), `vitest` (dev, unit tests).
Before writing code, read the relevant guides in `node_modules/next/dist/docs/`
(metadata, route handlers, image, opengraph-image), per AGENTS.md.

## Data

`src/content/profile.ts` — single typed source of truth:

```ts
export const profile = {
  siteUrl: "https://scrolldynasty.github.io",
  name: "Umar",
  fullName: "Umar Matyokubov",
  roles: "Full-stack developer / Mobile developer",
  companies: "Yeb-Ich, strawberry.house",
  location: "Uzbekistan/Tashkent",
  bio: "CEO founder Yeb-Ich",
  avatar: "/avatar.png",
  cover: null as string | null, // null → gradient cover
  accounts: [
    { kind: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/umar-matyokubov-044b41337" },
    { kind: "github",   label: "GitHub",   url: "https://github.com/scrollDynasty" },
    { kind: "telegram", label: "Telegram", url: "https://t.me/scroll_be" },
  ],
  contacts: {
    telegram: "https://t.me/scroll_be",
    email: "ymarumar502@gmail.com",
    phone: "+998936744994",
  },
};
```

## Routes

| Path | Implementation |
|---|---|
| `/` | `src/app/page.tsx`, static |
| `/contact.vcf` | Route handler, `force-static`, returns vCard 3.0, `Content-Type: text/vcard` |
| `/opengraph-image` | Generated OG image (name, role, avatar) |
| `/sitemap.xml`, `/robots.txt` | `sitemap.ts`, `robots.ts` |
| favicon | `src/app/icon.png` derived from avatar |

Metadata: title `Umar | Uzbekistan/Tashkent | Yeb-Ich, strawberry.house`,
description = bio, canonical = siteUrl, OpenGraph `type: profile`, `lang="ru"`.
JSON-LD `Person` with name, url, image, address, description and `sameAs`
(account URLs). Email and phone are deliberately **not** included in JSON-LD
(scraper exposure); they stay in the Contacts dialog and the vCard.

## Components (`src/components/`)

| Component | Kind | Responsibility |
|---|---|---|
| `ProfileCard` | server | Cover, avatar block, name, roles/companies, location, verified icon row, bio, two action buttons |
| `AvatarQrToggle` | client | Round avatar; corner button flips to the QR code (SVG string generated on the server and passed as prop) and back |
| `ShareDialog` | client | Native `<dialog>`: profile URL, Copy button, `navigator.share` when available, QR code |
| `ContactsDialog` | client | Telegram, email (`mailto:`), phone (`tel:`), "Add to contacts (vCard)" link to `/contact.vcf` |
| `VerifiedAccounts` | server | Card "Подтверждённые учётные записи" listing accounts with icon, label, verified badge, display URL |
| `icons.tsx` | server | Own inline SVG icons: LinkedIn, GitHub, Telegram, verified badge, QR, user, close, mail, phone |

Pure helpers in `src/lib/`:

- `vcard.ts` — `buildVCard(profile): string` (escapes `,;\` and newlines, CRLF line endings).
- `qr.ts` — `qrSvg(url): Promise<string>` via `qrcode`.
- `displayUrl.ts` — strips protocol and `www.` for link labels.

## Visual style

Dark purple theme matching the current page: page background ≈ `#1e1530`,
cards ≈ `#1f1d45`, primary text white, secondary text muted lavender,
accent magenta ≈ `#e100e8` for links and outlined buttons, verified badge
blue-violet. Centered column, max width ≈ 400px, cards with rounded corners
and 24px inner padding. Colors defined as CSS variables in `globals.css`
and exposed to Tailwind via `@theme`. Default cover: gradient in theme colors.

## Error handling

- `navigator.share` missing or rejected → fall back to copy.
- Clipboard write fails → select the URL text in the input so the user can copy manually.
- Dialogs close on Escape, backdrop click and close button; focus returns to the trigger.

## Testing

- Vitest unit tests for `buildVCard` (fields present, escaping, CRLF) and `displayUrl`.
- `next build` and `npm run lint` pass.
- Manual check in the browser at 375px and desktop width: QR toggle, both
  dialogs, vCard download, links open in new tab with `rel="me noopener noreferrer"`.

## Deployment (informational)

Deployed as a static export to GitHub Pages at https://scrolldynasty.github.io
(see README).
