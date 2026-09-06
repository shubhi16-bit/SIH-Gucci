import React, { useState } from 'react';
import { 
  Database, 
  GitCompare, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Activity, 
  FileText 
} from 'lucide-react';

export default function OffsetIntelligence({ project, onOpenModal }) {
  const [selectedWellId, setSelectedWellId] = useState("15/9-19 A");

  const similarWells = [
    {
      id: "15/9-19 A",
      similarity: 89,
      formation: "Forties Sandstone",
      depthOverlap: "91%",
      trajectory: "Similar (24° build section)",
      eventsCount: 3,
      topEvent: "Stuck Pipe — 2,162m",
      eventSeverity: "high",
      factors: {
        formation: 95,
        depth: 88,
        trajectory: 82,
        location: 76,
        drillingProfile: 84
      },
      summary: "High Net-to-Gross Paleocene reservoir analogue with identical lithology contacts and mud weight pressure profile."
    },
    {
      id: "15/9-F-5",
      similarity: 82,
      formation: "Forties Sandstone",
      depthOverlap: "85%",
      trajectory: "Parallel build-and-hold",
      eventsCount: 0,
      topEvent: "Clean drilling run to TD",
      eventSeverity: "safe",
      factors: {
        formation: 92,
        depth: 84,
        trajectory: 80,
        location: 74,
        drillingProfile: 81
      },
      summary: "Production well drilled with synthetic-based mud. Encountered zero differential sticking or lost circulation intervals."
    },
    {
      id: "15/9-F-7",
      similarity: 76,
      formation: "Hugin / Forties",
      depthOverlap: "78%",
      trajectory: "High inclination (32°)",
      eventsCount: 1,
      topEvent: "Mud Loss — 1,900m",
      eventSeverity: "med",
      factors: {
        formation: 78,
        depth: 75,
        trajectory: 73,
        location: 78,
        drillingProfile: 76
      },
      summary: "Offset reservoir appraisal well. Experienced micro-fracture fluid losses in upper transition zone at 1,900m MD."
    }
  ];

  const currentWell = similarWells.find(w => w.id === selectedWellId) || similarWells[0];

  return (
    <div className="offset-intel-layout">
      {/* 1. Header & Current Well Context Banner */}
      <div className="offset-header-block">
        <div className="ohb-left">
          <span className="ohb-tag">ANALOGUE MATCHING ENGINE</span>
          <h2 className="ohb-title">Offset Intelligence &amp; Well Similarity</h2>
          <p className="ohb-sub">
            Multi-dimensional feature scoring across lithology, pore pressure, trajectory curvature, and depth interval overlap.
          </p>
        </div>

        {/* Current Well Context Pill */}
        <div className="current-well-context-card">
          <div className="cwc-label">CURRENT ACTIVE WELL</div>
          <div className="cwc-id">{project?.name || '15/9-F-1'}</div>
          <div className="cwc-specs">
            <span>Depth: <strong>2,150 m</strong></span>
            <span>&bull;</span>
            <span>Formation: <strong>Forties Sandstone</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="offset-2col-grid">
        {/* Left Column: Top Similar Wells */}
        <div className="offset-col-left">
          <div className="col-section-header">
            <span className="csh-title">TOP SIMILAR WELLS</span>
            <span className="csh-count">{similarWells.length} High Analogues</span>
          </div>

          <div className="similar-cards-stack">
            {similarWells.map((well) => {
              const isSelected = well.id === selectedWellId;
              const isHighDanger = well.eventSeverity === 'high';

              return (
                <div
                  key={well.id}
                  className={`similar-well-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedWellId(well.id)}
                >
                  <div className="swc-top">
                    <div className="swc-id-col">
                      <h4 className="swc-well-id">{well.id}</h4>
                      <span className="swc-formation-tag">{well.formation}</span>
                    </div>

                    <div className="swc-score-badge">
                      <span className="swc-score-num">{well.similarity}%</span>
                      <span className="swc-score-lbl">SIMILARITY</span>
                    </div>
                  </div>

                  <div className="swc-metrics-row">
                    <div className="swc-metric">
                      <span className="m-lbl">Depth overlap</span>
                      <span className="m-val">{well.depthOverlap}</span>
                    </div>
                    <div className="swc-metric">
                      <span className="m-lbl">Trajectory</span>
                      <span className="m-val">{well.trajectory}</span>
                    </div>
                    <div className="swc-metric">
                      <span className="m-lbl">Historical Events</span>
                      <span className="m-val">{well.eventsCount} Recorded</span>
                    </div>
                  </div>

                  {/* Primary Event Flag */}
                  <div className={`swc-event-banner banner-${well.eventSeverity}`}>
                    <AlertTriangle size={14} />
                    <span>{well.topEvent}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: "Why Similar?" Explainable Factor Model */}
        <div className="offset-col-right">
          <div className="col-section-header">
            <span className="csh-title">WHY SIMILAR? EXPLAINABLE FACTORS</span>
            <span className="csh-sub">Grounded In Multi-Parameter Correlation</span>
          </div>

          <div className="explainable-model-card">
            <div className="emc-header">
              <div>
                <h3 className="emc-well-title">{currentWell.id} Analogue Breakdown</h3>
                <p className="emc-well-sub">{currentWell.summary}</p>
              </div>
              <div className="emc-total-pill">
                <span>Overall:</span>
                <strong>{currentWell.similarity}%</strong>
              </div>
            </div>

            {/* Factor Bars */}
            <div className="factors-bars-stack">
              {/* Formation */}
              <div className="factor-bar-row">
                <div className="fbr-info">
                  <span className="fbr-label">Formation &amp; Lithology</span>
                  <span className="fbr-val">{currentWell.factors.formation}%</span>
                </div>
                <div className="fbr-track">
                  <div className="fbr-fill fill-gold" style={{ width: `${currentWell.factors.formation}%` }} />
                </div>
              </div>

              {/* Depth */}
              <div className="factor-bar-row">
                <div className="fbr-info">
                  <span className="fbr-label">Depth Interval Overlap</span>
                  <span className="fbr-val">{currentWell.factors.depth}%</span>
                </div>
                <div className="fbr-track">
                  <div className="fbr-fill fill-gold" style={{ width: `${currentWell.factors.depth}%` }} />
                </div>
              </div>

              {/* Trajectory */}
              <div className="factor-bar-row">
                <div className="fbr-info">
                  <span className="fbr-label">Trajectory &amp; Dogleg Profile</span>
                  <span className="fbr-val">{currentWell.factors.trajectory}%</span>
                </div>
                <div className="fbr-track">
                  <div className="fbr-fill fill-gold" style={{ width: `${currentWell.factors.trajectory}%` }} />
                </div>
              </div>

              {/* Location */}
              <div className="factor-bar-row">
                <div className="fbr-info">
                  <span className="fbr-label">Geographic &amp; Structural Proximity</span>
                  <span className="fbr-val">{currentWell.factors.location}%</span>
                </div>
                <div className="fbr-track">
                  <div className="fbr-fill fill-gold" style={{ width: `${currentWell.factors.location}%` }} />
                </div>
              </div>

              {/* Drilling Profile */}
              <div className="factor-bar-row">
                <div className="fbr-info">
                  <span className="fbr-label">Drilling Telemetry &amp; WOB/RPM Profile</span>
                  <span className="fbr-val">{currentWell.factors.drillingProfile}%</span>
                </div>
                <div className="fbr-track">
                  <div className="fbr-fill fill-gold" style={{ width: `${currentWell.factors.drillingProfile}%` }} />
                </div>
              </div>
            </div>

            {/* Highlighted Warning for Selected Analogue */}
            {currentWell.id === '15/9-19 A' && (
              <div className="analogue-incident-dossier">
                <div className="aid-head">
                  <AlertTriangle size={16} color="#EF4444" />
                  <strong>CRITICAL HISTORICAL LESSON (DDR #43)</strong>
                </div>
                <p className="aid-text">
                  Offset 15/9-19 A suffered complete differential sticking at 2,162m MD due to permeable sandstone drawdown and stationary drillstring during survey. 
                  Recommended mitigation: maintain continuous pipe rotation and reduce overbalance margin.
                </p>
              </div>
            )}

            <button 
              className="btn btn-primary btn-view-dossier"
              onClick={() => onOpenModal({
                title: `Analogue Well Dossier: ${currentWell.id}`,
                subtitle: `Similarity Match: ${currentWell.similarity}% • Formation: ${currentWell.formation}`,
                content: `Displaying full composite well log and engineering history for ${currentWell.id}.\n\n• Spud Date: 2008-03-04\n• Total Depth (TD): 3,240m MD\n• Mud Program: 1.28 SG KCl Polymer Mud\n• Bit Record: 12-1/4" PDC Bit run #3 (averaged 22 m/h)\n• Non-Productive Time (NPT): 28.5 hours total (Jarring & freeing differential sticking at 2,162m).`
              })}
            >
              <FileText size={16} />
              <span>Inspect Full Historical Offset Dossier</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
