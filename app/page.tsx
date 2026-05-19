"use client";
import { useState } from "react";
import SimulatorPanel from "@/components/SimulatorPanel";
import ResultsPanel from "@/components/ResultsPanel";
import { runSimulation } from "@/lib/simulation";
import type { SimValues, SimResults } from "@/types";

type Screen = "register" | "sim" | "results";
interface User { name: string; company: string; }

export default function Home() {
  const [screen, setScreen]   = useState<Screen>("register");
  const [user, setUser]       = useState<User | null>(null);
  const [simVals, setSimVals] = useState<SimValues | null>(null);
  const [results, setResults] = useState<SimResults | null>(null);
  const [form, setForm]       = useState({ name:"", company:"", email:"", title:"", phone:"" });
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
    setSimVals(vals); setResults(r); setScreen("results");
  }

  const C = {
    acc: "#5b4fcf", pale: "#ede9ff", pale2: "#f7f5ff",
    ink: "#0f0e17", ink2: "#3a3650", ink3: "#7a748e",
    red: "#b91c1c", redbg: "#fef2f2", redbd: "#fecaca",
    grn: "#15803d", grnbg: "#f0fdf4", grnbd: "#bbf7d0",
    amb: "#b45309", ambbg: "#fffbeb", ambbd: "#fde68a",
  };

  // ── Registration gate ─────────────────────────────────────
  if (screen === "register") {
    return (
      <div style={{ minHeight:"100vh", background:"#f4f2fb", padding:"3rem 1rem" }}>
        <div style={{ width:"100%", maxWidth:580, margin:"0 auto" }}>

          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
              <img src="/logo.jpg" alt="OpenNetrikkan" style={{ height:44, width:"auto", objectFit:"contain" }} />
            </div>
            <span style={{ display:"inline-block", fontSize:11, fontWeight:500, padding:"4px 14px", borderRadius:9999, background:C.pale, color:C.acc, letterSpacing:"0.05em", marginBottom:16 }}>
              Interactive Demo
            </span>
            <h1 style={{ fontFamily:"var(--font-dm-serif),'DM Serif Display',serif", fontSize:"2rem", fontWeight:400, color:C.ink, marginBottom:10, lineHeight:1.2 }}>
              OilSim — Crude Availability Simulator
            </h1>
          </div>

          {/* About this demo */}
          <div style={{ background:"rgba(255,255,255,0.97)", borderRadius:16, border:"1px solid rgba(221,214,254,0.5)", padding:"1.5rem", marginBottom:20, boxShadow:"0 2px 20px rgba(91,79,207,0.06)" }}>
            <p style={{ fontSize:13, fontWeight:600, color:C.acc, textTransform:"uppercase" as const, letterSpacing:"0.07em", marginBottom:12 }}>
              Oil block to your refinery - simulate the availability
            </p>
            <p style={{ fontSize:14.5, color:C.ink2, lineHeight:1.75, marginBottom:14 }}>
              OilSim is a Monte Carlo simulation engine that models the probability of crude oil
              reaching your refinery's CDU gate — across every stage of the upstream supply chain.
            </p>
            <p style={{ fontSize:14, color:C.ink3, lineHeight:1.75, marginBottom:16 }}>
              Configure <strong style={{ color:C.ink2 }}>20 parameters</strong> across four stages —
              crude sourcing, maritime logistics, port &amp; terminal, and refinery configuration —
              and run <strong style={{ color:C.ink2 }}>2,000 stochastic trials</strong> to get
              probability distributions for availability, GRM impact, voyage delay and stock-out risk.
            </p>

            {/* Feature pills */}
            <div style={{ display:"flex", flexWrap:"wrap" as const, gap:8, marginBottom:16 }}>
              {[
                { icon:"◈", label:"Reserve block release probability" },
                { icon:"◉", label:"Vessel delay & freight volatility" },
                { icon:"◆", label:"SPM / jetty downtime modelling" },
                { icon:"◇", label:"Multi-grade flexibility index" },
                { icon:"⊕", label:"Geopolitical & sanctions risk" },
                { icon:"⊗", label:"Tank farm inventory buffer" },
              ].map(f => (
                <span key={f.label} style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, padding:"5px 12px", borderRadius:9999, background:C.pale2, color:C.ink2, border:"1px solid rgba(221,214,254,0.8)" }}>
                  <span style={{ color:C.acc, fontSize:10 }}>{f.icon}</span>
                  {f.label}
                </span>
              ))}
            </div>

            {/* What you get */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
              {[
                { color:C.grn,  bg:C.grnbg,  bd:C.grnbd,  title:"Availability distribution",  body:"Probability histogram of crude reaching CDU gate — P10, P50, P90" },
                { color:C.amb,  bg:C.ambbg,  bd:C.ambbd,  title:"GRM impact vs plan",          body:"Expected $/bbl delta from supply disruptions, grade switches and delays" },
                { color:C.acc,  bg:C.pale2,  bd:"#ddd6fe", title:"Stock-out risk score",        body:"Probability of tank farm running dry under your configured parameters" },
              ].map(o => (
                <div key={o.title} style={{ padding:"10px 12px", borderRadius:10, background:o.bg, border:`1px solid ${o.bd}` }}>
                  <p style={{ fontSize:12, fontWeight:600, color:o.color, marginBottom:4 }}>{o.title}</p>
                  <p style={{ fontSize:12, color:C.ink3, lineHeight:1.5 }}>{o.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Registration form */}
          <div style={{ background:"rgba(255,255,255,0.97)", borderRadius:16, border:"1px solid rgba(221,214,254,0.5)", padding:"1.5rem", boxShadow:"0 2px 20px rgba(91,79,207,0.06)" }}>
            <p style={{ fontSize:13, fontWeight:600, color:C.acc, textTransform:"uppercase" as const, letterSpacing:"0.07em", marginBottom:16 }}>
              Register to access the simulator
            </p>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <input className="input-field" placeholder="Full name *"   value={form.name}    onChange={upd("name")} />
              <input className="input-field" type="email" placeholder="Work email *"  value={form.email}   onChange={upd("email")} />
            </div>
            <div style={{ marginBottom:12 }}>
              <input className="input-field" placeholder="Company / Oil company *" value={form.company} onChange={upd("company")} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
              <input className="input-field" placeholder="Job title"       value={form.title}   onChange={upd("title")} />
              <input className="input-field" type="tel" placeholder="Phone (optional)" value={form.phone}   onChange={upd("phone")} />
            </div>

            {err && (
              <div style={{ marginBottom:14, padding:"10px 14px", background:C.redbg, border:`1px solid ${C.redbd}`, borderRadius:8, fontSize:13, color:C.red }}>
                {err}
              </div>
            )}

            <button
              className="btn-primary"
              style={{ width:"100%", padding:"13px", fontSize:15 }}
              onClick={handleRegister}
              disabled={busy}
            >
              {busy ? "Please wait…" : "Launch simulator →"}
            </button>

            <p style={{ fontSize:11, color:C.ink3, textAlign:"center" as const, marginTop:12, lineHeight:1.6 }}>
              Free to use · No charges · Your details are used only to send you simulation reports
            </p>
          </div>

          <p style={{ textAlign:"center" as const, fontSize:12, color:C.ink3, marginTop:24 }}>
            OpenNetrikkan Technologies ·{" "}
            <a href="mailto:info@opennetrikkan.com" style={{ color:C.acc, textDecoration:"none" }}>
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
