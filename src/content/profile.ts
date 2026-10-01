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
  /** Public origin, set per deployment via SITE_URL (e.g. https://scrolldynasty.github.io). */
  siteUrl: process.env.SITE_URL ?? "https://umar.social",
  name: "Umar",
  fullName: "Umar Matyokubov",
  roles: "Full-Stack Engineer · TypeScript, Python",
  companies: "Crowe TAC, Strawberry House Agro",
  location: "Tashkent, Uzbekistan",
  address: { locality: "Tashkent", country: "UZ" },
  bio: "Building B2B platforms & AI products.",
  avatar: { src: "/avatar.jpg", width: 512, height: 512 },
  cover: "/cover.webp",
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
