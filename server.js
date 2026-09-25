const express = require("express");
const path = require("path");
const { PROCESSES } = require("./rules");
const { evaluate } = require("./engine");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory audit log — every evaluation is recorded so an administrator
// can later see what was checked and what verdict was given. This is what
// "auditable, not a black box" actually means, not just a slide bullet.
const auditLog = [];

// GET /api/processes
// Returns the question sets WITHOUT weights or scores — the client only
// ever sees labels and options. The scoring logic never leaves the server.
app.get("/api/processes", (req, res) => {
  const publicView = Object.fromEntries(
    Object.entries(PROCESSES).map(([key, p]) => [
      key,
      {
        label: p.label,
        icon: p.icon,
        questions: p.questions.map((q) => ({
          id: q.id,
          label: q.label,
          why: q.why,
          options: q.options.map((o) => ({ value: o.value, label: o.label })),
        })),
      },
    ])
  );
  res.json(publicView);
});

// POST /api/evaluate/:processKey   body: { answers: { qId: value, ... } }
app.post("/api/evaluate/:processKey", (req, res) => {
  const process = PROCESSES[req.params.processKey];
  if (!process) return res.status(404).json({ error: "Unknown process" });

  const answers = req.body.answers || {};
  const result = evaluate(process, answers);

  auditLog.push({
    ts: new Date().toISOString(),
    process: req.params.processKey,
    answers,
    status: result.status,
    eligibilityScore: result.eligibilityScore,
    readinessScore: result.readinessScore,
  });

  res.json(result);
});

// GET /api/audit  — read-only view of everything evaluated this session.
// In production this would be admin-authenticated; exposed here for the demo.
app.get("/api/audit", (req, res) => {
  res.json({ count: auditLog.length, entries: auditLog.slice(-50) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Before You Apply backend running → http://localhost:${PORT}`);
});
