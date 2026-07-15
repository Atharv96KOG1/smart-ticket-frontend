interface SampleSelectProps {
  samples: string[];
  value: string;
  onChange: (value: string) => void;
}

export function SampleSelect({ samples, value, onChange }: SampleSelectProps) {
  return (
    <div className="sample-wrap">
      <select id="sampleSelect" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Try a sample…</option>
        {samples.map((text) => (
          <option key={text} value={text}>
            {text.length > 60 ? text.slice(0, 57) + "…" : text}
          </option>
        ))}
      </select>
    </div>
  );
}
