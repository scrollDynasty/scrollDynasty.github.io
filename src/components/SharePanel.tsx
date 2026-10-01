"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import { copyText, nativeShare, type CopyResult } from "@/lib/share";

interface SharePanelProps {
  url: string;
  title: string;
  qrSvg: string;
}

const noopSubscribe = () => () => {};
const canShare = () => typeof navigator.share === "function";

export function SharePanel({ url, title, qrSvg }: SharePanelProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [copyStatus, setCopyStatus] = useState<CopyResult | "idle">("idle");
  // false on the server and during hydration, real value afterwards — no mismatch.
  const shareSupported = useSyncExternalStore(noopSubscribe, canShare, () => false);

  async function handleCopy() {
    const result = await copyText(url, navigator.clipboard?.writeText.bind(navigator.clipboard));
    setCopyStatus(result);
    if (result === "failed") inputRef.current?.select();
    else setTimeout(() => setCopyStatus("idle"), 2000);
  }

  async function handleShare() {
    const result = await nativeShare({ title, url }, navigator.share?.bind(navigator));
    if (result === "failed") await handleCopy();
  }

  return (
    <div className="flex flex-col gap-4">
      <span
        role="img"
        aria-label="QR-код ссылки на профиль"
        className="mx-auto block size-40 rounded-lg bg-white p-2 [&>svg]:size-full"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />

      <div className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Ссылка на профиль
        </label>
        <input
          id={inputId}
          ref={inputRef}
          readOnly
          value={url}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-md border border-line bg-bg px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border border-accent/60 px-3 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent"
        >
          {copyStatus === "copied" ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copyStatus === "copied" ? "Скопировано" : "Копировать"}
        </button>
      </div>

      <p role="status" className="min-h-4 text-xs text-muted">
        {copyStatus === "copied" && "Ссылка скопирована."}
        {copyStatus === "failed" && "Не удалось скопировать — ссылка выделена, скопируйте её вручную."}
      </p>

      {shareSupported && (
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-accent-strong px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-strong/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Share2 className="size-4" aria-hidden />
          Поделиться через…
        </button>
      )}
    </div>
  );
}
