# umar.social

Personal profile page (link-in-bio): avatar with QR code, verified accounts,
Share and Contacts dialogs, vCard download. Next.js 16 (App Router), React 19,
Tailwind CSS 4. Every route is prerendered at build time.

## Commands

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests (Vitest)
npm run lint
npm run build   # production build; all routes must be static (○)
npm start       # serve the production build
```

## Editing the profile

All personal data lives in `src/content/profile.ts` — name, roles, location,
bio, accounts and contacts. Components, SEO metadata, JSON-LD, the vCard and
the QR code all read from it.

- **Avatar:** replace `public/avatar.png` (square, ≥ 512px) and update
  `avatar.width` / `avatar.height` if the size changes.
- **Cover image:** put a file in `public/` (e.g. `public/cover.jpg`) and set
  `cover: "/cover.jpg"`. With `cover: null` a gradient is shown.
- **Accounts:** supported kinds are `linkedin`, `github`, `telegram`
  (icons in `src/components/icons.tsx`).

Email and phone appear only in the Contacts dialog and the vCard — they are
deliberately kept out of the JSON-LD structured data.

## Project layout

```
src/
  app/            routes: page, contact.vcf, opengraph-image, icon, apple-icon, sitemap, robots
  components/     ProfileCard, AvatarQrToggle, VerifiedAccounts, Modal, SharePanel, ContactsList, icons
  content/        profile.ts — the single source of truth
  lib/            pure helpers with tests: vcard, jsonLd, qr, share, displayUrl, avatarDataUrl
```

## Deploying

1. Deploy to Vercel (or any host that runs `next start`).
2. Point the `umar.social` DNS records to the new host and wait until HTTPS works.
3. Check `https://umar.social`, `/contact.vcf` and the link preview in Telegram.
4. Only then cancel the Gravatar custom-domain plan.
