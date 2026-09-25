/**
 * RULE STORE
 * ----------
 * Every process is pure data: an id, a label, and a list of questions.
 * Each question belongs to one of two independent SCORING AXES:
 *
 *   "eligibility" — do the rules say you qualify at all?
 *   "readiness"   — even if you qualify, are your documents/logistics in order?
 *
 * We keep these separate on purpose: a student can be fully ELIGIBLE but not
 * yet READY (missing a certificate), or ready-looking but not eligible
 * (perfect paperwork, active backlog). Collapsing both into one yes/no
 * hides exactly the information this tool exists to surface.
 *
 * Each answer option carries:
 *   score      -> 0.0-1.0, how favorably this answer contributes to its axis
 *   blocking   -> true means this single answer overrides everything: the
 *                 process is a hard "Blocked" regardless of total score.
 *
 * Adding a brand-new process (passport, visa, internship) means adding one
 * new object to this file. The scoring engine in engine.js never changes.
 */

const PROCESSES = {
  scholarship: {
    label: "Merit Scholarship Application",
    icon: "🎓",
    questions: [
      {
        id: "cgpa",
        axis: "eligibility",
        weight: 60,
        label: "What is your current CGPA?",
        why: "Merit scholarships set a minimum CGPA band — checking this first avoids a rejected application.",
        options: [
          { value: "8plus", label: "8 and above", score: 1.0 },
          { value: "7to8", label: "7 to 8", score: 0.6 },
          { value: "below7", label: "Below 7", score: 0.0 },
        ],
      },
      {
        id: "backlog",
        axis: "eligibility",
        weight: 40,
        label: "Do you have any active backlogs?",
        why: "Active backlogs are a hard disqualifier for every merit category we checked.",
        options: [
          { value: "no", label: "No", score: 1.0, blocking: false },
          { value: "yes", label: "Yes", score: 0.0, blocking: true },
        ],
      },
      {
        id: "income",
        axis: "readiness",
        weight: 100,
        label: "Is your family income certificate ready?",
        why: "This is the single most common missing document, and the slowest one to obtain.",
        options: [
          { value: "yes", label: "Yes, I have it", score: 1.0 },
          { value: "no", label: "Not yet", score: 0.3 },
        ],
      },
    ],
    baseTimeMinutes: 20,
    docs: [
      { key: "income_cert", label: "Income certificate (Tahsildar / e-Seva)", triggerQ: "income", triggerVal: "no", flagIfTrue: true },
      { key: "marksheet", label: "Latest semester mark sheet" },
      { key: "aadhaar", label: "Aadhaar card copy" },
      { key: "bank", label: "Bank passbook first page" },
    ],
  },

  hostel: {
    label: "Hostel Room Allotment",
    icon: "🏠",
    questions: [
      {
        id: "distance",
        axis: "eligibility",
        weight: 60,
        label: "How far is your home from campus?",
        why: "Hostel priority is primarily distance-based under the current allotment policy.",
        options: [
          { value: "far", label: "More than 50 km", score: 1.0 },
          { value: "mid", label: "10 to 50 km", score: 0.6 },
          { value: "near", label: "Under 10 km", score: 0.25 },
        ],
      },
      {
        id: "year",
        axis: "eligibility",
        weight: 40,
        label: "Which year are you in?",
        why: "First-years and final-years fall into different priority windows.",
        options: [
          { value: "final", label: "Final year", score: 1.0 },
          { value: "first", label: "1st year", score: 0.8 },
          { value: "mid", label: "2nd / 3rd year", score: 0.5 },
        ],
      },
      {
        id: "medical",
        axis: "readiness",
        weight: 100,
        label: "Do you need a ground-floor / AC room for a medical reason?",
        why: "Medical accommodation needs a separate certificate and adds a review step.",
        options: [
          { value: "no", label: "No", score: 1.0 },
          { value: "yes", label: "Yes", score: 0.4 },
        ],
      },
    ],
    baseTimeMinutes: 15,
    docs: [
      { key: "photo", label: "Passport-size photo" },
      { key: "parent_id", label: "Parent ID proof" },
      { key: "fee_receipt", label: "Fee payment receipt" },
      { key: "medical_cert", label: "Medical certificate", triggerQ: "medical", triggerVal: "yes", flagIfTrue: true },
    ],
  },

  exam: {
    label: "Semester Exam Registration",
    icon: "📝",
    questions: [
      {
        id: "fees",
        axis: "eligibility",
        weight: 70,
        label: "Are your semester fees fully paid?",
        why: "Unpaid dues are a hard block on registration — this is the #1 cause of last-minute rejections.",
        options: [
          { value: "yes", label: "Yes", score: 1.0, blocking: false },
          { value: "no", label: "Pending", score: 0.0, blocking: true },
        ],
      },
      {
        id: "attendance",
        axis: "eligibility",
        weight: 30,
        label: "Is your attendance above 75%?",
        why: "Below this you can still register, but only via a condonation form.",
        options: [
          { value: "yes", label: "Yes", score: 1.0 },
          { value: "no", label: "No", score: 0.4 },
        ],
      },
      {
        id: "arrears",
        axis: "readiness",
        weight: 100,
        label: "Do you also have arrear subjects to register for?",
        why: "Arrears need a separate attached form — the most commonly forgotten step.",
        options: [
          { value: "no", label: "No", score: 1.0 },
          { value: "yes", label: "Yes", score: 0.5 },
        ],
      },
    ],
    baseTimeMinutes: 10,
    docs: [
      { key: "attendance_form", label: "Attendance condonation form (HOD signature)", triggerQ: "attendance", triggerVal: "no", flagIfTrue: true },
      { key: "fee_receipt", label: "Fee payment receipt" },
      { key: "arrear_form", label: "Arrear registration form", triggerQ: "arrears", triggerVal: "yes", flagIfTrue: true },
    ],
  },
};

module.exports = { PROCESSES };
