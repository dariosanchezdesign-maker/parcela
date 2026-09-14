/**
 * Project Copilot. Rule-based over live project state — not a live LLM
 * call (see the architecture note in tasks/todo.md). Answers the example
 * prompts from the brief plus close variants, always by reading the
 * project's actual data rather than generic advice.
 */
window.PARCELA_COPILOT = (function () {
  const RULES = [
    { test: /next|what should i do/i, answer: (ctx) => `${ctx.nextMove.headline} ${ctx.nextMove.detail}` },
    { test: /blocking|blocked|stuck/i, answer: (ctx) => {
        const blocked = ctx.roadmap.filter((s) => s.blocked && s.status !== "approved");
        if (!blocked.length) return "Nothing is currently blocked — the roadmap is moving.";
        return "Here's what's blocked right now: " + blocked.map((s) => `"${s.label}" is waiting on ${s.dependsOn.join(", ")}.`).join(" ");
      } },
    { test: /document.*missing|missing.*document/i, answer: (ctx) => {
        const actionable = ctx.roadmap.filter((s) => !s.blocked && s.status !== "approved" && s.docsRequired && s.docsRequired.length);
        if (!actionable.length) return "I don't see any outstanding document gaps on steps that are actionable right now.";
        return actionable.map((s) => `For "${s.label}": ${s.docsRequired.join(", ")}.`).join(" ");
      } },
    { test: /start construction|begin construction|can i build/i, answer: (ctx) => {
        if (ctx.workspace.status === "build" || ctx.workspace.status === "complete") return "You're already in Build Mode — construction is underway.";
        const core = ctx.roadmap.filter((s) => s.id !== "final-inspection");
        const remaining = core.filter((s) => s.status !== "approved");
        if (!remaining.length) return "All permitting steps are approved — you're clear to start construction.";
        return `Not yet — ${remaining.length} step${remaining.length === 1 ? "" : "s"} still need approval first: ${remaining.map((s) => s.label).join(", ")}.`;
      } },
    { test: /budget|how much/i, answer: (ctx) => `Based on current ranges, this project is estimated between $${ctx.budgetSummary.totalRangeMin.toLocaleString()} and $${ctx.budgetSummary.totalRangeMax.toLocaleString()}. You have $${ctx.budgetSummary.totalAccepted.toLocaleString()} in accepted estimates logged so far — treat both as ranges, not a fixed number.` },
    { test: /hire|who do i need|professional/i, answer: (ctx) => {
        const unassigned = ctx.roadmap.filter((s) => s.professionalCategory && !ctx.workspace.assignments[s.id] && s.status !== "approved");
        const uniqueCats = [...new Set(unassigned.map((s) => s.professionalCategory))];
        if (!uniqueCats.length) return "Every remaining step already has a professional assigned.";
        return `Based on your roadmap, you'll likely need: ${uniqueCats.join(", ")}.`;
      } },
    { test: /changed|since last|this week|last week/i, answer: (ctx) => {
        if (!ctx.changesSince.length) return "Nothing new since your last visit.";
        return "Since your last visit: " + ctx.changesSince.slice(0, 5).map((a) => a.text).join(" ");
      } }
  ];

  const QUICK_PROMPTS = [
    "What do I need to do next?", "What is blocking my project?", "What documents are missing?",
    "Can I start construction?", "How much should I budget?", "Who do I need to hire?", "What changed since last week?"
  ];

  function ask(question, ctx) {
    const rule = RULES.find((r) => r.test.test(question));
    if (rule) return rule.answer(ctx);
    return "I can help with what's next, what's blocking you, missing documents, budget, who to hire, or what's changed recently — try one of the quick prompts, or check the relevant section in the sidebar. I organize and explain your project's data; I'm not a substitute for your architect, engineer, or attorney.";
  }

  return { ask, QUICK_PROMPTS };
})();
