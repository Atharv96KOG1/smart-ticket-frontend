import { useRef, useState } from "react";
import type { useTicketRouter } from "../../hooks/useTicketRouter";
import { ErrorBanner } from "./ErrorBanner";
import { SampleSelect } from "./SampleSelect";
import { TicketTextarea } from "./TicketTextarea";

interface InputPanelProps {
  ticket: ReturnType<typeof useTicketRouter>;
  samples: string[];
}

export function InputPanel({ ticket, samples }: InputPanelProps) {
  const [sampleValue, setSampleValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSampleChange = (val: string) => {
    setSampleValue(val);
    if (val) {
      ticket.setValue(val);
      ticket.clearError();
    }
  };

  const handleClear = () => {
    ticket.clear();
    setSampleValue("");
    textareaRef.current?.focus();
  };

  const isLoading = ticket.status === "loading";

  return (
    <section className="panel input-panel">
      <div className="panel-head">
        <h1>Route a ticket</h1>
        <p>Paste a raw support message and get an instant, validated routing decision.</p>
      </div>

      <label className="field-label" htmlFor="ticketText">
        Ticket message
      </label>
      <TicketTextarea ref={textareaRef} value={ticket.value} onChange={ticket.setValue} onSubmit={ticket.submit} />

      <div className="actions">
        <button className="btn btn-primary" type="button" disabled={isLoading} onClick={ticket.submit}>
          <span className="btn-label">{isLoading ? "Routing…" : "Route ticket"}</span>
          <span className="spinner" hidden={!isLoading} />
        </button>
        <button className="btn btn-ghost" type="button" onClick={handleClear}>
          Clear
        </button>
        <SampleSelect samples={samples} value={sampleValue} onChange={handleSampleChange} />
      </div>

      <ErrorBanner message={ticket.error} nonce={ticket.errorNonce} />
    </section>
  );
}
