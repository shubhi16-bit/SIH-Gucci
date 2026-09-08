import React from 'react';
import { Compass, Layers, Activity, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function StreamlinedFeatures({ onOpenModal }) {
  const lifecycleSteps = [
    { num: "01", name: "Explore", q: "Where to drill?" },
    { num: "02", name: "Plan", q: "Optimal spacing?" },
    { num: "03", name: "Assess", q: "Depth-indexed hazards?" },
    { num: "04", name: "Monitor", q: "Replayed telemetry?" },
    { num: "05", name: "Evidence", q: "DDR incident archive" },
  ];

  return (
    <div className="streamlined-content-wrap">
      <section id="workflow" className="streamlined-section">
        <div className="container">
          {/* Section Header */}
          <div className="streamlined-header">
            <h2 className="streamlined-title">Continuous Decision Support Across the Well Lifecycle</h2>
            <p className="streamlined-sub">
              Turning 28 Volve well records and 1,604 historical Daily Drilling Reports into actionable engineering decisions before and during drilling.
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
                content: "Evaluates surface accessibility alongside subsurface offset well intelligence to rank candidate drilling locations.\n\n• Candidate LOC-1: 100/100 (Optimal spacing and offset cluster density)\n• Candidate LOC-2: 88/100 (Nearby offset well 15/9-19 A with low historical risk)\n• Candidate LOC-3: 74/100 (Boundary clearance verified)"
              })}
            >
              <div className="triad-icon-box">
                <Compass size={24} color="#8F7C3A" />
              </div>
              <span className="triad-num">PHASE 01 / EXPLORATION</span>
              <h3 className="triad-card-title">Candidate Location Ranking</h3>
              <p className="triad-card-desc">
                Generates and scores feasible drilling locations using spatial constraints and offset well density.
              </p>
              <div className="triad-pill-highlight">
                <CheckCircle2 size={13} color="#8F7C3A" />
                <span>Deterministic Scoring (0–100 Index)</span>
              </div>
              <div className="triad-link">
                <span>Inspect Planning Engine</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 2: Phase 2 */}
            <div 
              className="triad-card" 
              onClick={() => onOpenModal({
                title: "Phase 2: Offset Intelligence & Hazard Screening",
                subtitle: "Which offset wells are most comparable? — Multi-Factor Analogue Radar",
                content: "Scores offset wellbores across 5 weighted dimensions (geography, depth, formation, trajectory, context) against the proposed prospect.\n\n• 15/9-19 A: Weighted Similarity Index 66.5/100 (Encountered stuck pipe at 2,162m MD)\n• 15/9-F-11: Weighted Similarity Index 65.2/100 (Pack-off at 2,198m MD)\n• 15/9-F-4: Weighted Similarity Index 64.8/100 (Kick at 1,840m MD)"
              })}
            >
              <div className="triad-icon-box">
                <Layers size={24} color="#8F7C3A" />
              </div>
              <span className="triad-num">PHASE 02 / OFFSET INTELLIGENCE</span>
              <h3 className="triad-card-title">Analogue Radar &amp; DDR Archive</h3>
              <p className="triad-card-desc">
                Screens planned well depths against historical offset incident logs to identify and mitigate hazard intervals.
              </p>
              <div className="triad-pill-highlight">
                <CheckCircle2 size={13} color="#8F7C3A" />
                <span>28 Volve Wells Indexed</span>
              </div>
              <div className="triad-link">
                <span>View Offset Similarity</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 3: Phase 3 */}
            <div 
              className="triad-card" 
              onClick={() => onOpenModal({
                title: "Phase 3: Telemetry Replay & Drilling Parameter Monitor",
                subtitle: "What is happening now? — WITSML Telemetry Replay",
                content: "Replays standardized WITSML surface sensor streams (ROP 18 m/h, Bit Depth 2,145m, Torque 8.4 kN·m, SPP 14,150 kPa).\n\n• Anomaly Alert: Torque micro-spikes and deceleration matching pre-sticking signature in offset well 15/9-19 A [DDR Day 43 at 2,162m MD].\n• Actionable Guidance: Elevate pump rate to clear cuttings and maintain string rotation."
              })}
            >
              <div className="triad-icon-box">
                <Activity size={24} color="#8F7C3A" />
              </div>
              <span className="triad-num">PHASE 03 / DRILLING MONITOR</span>
              <h3 className="triad-card-title">WITSML Telemetry Replay</h3>
              <p className="triad-card-desc">
                Replays drilling telemetry with depth-synchronized hazard alerts grounded in historical DDR records.
              </p>
              <div className="triad-pill-highlight">
                <CheckCircle2 size={13} color="#8F7C3A" />
                <span>WITSML Replay + Historical DDR Records</span>
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
