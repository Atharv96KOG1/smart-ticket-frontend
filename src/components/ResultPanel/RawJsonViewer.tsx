import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "../../utils/clipboard";
import type { RouteResponse } from "../../types/ticket";

interface RawJsonViewerProps {
  data: RouteResponse;
}

export function RawJsonViewer({ data }: RawJsonViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);
  const json = JSON.stringify(data, null, 2);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = async () => {
    const ok = await copyToClipboard(json);
    setCopyLabel(ok ? "Copied ✓" : "Copy failed");
    setCopied(ok);
    if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setCopyLabel("Copy");
      setCopied(false);
    }, 1500);
  };

  return (
    <div className="raw-json">
      <button
        className="raw-json-toggle"
        type="button"
        aria-expanded={expanded}
        aria-controls="rawJsonBody"
        onClick={() => setExpanded((v) => !v)}
      >
        <span>Raw JSON response</span>
        <svg className="chevron" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="raw-json-body" id="rawJsonBody" hidden={!expanded}>
        <div className="raw-json-actions">
          <button
            className={`btn btn-ghost btn-small${copied ? " btn-copied" : ""}`}
            type="button"
            onClick={handleCopy}
          >
            {copyLabel}
          </button>
        </div>
        <pre>{json}</pre>
      </div>
    </div>
  );
}
