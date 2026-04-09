import type { SimValues, SimResults, Distribution } from "@/types";

function boxMuller(mu: number, sigma: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

function pct(arr: number[], p: number): number {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor((s.length * p) / 100)] ?? s[0] ?? 0;
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function histogram(
  arr: number[],
  bins: number,
  lo: number,
  hi: number
): { counts: number[]; labels: number[] } {
  const w = (hi - lo) / bins;
  const counts = Array(bins).fill(0);
  arr.forEach((v) => {
    const i = clamp(Math.floor((v - lo) / w), 0, bins - 1);
    counts[i]++;
  });
  const labels = Array.from({ length: bins }, (_, i) =>
    parseFloat((lo + i * w + w / 2).toFixed(1))
  );
  return { counts, labels };
}

export function runSimulation(v: SimValues, N = 2000): SimResults {
  const availArr: number[] = [];
  const grmArr: number[] = [];
  const delayArr: number[] = [];
  const soArr: number[] = [];

  for (let t = 0; t < N; t++) {
    let avail = 100;
    let grm = 0;
    let delay = 0;
    let so = 0;

    // ── Reserve block release ──────────────────────────────
    const rbReleased = Math.random() < v.reserveBlock / 100;
    if (!rbReleased) {
      const cut = 0.2 + Math.random() * 0.4;
      avail *= 1 - cut;
      grm -= boxMuller(2.4, 0.8);
      delay += Math.max(0, boxMuller(3.5, 1.5));
    }

    // ── Geopolitical disruption ───────────────────────────
    if (Math.random() < v.geoRisk / 100) {
      const cut = 0.15 + Math.random() * 0.55;
      avail *= 1 - cut;
      grm -= boxMuller(2.8, 1.0);
      delay += Math.max(0, boxMuller(6, 2.5));
    }

    // ── Sanctions exposure ─────────────────────────────────
    if (Math.random() < v.sanctionsExp / 160) {
      const cut = 0.08 + Math.random() * 0.32;
      avail *= 1 - cut;
      grm -= boxMuller(1.9, 0.7);
    }

    // ── Spot vs term volatility ───────────────────────────
    const spotNoise = (v.spotShare / 100) * boxMuller(0, 1) * 9;
    avail = clamp(avail + spotNoise, 0, 100);
    grm += spotNoise > 0 ? -spotNoise * 0.07 : spotNoise * 0.04;

    // ── Grade flexibility benefit ─────────────────────────
    grm += ((v.gradeFlx - 60) / 100) * 2.4;

    // ── Vessel delay ──────────────────────────────────────
    const vd = Math.max(0, boxMuller(v.vesselDelay, v.vesselDelay * 0.45));
    delay += vd;
    grm -= vd * 0.14;

    // ── Freight volatility ────────────────────────────────
    const fhit = boxMuller(0, v.freightVol / 100) * 18;
    grm += fhit > 0 ? -fhit * 0.09 : fhit * 0.04;

    // ── STS transfer ──────────────────────────────────────
    if (Math.random() < v.stsRisk / 100) {
      delay += Math.max(0, boxMuller(2.1, 0.7));
      grm -= 0.5;
    }

    // ── Charter market tightness ──────────────────────────
    if (v.charterTight > 65) {
      grm -= boxMuller(0.8, 0.3);
    } else if (v.charterTight > 80) {
      grm -= boxMuller(1.4, 0.4);
    }

    // ── Jetty / berth congestion ──────────────────────────
    delay += Math.max(0, boxMuller(v.jettyCong, v.jettyCong * 0.5));

    // ── Primary terminal downtime (SPM / jetty) ───────────
    if (Math.random() < v.spmDowntime / 100) {
      const outDays = clamp(boxMuller(10, 4), 2, 30);
      delay += outDays;
      grm -= boxMuller(1.5, 0.5);
      avail *= 1 - 0.1 * Math.random();
      const bufLeft = v.tankBuffer - delay;
      so =
        bufLeft < 3 ? 0.92 :
        bufLeft < 7 ? 0.48 :
        bufLeft < 12 ? 0.2 :
        bufLeft < 18 ? 0.07 : 0.02;
    }

    // ── Pipeline utilisation ──────────────────────────────
    if (v.pipeUtil > 90) {
      delay += Math.max(0, boxMuller(1.2, 0.4));
      grm -= 0.35;
    }

    // ── Tank buffer ───────────────────────────────────────
    const bufFactor = clamp(
      (v.tankBuffer - clamp(delay, 0, v.tankBuffer)) / v.tankBuffer,
      0,
      1
    );
    avail = clamp(avail * bufFactor * 0.3 + avail * 0.7, 15, 100);

    // ── Planned maintenance ───────────────────────────────
    if (Math.random() < v.maintenance / 365) {
      avail *= 0.88;
      delay += Math.max(0, boxMuller(3, 1.2));
    }

    // ── CDU over-utilisation penalty ─────────────────────
    if (v.cduUtil > 100) {
      grm -= boxMuller(0.7, 0.3);
    }

    availArr.push(clamp(avail, 15, 100));
    grmArr.push(clamp(grm, -16, 6));
    delayArr.push(clamp(delay, 0, 45));
    soArr.push(clamp(so, 0, 1));
  }

  return {
    avail: {
      mean: mean(availArr),
      p10: pct(availArr, 10),
      p50: pct(availArr, 50),
      p90: pct(availArr, 90),
      hist: histogram(availArr, 22, 15, 100),
    },
    grm: {
      mean: mean(grmArr),
      p10: pct(grmArr, 10),
      p50: pct(grmArr, 50),
      p90: pct(grmArr, 90),
      hist: histogram(grmArr, 22, -16, 6),
    },
    delay: {
      mean: mean(delayArr),
      p90: pct(delayArr, 90),
    },
    stockout: {
      mean: mean(soArr) * 100,
      p90: pct(soArr.map((v) => v * 100), 90),
    },
    trials: N,
    ranAt: new Date().toISOString(),
  };
}
