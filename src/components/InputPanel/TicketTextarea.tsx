import { forwardRef, type KeyboardEvent } from "react";

interface TicketTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const TicketTextarea = forwardRef<HTMLTextAreaElement, TicketTextareaProps>(function TicketTextarea(
  { value, onChange, onSubmit },
  ref
) {
  const length = value.length;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <>
      <textarea
        id="ticketText"
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. I was charged twice this month, please refund me now!"
        maxLength={8000}
        rows={9}
      />
      <div className="field-foot">
        <span className="hint">⌘/Ctrl + Enter to submit</span>
        <span className={length > 7000 ? "char-count-warn" : undefined}>
          {length} / 8000
        </span>
      </div>
    </>
  );
});
