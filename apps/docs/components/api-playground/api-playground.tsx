"use client";

import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from "fumadocs-ui/components/codeblock";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Loader2, Play } from "lucide-react";
import { Suspense, useCallback, useMemo, useState } from "react";

import { buildOpenngApiUrl } from "@/lib/build-openng-api-url";
import {
  loadPlaygroundKey,
  touchPlaygroundActivity,
} from "@/lib/docs-playground-storage";
import {
  PLAYGROUND_SNIPPET_TABS,
  buildPlaygroundSnippets,
} from "@/lib/playground-snippets";

import { RateLimitDialog } from "./rate-limit-dialog";

const PLAYGROUND_API_BASE = "http://localhost:3000";

function prettyFormatBody(raw: string): string {
  const t = raw.trim();
  if (!t) return raw;
  try {
    const parsed: unknown = JSON.parse(t);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}

export type ApiPlaygroundProps = {
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
};

export function ApiPlayground({ path, query }: ApiPlaygroundProps) {
  const [running, setRunning] = useState(false);
  const [body, setBody] = useState<string | null>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [rateOpen, setRateOpen] = useState(false);
  const [retryAfterSec, setRetryAfterSec] = useState<number | null>(null);

  const url = useMemo(
    () => buildOpenngApiUrl(PLAYGROUND_API_BASE, path, query),
    [path, query],
  );

  const snippets = useMemo(() => buildPlaygroundSnippets(url), [url]);

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

  const displayBody = useMemo(
    () => (body === null ? "" : prettyFormatBody(body)),
    [body],
  );

  const runControl = (
    <button
      type="button"
      disabled={running}
      onClick={() => void run()}
      className="inline-flex shrink-0 items-center gap-1.5 py-1.5 text-sm font-medium text-fd-primary hover:opacity-80 disabled:opacity-50"
    >
      {running ? (
        <Loader2 className="size-3.5 shrink-0 animate-spin text-fd-primary" />
      ) : (
        <Play className="size-3.5 shrink-0 text-fd-primary" />
      )}
      Run
    </button>
  );

  return (
    <div className="not-prose my-4">
      <RateLimitDialog
        open={rateOpen}
        retryAfterSec={retryAfterSec}
        onOpenChange={setRateOpen}
      />
      <CodeBlockTabs defaultValue="curl" className="!my-0">
        <div className="flex w-full min-w-0 flex-row items-stretch border-b border-fd-border">
          <CodeBlockTabsList className="min-w-0 flex-1 border-0 bg-transparent">
            {PLAYGROUND_SNIPPET_TABS.map((t) => (
              <CodeBlockTabsTrigger key={t.value} value={t.value}>
                {t.label}
              </CodeBlockTabsTrigger>
            ))}
          </CodeBlockTabsList>
          <div className="flex shrink-0 items-center px-2">{runControl}</div>
        </div>
        {PLAYGROUND_SNIPPET_TABS.map((t) => (
          <CodeBlockTab key={t.value} value={t.value}>
            <Suspense
              fallback={
                <div className="bg-fd-secondary px-4 py-3 text-sm text-fd-muted-foreground">
                  Loading…
                </div>
              }
            >
              <DynamicCodeBlock
                lang={t.shikiLang}
                code={snippets[t.value]}
              />
            </Suspense>
          </CodeBlockTab>
        ))}
      </CodeBlockTabs>
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
          <pre className="max-h-96 overflow-auto whitespace-pre break-words rounded-md border border-fd-border bg-fd-background p-3 font-mono text-[0.8125rem] text-fd-foreground [tab-size:2]">
            {displayBody}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
