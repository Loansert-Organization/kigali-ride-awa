
/******************************************************************
 *  Kigali Ride – WhatsApp OTP verifier  (Edge Function, Deno + TS)
 *  • Confirms phone + code
 *  • Checks hash & expiry in table  `otps`
 *  • Creates / fetches user in Supabase Auth
 *  • Deletes used OTP row
 ******************************************************************/

import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
/* npm: loader  –  resolved via deno.json below */
import { createClient } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* tiny SHA-256 helper (same salt as send-otp) */
const sha256 = async (txt: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

/* neat JSON responder */
const j = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...cors, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { phone, code } = await req.json();
    if (!phone || !code) return j({ error: "phone & code required" }, 400);

    const clean = phone.replace(/\s+/g, "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    /* 1️⃣  pull latest OTP row */
    const { data: row } = await supabase
      .from("otps")
      .select("id, code_hash, expires_at, created_at")
      .eq("phone", clean)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) return j({ error: "no otp" }, 400);
    if (new Date() > new Date(row.expires_at)) return j({ error: "expired" }, 400);

    const hash = await sha256(`${code  }salt_kigali_ride`);
    if (hash !== row.code_hash) return j({ error: "invalid" }, 400);

    /* 2️⃣  upsert auth user */
    const { data: existing } = await supabase.auth.admin.getUserByPhone(clean);

    const userId =
      existing?.id ??
      (await supabase.auth.admin
        .createUser({ phone: clean, phone_confirm: true })).user!.id;

    /* 3️⃣  tidy table */
    await supabase.from("otps").delete().eq("id", row.id);

    return j({ success: true, user_id: userId });
  } catch (e) {
    console.error("verify-otp crash:", e);
    return j({ error: "server error" }, 500);
  }
});
