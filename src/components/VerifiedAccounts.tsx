import type { Account } from "@/content/profile";
import { displayUrl } from "@/lib/displayUrl";
import { AccountIcon, VerifiedBadge } from "./icons";

export function VerifiedAccounts({ accounts }: { accounts: Account[] }) {
  return (
    <section aria-labelledby="verified-title" className="rounded-2xl bg-card p-6">
      <h2 id="verified-title" className="text-base font-semibold">
        Подтверждённые учётные записи
      </h2>
      <ul className="mt-4 divide-y divide-line">
        {accounts.map((account) => (
          <li key={account.url} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AccountIcon kind={account.kind} className="size-4" />
              {account.label}
              <VerifiedBadge label="Подтверждено" className="size-4 text-verified" />
            </div>
            <a
              href={account.url}
              target="_blank"
              rel="me noopener noreferrer"
              className="mt-1 block break-all pl-6 text-sm text-accent hover:underline"
            >
              {displayUrl(account.url)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
