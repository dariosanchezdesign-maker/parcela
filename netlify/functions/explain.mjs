// Netlify entry for POST /api/explain. The logic lives in lib/explain.mjs
// so the Vercel entry (api/explain.js) runs the same code.
import { handleExplain } from "../../lib/explain.mjs";

export default handleExplain;

export const config = { path: "/api/explain" };
