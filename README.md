# umar.social

Personal profile page (link-in-bio): avatar with QR code, verified accounts,
Share and Contacts dialogs, vCard download. Next.js 16 (App Router), React 19,
Tailwind CSS 4. Built as a fully static export (`out/`) and hosted on GitHub Pages.

## Commands

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests (Vitest)
npm run lint
npm run build   # static export to out/; all routes must be static (○)
```

## Editing the profile

All personal data lives in `src/content/profile.ts` — name, roles, location,
bio, accounts and contacts. Components, SEO metadata, JSON-LD, the vCard and
the QR code all read from it.

- **Avatar:** replace `public/avatar.jpg` (square JPEG or PNG, ~512px — the OG image and icons cannot use WebP) and update
  `avatar.width` / `avatar.height` if the size changes.
- **Cover image:** put a file in `public/` (e.g. `public/cover.webp`) and set
  `cover: "/cover.webp"`. With `cover: null` a gradient is shown.
- **Accounts:** supported kinds are `linkedin`, `github`, `telegram`
  (icons in `src/components/icons.tsx`).

Email and phone appear only in the Contacts dialog and the vCard — they are
deliberately kept out of the JSON-LD structured data.

## Project layout

```
src/
  app/            routes: page, contact.vcf, og.png, icon.png, apple-icon.png, sitemap, robots
  components/     ProfileCard, AvatarQrToggle, VerifiedAccounts, Modal, SharePanel, ContactsList, icons
  content/        profile.ts — the single source of truth
  lib/            helpers: vcard, jsonLd, qr, share, displayUrl, imageMime, avatarDataUrl, metaImages
```

## Deploying

Every push to `master` runs `.github/workflows/deploy.yml`: install, tests,
lint, static export, then deploy to GitHub Pages
(https://scrolldynasty.github.io). The workflow passes the Pages URL to the
build as `SITE_URL`, so canonical links, the OG image, the sitemap and the QR
code always point at the live address (locally `SITE_URL` defaults to
https://umar.social).

Static hosting limits: no custom response headers and no Next.js image
optimizer, so keep images in `public/` small (avatar ≈ 25 KB JPEG, cover WebP).
Generated images live at routes ending in `.png` (`/og.png`, `/icon.png`,
`/apple-icon.png`) because Pages picks the Content-Type from the extension.

### Moving umar.social here

1. Repo **Settings → Pages → Custom domain**: enter `umar.social`.
2. At the domain registrar, replace the Gravatar records with GitHub Pages ones:
   `A` records for `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153,
   185.199.111.153 and `CNAME` `www` → `scrolldynasty.github.io`.
3. Wait for the DNS check, tick **Enforce HTTPS**, then re-run the workflow
   (Actions → Deploy to GitHub Pages → Run workflow) so URLs switch to umar.social.
4. Check the site, `/contact.vcf` and the Telegram link preview, then cancel
   the Gravatar custom-domain plan.
