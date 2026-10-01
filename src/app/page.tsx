import { ContactsList } from "@/components/ContactsList";
import { Modal } from "@/components/Modal";
import { ProfileCard } from "@/components/ProfileCard";
import { SharePanel } from "@/components/SharePanel";
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
      <VerifiedAccounts accounts={profile.accounts} />
    </main>
  );
}
