"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthPage from "@/components/AuthPage";
import Dashboard from "@/components/Dashboard";
import SimulatorPanel from "@/components/SimulatorPanel";
import ResultsPanel from "@/components/ResultsPanel";
import { runSimulation } from "@/lib/simulation";
import type { SimValues, SimResults } from "@/types";

type Screen = "dashboard" | "sim" | "results";

export default function Home() {
  const { user, profile, loading } = useAuth();
  const [screen, setScreen]       = useState<Screen>("dashboard");
  const [simVals, setSimVals]     = useState<SimValues | null>(null);
  const [results, setResults]     = useState<SimResults | null>(null);

  // Loading spinner while session is being checked
  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f4f2fb" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:32, height:32, border:"3px solid #ede9ff", borderTopColor:"#5b4fcf", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} />
          <p style={{ fontSize:13, color:"#7a748e" }}>Loading…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Not logged in → show auth page
  if (!user || !profile) {
    return <AuthPage />;
  }

  function handleRun(vals: SimValues) {
    const r = runSimulation(vals);
    setSimVals(vals);
    setResults(r);
    setScreen("results");
  }

  function handleLoadRun(params: SimValues, results: SimResults) {
    setSimVals(params);
    setResults(results);
    setScreen("results");
  }

  return (
    <main>
      {screen === "dashboard" && (
        <Dashboard
          onNewRun={() => setScreen("sim")}
          onLoadRun={handleLoadRun}
        />
      )}

      {screen === "sim" && (
        <SimulatorPanel
          user={{ name: profile.name, company: profile.company }}
          onRun={handleRun}
          initialValues={simVals ?? undefined}
          onBack={() => setScreen("dashboard")}
        />
      )}

      {screen === "results" && results && simVals && (
        <ResultsPanel
          results={results}
          params={simVals}
          user={{ name: profile.name, id: user.id }}
          leadId={user.id}
          onBack={() => setScreen("sim")}
          onReRun={() => { if (simVals) { const r = runSimulation(simVals); setResults(r); } }}
          onDashboard={() => setScreen("dashboard")}
        />
      )}
    </main>
  );
}
