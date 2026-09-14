/**
 * Mock document intelligence. There's no real OCR/parsing here (same
 * honesty stance as V1's parcel-upload stub) — the user tags a document
 * with its type on upload, and this returns type-appropriate canned
 * findings framed as what an AI reading that kind of document would
 * plausibly flag, plus which roadmap requirements it affects.
 */
window.PARCELA_DOCUMENT_ENGINE = (function () {
  const TABLE = {
    deed: {
      extracted: ["Confirmed ownership record on file.", "No liens noted on this document — a full title search is still recommended for certainty."],
      requirements: []
    },
    plan: {
      extracted: ["Detected architectural floor plans.", "Unit count and layout appear consistent with the chosen scenario."],
      requirements: ["Plans available for engineering review"]
    },
    survey: {
      extracted: ["Lot boundary and frontage confirmed.", "No encroachments detected on adjoining parcels.", "Setback from existing structures measured."],
      requirements: ["Boundary requirement satisfied for design", "Setback data now available for permit preparation"]
    },
    estimate: {
      extracted: ["Detected a cost estimate.", "Recommend logging this amount under Budget for range comparison."],
      requirements: ["Estimate available for budget comparison"]
    },
    "government-letter": {
      extracted: ["This reads as correspondence from a permitting or regulatory agency.", "May contain a correction request or a newly added requirement."],
      requirements: ["Review for a correction request", "Confirm response deadline, if any", "Check whether a specific document is being requested"]
    },
    permit: {
      extracted: ["Detected what looks like an issued permit or approval document."],
      requirements: ["Related roadmap step can likely move to Approved"]
    },
    "contractor-proposal": {
      extracted: ["Detected a contractor bid.", "Breakdown appears to cover materials, labor, and utilities."],
      requirements: ["Materials estimate available for budget comparison", "Labor estimate available for budget comparison", "Utilities estimate available for budget comparison"]
    },
    inspection: {
      extracted: ["Detected an inspection report.", "Check whether any items were flagged for correction."],
      requirements: ["Confirm whether any inspection items need correction"]
    }
  };
  const TYPE_LABELS = {
    deed: "Deed", plan: "Plans", survey: "Survey", estimate: "Estimate",
    "government-letter": "Government letter", permit: "Permit", "contractor-proposal": "Contractor proposal", inspection: "Inspection document"
  };

  function process(type) {
    const entry = TABLE[type] || { extracted: ["Document received — nothing specific detected for this type yet."], requirements: [] };
    const n = entry.requirements.length;
    return {
      extracted: entry.extracted, requirements: entry.requirements,
      message: n ? `I found ${n} requirement${n === 1 ? "" : "s"} that affect your project.` : "Added to your documents — nothing new for the roadmap from this one."
    };
  }

  return { process, TYPE_LABELS };
})();
