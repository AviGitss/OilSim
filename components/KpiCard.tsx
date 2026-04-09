interface Props {
  label: string;
  value: string;
  unit: string;
  sub?: string;
  sentiment?: "good" | "warn" | "bad" | "neutral";
}

const sentimentColor: Record<string, string> = {
  good:    "#15803d",
  warn:    "#b45309",
  bad:     "#c0392b",
  neutral: "#0f0e17",
};

export default function KpiCard({ label, value, unit, sub, sentiment = "neutral" }: Props) {
  return (
    <div className="kpi-card">
      <p style={{
        fontSize: 11,
        fontWeight: 500,
        color: "#7a748e",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 8,
      }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{
          fontSize: 28,
          fontWeight: 400,
          lineHeight: 1,
          fontFamily: "var(--font-dm-serif), 'DM Serif Display', serif",
          color: sentimentColor[sentiment],
        }}>
          {value}
        </span>
        <span style={{ fontSize: 12, color: "#7a748e" }}>{unit}</span>
      </div>
      {sub && (
        <p style={{ fontSize: 11, color: "#7a748e", marginTop: 6, lineHeight: 1.5 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

