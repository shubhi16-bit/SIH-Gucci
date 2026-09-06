export const LIFECYCLE_STAGES = [
  {
    step: "01",
    phase: "Explore",
    title: "Where should we drill?",
    description: "Regional geospatial mapping, satellite accessibility filters, and candidate location scouting.",
    badge: "Geospatial Surface + Subsurface",
    color: "#534831",
    points: [
      "Polygon-based prospect area selection",
      "Terrain, surface water & road obstacle avoidance",
      "Proximity to existing well infrastructure"
    ]
  },
  {
    step: "02",
    phase: "Plan",
    title: "Which well plan is safest?",
    description: "Multi-factor candidate ranking (A/B/C), offset well similarity matching, and 2D/3D trajectory feasibility.",
    badge: "Candidate Ranking Engine",
    color: "#8F7C3A",
    points: [
      "Composite Suitability Score (0-100%)",
      "Anti-collision & exclusion zone verification",
      "Weighted geological & depth compatibility"
    ]
  },
  {
    step: "03",
    phase: "Predict",
    title: "What risks lie ahead?",
    description: "Depth-correlated historical drilling problems: mud loss, stuck pipe, kicks, and pack-offs.",
    badge: "Risk Forecast & Correlation",
    color: "#A85530",
    points: [
      "Depth-correlated hazard mapping (±50m)",
      "Daily Drilling Report (DDR) citation links",
      "Multi-well incident clustering"
    ]
  },
  {
    step: "04",
    phase: "Drill",
    title: "What is happening now?",
    description: "Historical WITSML 1.4/2.0 telemetry playback with live parameter tracking & early anomaly warnings.",
    badge: "WITSML Telemetry Replay",
    color: "#5E2A25",
    points: [
      "Real-time ROP, WOB, RPM, Torque, SPP, Flow",
      "Synchronized time & depth playback controls",
      "Pre-incident alert threshold detection"
    ]
  },
  {
    step: "05",
    phase: "Learn",
    title: "What did we learn?",
    description: "Completed well logs and validated drilling events are fed back into institutional memory.",
    badge: "Continuous Feedback Loop",
    color: "#734F31",
    points: [
      "Automated event validation & cataloging",
      "Enriches similarity graph for future projects",
      "Permanent institutional engineering memory"
    ]
  }
];

export const CANDIDATES_DATA = [
  {
    id: "B",
    name: "Candidate W-02B",
    recommended: true,
    score: 88,
    targetDepth: "3,200 m",
    targetFormation: "Forties Sandstone",
    trajectoryFeasibility: 94,
    offsetEvidence: 89,
    historicalRiskScore: 24, // low risk
    surfaceAccessibility: 91,
    existingOffsetCount: 5,
    distanceToOffset: "2.1 km",
    pros: [
      "4 highly comparable historical wells drilled without severe incidents",
      "Target formation encountered with high net-to-gross pay in nearby 15/9-19 A",
      "Low structural dip angle allowing gradual 24° deviation build",
      "Direct pipeline access corridor within 800m"
    ],
    concerns: [
      "Minor pore pressure escalation recorded below 2,850m in offset 15/9-F-4"
    ]
  },
  {
    id: "A",
    name: "Candidate W-01A",
    recommended: false,
    score: 74,
    targetDepth: "3,150 m",
    targetFormation: "Horda Formation",
    trajectoryFeasibility: 82,
    offsetEvidence: 81,
    historicalRiskScore: 42, // medium risk
    surfaceAccessibility: 76,
    existingOffsetCount: 4,
    distanceToOffset: "3.2 km",
    pros: [
      "Proximity to legacy production platform",
      "Proven seal integrity across overlying caprock"
    ],
    concerns: [
      "Intersects complex fault boundary with potential differential sticking",
      "Higher surface slope requires additional rig pad leveling"
    ]
  },
  {
    id: "C",
    name: "Candidate W-03C",
    recommended: false,
    score: 67,
    targetDepth: "3,400 m",
    targetFormation: "Skade Formation",
    trajectoryFeasibility: 71,
    offsetEvidence: 74,
    historicalRiskScore: 61, // high risk
    surfaceAccessibility: 88,
    existingOffsetCount: 2,
    distanceToOffset: "4.5 km",
    pros: [
      "Excellent surface logistics and road access"
    ],
    concerns: [
      "Severe lost circulation zone encountered at 2,240m in nearest offset well",
      "Sparse historical offset calibration below 3,000m TVD"
    ]
  }
];

export const OFFSET_WELLS = [
  {
    id: "15/9-19 A",
    field: "Volve Field",
    similarity: 91,
    formation: "Forties",
    td: "3,200 m",
    waterDepth: "86 m",
    eventsCount: 4,
    topEvent: "Pack-off at 2,120 m",
    weights: { formation: 30, depth: 25, trajectory: 20, location: 15, wellType: 10 }
  },
  {
    id: "15/9-19 B",
    field: "Volve Field",
    similarity: 87,
    formation: "Forties / Horda",
    td: "3,120 m",
    waterDepth: "86 m",
    eventsCount: 3,
    topEvent: "Mud Losses at 2,850 m",
    weights: { formation: 28, depth: 25, trajectory: 18, location: 16, wellType: 10 }
  },
  {
    id: "15/9-F-4",
    field: "Volve Field",
    similarity: 83,
    formation: "Forties",
    td: "3,450 m",
    waterDepth: "88 m",
    eventsCount: 2,
    topEvent: "Kick detected at 1,840 m",
    weights: { formation: 29, depth: 22, trajectory: 17, location: 15, wellType: 10 }
  }
];

export const TELEMETRY_INITIAL = {
  well: "15/9-F-1 (Replay)",
  depth: 1842,
  rop: 12.4,
  wob: 8.7,
  rpm: 120,
  torque: 24.2,
  spp: 8200,
  flow: 1100,
  formation: "Forties Formation",
  riskLevel: "MEDIUM",
  alerts: [
    {
      id: 1,
      type: "warning",
      title: "Approaching Historical Loss Zone",
      details: "58m ahead (at ~1,900m). 3 offset wells (15/9-19 A, B) reported fluid loss.",
      severity: "High"
    }
  ]
};

export const EVIDENCE_SAMPLE = {
  wellId: "15/9-19 A",
  depth: "2,840 m",
  incident: "Lost Circulation",
  source: "Daily Drilling Report (DDR) #43",
  date: "2008-04-12",
  excerpt: "While drilling 12-1/4\" hole at 2,840m MD, sudden loss of returns observed (35 bbl/hr). Standpipe pressure dropped by 450 psi. Mixed and pumped 50 bbl high-viscosity LCM pill. Regained full returns after 2.5 hours.",
  provenance: "Directly Reported in Source DDR",
  confidence: "98% Ground Truth"
};

export const ASSISTANT_SUGGESTIONS = [
  "Which offset wells had lost circulation between 2,200m and 2,500m?",
  "Why is Candidate W-02B ranked higher than Candidate W-01A?",
  "What risks should we prepare for in the Forties formation?",
  "Compare drilling torque trends in 15/9-19 A vs our current plan."
];
