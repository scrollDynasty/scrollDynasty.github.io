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
