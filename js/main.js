/* ==========================================================================
   ClearPath AI — main.js
   ------------------------------------------------------------------------
   Plain JavaScript, no build step and no external libraries — this file
   runs directly in the browser. It's split into small, commented pieces:

     1. Demo process data   — the information the rest of the app will use
     2. Mobile navigation    — opens/closes the menu on small screens
     3. Process card clicks  — remembers your choice + shows a status toast
     4. Footer year          — small nicety so the copyright stays current

   Nothing here reads or sends real personal data — everything is demo data
   that stays in your own browser (localStorage).
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. Demo process data
     This lives here (rather than scattered across the HTML) so that the
     next build step — the process overview pages — can reuse it instead
     of retyping it. Nothing on the homepage strictly needs this object
     yet, aside from remembering which card was clicked.
  ------------------------------------------------------------------ */
  const DEMO_PROCESSES = {
    scholarship: {
      name: "Scholarship Application",
      tagline: "Merit and need-based scholarships for undergraduate students.",
      estimatedPrepTime: "20–30 minutes",
      documentCount: 5,
    },
    admission: {
      name: "College Admission",
      tagline: "First-year undergraduate admission to a demo college.",
      estimatedPrepTime: "45–60 minutes",
      documentCount: 7,
    },
    certificate: {
      name: "College Certificate Request",
      tagline: "Bonafide, transfer, or course-completion certificates.",
      estimatedPrepTime: "10–15 minutes",
      documentCount: 3,
    },
  };

  /* ------------------------------------------------------------------
     2. Mobile navigation toggle
     The nav is a plain list of links. On small screens CSS hides it;
     this button shows/hides it and keeps aria-expanded in sync so
     screen readers announce the state correctly.
  ------------------------------------------------------------------ */
  function setupMobileNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    // Close the menu after choosing a link, so it doesn't stay open
    // after the page scrolls to the new section.
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  /* ------------------------------------------------------------------
     3. Process card clicks
     The overview/eligibility/documents pages haven't been built yet
     (this is intentionally step one of the project). For now, clicking
     "View process" saves the choice and shows an honest status message
     instead of a dead link or a silent failure.
  ------------------------------------------------------------------ */
  function setupProcessCards() {
    const buttons = document.querySelectorAll(".process-select");

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        const processId = button.getAttribute("data-process");
        const process = DEMO_PROCESSES[processId];
        if (!process) return;

        try {
          localStorage.setItem("clearpath:selectedProcess", processId);
        } catch (err) {
          // localStorage can fail in some private-browsing modes —
          // that's fine, the toast below still works without it.
        }

        showToast(
          process.name + " is selected. Its overview page is the next build step."
        );
      });
    });
  }

  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3200);
  }

  /* ------------------------------------------------------------------
     4. Footer year
  ------------------------------------------------------------------ */
  function setupFooterYear() {
    const el = document.getElementById("footerYear");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------
     Run everything once the page's HTML has loaded.
  ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    setupMobileNav();
    setupProcessCards();
    setupFooterYear();
  });
})();
