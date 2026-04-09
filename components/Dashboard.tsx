"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { SimResults, SimValues } from "@/types";

interface Run {
  id: string;
  label: string | null;
  avail_mean: number;
  grm_mean: number;
  delay_mean: number;
  stockout_mean: number;
  trials: number;
  ran_at: string;
  params: SimValues;
  results: SimResults;
}

interface Props {
  onNewRun: () => void;
  onLoadRun: (params: SimValues, results: SimResults) => void;
}

function fmt(n: number, dp = 1) { return n?.toFixed(dp) ?? "—"; }

function sentColor(v: number, good: number, warn: number) {
  return v >= good ? "#15803d" : v >= warn ? "#b45309" : "#c0392b";
}

export default function Dashboard({ onNewRun, onLoadRun }: Props) {
  const { user, profile, supabase, signOut } = useAuth();
  const [runs, setRuns]       = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchRuns() {
    if (!user) return;
    const { data } = await supabase
      .from("simulation_runs")
      .select("id, label, avail_mean, grm_mean, delay_mean, stockout_mean, trials, ran_at, params, results")
      .eq("user_id", user.id)
      .order("ran_at", { ascending: false })
      .limit(50);
    setRuns((data as Run[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchRuns(); }, [user]);

  async function deleteRun(id: string) {
    setDeleting(id);
    await supabase.from("simulation_runs").delete().eq("id", id);
    setRuns(prev => prev.filter(r => r.id !== id));
    setDeleting(null);
  }

  const initial = profile?.name?.charAt(0).toUpperCase() ?? "?";

  const S = {
    page: { minHeight:"100vh", background:"#f4f2fb", padding:"0" } as React.CSSProperties,
    header: {
      background:"rgba(255,255,255,0.97)", borderBottom:"1px solid rgba(221,214,254,0.5)",
      padding:"0 2rem", display:"flex", alignItems:"center", justifyContent:"space-between",
      height:60,
    } as React.CSSProperties,
    brand: { fontFamily:"var(--font-dm-serif),'DM Serif Display',serif", fontSize:"1.15rem", color:"#0f0e17" } as React.CSSProperties,
    headerRight: { display:"flex", alignItems:"center", gap:12 } as React.CSSProperties,
    avatar: { width:34, height:34, borderRadius:"50%", background:"#ede9ff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:500, color:"#5b4fcf" } as React.CSSProperties,
    body: { maxWidth:900, margin:"0 auto", padding:"2rem 1rem" } as React.CSSProperties,
    welcome: { marginBottom:"2rem" } as React.CSSProperties,
    wName: { fontFamily:"var(--font-dm-serif),'DM Serif Display',serif", fontSize:"1.6rem", color:"#0f0e17", marginBottom:4 } as React.CSSProperties,
    wSub: { fontSize:13, color:"#7a748e" } as React.CSSProperties,
    statsRow: { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:"2rem" } as React.CSSProperties,
    stat: { background:"rgba(255,255,255,0.97)", borderRadius:12, padding:"14px 16px", border:"1px solid rgba(221,214,254,0.5)" } as React.CSSProperties,
    statLabel: { fontSize:11, fontWeight:500, color:"#7a748e", textTransform:"uppercase" as const, letterSpacing:"0.06em", marginBottom:6 } as React.CSSProperties,
    statVal: { fontFamily:"var(--font-dm-serif),'DM Serif Display',serif", fontSize:26, color:"#0f0e17" } as React.CSSProperties,
    sectionHead: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 } as React.CSSProperties,
    sectionTitle: { fontFamily:"var(--font-dm-serif),'DM Serif Display',serif", fontSize:"1.15rem", color:"#0f0e17" } as React.CSSProperties,
    emptyBox: { background:"rgba(255,255,255,0.97)", borderRadius:16, border:"1px solid rgba(221,214,254,0.5)", padding:"3rem", textAlign:"center" as const } as React.CSSProperties,
    runCard: { background:"rgba(255,255,255,0.97)", borderRadius:14, border:"1px solid rgba(221,214,254,0.5)", padding:"1.25rem 1.5rem", marginBottom:10, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" as const, cursor:"pointer", transition:"border-color 150ms ease" } as React.CSSProperties,
    runMeta: { flex:1, minWidth:160 } as React.CSSProperties,
    runLabel: { fontSize:14, fontWeight:500, color:"#0f0e17", marginBottom:3 } as React.CSSProperties,
    runDate: { fontSize:11, color:"#7a748e" } as React.CSSProperties,
    metrics: { display:"flex", gap:20, flexWrap:"wrap" as const } as React.CSSProperties,
    metric: { textAlign:"center" as const } as React.CSSProperties,
    metricVal: { fontSize:18, fontWeight:400, fontFamily:"var(--font-dm-serif),'DM Serif Display',serif" } as React.CSSProperties,
    metricLabel: { fontSize:10, color:"#7a748e", fontWeight:500, textTransform:"uppercase" as const, letterSpacing:"0.06em" } as React.CSSProperties,
    actions: { display:"flex", gap:8, alignItems:"center", flexShrink:0 } as React.CSSProperties,
  };

  const avgAvail    = runs.length ? runs.reduce((a,r) => a + r.avail_mean, 0) / runs.length : null;
  const avgGrm      = runs.length ? runs.reduce((a,r) => a + r.grm_mean, 0)  / runs.length : null;

  return (
    <div style={S.page}>
      {/* Top nav */}
      <div style={S.header}>
        <img
          src="/logo.jpg"
          alt="OpenNetrikkan"
          style={{ height: 32, width: "auto", objectFit: "contain" }}
        />
        <div style={S.headerRight}>
          <button className="btn-primary" style={{ padding:"7px 16px", fontSize:13 }} onClick={onNewRun}>
            + New simulation
          </button>
          <div style={S.avatar}>{initial}</div>
          <span style={{ fontSize:13, color:"#3a3650" }}>{profile?.name ?? user?.email}</span>
          <button
            onClick={signOut}
            style={{ fontSize:12, color:"#7a748e", background:"none", border:"none", cursor:"pointer", padding:"4px 8px" }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={S.body}>
        {/* Welcome */}
        <div style={S.welcome}>
          <h1 style={S.wName}>
            Hello, {profile?.name?.split(" ")[0] ?? "there"}
          </h1>
          <p style={S.wSub}>
            {profile?.company} · {user?.email}
          </p>
        </div>

        {/* Summary stats */}
        <div style={S.statsRow}>
          {[
            { label:"Total runs", value: runs.length.toString(), unit:"" },
            { label:"Avg availability", value: avgAvail != null ? fmt(avgAvail) : "—", unit:"%" },
            { label:"Avg GRM impact", value: avgGrm != null ? (avgGrm >= 0 ? "+" : "") + fmt(avgGrm, 2) : "—", unit:"$/bbl" },
            { label:"Last run", value: runs[0] ? new Date(runs[0].ran_at).toLocaleDateString(undefined, { day:"numeric", month:"short" }) : "—", unit:"" },
          ].map(s => (
            <div key={s.label} style={S.stat}>
              <p style={S.statLabel}>{s.label}</p>
              <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                <span style={S.statVal}>{s.value}</span>
                {s.unit && <span style={{ fontSize:12, color:"#7a748e" }}>{s.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Runs list */}
        <div style={S.sectionHead}>
          <h2 style={S.sectionTitle}>Previous runs</h2>
          {runs.length > 0 && (
            <span style={{ fontSize:12, color:"#7a748e" }}>{runs.length} saved · click any to reload</span>
          )}
        </div>

        {loading && (
          <p style={{ color:"#7a748e", fontSize:14 }}>Loading runs…</p>
        )}

        {!loading && runs.length === 0 && (
          <div style={S.emptyBox}>
            <p style={{ fontSize:15, color:"#7a748e", marginBottom:16 }}>No runs yet.</p>
            <button className="btn-primary" onClick={onNewRun}>Run your first simulation →</button>
          </div>
        )}

        {runs.map(run => {
          const d = new Date(run.ran_at);
          const label = run.label || `Run ${d.toLocaleDateString(undefined, { day:"numeric", month:"short" })} ${d.toLocaleTimeString(undefined, { hour:"2-digit", minute:"2-digit" })}`;
          return (
            <div
              key={run.id}
              style={S.runCard}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#a78bfa")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(221,214,254,0.5)")}
              onClick={() => onLoadRun(run.params, run.results)}
            >
              <div style={S.runMeta}>
                <p style={S.runLabel}>{label}</p>
                <p style={S.runDate}>{d.toLocaleDateString(undefined, { weekday:"short", day:"numeric", month:"long", year:"numeric" })} · {run.trials?.toLocaleString()} trials</p>
              </div>

              <div style={S.metrics}>
                {[
                  { label:"Availability", value: fmt(run.avail_mean)+"%", color: sentColor(run.avail_mean, 75, 60) },
                  { label:"GRM impact", value: (run.grm_mean >= 0 ? "+" : "")+fmt(run.grm_mean, 2)+" $/bbl", color: sentColor(run.grm_mean, 0, -2) },
                  { label:"Delay", value: fmt(run.delay_mean)+"d", color: sentColor(-run.delay_mean, -4, -8) },
                  { label:"Stock-out", value: fmt(run.stockout_mean)+"%", color: sentColor(-run.stockout_mean, -20, -8) },
                ].map(m => (
                  <div key={m.label} style={S.metric}>
                    <div style={{ ...S.metricVal, color: m.color }}>{m.value}</div>
                    <div style={S.metricLabel}>{m.label}</div>
                  </div>
                ))}
              </div>

              <div style={S.actions} onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onLoadRun(run.params, run.results)}
                  style={{ fontSize:12, color:"#5b4fcf", background:"#ede9ff", border:"none", borderRadius:6, padding:"6px 12px", cursor:"pointer", fontFamily:"var(--font-dm-sans),'DM Sans',sans-serif", fontWeight:500 }}
                >
                  Load →
                </button>
                <button
                  onClick={() => deleteRun(run.id)}
                  disabled={deleting === run.id}
                  style={{ fontSize:12, color:"#c0392b", background:"#fef2f2", border:"none", borderRadius:6, padding:"6px 10px", cursor:"pointer", fontFamily:"var(--font-dm-sans),'DM Sans',sans-serif" }}
                >
                  {deleting === run.id ? "…" : "✕"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
