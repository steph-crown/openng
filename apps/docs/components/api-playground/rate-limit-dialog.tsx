"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "fumadocs-core/link";
import { X } from "lucide-react";
import { useState } from "react";

import { savePlaygroundKey } from "@/lib/docs-playground-storage";

type RateLimitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  retryAfterSec: number | null;
};

export function RateLimitDialog({
  open,
  onOpenChange,
  retryAfterSec,
}: RateLimitDialogProps) {
  const [keyDraft, setKeyDraft] = useState("");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-[min(calc(100vw-2rem),28rem)] max-h-[min(90vh,calc(100dvh-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-fd-border bg-fd-card p-6 text-fd-card-foreground shadow-lg outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex flex-row items-start justify-between gap-3">
            <Dialog.Title className="text-lg font-semibold text-fd-foreground">
              Rate limited
            </Dialog.Title>
            <Dialog.Close
              type="button"
              className="rounded-md p-1 text-fd-muted-foreground hover:bg-fd-accent/50 hover:text-fd-foreground"
              aria-label="Close"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-3 text-sm text-fd-muted-foreground">
            Anonymous requests from this browser share a per-IP quota. Wait and
            try again
            {retryAfterSec !== null && retryAfterSec > 0 ? (
              <>
                {" "}
                (about <strong>{retryAfterSec}s</strong> per{" "}
                <code className="rounded bg-fd-accent/30 px-1">Retry-After</code>
                ), or use an API key for higher limits.
              </>
            ) : (
              <> before trying again, or use an API key for higher limits.</>
            )}
          </Dialog.Description>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-fd-muted-foreground">
            <li>
              <a
                className="text-fd-foreground underline decoration-fd-primary underline-offset-2"
                href="https://openng.dev/dashboard"
                rel="noreferrer"
                target="_blank"
              >
                Dashboard — create a key
              </a>
            </li>
            <li>
              <Link
                className="text-fd-foreground underline decoration-fd-primary underline-offset-2"
                href="/getting-started#create-an-api-key"
              >
                Docs — create an API key
              </Link>
            </li>
          </ul>
          <details className="mt-4 rounded-lg border border-fd-border bg-fd-background/50 p-3">
            <summary className="cursor-pointer text-sm font-medium text-fd-foreground">
              Save API key in this browser
            </summary>
            <p className="mt-2 text-xs text-fd-muted-foreground">
              Stored only on this device; cleared after <strong>24 hours</strong>{" "}
              idle. Sent as <code className="rounded bg-fd-accent/30 px-1">Authorization</code>{" "}
              when you use <strong>Run</strong> here.
            </p>
            <div className="mt-2 flex flex-wrap items-end gap-2">
              <input
                type="password"
                autoComplete="off"
                value={keyDraft}
                onChange={(ev) => setKeyDraft(ev.target.value)}
                className="min-w-[12rem] flex-1 rounded-md border border-fd-border bg-fd-background px-2 py-1.5 font-mono text-sm text-fd-foreground"
                placeholder="ong_live_…"
              />
              <button
                type="button"
                className="rounded-lg border border-fd-border bg-fd-card px-3 py-1.5 text-sm font-medium hover:bg-fd-accent/40"
                onClick={() => {
                  savePlaygroundKey(keyDraft);
                  setKeyDraft("");
                  onOpenChange(false);
                }}
              >
                Save
              </button>
            </div>
          </details>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
