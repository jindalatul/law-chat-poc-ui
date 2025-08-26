const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 2400;

// Load data once at startup (simple demo approach)
const cases = JSON.parse(fs.readFileSync(path.join(__dirname, "cases.json"), "utf8"));
const statutes = JSON.parse(fs.readFileSync(path.join(__dirname, "statutes.json"), "utf8"));

/**
 * Utility: pick up to N items from an array, optionally filtered by a predicate.
 * Falls back to first N if the filter returns fewer than N.
 */
function pickN(arr, n, predicate = null) {
  let pool = Array.isArray(arr) ? arr : [];
  if (predicate) {
    const filtered = pool.filter(predicate);
    if (filtered.length >= n) return filtered.slice(0, n);
  }
  return pool.slice(0, n);
}

/**
 * Build two argument points using selected statutes/cases.
 * This is deterministic demo logic — in a production app you could
 * generate richer arguments with templates or an LLM.
 */
function buildArguments(selectedStatutes, selectedCases) {
  const s1 = selectedStatutes[0];
  const s2 = selectedStatutes[1] || selectedStatutes[0];
  const c1 = selectedCases[0];
  const c2 = selectedCases[1] || selectedCases[0];

  return [
    {
      point:
        `Breach elements and timeliness: claim is supportable under ${s1?.title || "applicable limitations law"}; filing appears timely if within the stated period.`,
      support: [
        { type: "statute", ref: s1?.doc_id || null, citation: s1?.citation || null, url: s1?.url || null },
        { type: "case", ref: c1?.doc_id || null, title: c1?.title || null, url: c1?.url || null }
      ].filter(Boolean)
    },
    {
      point:
        `Damages/remedies: recovery should align with ${s2?.title || "applicable damages provision"}; facts in similar disputes (e.g., ${c2?.title || "a comparable case"}) support contract-based relief.`,
      support: [
        { type: "statute", ref: s2?.doc_id || null, citation: s2?.citation || null, url: s2?.url || null },
        { type: "case", ref: c2?.doc_id || null, title: c2?.title || null, url: c2?.url || null }
      ].filter(Boolean)
    }
  ];
}

/**
 * GET /api/research
 * Optional query params:
 *   - jurisdiction (e.g., "California", "Federal", "Texas")
 *   - case_type   (e.g., "contract dispute", "sales contracts")
 *
 * Returns:
 * {
 *   statutes: [ ...2 items... ],
 *   similar_cases: [ ...2 items... ],
 *   arguments: [ ...2 items... ],
 *   next_steps: [ ...list... ]
 * }
 */
app.get("/api/research", (req, res) => {
  const { jurisdiction, case_type } = req.query;

  // Filters
  const caseFilter = (c) =>
    (!jurisdiction || (c.jurisdiction || "").toLowerCase() === jurisdiction.toLowerCase()) &&
    (!case_type || (c.case_type || "").toLowerCase() === case_type.toLowerCase());

  const statuteFilter = (s) =>
    (!jurisdiction || (s.jurisdiction || "").toLowerCase() === jurisdiction.toLowerCase()) &&
    (!case_type || (s.case_type || "").toLowerCase() === case_type.toLowerCase());

  // Select 2 statutes and 2 cases
  const selectedStatutes = pickN(statutes, 2, statuteFilter);
  const selectedCases = pickN(cases, 2, caseFilter);

  // Build two argument points
  const argumentsList = buildArguments(selectedStatutes, selectedCases);

  // Simple, actionable next steps (generic workflow; not legal advice)
  const nextSteps = [
    "Assemble the written contract, amendments, and communications (emails, invoices, delivery proofs).",
    "Send a written demand with cure deadline; preserve evidence for potential litigation or arbitration.",
    "Check any arbitration/venue clause and verify limitation periods before filing.",
    "If unresolved, file in the proper court (or initiate arbitration) and prepare initial disclosures."
  ];

  res.json({
    query_used: { jurisdiction: jurisdiction || null, case_type: case_type || null },
    statutes: selectedStatutes.map(s => ({
      doc_id: s.doc_id, title: s.title, citation: s.citation, jurisdiction: s.jurisdiction, url: s.url
    })),
    similar_cases: selectedCases.map(c => ({
      doc_id: c.doc_id, title: c.title, jurisdiction: c.jurisdiction, case_type: c.case_type, url: c.url
    })),
    arguments: argumentsList,
    next_steps: nextSteps
  });
});

// Root for sanity check
app.get("/", (_req, res) => res.send("Legal Research API is running. Use /api/research"));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
