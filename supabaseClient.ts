import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // This only throws in the browser console during local dev if .env.local isn't set up yet.
  console.warn(
    "Supabase env vars are missing. Copy .env.local.example to .env.local and fill in your project details."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
