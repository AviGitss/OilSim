"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const { supabase } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({ name: "", email: "", company: "", title: "", phone: "", password: "" });
  const [err, setErr]   = useState("");
  const [msg, setMsg]   = useState("");
  const [busy, setBusy] = useState(false);

  function upd(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));
  }

  function switchMode(m: Mode) {
    setMode(m); setErr(""); setMsg("");
  }

  async function handleSubmit() {
    setErr(""); setMsg("");

    // ── Forgot password ──────────────────────────────────────
    if (mode === "forgot") {
      if (!form.email.trim()) { setErr("Please enter your email address."); return; }
      setBusy(true);
      const { error } = await supabase.auth.resetPasswordForEmail(
        form.email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      setBusy(false);
      if (error) {
        setErr(error.message);
      } else {
        setMsg("Password reset link sent — check your inbox and spam folder.");
      }
      return;
    }

    // ── Login ────────────────────────────────────────────────
    if (mode === "login") {
      if (!form.email.trim() || !form.password.trim()) {
        setErr("Email and password are required."); return;
      }
      setBusy(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) { setErr(error.message); setBusy(false); }
      return;
    }

    // ── Sign up ───────────────────────────────────────────────
    if (!form.email.trim() || !form.password.trim()) {
      setErr("Email and password are required."); return;
    }
    if (!form.name.trim() || !form.company.trim()) {
      setErr("Name and company are required."); return;
    }
    setBusy(true);
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
      setMsg("Account created! You can now log in.");
      switchMode("login");
      setForm(p => ({ ...p, password: "" }));
    }
    setBusy(false);
  }

  const S = {
    page:    { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"3rem 1rem", background:"#f4f2fb" } as React.CSSProperties,
    wrap:    { width:"100%", maxWidth:480 } as React.CSSProperties,
    eyebrow: { display:"inline-block", fontSize:11, fontWeight:500, padding:"4px 14px", borderRadius:9999, background:"#ede9ff", color:"#5b4fcf", letterSpacing:"0.05em", marginBottom:16 } as React.CSSProperties,
    h1:      { fontFamily:"var(--font-dm-serif),'DM Serif Display',serif", fontSize:"1.9rem", fontWeight:400, color:"#0f0e17", marginBottom:8, lineHeight:1.2 } as React.CSSProperties,
    sub:     { fontSize:14, color:"#7a748e", lineHeight:1.65, marginBottom:0 } as React.CSSProperties,
    tabs:    { display:"flex", gap:0, marginBottom:20, borderRadius:8, overflow:"hidden", border:"1px solid #ddd6fe" } as React.CSSProperties,
    tab: (active: boolean): React.CSSProperties => ({
      flex:1, padding:"10px", fontSize:13, fontWeight:500, cursor:"pointer",
      fontFamily:"var(--font-dm-sans),'DM Sans',sans-serif", border:"none",
      background: active ? "#5b4fcf" : "#ffffff",
      color: active ? "#ffffff" : "#7a748e",
      transition:"all 150ms ease",
    }),
    row2:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 } as React.CSSProperties,
    mb:    { marginBottom:12 } as React.CSSProperties,
    mb20:  { marginBottom:20 } as React.CSSProperties,
    err:   { marginBottom:14, padding:"10px 14px", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, fontSize:13, color:"#b91c1c" } as React.CSSProperties,
    ok:    { marginBottom:14, padding:"10px 14px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, fontSize:13, color:"#15803d" } as React.CSSProperties,
    note:  { fontSize:11, color:"#7a748e", textAlign:"center" as const, marginTop:14, lineHeight:1.7 } as React.CSSProperties,
    footer:{ textAlign:"center" as const, fontSize:12, color:"#7a748e", marginTop:24 } as React.CSSProperties,
    link:  { color:"#5b4fcf", textDecoration:"none", cursor:"pointer" } as React.CSSProperties,
    divider:{ display:"flex", alignItems:"center", gap:10, margin:"16px 0", color:"#7a748e", fontSize:12 } as React.CSSProperties,
    line:  { flex:1, height:1, background:"#e9e5ff" } as React.CSSProperties,
    backBtn:{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#7a748e", background:"none", border:"none", cursor:"pointer", padding:"0 0 16px", fontFamily:"var(--font-dm-sans),'DM Sans',sans-serif" } as React.CSSProperties,
  };

  const headings: Record<Mode, string> = {
    login:  "OilSim",
    signup: "Create your account",
    forgot: "Reset your password",
  };
  const subtitles: Record<Mode, string> = {
    login:  "Log in to access the simulator and your previous runs.",
    signup: "Register once to access the full simulation engine and save your runs.",
    forgot: "Enter your email and we'll send you a reset link.",
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <img src="/logo.jpg" alt="OpenNetrikkan" style={{ height:44, width:"auto", objectFit:"contain" }} />
          </div>
          <span style={S.eyebrow}>Crude Availability Simulator</span>
          <h1 style={S.h1}>{headings[mode]}</h1>
          <p style={S.sub}>{subtitles[mode]}</p>
        </div>

        <div className="card">

          {/* ── Forgot password view ── */}
          {mode === "forgot" && (
            <>
              <button style={S.backBtn} onClick={() => switchMode("login")}>
                ← Back to log in
              </button>
              <div style={S.mb20}>
                <input
                  className="input-field"
                  type="email"
                  placeholder="Your email address *"
                  value={form.email}
                  onChange={upd("email")}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>
              {err && <div style={S.err}>{err}</div>}
              {msg && <div style={S.ok}>{msg}</div>}
              <button
                className="btn-primary"
                style={{ width:"100%", padding:"12px", fontSize:15 }}
                onClick={handleSubmit}
                disabled={busy}
              >
                {busy ? "Sending…" : "Send reset link →"}
              </button>
              <p style={S.note}>
                Remembered it?{" "}
                <span style={S.link} onClick={() => switchMode("login")}>Log in →</span>
              </p>
            </>
          )}

          {/* ── Login / Signup view ── */}
          {mode !== "forgot" && (
            <>
              <div style={S.tabs}>
                <button style={S.tab(mode === "login")}  onClick={() => switchMode("login")}>Log in</button>
                <button style={S.tab(mode === "signup")} onClick={() => switchMode("signup")}>Create account</button>
              </div>

              {mode === "signup" && (
                <>
                  <div style={S.row2}>
                    <input className="input-field" placeholder="Full name *"  value={form.name}    onChange={upd("name")} />
                    <input className="input-field" placeholder="Company *"    value={form.company} onChange={upd("company")} />
                  </div>
                  <div style={{ ...S.row2, ...S.mb }}>
                    <input className="input-field" placeholder="Job title"    value={form.title}   onChange={upd("title")} />
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
                <input
                  className="input-field"
                  type="password"
                  placeholder="Password *"
                  value={form.password}
                  onChange={upd("password")}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>

              {err && <div style={S.err}>{err}</div>}
              {msg && <div style={S.ok}>{msg}</div>}

              <button
                className="btn-primary"
                style={{ width:"100%", padding:"12px", fontSize:15 }}
                onClick={handleSubmit}
                disabled={busy}
              >
                {busy ? "Please wait…" : mode === "login" ? "Log in →" : "Create account →"}
              </button>

              <p style={S.note}>
                {mode === "login" ? (
                  <>
                    <span style={S.link} onClick={() => switchMode("forgot")}>Forgot password?</span>
                    {"  ·  "}
                    No account?{" "}
                    <span style={S.link} onClick={() => switchMode("signup")}>Create one free →</span>
                  </>
                ) : (
                  <>
                    Already registered?{" "}
                    <span style={S.link} onClick={() => switchMode("login")}>Log in →</span>
                  </>
                )}
              </p>
            </>
          )}

        </div>

        <p style={S.footer}>
          OpenNetrikkan Technologies ·{" "}
          <a href="mailto:info@opennetrikkan.com" style={S.link}>contact@opennetrikkan.com</a>
        </p>
      </div>
    </div>
  );
}
