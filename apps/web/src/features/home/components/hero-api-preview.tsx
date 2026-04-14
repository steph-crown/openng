import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { buildApiUrl } from "../../../lib/api-base-url";
import {
  heroPreviewEndpoints,
  type HeroPreviewEndpoint,
} from "../data/hero-preview-endpoints";
import styles from "./hero-api-preview.module.css";

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

    let tokenClassName = styles.tokenDefault;
    if (match[1]) {
      tokenClassName =
        tokenValue.startsWith('"') && tokenValue.endsWith('"')
          ? styles.tokenString
          : styles.tokenDefault;
    } else if (match[2]) {
      tokenClassName = styles.tokenBoolean;
    } else if (match[3]) {
      tokenClassName = styles.tokenNumber;
    } else if (match[4]) {
      tokenClassName = styles.tokenPunctuation;
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
    <div className={styles.window}>
      <div className={styles.windowHeader}>
        <div className={styles.dots}>
          <span />
          <span />
          <span />
        </div>
        <span className={styles.endpointLabel}>{activeEndpoint.label}</span>
        <div className={styles.headerRight}>
          {showSpinner ? <span className={styles.spinner} /> : null}
        </div>
      </div>

      <div className={styles.commandBox}>
        <code className={styles.commandText}>{typedCommandText}</code>
        {typingDone ? (
          <button
            className={styles.copyButton}
            type="button"
            onClick={copyCommand}
          >
            {commandCopied ? "Copied ✓" : "Copy"}
          </button>
        ) : null}
      </div>

      <div className={styles.outputBox}>
        <pre className={styles.outputPre}>
          <code className={styles.outputCode}>
            {renderedLines.map((line, index) => (
              <span
                className={styles.outputLine}
                key={`${activeEndpoint.id}-${index}`}
              >
                {highlightOutputLine(line)}
              </span>
            ))}
          </code>
        </pre>
        {visibleLineCount > 0 ? (
          <button
            className={styles.copyOutputButton}
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
