// Vercel entry for POST /api/explain. The logic lives in lib/explain.mjs
// so the Netlify entry (netlify/functions/explain.mjs) runs the same code.
import { handleExplain } from "../lib/explain.mjs";

export const maxDuration = 60;

export function POST(request) {
  return handleExplain(request);
}

export function GET(request) {
  return handleExplain(request); // answers 405
}
