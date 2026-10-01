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
