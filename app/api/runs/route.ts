import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { SimResults, SimValues } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, params, results, label }: {
      userId: string;
      params: SimValues;
      results: SimResults;
      label?: string;
    } = body;

    if (!userId || !params || !results) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Use service role to bypass RLS for server-side insert
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { error } = await db.from("simulation_runs").insert({
      user_id:        userId,
      label:          label || null,
      params,
      results,
      avail_mean:     parseFloat(results.avail.mean.toFixed(2)),
      grm_mean:       parseFloat(results.grm.mean.toFixed(3)),
      delay_mean:     parseFloat(results.delay.mean.toFixed(2)),
      stockout_mean:  parseFloat(results.stockout.mean.toFixed(2)),
      trials:         results.trials,
      ran_at:         results.ranAt,
    });

    if (error) {
      console.error("Run insert error:", error);
      return NextResponse.json({ saved: false, error: error.message }, { status: 200 });
    }

    return NextResponse.json({ saved: true }, { status: 200 });
  } catch (err) {
    console.error("Runs API error:", err);
    return NextResponse.json({ saved: false }, { status: 200 });
  }
}
