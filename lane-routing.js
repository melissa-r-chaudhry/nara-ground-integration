/**
 * Nara Ground — Care Corps Lane Routing Logic
 *
 * Input: volunteer_interests (array of strings from intake form)
 * Output: { primaryLane, secondaryLane }
 *
 * Paste into an n8n Code node. Access inputs via:
 *   const interests = $input.first().json.volunteer_interests;
 */

// ---------------------------------------------------------------------------
// Mapping: intake form choice → lane
// null = context-dependent or flexible (doesn't count toward any lane tally)
// ---------------------------------------------------------------------------
const INTEREST_TO_LANE = {
  // Shield — direct voter contact and field presence
  "Canvassing":                                                "Shield",
  "Phone banking":                                             "Shield",
  "Text banking":                                              "Shield",
  // Flyering WITHOUT conversations: introvert-friendly outdoor work (lit drops,
  // parking lots, street parking). Pure Shield — no social pressure required.
  "Flyering (without conversations)":                          "Shield",
  // Flyering WITH conversations: talking to business proprietors, asking them to
  // post flyers — hybrid Shield/Spark. Counts Shield; multilingual volunteers
  // flagged separately for high-value immigrant corridor assignments.
  "Flyering (with conversations)":                             "Shield",
  "Tabling":                                                   "Shield",
  "Event support":                                             "Shield",
  "Setting out yard signs & banners":                          "Shield",
  "Driving delivery (yard signs, flyers for volunteers, etc)": "Shield",
  "Voter registration / Get Out The Vote":                     "Shield",

  // Spark — recruitment, hosting, relationship-building
  "Hosting a small gathering":                                 "Spark",
  "Recruiting friends or neighbors":                           "Spark",

  // Signal — amplification, content, systems, admin
  "Social Media (sharing, promotion, comms)":                  "Signal",
  "Social Media (content creation, videos, etc)":              "Signal",
  "Technical support":                                         "Signal",
  "Graphic design / photo / video / content help":             "Signal",
  "Admin / office help":                                       "Signal",

  // Context-dependent — don't count toward lane tally; flag for manual review.
  // "Translation / multilingual outreach" is special: if volunteer also selected
  // "Flyering (with conversations)", they become high-priority for immigrant
  // corridor canvassing assignments regardless of their primary lane.
  "Translation / multilingual outreach":                       null,
  "I'm not sure yet, help me find the best fit.":              null,
  "I can help occasionally, wherever's needed.":               null,
  "I have a lot of time and want to be deeply involved.":      null,
  "Other":                                                     null,
};

// Tie-breaking priority when counts are equal
const LANE_PRIORITY = ["Shield", "Spark", "Signal"];

function routeLanes(interests) {
  const tally = { Signal: 0, Shield: 0, Spark: 0 };
  let needsManualReview = false;

  for (const interest of interests) {
    const lane = INTEREST_TO_LANE[interest];
    if (lane === null || lane === undefined) {
      // Unrecognized or context-dependent
      if (interest && INTEREST_TO_LANE[interest] === null) needsManualReview = true;
    } else {
      tally[lane]++;
    }
  }

  const totalSignals = tally.Signal + tally.Shield + tally.Spark;

  // No mappable interests — needs manual assignment
  if (totalSignals === 0) {
    return { primaryLane: null, secondaryLane: null, needsManualReview: true };
  }

  // Sort lanes by count, then by priority order for tie-breaking
  const ranked = LANE_PRIORITY
    .map(lane => ({ lane, count: tally[lane] }))
    .sort((a, b) => b.count - a.count || LANE_PRIORITY.indexOf(a.lane) - LANE_PRIORITY.indexOf(b.lane));

  const primaryLane   = ranked[0].count > 0 ? ranked[0].lane : null;
  const secondaryLane = ranked[1].count > 0 ? ranked[1].lane : null;

  // Flag multilingual corridor priority: volunteer selected BOTH
  // "Translation / multilingual outreach" AND "Flyering (with conversations)"
  // → high-value assignment for immigrant-heavy business corridors
  const multilingualCorridorPriority =
    interests.includes("Translation / multilingual outreach") &&
    interests.includes("Flyering (with conversations)");

  return { primaryLane, secondaryLane, needsManualReview, multilingualCorridorPriority };
}

// ---------------------------------------------------------------------------
// n8n Code node — runs once for each item
// ---------------------------------------------------------------------------
const interests = $input.first().json.volunteer_interests ?? [];
const { primaryLane, secondaryLane, needsManualReview, multilingualCorridorPriority } = routeLanes(interests);

return [{
  json: {
    ...$input.first().json,
    primaryLane,
    secondaryLane,
    needsManualReview,
    multilingualCorridorPriority,
  }
}];
