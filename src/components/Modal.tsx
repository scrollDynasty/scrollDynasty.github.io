"use client";

import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";

interface ModalProps {
  triggerLabel: string;
  title: string;
  children: ReactNode;
}

/** Button + native modal <dialog>: Esc, backdrop click and the close button dismiss it; the browser restores focus. */
export function Modal({ triggerLabel, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="h-[42px] rounded-md border border-accent/60 px-4 font-semibold text-accent transition hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          // Clicks on the <dialog> box itself (outside the content wrapper) land on the backdrop.
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-md bg-card p-0 text-fg shadow-2xl"
      >
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            <form method="dialog">
              <button
                aria-label="Close"
                className="rounded p-1 text-muted transition hover:text-fg focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X className="size-5" aria-hidden />
              </button>
            </form>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
