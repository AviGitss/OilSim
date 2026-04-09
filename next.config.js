/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Validate required env vars at build time so Vercel fails fast with a
  // clear message rather than a cryptic runtime crash.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;
