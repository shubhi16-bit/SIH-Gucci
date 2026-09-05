import React from 'react';
import { Compass, Layers, Activity, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function StreamlinedFeatures({ onOpenModal }) {
  const lifecycleSteps = [
    { num: "01", name: "Explore", q: "Where to drill?" },
    { num: "02", name: "Plan", q: "Safest trajectory?" },
    { num: "03", name: "Predict", q: "Offset hazards?" },
    { num: "04", name: "Drill", q: "Live telemetry?" },
    { num: "05", name: "Learn", q: "Institutional memory" },
  ];

  return (
    <div className="streamlined-content-wrap">
      <section id="workflow" className="streamlined-section">
        <div className="container">
          {/* Section Header */}
          <div className="streamlined-header">
            <h2 className="streamlined-title">Continuous Decision Support Across the Well Lifecycle</h2>
            <p className="streamlined-sub">
              Turning historical drilling experience and geospatial intelligence into actionable decisions before and during drilling.
            </p>
          </div>

          {/* 5-Stage Lifecycle Ribbon */}
          <div className="lifecycle-chain-bar">
            {lifecycleSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="lifecycle-chip">
                  <span className="chip-num">{step.num}</span>
                  <span className="chip-name">{step.name}</span>
                  <span className="chip-q">({step.q})</span>
                </div>
                {idx < lifecycleSteps.length - 1 && (
                  <ChevronRight size={16} className="lifecycle-arrow" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* 3 Core Phase Cards */}
          <div id="phases" className="cards-triad-grid">
            {/* Card 1: Phase 1 */}
            <div 
              className="triad-card" 
              onClick={() => onOpenModal({
                title: "Phase 1: Candidate Location Ranking",
                subtitle: "Where should we drill? — Multi-Factor Suitability Scoring",
                content: "Evaluates surface accessibility (roads, terrain, water bodies, infrastructure) alongside subsurface offset well intelligence to rank candidate drilling locations.\n\n• Candidate A: 78/100 (Moderate offset similarity)\n• Candidate B: 88/100 (RECOMMENDED — 4 comparable offset wells, low historical risk, high surface access)\n• Candidate C: 71/100 (Infrastructure constraints)"
              })}
            >
              <div className="triad-icon-box">
                <Compass size={24} color="#8F7C3A" />
              </div>
              <span className="triad-num">PHASE 01 / EXPLORATION</span>
              <h3 className="triad-card-title">Candidate Location Ranking</h3>
              <p className="triad-card-desc">
                Combines surface accessibility and subsurface history to score and rank drilling locations.
              </p>
              <div className="triad-pill-highlight">
                <CheckCircle2 size={13} color="#8F7C3A" />
                <span>Recommendation: Candidate B (88/100)</span>
              </div>
              <div className="triad-link">
                <span>Inspect Candidate Engine</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 2: Phase 2 */}
            <div 
              className="triad-card" 
              onClick={() => onOpenModal({
                title: "Phase 2: Trajectory & Risk Screening",
                subtitle: "Which path is safest? — Proactive Hazard Avoidance",
                content: "Screens the proposed 3D trajectory against historical risk zones before spudding. Overlays lithology and pore pressure data from Volve Field & BSEE analogues.\n\n• Trajectory A: Intersects historical stuck-pipe zone at 2,420m (3 offset incidents).\n• Trajectory B (Adjusted): Re-routed 60m east — historical risk reduced to LOW."
              })}
            >
              <div className="triad-icon-box">
                <Layers size={24} color="#8F7C3A" />
              </div>
              <span className="triad-num">PHASE 02 / WELL PLANNING</span>
              <h3 className="triad-card-title">Trajectory & Offset Hazards</h3>
              <p className="triad-card-desc">
                Screens planned well paths against analogue well logs to identify and avoid hazard intervals.
              </p>
              <div className="triad-pill-highlight">
                <CheckCircle2 size={13} color="#8F7C3A" />
                <span>3 Analogues Correlated (Volve Field)</span>
              </div>
              <div className="triad-link">
                <span>View Trajectory Risk</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 3: Phase 3 */}
            <div 
              className="triad-card" 
              onClick={() => onOpenModal({
                title: "Phase 3: Live Telemetry & Institutional Memory",
                subtitle: "What is happening now & what did we learn? — WITSML Replay",
                content: "Simulates high-frequency WITSML surface sensor streams (ROP 12.4 m/h, Bit Depth 1,842m, Torque 24.2 kN·m, SPP 8,200 kPa).\n\n• Live Alert: Potential mud loss approaching 58m ahead calibrated against DDR #43 in offset well 15/9-19 A.\n• Memory Loop: Validated post-well drilling events are fed directly back into institutional memory for future wells."
              })}
            >
              <div className="triad-icon-box">
                <Activity size={24} color="#8F7C3A" />
              </div>
              <span className="triad-num">PHASE 03 / DRILLING & MEMORY</span>
              <h3 className="triad-card-title">Live Telemetry & Knowledge Loop</h3>
              <p className="triad-card-desc">
                Replays standardized WITSML sensor streams with depth-synchronized alerts.
              </p>
              <div className="triad-pill-highlight">
                <CheckCircle2 size={13} color="#8F7C3A" />
                <span>WITSML Replay + Institutional Loop</span>
              </div>
              <div className="triad-link">
                <span>Launch Telemetry Replay</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
