"use client";
import { useState } from "react";
import { PARAM_GROUPS, DEFAULT_VALUES } from "@/lib/params";
import Slider from "@/components/Slider";
import type { SimValues, Lead } from "@/types";

interface Props {
  user: Pick<Lead, "name" | "company">;
  onRun: (values: SimValues) => void;
  initialValues?: SimValues;
  onBack?: () => void;
}

export default function SimulatorPanel({ user, onRun, initialValues, onBack }: Props) {
  const [vals, setVals] = useState<SimValues>(initialValues ?? DEFAULT_VALUES);
  const [activeGroup, setActiveGroup] = useState("sourcing");
  const [running, setRunning] = useState(false);

  function updateVal(id: string, v: number) {
    setVals((prev) => ({ ...prev, [id]: v }));
  }

  function handleRun() {
    setRunning(true);
    setTimeout(() => { onRun(vals); setRunning(false); }, 50);
  }

  const currentGroup = PARAM_GROUPS.find((g) => g.id === activeGroup)!;
  const paramCount = PARAM_GROUPS.flatMap((g) => g.params).length;
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem", background: "#f4f2fb" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src="/logo.jpg" alt="OpenNetrikkan" style={{ height: 28, width: "auto", objectFit: "contain" }} />
            <div>
              <h1 style={{ fontFamily: "var(--font-dm-serif),'DM Serif Display',serif", fontSize: "1.65rem", color: "#0f0e17", lineHeight: 1.2, marginBottom: 4 }}>
                Crude availability simulator
              </h1>
              <p style={{ fontSize: 13, color: "#7a748e" }}>
                {paramCount} parameters · 2,000 Monte Carlo trials per run
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {onBack && (
              <button className="btn-secondary" style={{ fontSize:12, padding:"6px 12px" }} onClick={onBack}>
                ← Dashboard
              </button>
            )}
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#ede9ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: "#5b4fcf" }}>
              {initial}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#3a3650", margin: 0 }}>{user.name}</p>
              <p style={{ fontSize: 11, color: "#7a748e", margin: 0 }}>{user.company}</p>
            </div>
          </div>
        </div>

        {/* Group tabs */}
        <div className="card-sm" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PARAM_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGroup(g.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 9999,
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                  fontFamily: "var(--font-dm-sans),'DM Sans',sans-serif",
                  border: `1px solid ${activeGroup === g.id ? g.color + "60" : "rgba(91,79,207,0.2)"}`,
                  background: activeGroup === g.id ? g.color + "15" : "#ffffff",
                  color: activeGroup === g.id ? g.color : "#7a748e",
                  transition: "all 150ms ease",
                }}
              >
                <span style={{ fontSize: 10 }}>{g.icon}</span>
                {g.label}
                <span style={{ opacity: 0.6, marginLeft: 2 }}>{g.params.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active param group */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(91,79,207,0.1)" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: currentGroup.color }} />
            <span style={{ fontWeight: 500, color: "#0f0e17" }}>{currentGroup.label}</span>
            <span style={{ fontSize: 12, color: "#7a748e" }}>{currentGroup.params.length} parameters</span>
          </div>
          {currentGroup.params.map((p) => (
            <Slider key={p.id} param={p} value={vals[p.id]} onChange={updateVal} />
          ))}
        </div>

        {/* Run bar */}
        <div className="card-sm" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "#7a748e", margin: 0 }}>
            {paramCount} parameters configured across {PARAM_GROUPS.length} supply chain stages
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-secondary" onClick={() => setVals(DEFAULT_VALUES)}>
              Reset defaults
            </button>
            <button className="btn-primary" style={{ minWidth: 160 }} onClick={handleRun} disabled={running}>
              {running ? "Simulating…" : "Run simulation →"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
