// POST /api/explain — AI explanation of a property analysis.
//
// Body: { question: "explain" | "next", lang: "es" | "en", context: {...} }
// Header: Authorization: Bearer <Supabase access token>
//
// Only signed-in users, 20 per day: the user's own token calls
// claim_ai_credit() (db/migration_004_accounts.sql), which both proves the
// token is valid and enforces the limit. Claude only sees the findings the
// page already computed from public records and is told to explain them —
// never to add facts.

import Anthropic from "@anthropic-ai/sdk";

// Public values (same as js/data/supabaseClient.js); Row Level Security and
// claim_ai_credit() do the access control, not secrecy of these.
const SUPABASE_URL = "https://wwmunjpojzfjkketbpvl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bXVuanBvanpmamtrZXRicHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MjgyNDcsImV4cCI6MjEwNTUwNDI0N30.qwfIZT64_FAmq0n9tHGTbI-BPlf-uV8RtVuZnZFgVxk";

const MAX_CONTEXT_CHARS = 40000;

const SYSTEM = `You are Parcela's analyst for real estate development in Puerto Rico. You write for professional developers and investors.

You receive a property analysis that Parcela already built from public records: CRIM parcel data, the Planning Board's current zoning map, FEMA flood maps, and the Reglamento Conjunto 2023. Explain it; do not extend it.

Rules:
- Use only facts present in the analysis. Never add zoning rules, numbers, dates, agencies, costs, or legal conclusions that aren't in it. If something the reader would want isn't in the analysis, say it isn't covered and name the next step the analysis gives.
- Name the source when you state a fact (for example "según FEMA" / "per FEMA", "Reglamento Conjunto 2023, Tabla 6.14").
- Keep the analysis's own uncertainty: "estimate", "to confirm", "unknown" stay that way. This is a preliminary analysis, not a legal or professional determination.
- Plain, direct prose for a busy professional. Short paragraphs, no headings, no markdown tables, no bullet lists longer than five items. Under 250 words.
- Write in the language requested.`;

const QUESTIONS = {
  explain: {
    es: "Explica esta propiedad: qué significa la combinación de calificación, distrito actual, zona de inundación y capacidad estimada para el proyecto indicado, y qué es lo más importante que debo saber.",
    en: "Explain this property: what the combination of zoning, current district, flood zone, and estimated capacity means for the stated project, and the single most important thing I should know.",
  },
  next: {
    es: "¿Qué debo investigar primero y por qué? Ordena los pasos usando las incógnitas y los próximos pasos del análisis.",
    en: "What should I investigate first, and why? Order the steps using the analysis's unknowns and next actions.",
  },
};

const client = new Anthropic(); // ANTHROPIC_API_KEY from Netlify's environment

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return json({ error: "signed_out" }, 401);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const lang = body.lang === "en" ? "en" : "es";
  const question = QUESTIONS[body.question];
  const context = JSON.stringify(body.context || null);
  if (!question || !body.context || context.length > MAX_CONTEXT_CHARS) return json({ error: "bad_request" }, 400);

  // Claim a credit as the user. An invalid or expired token fails here.
  const claimRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/claim_ai_credit`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: "{}",
  }).catch(() => null);
  if (!claimRes) return json({ error: "unavailable" }, 502);
  if (claimRes.status === 401 || claimRes.status === 403) return json({ error: "signed_out" }, 401);
  if (!claimRes.ok) return json({ error: "unavailable" }, 502);
  const claim = await claimRes.json();
  if (!claim.allowed) return json({ error: "daily_limit", limit: claim.limit }, 429);

  let response;
  try {
    response = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "medium" },
      // On a safety decline, retry on Anthropic's recommended model for
      // that category instead of returning the refusal.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `<analysis>\n${context}\n</analysis>\n\nLanguage: ${lang === "es" ? "Spanish (Puerto Rico)" : "English"}\n\n${question[lang]}`,
        },
      ],
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: "busy" }, 503);
    if (err instanceof Anthropic.APIError) {
      console.error(`explain: Claude API ${err.status}: ${err.message}`);
      return json({ error: "unavailable" }, 502);
    }
    console.error("explain: unexpected", err);
    return json({ error: "unavailable" }, 502);
  }

  if (response.stop_reason === "refusal") return json({ error: "declined", remaining: claim.remaining }, 200);
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n\n")
    .trim();
  if (!text) return json({ error: "unavailable" }, 502);
  return json({ text, remaining: claim.remaining, limit: claim.limit });
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const config = { path: "/api/explain" };
