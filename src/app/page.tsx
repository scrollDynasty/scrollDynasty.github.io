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
