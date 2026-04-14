import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { buildApiUrl } from "../../../lib/api-base-url";
import {
  heroPreviewEndpoints,
  type HeroPreviewEndpoint,
} from "../data/hero-preview-endpoints";

type JsonRecord = Record<string, unknown>;

const commandTypingDelayMs = 26;
const streamLineDelayMs = 58;
const endpointPauseMs = 2400;
const copyFeedbackDurationMs = 1200;
const ellipsisToken = "__OPENNG_ELLIPSIS__";

const fallbackResponse: JsonRecord = {
  success: false,
  error: {
    code: "UPSTREAM_UNAVAILABLE",
    message: "Unable to fetch live preview response. Showing fallback output.",
    docs: "https://docs.openng.dev",
  },
};

const defaultEndpoint: HeroPreviewEndpoint = {
  id: "holidays-list",
  label: "Holidays (list)",
  path: "/v1/holidays?year=2026",
};

const tokenDefaultClass = "text-[#d1d5db]";
const tokenStringClass = "text-[#86efac]";
const tokenBooleanClass = "text-[#f9a8d4]";
const tokenNumberClass = "text-[#fcd34d]";
const tokenPunctuationClass = "text-[#aab2c2]";

function isJsonRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function truncateResponseData(value: unknown): unknown {
  if (!isJsonRecord(value)) {
    return value;
  }

  const clonedValue: JsonRecord = { ...value };
  const payloadData = clonedValue.data;

  if (Array.isArray(payloadData) && payloadData.length > 1) {
    clonedValue.data = [...payloadData.slice(0, 1), ellipsisToken];
  }

  return clonedValue;
}

function toResponseLines(value: unknown): string[] {
  const truncatedValue = truncateResponseData(value);
  const serialized = JSON.stringify(truncatedValue, null, 2) ?? "{}";
  return serialized
    .split("\n")
    .map((line) =>
      line.includes(`"${ellipsisToken}"`)
        ? line.replace(`"${ellipsisToken}"`, "...")
        : line,
    );
}

function highlightOutputLine(line: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const tokenRegex =
    /("(?:\\.|[^"])*")|(\btrue\b|\bfalse\b|null)|(-?\d+(?:\.\d+)?)|([{}[\],:])/g;
  let lastIndex = 0;

  for (const match of line.matchAll(tokenRegex)) {
    const tokenValue = match[0];
    const tokenIndex = match.index ?? 0;
    if (tokenIndex > lastIndex) {
      tokens.push(line.slice(lastIndex, tokenIndex));
    }

    let tokenClassName = tokenDefaultClass;
    if (match[1]) {
      tokenClassName =
        tokenValue.startsWith('"') && tokenValue.endsWith('"')
          ? tokenStringClass
          : tokenDefaultClass;
    } else if (match[2]) {
      tokenClassName = tokenBooleanClass;
    } else if (match[3]) {
      tokenClassName = tokenNumberClass;
    } else if (match[4]) {
      tokenClassName = tokenPunctuationClass;
    }

    tokens.push(
      <span className={tokenClassName} key={`${tokenIndex}-${tokenValue}`}>
        {tokenValue}
      </span>,
    );
    lastIndex = tokenIndex + tokenValue.length;
  }

  if (lastIndex < line.length) {
    tokens.push(line.slice(lastIndex));
  }

  return tokens;
}

export function HeroApiPreview() {
  const [endpointIndex, setEndpointIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [commandCopied, setCommandCopied] = useState(false);
  const [outputCopied, setOutputCopied] = useState(false);

  const activeEndpoint = heroPreviewEndpoints[endpointIndex] ?? defaultEndpoint;
  const { data, isSuccess, isError } = useQuery<unknown, Error>({
    queryKey: ["hero-preview", activeEndpoint.path],
    queryFn: async () => {
      const response = await fetch(buildApiUrl(activeEndpoint.path));
      if (!response.ok) {
        throw new Error(`request failed (${response.status})`);
      }
      return (await response.json()) as unknown;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });
  const commandText = `curl "${buildApiUrl(activeEndpoint.path)}"`;
  const typedCommandText = commandText.slice(0, typedLength);
  const typingDone = typedLength >= commandText.length;
  const responseReady = isSuccess || isError;
  const showSpinner = typingDone && !responseReady;
  const activeResponse = isSuccess ? data : fallbackResponse;
  const outputLines = useMemo(
    () => toResponseLines(activeResponse),
    [activeResponse],
  );
  const renderedLines = outputLines.slice(0, visibleLineCount);

  useEffect(() => {
    setTypedLength(0);
    setVisibleLineCount(0);
  }, [endpointIndex]);

  useEffect(() => {
    if (typingDone) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setTypedLength((currentValue) =>
        Math.min(currentValue + 1, commandText.length),
      );
    }, commandTypingDelayMs);

    return () => window.clearTimeout(timer);
  }, [commandText.length, typingDone, typedLength]);

  useEffect(() => {
    if (!typingDone || !responseReady) {
      return undefined;
    }

    if (visibleLineCount < outputLines.length) {
      const streamTimer = window.setTimeout(() => {
        setVisibleLineCount((currentValue) =>
          Math.min(currentValue + 1, outputLines.length),
        );
      }, streamLineDelayMs);

      return () => window.clearTimeout(streamTimer);
    }

    const loopTimer = window.setTimeout(() => {
      setEndpointIndex((currentValue) =>
        currentValue >= heroPreviewEndpoints.length - 1 ? 0 : currentValue + 1,
      );
    }, endpointPauseMs);

    return () => window.clearTimeout(loopTimer);
  }, [outputLines.length, responseReady, typingDone, visibleLineCount]);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(commandText);
    setCommandCopied(true);
    window.setTimeout(() => setCommandCopied(false), copyFeedbackDurationMs);
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(renderedLines.join("\n"));
    setOutputCopied(true);
    window.setTimeout(() => setOutputCopied(false), copyFeedbackDurationMs);
  };

  return (
    <div className="grid h-full min-h-0 min-w-0 w-full grid-rows-[auto_auto_minmax(0,1fr)] overflow-hidden rounded-[14px] border border-[color-mix(in_oklab,var(--color-border)_75%,#1f1f1f)] bg-[#03050a] font-[var(--font-mono)] text-[#e5e7eb]">
      <div className="grid h-[34px] grid-cols-[auto_1fr_auto] items-center gap-[10px] border-b border-[#1d2430] px-3">
        <div className="inline-flex items-center gap-1.5">
          <span className="h-[9px] w-[9px] rounded-full bg-[#ff5f57]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#febc2e]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#28c840]" />
        </div>
        <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-[#8fa0b8]">
          {activeEndpoint.label}
        </span>
        <div className="inline-flex min-w-4 justify-end">
          {showSpinner ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#2f3a4e] border-t-[#7dd3fc]" />
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-[#1d2430] px-3 py-[10px]">
        <code className="block max-w-full min-w-0 overflow-x-hidden overflow-y-hidden text-ellipsis whitespace-nowrap text-xs text-[#a5f3fc] max-[640px]:text-[11px]">
          {typedCommandText}
        </code>
        {typingDone ? (
          <button
            className="cursor-pointer rounded-lg border border-[#2e3d56] bg-[#081225] px-[10px] py-1 text-[11px] text-[#b5c4d8] hover:border-[#476287] hover:text-[#f4f7fb]"
            type="button"
            onClick={copyCommand}
          >
            {commandCopied ? "Copied ✓" : "Copy"}
          </button>
        ) : null}
      </div>

      <div className="relative mx-3 mb-3 mt-[10px] min-h-0 min-w-0 rounded-[10px] border border-[#1d2430] bg-[#050b16]">
        <pre className="m-0 h-full w-full max-w-full min-h-0 overflow-auto p-3 pb-[38px] text-xs leading-[1.5] [scrollbar-width:thin] max-[900px]:text-[11px]">
          <code className="grid w-max min-w-full max-w-full gap-px">
            {renderedLines.map((line, index) => (
              <span
                className="whitespace-pre"
                key={`${activeEndpoint.id}-${index}`}
              >
                {highlightOutputLine(line)}
              </span>
            ))}
          </code>
        </pre>
        {visibleLineCount > 0 ? (
          <button
            className="absolute bottom-2 right-2 cursor-pointer rounded-lg border border-[#2e3d56] bg-[#081225] px-[10px] py-1 text-[11px] text-[#b5c4d8] hover:border-[#476287] hover:text-[#f4f7fb]"
            type="button"
            onClick={copyOutput}
          >
            {outputCopied ? "Copied ✓" : "Copy"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
