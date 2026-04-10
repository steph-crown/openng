"use client";

import { Loader2, Play } from "lucide-react";
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

import { buildOpenngApiUrl } from "@/lib/build-openng-api-url";
import {
  loadPlaygroundKey,
  touchPlaygroundActivity,
} from "@/lib/docs-playground-storage";

import { RateLimitDialog } from "./rate-limit-dialog";

const PLAYGROUND_API_BASE = "http://localhost:3000";

function mergeTabShellClass(existing: string | undefined): string {
  return [existing, "!my-0 rounded-b-none border-b-0 shadow-none"].filter(Boolean).join(" ");
}

export type ApiPlaygroundProps = {
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  children: ReactNode;
};

export function ApiPlayground({ path, query, children }: ApiPlaygroundProps) {
  const [running, setRunning] = useState(false);
  const [body, setBody] = useState<string | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [rateOpen, setRateOpen] = useState(false);
  const [retryAfterSec, setRetryAfterSec] = useState<number | null>(null);

  const url = useMemo(
    () => buildOpenngApiUrl(PLAYGROUND_API_BASE, path, query),
    [path, query],
  );

  const patchedTabs = useMemo(() => {
    return Children.map(children, (child) => {
      if (!isValidElement<{ className?: string }>(child)) return child;
      return cloneElement(child as ReactElement<{ className?: string }>, {
        className: mergeTabShellClass(child.props.className),
      });
    });
  }, [children]);

  const run = useCallback(async () => {
    setRunning(true);
    try {
      const key = loadPlaygroundKey();
      if (key) touchPlaygroundActivity();
      const headers: Record<string, string> = { Accept: "application/json" };
      if (key) headers.Authorization = `Bearer ${key}`;
      const res = await fetch(url, { method: "GET", headers });
      const text = await res.text();
      setHttpStatus(res.status);
      setBody(text);
      if (res.status === 429) {
        const ra = res.headers.get("retry-after");
        const n = ra ? Number.parseInt(ra, 10) : NaN;
        setRetryAfterSec(Number.isFinite(n) ? n : null);
        setRateOpen(true);
      }
    } catch (e) {
      setHttpStatus(0);
      setBody(e instanceof Error ? e.message : "Request failed in this browser.");
    } finally {
      setRunning(false);
    }
  }, [url]);

  const hideResponse = useCallback(() => {
    setBody(null);
    setHttpStatus(null);
  }, []);

  return (
    <div className="not-prose my-4">
      <RateLimitDialog
        open={rateOpen}
        retryAfterSec={retryAfterSec}
        onOpenChange={setRateOpen}
      />
      {patchedTabs}
      <div className="-mt-px flex justify-end rounded-b-xl border border-t-0 border-fd-border bg-fd-card px-2 py-2">
        <button
          type="button"
          disabled={running}
          onClick={() => void run()}
          className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-primary px-3 py-1.5 text-sm font-medium text-fd-primary-foreground disabled:opacity-50"
        >
          {running ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          Run
        </button>
      </div>
      {body !== null ? (
        <div className="mt-3 rounded-xl border border-fd-border bg-fd-card p-3 text-fd-card-foreground shadow-sm">
          <div className="mb-2 flex flex-row items-center justify-between gap-2">
            <span className="text-xs font-medium text-fd-muted-foreground">
              Response
              {httpStatus !== null ? (
                <span className="ms-2 rounded bg-fd-accent/30 px-1.5 py-0.5 font-mono text-fd-foreground">
                  HTTP {httpStatus}
                </span>
              ) : null}
            </span>
            <button
              type="button"
              onClick={hideResponse}
              className="rounded-md px-2 py-1 text-xs font-medium text-fd-muted-foreground hover:bg-fd-accent/40 hover:text-fd-foreground"
            >
              Hide
            </button>
          </div>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-md border border-fd-border bg-fd-background p-3 font-mono text-[0.8125rem] text-fd-foreground">
            {body}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
