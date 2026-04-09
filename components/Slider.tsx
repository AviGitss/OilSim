"use client";
import type { SimParam } from "@/types";

interface Props {
  param: SimParam;
  value: number;
  onChange: (id: string, value: number) => void;
}

export default function Slider({ param, value, onChange }: Props) {
  const display = param.step < 1 ? value.toFixed(1) : value.toFixed(0);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "#3a3650", flex: 1, paddingRight: 12, lineHeight: 1.4 }}>
          {param.label}
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#5b4fcf", minWidth: 38, textAlign: "right" }}>
            {display}
          </span>
          <span style={{ fontSize: 11, color: "#7a748e" }}>{param.unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        onChange={(e) => onChange(param.id, parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#5b4fcf" }}
      />
      <p style={{ fontSize: 11, color: "#7a748e", marginTop: 4, lineHeight: 1.5 }}>
        {param.desc}
      </p>
    </div>
  );
}
