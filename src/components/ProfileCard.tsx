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
