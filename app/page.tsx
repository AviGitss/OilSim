"use client";
import { useState } from "react";
import SimulatorPanel from "@/components/SimulatorPanel";
import ResultsPanel from "@/components/ResultsPanel";
import { runSimulation } from "@/lib/simulation";
import type { SimValues, SimResults } from "@/types";

type Screen = "register" | "sim" | "results";

interface User {
  name: string;
  company: string;
}

export default function Home() {
  const [screen, setScreen]   = useState<Screen>("register");
  const [user, setUser]       = useState<User | null>(null);
  const [simVals, setSimVals] = useState<SimValues | null>(null);
  const [results, setResults] = useState<SimResults | null>(null);
  const [form, setForm]       = useState({ name: "", company: "", email: "", title: "", phone: "" });
  const [err, setErr]         = useState("");
  const [busy, setBusy]       = useState(false);

  function upd(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));
  }

  async function handleRegister() {
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) {
      setErr("Name, email and company are required."); return;
    }
    setErr(""); setBusy(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch { /* non-blocking */ }
    setBusy(false);
    setUser({ name: form.name.trim(), company: form.company.trim() });
    setScreen("sim");
  }

  function handleRun(vals: SimValues) {
    const r = runSimulation(vals);
    setSimVals(vals);
    setResults(r);
    setScreen("results");
  }

  const S = {
    page:    { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"3rem 1rem", background:"#f4f2fb" } as React.CSSProperties,
    wrap:    { width:"100%", maxWidth:480 } as React.CSSProperties,
    eyebrow: { display:"inline-block", fontSize:11, fontWeight:500, padding:"4px 14px", borderRadius:9999, background:"#ede9ff", color:"#5b4fcf", letterSpacing:"0.05em", marginBottom:16 } as React.CSSProperties,
    h1:      { fontFamily:"var(--font-dm-serif),'DM Serif Display',serif", fontSize:"1.9rem", fontWeight:400, color:"#0f0e17", marginBottom:8, lineHeight:1.2 } as React.CSSProperties,
    sub:     { fontSize:14, color:"#7a748e", lineHeight:1.65, marginBottom:0 } as React.CSSProperties,
    row2:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 } as React.CSSProperties,
    mb:      { marginBottom:12 } as React.CSSProperties,
    mb20:    { marginBottom:20 } as React.CSSProperties,
    err:     { marginBottom:14, padding:"10px 14px", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, fontSize:13, color:"#b91c1c" } as React.CSSProperties,
    note:    { fontSize:11, color:"#7a748e", textAlign:"center" as const, marginTop:14, lineHeight:1.6 } as React.CSSProperties,
    footer:  { textAlign:"center" as const, fontSize:12, color:"#7a748e", marginTop:24 } as React.CSSProperties,
    link:    { color:"#5b4fcf", textDecoration:"none" } as React.CSSProperties,
  };

  // ── Registration gate ─────────────────────────────────────
  if (screen === "register") {
    return (
      <div style={S.page}>
        <div style={S.wrap}>
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
              <img src="/logo.jpg" alt="OpenNetrikkan" style={{ height:44, width:"auto", objectFit:"contain" }} />
            </div>
            <span style={S.eyebrow}>Crude Availability Simulator</span>
            <h1 style={S.h1}>OilSim</h1>
            <p style={S.sub}>
              Model the probability of crude reaching your CDU gate across
              2,000 stochastic Monte Carlo trials.
            </p>
          </div>

          <div className="card">
            <div style={S.row2}>
              <input className="input-field" placeholder="Full name *"  value={form.name}    onChange={upd("name")} />
              <input className="input-field" type="email" placeholder="Work email *"  value={form.email}   onChange={upd("email")} />
            </div>
            <div style={S.mb}>
              <input className="input-field" placeholder="Company *" value={form.company} onChange={upd("company")} />
            </div>
            <div style={{ ...S.row2, ...S.mb20 }}>
              <input className="input-field" placeholder="Job title"       value={form.title}   onChange={upd("title")} />
              <input className="input-field" type="tel" placeholder="Phone (optional)" value={form.phone}   onChange={upd("phone")} />
            </div>

            {err && <div style={S.err}>{err}</div>}

            <button
              className="btn-primary"
              style={{ width:"100%", padding:"12px", fontSize:15 }}
              onClick={handleRegister}
              disabled={busy}
            >
              {busy ? "Please wait…" : "Launch simulator →"}
            </button>

            <p style={S.note}>
              No charges, no spam — your details are used only to send you
              simulation reports.
            </p>
          </div>

          <p style={S.footer}>
            OpenNetrikkan Technologies ·{" "}
            <a href="mailto:info@opennetrikkan.com" style={S.link}>
              info@opennetrikkan.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  // ── Simulator ─────────────────────────────────────────────
  if (screen === "sim" && user) {
    return (
      <SimulatorPanel
        user={user}
        onRun={handleRun}
        initialValues={simVals ?? undefined}
      />
    );
  }

  // ── Results ───────────────────────────────────────────────
  if (screen === "results" && results && simVals && user) {
    return (
      <ResultsPanel
        results={results}
        params={simVals}
        user={{ name: user.name, id: "guest" }}
        leadId=""
        onBack={() => setScreen("sim")}
        onReRun={() => { if (simVals) setResults(runSimulation(simVals)); }}
      />
    );
  }

  return null;
}
