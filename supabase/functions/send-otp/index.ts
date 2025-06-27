
/******************************************************************
 *  Kigali Ride – WhatsApp OTP sender   (Template / 24-h safe)
 *  Uses template  "autho_rw"  (BODY + URL button)
 ******************************************************************/

import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
/* npm: loader ⇢ deno.json import map resolves this */
import { createClient } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* --- helper: SHA-256 hash (salted) ---------------------------- */
const sha256 = async (txt: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)),
    ),
  ).map((b) => b.toString(16).padStart(2, "0")).join("");

/* -------------------------------------------------------------- */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const { phone } = await req.json();
    if (!phone) {
      return new Response(JSON.stringify({ error: "phone required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    /* 1️⃣  Generate & store OTP */
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const code_hash = await sha256(`${otp  }salt_kigali_ride`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbErr } = await supabase.from("otps").insert({
      phone,
      code_hash,
      expires_at: new Date(Date.now() + 5 * 60_000).toISOString(), // +5 min
    });
    if (dbErr) {
      console.error("DB insert:", dbErr);
      return new Response(JSON.stringify({ error: "db insert failed" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    /* 2️⃣  Send WhatsApp template */
    const waRes = await fetch(
      "https://graph.facebook.com/v19.0/396791596844039/messages",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("WHATSAPP_API_TOKEN")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,            // +2507…
          type: "template",
          template: {
            name: "autho_rw",   // or ride_login_otp when live
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [{ type: "text", text: otp }],
              },
              {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [{ type: "text", text: otp }],
              },
            ],
          },
        }),
      },
    );

    const waJson = await waRes.json();
    console.log("WA reply:", waJson);
    if (!waRes.ok) {
      return new Response(JSON.stringify({ error: "wa send failed", waJson }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "server crash" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
