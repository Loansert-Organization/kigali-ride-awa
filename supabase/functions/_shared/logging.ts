// Lightweight Sentry + Logflare helpers for Supabase Edge Functions
// SENTRY_DSN, LOGFLARE_API_KEY, LOGFLARE_SOURCE_ID must be set as secrets

import * as Sentry from "https://esm.sh/@sentry/deno@7.100.1";

const SENTRY_DSN = Deno.env.get("SENTRY_DSN");
const LOGFLARE_API_KEY = Deno.env.get("LOGFLARE_API_KEY");
const LOGFLARE_SOURCE_ID = Deno.env.get("LOGFLARE_SOURCE_ID");

if (SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.1 });
}

export function captureError(err: unknown, context?: Record<string, unknown>) {
  try {
    if (SENTRY_DSN) {
      Sentry.captureException(err, { extra: context });
    }
    if (LOGFLARE_API_KEY && LOGFLARE_SOURCE_ID) {
      fetch("https://api.logflare.app/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": LOGFLARE_API_KEY,
        },
        body: JSON.stringify({ source: LOGFLARE_SOURCE_ID, metadata: context ?? {}, message: String(err) }),
      }).catch(() => {/* ignore */});
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Logging failed", e);
  }
}

export function logInfo(message: string, metadata: Record<string, unknown> = {}) {
  if (LOGFLARE_API_KEY && LOGFLARE_SOURCE_ID) {
    fetch("https://api.logflare.app/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": LOGFLARE_API_KEY,
      },
      body: JSON.stringify({ source: LOGFLARE_SOURCE_ID, message, metadata }),
    }).catch(() => {/* ignore */});
  } else {
    console.log(message, metadata);
  }
} 