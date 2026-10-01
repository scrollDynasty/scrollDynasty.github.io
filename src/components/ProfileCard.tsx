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
    <section aria-labelledby="profile-name" className="overflow-hidden rounded-md bg-card">
      <div className="relative h-36 bg-[linear-gradient(135deg,#3b1d6e_0%,#1f1d47_55%,#5b1166_100%)]">
        {profile.cover && (
          <Image
            src={profile.cover}
            alt=""
            fill
            sizes="(min-width: 672px) 640px, 100vw"
            loading="eager"
            className="object-cover object-[50%_31%]"
          />
        )}
      </div>

      <div className="px-6 pb-8 sm:px-10 sm:pb-10">
        {/* Avatar starts 32px below the card top, overlapping the 144px cover. */}
        <div className="relative -mt-28">
          <AvatarQrToggle avatar={profile.avatar} alt={profile.fullName} qrSvg={qrSvg} />
        </div>

        <h1 id="profile-name" className="mt-4 text-[34px] leading-tight font-bold">
          {profile.name}
        </h1>
        <p className="mt-2 text-muted">{profile.roles}</p>
        <p className="text-muted">{profile.companies}</p>
        <p className="text-muted">{profile.location}</p>

        <div className="mt-6 flex items-center gap-3">
          <VerifiedBadge label="Verified accounts" className="size-6 text-verified" />
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
                  <AccountIcon kind={account.kind} className="size-6" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6">{profile.bio}</p>

        <div className="mt-8 grid grid-cols-2 gap-4">{actions}</div>
      </div>
    </section>
  );
}
