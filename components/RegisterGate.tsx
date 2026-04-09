"use client";
import { useState } from "react";
import type { Lead } from "@/types";

interface Props {
  onSuccess: (lead: Lead & { id: string }) => void;
}

export default function RegisterGate({ onSuccess }: Props) {
  const [form, setForm] = useState({ name: "", email: "", company: "", title: "", phone: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  function upd(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));
  }

  async function submit() {
    if (!form.name.trim() || !form.email.trim() || !form.company.trim()) {
      setErr("Name, email and company are required.");
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: form.email.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.error || `Server error ${res.status} — check Vercel logs and Supabase env vars.`);
        setBusy(false);
        return;
      }
      onSuccess(json.lead);
    } catch {
      setErr("Network error. Please check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem", background: "#f4f2fb" }}>
      <div style={{ width: "100%", maxWidth: 500 }}>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, padding: "4px 14px", borderRadius: 9999, background: "#ede9ff", color: "#5b4fcf", letterSpacing: "0.05em", marginBottom: 16 }}>
            Crude Availability Simulator — Beta
          </span>
          <h1 style={{ fontFamily: "var(--font-dm-serif),'DM Serif Display',serif", fontSize: "1.9rem", fontWeight: 400, color: "#0f0e17", marginBottom: 10, lineHeight: 1.2 }}>
            Simulate upstream crude availability
          </h1>
          <p style={{ fontSize: 14, color: "#7a748e", lineHeight: 1.65 }}>
            Model the probability of crude reaching your CDU gate across 2,000 stochastic
            Monte Carlo trials. Configure 20 parameters across sourcing, maritime, port
            and refinery stages.
          </p>
        </div>

        <div className="card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input className="input-field" placeholder="Full name *" value={form.name} onChange={upd("name")} />
            <input className="input-field" type="email" placeholder="Work email *" value={form.email} onChange={upd("email")} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input className="input-field" placeholder="Company / Organisation *" value={form.company} onChange={upd("company")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <input className="input-field" placeholder="Job title" value={form.title} onChange={upd("title")} />
            <input className="input-field" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={upd("phone")} />
          </div>

          {err && (
            <div style={{ marginBottom: 14, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#b91c1c" }}>
              {err}
            </div>
          )}

          <button className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: 15 }} onClick={submit} disabled={busy}>
            {busy ? "Saving…" : "Access simulator →"}
          </button>

          <p style={{ fontSize: 11, color: "#7a748e", textAlign: "center", marginTop: 14, lineHeight: 1.6 }}>
            Your details are used only to send simulation reports and product updates. No charges, no spam.
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#7a748e", marginTop: 24 }}>
          OpenNEtrikkan Technologies ·{" "}
          <a href="mailto:contact@opennetrikkan.com" style={{ color: "#5b4fcf", textDecoration: "none" }}>
            contact@opennetrikkan.com
          </a>
        </p>
      </div>
    </div>
  );
}
