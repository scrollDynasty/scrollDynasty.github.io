"use client";

import { QrCode, UserRound } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { Profile } from "@/content/profile";

interface AvatarQrToggleProps {
  avatar: Profile["avatar"];
  alt: string;
  qrSvg: string;
}

export function AvatarQrToggle({ avatar, alt, qrSvg }: AvatarQrToggleProps) {
  const [showQr, setShowQr] = useState(false);

  return (
    <div className="relative size-28">
      <div className="size-full overflow-hidden rounded-full bg-white ring-4 ring-card">
        {showQr ? (
          <span
            role="img"
            aria-label="QR-код профиля"
            // 18px padding keeps the square QR inside the circle (112px / √2 ≈ 79px) so finder corners aren't clipped.
            className="block size-full p-4.5 [&>svg]:size-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        ) : (
          <Image
            src={avatar.src}
            alt={alt}
            width={224}
            height={224}
            sizes="112px"
            loading="eager"
            fetchPriority="high"
            className="size-full object-cover"
          />
        )}
      </div>
      <button
        type="button"
        aria-label={showQr ? "Показать фото" : "Показать QR-код"}
        onClick={() => setShowQr((v) => !v)}
        className="absolute -right-1 top-1 grid size-9 place-items-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur transition hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {showQr ? <UserRound className="size-4" aria-hidden /> : <QrCode className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
