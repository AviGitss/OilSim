# OpenNEtrikkan — Crude Availability Simulator

A production-grade Monte Carlo simulation application for upstream crude supply chain modelling. Built for executive decision-makers at oil & gas companies.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel |

---

## Quick Start (Local)

### 1. Clone and install

```bash
git clone https://github.com/your-org/opennetrikkan-simulator.git
cd opennetrikkan-simulator
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials (see Supabase Setup below).

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the Supabase dashboard, go to **SQL Editor**
3. Paste and run the contents of `supabase/schema.sql`
4. Copy your project credentials from **Project Settings → API** into `.env.local`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Where to find it | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon / public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role key | Yes |

> **Security**: The service role key is used only in API routes (server-side). It is never exposed to the browser.

---

## Deploy to Vercel

### Option A — Vercel Dashboard (recommended)

**Critical order — do this before the first deploy:**

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. **Before clicking Deploy**, scroll down to **Environment Variables** on the same import screen
4. Add all three variables there:

   | Name | Value | Environments |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Production, Preview, Development |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Production only |

5. Now click **Deploy**

> **If you already deployed without the env vars:** Go to **Project → Settings → Environment Variables**, add them, then go to **Deployments → ⋯ → Redeploy**. A redeploy is required — Vercel bakes `NEXT_PUBLIC_` vars into the JS bundle at build time, so adding them after the fact has no effect until you rebuild.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login

# Add env vars FIRST — before the first deploy
vercel env add NEXT_PUBLIC_SUPABASE_URL
# paste your Supabase project URL, select all environments

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# paste your anon key, select all environments

vercel env add SUPABASE_SERVICE_ROLE_KEY
# paste your service role key, select Production only

# Now deploy
vercel --prod
```

### Custom domain

In the Vercel dashboard: **Project → Settings → Domains** → add `simulator.opennetrikkan.com` (or your preferred subdomain). Update your DNS CNAME to point to `cname.vercel-dns.com`.

---

## Database Schema

Two tables are created by `supabase/schema.sql`:

### `leads`
Stores every registration. Fields: `id`, `name`, `email`, `company`, `title`, `phone`, `created_at`.

Email is upserted — if the same email re-registers, their details update but a duplicate row is not created.

### `simulation_runs`
Stores every simulation execution, linked to the lead. Fields: `id`, `lead_id`, `params` (JSONB), `results` (JSONB), `avail_mean`, `grm_mean`, `delay_mean`, `stockout_mean`, `trials`, `ran_at`.

### Viewing leads

In the Supabase dashboard → **Table Editor** → `leads`, or use the convenience view:

```sql
SELECT * FROM public.leads_with_run_count;
```

This shows each lead with their total run count, last run time, and average simulation results.

### Export leads to CSV

In Supabase SQL Editor:

```sql
COPY (SELECT name, email, company, title, phone, created_at FROM public.leads ORDER BY created_at DESC)
TO STDOUT WITH CSV HEADER;
```

Or use the **Table Editor → Export** button in the Supabase dashboard.

---

## Project Structure

```
opennetrikkan-simulator/
├── app/
│   ├── api/
│   │   ├── leads/route.ts      # POST /api/leads — save registration
│   │   └── runs/route.ts       # POST /api/runs — save simulation run
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Root SPA — orchestrates all screens
├── components/
│   ├── RegisterGate.tsx        # Registration form (screen 1)
│   ├── SimulatorPanel.tsx      # Parameter controls (screen 2)
│   ├── ResultsPanel.tsx        # Results dashboard (screen 3)
│   ├── Slider.tsx              # Parameter slider with label + description
│   └── KpiCard.tsx             # Headline metric card
├── lib/
│   ├── params.ts               # All 20 simulation parameters + groups
│   ├── simulation.ts           # Monte Carlo engine (2000 trials)
│   └── supabase.ts             # Supabase client (browser + server)
├── types/
│   └── index.ts                # Shared TypeScript types
├── supabase/
│   └── schema.sql              # Run once in Supabase SQL Editor
├── .env.local.example
├── vercel.json
└── README.md
```

---

## Simulation Parameters

The engine models 20 parameters across 4 upstream supply chain stages:

### Crude Sourcing
- Active crude grades in basket
- Spot contract share
- **Reserve block release probability** ← key differentiator
- Geopolitical disruption probability
- Sanctioned-origin exposure

### Maritime & Freight
- Mean vessel delay
- Freight rate volatility
- STS transfer dependency
- Charter market tightness

### Port & Terminal
- Jetty/berth average wait time
- Primary terminal downtime (SPM/jetty)
- Onshore pipeline utilisation
- Tank farm inventory buffer

### Refinery Configuration
- CDU utilisation target
- Crude grade flexibility index
- Planned maintenance window
- Secondary unit availability

---

## Simulation Engine

Each run executes 2,000 Monte Carlo trials. Each trial independently samples:
- Bernoulli events (reserve block release, geopolitical disruption, STS transfer, terminal downtime, planned maintenance)
- Normal distributions (vessel delay, freight impact, congestion wait)
- Compounding effects (tank buffer depletion, grade flexibility GRM benefit)

Outputs per run:
- **Crude availability at CDU gate** — % of planned throughput (P10/P50/P90 + full histogram)
- **GRM impact vs plan** — $/bbl delta (P10/P90 + histogram)
- **Expected voyage delay** — days (mean + P90)
- **Stock-out risk** — % probability

---

## Lead Capture Logic

- Registration is required before accessing the simulator
- Email is upserted — returning users update their record, not duplicate it
- Every simulation run is logged against the lead's `id`
- The `leads_with_run_count` view gives instant engagement metrics
- All PII is protected by Row Level Security — only the service role can read leads

---

## Customisation

### Change default parameter values
Edit `lib/params.ts` — each parameter has a `def` field.

### Add a new parameter
1. Add the parameter object to the relevant group in `lib/params.ts`
2. Add its simulation logic to `lib/simulation.ts`
3. Add its risk driver card to `components/ResultsPanel.tsx`

### Change branding
- Logo/name: edit `app/layout.tsx` (metadata) and the footer text in components
- Colors: edit `tailwind.config.ts` — the `lav` palette drives the entire UI
- Fonts: swap `DM_Sans` and `DM_Serif_Display` in `app/layout.tsx`

---

## Support

contact@opennetrikkan.com
