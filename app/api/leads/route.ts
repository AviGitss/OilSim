import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  // Check env vars first — gives a clear error instead of a cryptic crash
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Server misconfigured: Supabase env vars missing. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel settings, then redeploy." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, company, title, phone } = body;

    if (!name?.trim() || !email?.trim() || !company?.trim()) {
      return NextResponse.json(
        { error: "Name, email and company are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const db = getSupabaseAdmin();

    // Check if email already exists — if so, just return that lead
    const { data: existing } = await db
      .from("leads")
      .select("id, name, email, company")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ lead: existing }, { status: 200 });
    }

    // New lead — insert
    const { data, error } = await db
      .from("leads")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company.trim(),
        title: title?.trim() || null,
        phone: phone?.trim() || null,
      })
      .select("id, name, email, company")
      .single();

    if (error) {
      console.error("Supabase lead upsert error:", error);
      return NextResponse.json(
        { error: `Database error: ${error.message} (code: ${error.code})` },
        { status: 500 }
      );
    }

    return NextResponse.json({ lead: data }, { status: 200 });
  } catch (err) {
    console.error("Lead API error:", err);
    return NextResponse.json(
      { error: "Unexpected error. Please try again." },
      { status: 500 }
    );
  }
}
