"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const { supabase } = useAuth();
  const [mode, setMode]       = useState<"login" | "signup">("login");
  const [form, setForm]       = useState({ name: "", email: "", company: "", title: "", phone: "", password: "" });
  const [err, setErr]         = useState("");
  const [msg, setMsg]         = useState("");
  const [busy, setBusy]       = useState(false);

  function upd(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));
  }

  async function handleSubmit() {
    setErr(""); setMsg("");
    if (!form.email.trim() || !form.password.trim()) {
      setErr("Email and password are required."); return;
    }
    if (mode === "signup" && (!form.name.trim() || !form.company.trim())) {
      setErr("Name and company are required."); return;
    }
    setBusy(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) { setErr(error.message); setBusy(false); }
      // on success AuthContext fires onAuthStateChange → app re-renders

    } else {
      const { error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            name:    form.name.trim(),
            company: form.company.trim(),
            title:   form.title.trim() || null,
            phone:   form.phone.trim() || null,
          },
        },
      });
      if (error) {
        setErr(error.message);
      } else {
        setMsg("Account created! Check your email to confirm, then log in.");
        setMode("login");
        setForm(p => ({ ...p, password: "" }));
      }
      setBusy(false);
    }
  }

  const S = {
    page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"3rem 1rem", background:"#f4f2fb" } as React.CSSProperties,
    wrap: { width:"100%", maxWidth:480 } as React.CSSProperties,
    eyebrow: { display:"inline-block", fontSize:11, fontWeight:500, padding:"4px 14px", borderRadius:9999, background:"#ede9ff", color:"#5b4fcf", letterSpacing:"0.05em", marginBottom:16 } as React.CSSProperties,
    h1: { fontFamily:"var(--font-dm-serif),'DM Serif Display',serif", fontSize:"1.9rem", fontWeight:400, color:"#0f0e17", marginBottom:8, lineHeight:1.2 } as React.CSSProperties,
    sub: { fontSize:14, color:"#7a748e", lineHeight:1.65, marginBottom:0 } as React.CSSProperties,
    tabs: { display:"flex", gap:0, marginBottom:20, borderRadius:8, overflow:"hidden", border:"1px solid #ddd6fe" } as React.CSSProperties,
    tab: (active: boolean): React.CSSProperties => ({
      flex:1, padding:"10px", fontSize:13, fontWeight:500, cursor:"pointer",
      fontFamily:"var(--font-dm-sans),'DM Sans',sans-serif", border:"none",
      background: active ? "#5b4fcf" : "#ffffff",
      color: active ? "#ffffff" : "#7a748e",
      transition:"all 150ms ease",
    }),
    row2: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 } as React.CSSProperties,
    mb: { marginBottom:12 } as React.CSSProperties,
    mb20: { marginBottom:20 } as React.CSSProperties,
    err: { marginBottom:14, padding:"10px 14px", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, fontSize:13, color:"#b91c1c" } as React.CSSProperties,
    ok:  { marginBottom:14, padding:"10px 14px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, fontSize:13, color:"#15803d" } as React.CSSProperties,
    note: { fontSize:11, color:"#7a748e", textAlign:"center" as const, marginTop:14, lineHeight:1.6 } as React.CSSProperties,
    footer: { textAlign:"center" as const, fontSize:12, color:"#7a748e", marginTop:24 } as React.CSSProperties,
    link: { color:"#5b4fcf", textDecoration:"none", cursor:"pointer" } as React.CSSProperties,
    divider: { display:"flex", alignItems:"center", gap:10, margin:"16px 0", color:"#7a748e", fontSize:12 } as React.CSSProperties,
    line: { flex:1, height:1, background:"#e9e5ff" } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <img
              src="/logo.jpg"
              alt="OpenNetrikkan"
              style={{ height: 44, width: "auto", objectFit: "contain" }}
            />
          </div>
          <span style={S.eyebrow}>Crude Availability Simulator</span>
          <h1 style={S.h1}>
            {mode === "login" ? "OilSim" : "Create your account"}
          </h1>
          <p style={S.sub}>
            {mode === "login"
              ? "Log in to access the simulator and your previous runs."
              : "Register once to access the full simulation engine and save your runs."}
          </p>
        </div>

        <div className="card">
          <div style={S.tabs}>
            <button style={S.tab(mode === "login")}  onClick={() => { setMode("login");  setErr(""); setMsg(""); }}>Log in</button>
            <button style={S.tab(mode === "signup")} onClick={() => { setMode("signup"); setErr(""); setMsg(""); }}>Create account</button>
          </div>

          {mode === "signup" && (
            <>
              <div style={S.row2}>
                <input className="input-field" placeholder="Full name *" value={form.name} onChange={upd("name")} />
                <input className="input-field" placeholder="Company *"   value={form.company} onChange={upd("company")} />
              </div>
              <div style={{ ...S.row2, ...S.mb }}>
                <input className="input-field" placeholder="Job title"   value={form.title} onChange={upd("title")} />
                <input className="input-field" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={upd("phone")} />
              </div>
              <div style={S.divider}>
                <div style={S.line} />
                <span>Account details</span>
                <div style={S.line} />
              </div>
            </>
          )}

          <div style={S.mb}>
            <input className="input-field" type="email" placeholder="Work email *" value={form.email} onChange={upd("email")} />
          </div>
          <div style={S.mb20}>
            <input className="input-field" type="password" placeholder="Password *" value={form.password} onChange={upd("password")}
              onKeyDown={e => e.key === "Enter" && handleSubmit()} />
          </div>

          {err && <div style={S.err}>{err}</div>}
          {msg && <div style={S.ok}>{msg}</div>}

          <button className="btn-primary" style={{ width:"100%", padding:"12px", fontSize:15 }} onClick={handleSubmit} disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Log in →" : "Create account →"}
          </button>

          <p style={S.note}>
            {mode === "login" ? (
              <>No account? <span style={S.link} onClick={() => { setMode("signup"); setErr(""); setMsg(""); }}>Create one free →</span></>
            ) : (
              <>Already registered? <span style={S.link} onClick={() => { setMode("login"); setErr(""); setMsg(""); }}>Log in →</span></>
            )}
          </p>
        </div>

        <p style={S.footer}>
          OpenNetrikkan Technologies ·{" "}
          <a href="mailto:contact@opennetrikkan.com" style={S.link}>contact@opennetrikkan.com</a>
        </p>
      </div>
    </div>
  );
}
