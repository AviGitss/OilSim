"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordPage() {
  const { supabase } = useAuth();
  const [password, setPassword]   = useState("");
  const [confirm,  setConfirm]    = useState("");
  const [err,      setErr]        = useState("");
  const [msg,      setMsg]        = useState("");
  const [busy,     setBusy]       = useState(false);
  const [ready,    setReady]      = useState(false);

  // Supabase exchanges the token from the URL hash automatically on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") setReady(true);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset() {
    setErr(""); setMsg("");
    if (!password.trim()) { setErr("Please enter a new password."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setErr("Passwords do not match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErr(error.message);
    } else {
      setMsg("Password updated! Redirecting to login…");
      setTimeout(() => { window.location.href = "/"; }, 2000);
    }
    setBusy(false);
  }

  const S = {
    page: { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"3rem 1rem", background:"#f4f2fb" } as React.CSSProperties,
    wrap: { width:"100%", maxWidth:440 } as React.CSSProperties,
    h1:   { fontFamily:"var(--font-dm-serif),'DM Serif Display',serif", fontSize:"1.75rem", fontWeight:400, color:"#0f0e17", marginBottom:8, lineHeight:1.2 } as React.CSSProperties,
    sub:  { fontSize:14, color:"#7a748e", lineHeight:1.65, marginBottom:0 } as React.CSSProperties,
    mb:   { marginBottom:12 } as React.CSSProperties,
    mb20: { marginBottom:20 } as React.CSSProperties,
    err:  { marginBottom:14, padding:"10px 14px", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, fontSize:13, color:"#b91c1c" } as React.CSSProperties,
    ok:   { marginBottom:14, padding:"10px 14px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, fontSize:13, color:"#15803d" } as React.CSSProperties,
    info: { marginBottom:14, padding:"10px 14px", background:"#f0f4ff", border:"1px solid #c7d2fe", borderRadius:8, fontSize:13, color:"#3730a3" } as React.CSSProperties,
  };

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <img src="/logo.jpg" alt="OpenNetrikkan" style={{ height:44, width:"auto", objectFit:"contain" }} />
          </div>
          <h1 style={S.h1}>Set new password</h1>
          <p style={S.sub}>Enter your new password below.</p>
        </div>

        <div className="card">
          {!ready && (
            <div style={S.info}>
              Verifying reset link — please wait a moment…
            </div>
          )}

          <div style={S.mb}>
            <input
              className="input-field"
              type="password"
              placeholder="New password *"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={!ready}
            />
          </div>
          <div style={S.mb20}>
            <input
              className="input-field"
              type="password"
              placeholder="Confirm new password *"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              disabled={!ready}
              onKeyDown={e => e.key === "Enter" && handleReset()}
            />
          </div>

          {err && <div style={S.err}>{err}</div>}
          {msg && <div style={S.ok}>{msg}</div>}

          <button
            className="btn-primary"
            style={{ width:"100%", padding:"12px", fontSize:15 }}
            onClick={handleReset}
            disabled={busy || !ready}
          >
            {busy ? "Updating…" : "Set new password →"}
          </button>
        </div>
      </div>
    </div>
  );
}
