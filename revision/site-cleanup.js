(() => {
  "use strict";

  // The revision site changed substantially while being built. Clear the old
  // development/test progress once so stale XP or old self-marked exam data
  // cannot carry into the final student version.
  const MIGRATION_KEY = "stp-y10-revision-final-progress-v1";
  try {
    if (!localStorage.getItem(MIGRATION_KEY)) {
      state.checks = {};
      state.exam = {};
      state.xp = 0;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(MIGRATION_KEY, "done");
    }
  } catch {}

  function actualXP() {
    let total = 0;
    for (const id of Object.keys(modules)) {
      const topicChecks = state.checks?.[id] || {};
      total += Object.values(topicChecks).filter(item => item?.correct).length * 10;

      const topicExam = state.exam?.[id] || {};
      total += Object.values(topicExam).reduce((sum, item) => {
        const mark = Number(item?.mark || 0);
        return sum + Math.max(0, mark) * 5;
      }, 0);
    }
    return total;
  }

  function syncXP() {
    const total = actualXP();
    state.xp = total;
    const display = document.getElementById("xp-total");
    if (display && display.textContent !== String(total)) display.textContent = String(total);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function cleanText(value) {
    return String(value)
      .replace(/GCSE\s*[-–—]\s*style/gi, "exam-style")
      .replace(/GCSE\s+style/gi, "exam-style")
      .replace(/\bGCSE\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1");
  }

  function sanitise(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const next = cleanText(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    });

    if (root.querySelectorAll) {
      root.querySelectorAll("[title],[aria-label],[alt]").forEach(el => {
        ["title", "aria-label", "alt"].forEach(attr => {
          if (!el.hasAttribute(attr)) return;
          const next = cleanText(el.getAttribute(attr));
          if (next !== el.getAttribute(attr)) el.setAttribute(attr, next);
        });
      });
    }
  }

  // Keep XP tied to completed work rather than an accumulated/stale counter.
  const originalUpdateDashboard = updateDashboard;
  updateDashboard = function () {
    originalUpdateDashboard();
    syncXP();
    sanitise(document.body);
  };

  syncXP();
  sanitise(document.body);

  // Learn sections are swapped in-place, so clean any newly rendered text too.
  const observer = new MutationObserver(records => {
    for (const record of records) {
      record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) sanitise(node);
        if (node.nodeType === Node.TEXT_NODE) {
          const next = cleanText(node.nodeValue);
          if (next !== node.nodeValue) node.nodeValue = next;
        }
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
