/**
 * SCORING ENGINE
 * --------------
 * Generic — this file has zero knowledge of "scholarship" or "hostel".
 * It only knows how to read a process definition from rules.js and a set
 * of answers, and produce a scored verdict. Adding a new process never
 * touches this file.
 *
 * Algorithm:
 *   1. Split questions by axis ("eligibility" / "readiness").
 *   2. For each axis: score = Σ(weight_i * optionScore_i) / Σ(weight_i) * 100
 *   3. If ANY answered option has blocking:true, eligibility is forced to
 *      a hard "blocked" state regardless of the numeric score — a blocker
 *      is a rule violation, not a matter of degree.
 *   4. Map the final eligibility score to a verdict tier.
 *   5. Compute a time estimate: base time + a penalty for low readiness.
 *   6. Build the document checklist, flagging any doc whose trigger
 *      condition was met (e.g. "income cert not ready").
 */

function scoreAxis(questions, answers, axis) {
  const qs = questions.filter((q) => q.axis === axis);
  let totalWeight = 0;
  let weightedSum = 0;
  let blocked = false;
  const breakdown = [];

  for (const q of qs) {
    const answerVal = answers[q.id];
    const opt = q.options.find((o) => o.value === answerVal);
    if (!opt) continue; // unanswered — excluded from the average, not penalized
    totalWeight += q.weight;
    weightedSum += q.weight * opt.score;
    if (opt.blocking) blocked = true;
    breakdown.push({
      question: q.label,
      answer: opt.label,
      weight: q.weight,
      contribution: Math.round(opt.score * 100),
    });
  }

  const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : null;
  return { score, blocked, breakdown };
}

function verdictTier(eligibilityScore, blocked) {
  if (blocked) return { status: "blocked", label: "Blocked by a hard requirement" };
  if (eligibilityScore === null) return { status: "incomplete", label: "Answer all questions to see your result" };
  if (eligibilityScore >= 75) return { status: "eligible", label: "Likely eligible" };
  if (eligibilityScore >= 45) return { status: "borderline", label: "Borderline — confirm with your department" };
  return { status: "unlikely", label: "Unlikely to qualify as answered" };
}

function estimateTime(baseTimeMinutes, readinessScore) {
  if (readinessScore === null) return `~${baseTimeMinutes} min`;
  // Below 100% readiness, add time proportional to how much is missing —
  // a simple, explainable linear penalty rather than a fixed lookup table.
  const penalty = Math.round(((100 - readinessScore) / 100) * baseTimeMinutes * 1.5);
  const total = baseTimeMinutes + penalty;
  return penalty > 0 ? `~${total} min (incl. ${penalty} min for missing items)` : `~${total} min`;
}

function buildChecklist(docs, answers) {
  return docs.map((d) => {
    const flagged = d.triggerQ ? answers[d.triggerQ] === d.triggerVal && d.flagIfTrue : false;
    return { label: d.label, flagged };
  });
}

function evaluate(process, answers) {
  const elig = scoreAxis(process.questions, answers, "eligibility");
  const ready = scoreAxis(process.questions, answers, "readiness");
  const verdict = verdictTier(elig.score, elig.blocked);

  return {
    status: verdict.status,
    statusLabel: verdict.label,
    eligibilityScore: elig.score,
    readinessScore: ready.score,
    breakdown: { eligibility: elig.breakdown, readiness: ready.breakdown },
    time: estimateTime(process.baseTimeMinutes, ready.score),
    docs: buildChecklist(process.docs, answers),
  };
}

module.exports = { evaluate };
