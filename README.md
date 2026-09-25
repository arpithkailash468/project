# Before You Apply — Backend

A real client-server version of the readiness wizard: Express REST API +
a generic weighted-scoring engine, with an in-memory audit log.

## Run it

```bash
npm install
npm start
```

Then open **http://localhost:3000** in a browser.

## Architecture

```
public/index.html   → frontend: fetches questions, POSTs answers, renders result
        │  fetch()
        ▼
server.js           → Express REST API
        │  calls
        ▼
engine.js            → generic weighted scoring engine (no per-process code)
        │  reads
        ▼
rules.js             → JSON-like rule store: one object per process
```

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/processes` | Question sets only — no weights or scores are ever sent to the client |
| POST | `/api/evaluate/:key` | Body `{ answers: {...} }` → returns eligibility score, readiness score, verdict, time estimate, document checklist, and a per-question breakdown |
| GET | `/api/audit` | Last 50 evaluations run this session — the audit trail |

## Scoring model

Each process defines questions on two independent axes:

- **eligibility** — do the rules say you qualify at all?
- **readiness** — are your documents/logistics actually in order?

Each answer contributes a weighted 0–1 score to its axis. Any answer marked
`blocking: true` (e.g. unpaid fees, an active backlog) overrides everything:
the result is a hard "Blocked" regardless of the numeric score, because a
blocker is a rule violation, not a matter of degree.

Adding a new process (e.g. passport, visa) means adding one object to
`rules.js`. The engine and API never change.
