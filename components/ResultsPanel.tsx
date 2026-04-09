"use client";
import { useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import KpiCard from "@/components/KpiCard";
import type { SimResults, SimValues, Lead } from "@/types";

interface Props {
  results: SimResults;
  params: SimValues;
  user: Pick<Lead, "name" | "id">;
  leadId: string;
  onBack: () => void;
  onReRun: () => void;
  onDashboard?: () => void;
}

function availColor(v: number) {
  return v >= 75 ? "#4ade80" : v >= 60 ? "#fbbf24" : "#f87171";
}
function grmColor(v: number) {
  return v >= 0 ? "#4ade80" : v >= -2 ? "#fcd34d" : v >= -6 ? "#fb923c" : "#f87171";
}
function sentimentOf(mean: number, goodAbove: number, warnAbove: number): "good" | "warn" | "bad" {
  return mean >= goodAbove ? "good" : mean >= warnAbove ? "warn" : "bad";
}

const RISK_DRIVERS = [
  { key: "Reserve block release", color: "#5b4fcf", text: "Below 80% release probability introduces material availability loss in ~1 in 5 scenarios — the single highest-leverage upstream parameter." },
  { key: "Geopolitical & sanctions risk", color: "#c0392b", text: "Combined geopolitical and sanctions exposure drives tail risk — the extreme downside scenarios in the left tail of the availability chart." },
  { key: "Terminal downtime", color: "#b45309", text: "SPM/jetty downtime events cause disproportionate impact when tank buffer days fall below 15 — a compounding vulnerability." },
  { key: "Vessel delay stack", color: "#0f6e56", text: "Vessel delay, freight volatility and STS risk compound — each layer adds to the total delay stack before the CDU sees the crude." },
  { key: "Grade flexibility", color: "#185fa5", text: "Grade flexibility index above 70 materially reduces GRM impact during supply disruptions by enabling cost-effective substitution." },
  { key: "Tank farm buffer", color: "#3a3650", text: "Every additional 5 days of crude cover reduces stock-out probability by approximately 30–40% — the most direct resilience lever." },
];

export default function ResultsPanel({ results, params, user, leadId, onBack, onReRun, onDashboard }: Props) {
  const { avail, grm, delay, stockout, trials, ranAt } = results;

  useEffect(() => {
    if (!leadId) return;
    fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: leadId, params, results }),
    }).catch(() => {});
  }, [results]);

  const availData = avail.hist.labels.map((label, i) => ({ label, count: avail.hist.counts[i] }));
  const grmData   = grm.hist.labels.map((label, i) => ({ label, count: grm.hist.counts[i] }));

  const riskLabel = stockout.mean > 20 ? "High" : stockout.mean > 8 ? "Elevated" : "Managed";
  const grmDown = grm.mean < 0;

  const badge = (bg: string, color: string, text: string) => (
    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 9999, background: bg, color, fontWeight: 500 }}>
      {text}
    </span>
  );

  return (
    <div style={{ minHeight: "100vh", padding: "2rem 1rem", background: "#f4f2fb" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-dm-serif),'DM Serif Display',serif", fontSize: "1.65rem", color: "#0f0e17", lineHeight: 1.2, marginBottom: 4 }}>
              Simulation results
            </h1>
            <p style={{ fontSize: 13, color: "#7a748e" }}>
              {trials.toLocaleString()} trials · {new Date(ranAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {onDashboard && (
              <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }} onClick={onDashboard}>
                ← Dashboard
              </button>
            )}
            <button className="btn-secondary" onClick={onBack}>Adjust parameters</button>
            <button className="btn-primary" onClick={onReRun}>Re-run</button>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
          <KpiCard label="Crude availability at CDU" value={avail.mean.toFixed(1)} unit="%" sub={`P10: ${avail.p10.toFixed(1)}%  ·  P90: ${avail.p90.toFixed(1)}%`} sentiment={sentimentOf(avail.mean, 75, 60)} />
          <KpiCard label="GRM impact vs plan" value={(grm.mean >= 0 ? "+" : "") + grm.mean.toFixed(2)} unit="$/bbl" sub={`P10: ${grm.p10.toFixed(2)}  ·  P90: ${grm.p90.toFixed(2)}`} sentiment={sentimentOf(grm.mean, 0, -2)} />
          <KpiCard label="Expected voyage delay" value={delay.mean.toFixed(1)} unit="days" sub={`P90 worst case: ${delay.p90.toFixed(1)} days`} sentiment={sentimentOf(-delay.mean, -4, -8)} />
          <KpiCard label="Stock-out risk" value={stockout.mean.toFixed(1)} unit="%" sub={`Risk level: ${riskLabel}`} sentiment={stockout.mean > 20 ? "bad" : stockout.mean > 8 ? "warn" : "good"} />
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 16, marginBottom: 20 }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: "#0f0e17", margin: 0 }}>Availability distribution</h3>
              <div style={{ display: "flex", gap: 8 }}>
                {badge("#dcfce7", "#15803d", "≥75% on target")}
                {badge("#fef3c7", "#b45309", "60–75% marginal")}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={availData} barCategoryGap="10%">
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#7a748e" }} tickLine={false} axisLine={false} interval="preserveStartEnd" label={{ value: "Availability at CDU gate (%)", position: "insideBottom", offset: -4, fontSize: 10, fill: "#7a748e" }} />
                <YAxis tick={{ fontSize: 10, fill: "#7a748e" }} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #ede9ff", borderRadius: 8 }} formatter={(v: number) => [`${v} trials`, "Count"]} labelFormatter={(l) => `${l}% availability`} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {availData.map((d, i) => <Cell key={i} fill={availColor(d.label)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: "#0f0e17", margin: 0 }}>GRM impact distribution</h3>
              {badge(grmDown ? "#fee2e2" : "#dcfce7", grmDown ? "#c0392b" : "#15803d", grmDown ? "Downside" : "Upside")}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={grmData} barCategoryGap="10%">
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#7a748e" }} tickLine={false} axisLine={false} interval="preserveStartEnd" label={{ value: "GRM impact vs plan ($/bbl)", position: "insideBottom", offset: -4, fontSize: 10, fill: "#7a748e" }} />
                <YAxis tick={{ fontSize: 10, fill: "#7a748e" }} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #ede9ff", borderRadius: 8 }} formatter={(v: number) => [`${v} trials`, "Count"]} labelFormatter={(l) => `${parseFloat(String(l)) >= 0 ? "+" : ""}${l} $/bbl`} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {grmData.map((d, i) => <Cell key={i} fill={grmColor(d.label)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk drivers */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 500, color: "#0f0e17", marginBottom: 16, marginTop: 0 }}>Key risk drivers</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {RISK_DRIVERS.map((d) => (
              <div key={d.key} style={{ padding: "12px 14px", borderRadius: 12, background: "#f9f8ff", border: "1px solid #ede9ff" }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: d.color, marginBottom: 6, marginTop: 0 }}>{d.key}</p>
                <p style={{ fontSize: 12, color: "#7a748e", lineHeight: 1.55, margin: 0 }}>{d.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#7a748e", marginTop: 24 }}>
          OpenNEtrikkan Technologies · Powered by Monte Carlo simulation ·{" "}
          <a href="mailto:contact@opennetrikkan.com" style={{ color: "#5b4fcf", textDecoration: "none" }}>
            contact@opennetrikkan.com
          </a>
        </p>

      </div>
    </div>
  );
}
