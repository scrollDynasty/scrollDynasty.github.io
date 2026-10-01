import { Download, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";
import type { Profile } from "@/content/profile";
import { displayUrl } from "@/lib/displayUrl";
import { AccountIcon } from "./icons";

interface ContactItem {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
}

export function ContactsList({ contacts }: { contacts: Profile["contacts"] }) {
  const items: ContactItem[] = [
    {
      icon: <AccountIcon kind="telegram" className="size-4" />,
      label: "Telegram",
      value: displayUrl(contacts.telegram),
      href: contacts.telegram,
      external: true,
    },
    {
      icon: <Mail className="size-4" aria-hidden />,
      label: "Электронная почта",
      value: contacts.email,
      href: `mailto:${contacts.email}`,
    },
    {
      icon: <Phone className="size-4" aria-hidden />,
      label: "Телефон",
      value: contacts.phone,
      href: `tel:${contacts.phone}`,
    },
  ];

  return (
    <div>
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.label} className="flex gap-3">
            <span className="mt-0.5 text-muted">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{item.label}</p>
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "me noopener noreferrer" } : {})}
                className="break-all text-sm text-accent hover:underline"
              >
                {item.value}
              </a>
            </div>
          </li>
        ))}
      </ul>
      <a
        href="/contact.vcf"
        download
        className="mt-6 flex items-center justify-center gap-2 rounded-md border border-accent/60 px-4 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Download className="size-4" aria-hidden />
        Добавить в контакты (vCard)
      </a>
    </div>
  );
}
