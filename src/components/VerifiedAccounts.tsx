import type { Account } from "@/content/profile";
import { displayUrl } from "@/lib/displayUrl";
import { AccountIcon, VerifiedBadge } from "./icons";

export function VerifiedAccounts({ accounts }: { accounts: Account[] }) {
  return (
    <section aria-labelledby="verified-title" className="rounded-md bg-card px-6 py-8 sm:px-10">
      <h2 id="verified-title" className="text-lg font-bold">
        Verified accounts
      </h2>
      <ul className="mt-4 divide-y divide-line">
        {accounts.map((account) => (
          <li key={account.url} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 font-semibold">
              <AccountIcon kind={account.kind} className="size-5" />
              {account.label}
              <VerifiedBadge label="Verified" className="size-5 text-verified" />
            </div>
            <a
              href={account.url}
              target="_blank"
              rel="me noopener noreferrer"
              className="mt-1 block break-all pl-7 text-accent hover:underline"
            >
              {displayUrl(account.url)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
