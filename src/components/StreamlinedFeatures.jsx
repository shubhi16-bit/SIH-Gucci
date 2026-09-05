import React, { useState, useEffect } from 'react';
import { Compass, Database, Activity, ShieldAlert, ArrowRight, Play, Pause, FileText, Send } from 'lucide-react';

export default function StreamlinedFeatures({ onOpenModal }) {
  // Telemetry state for interactive demo
  const [depth, setDepth] = useState(1842);
  const [isPlaying, setIsPlaying] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState("");

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setDepth(d => parseFloat((d + 0.5).toFixed(1)));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="streamlined-content-wrap">
      {/* 1. Core Capabilities: 3 Focused Cards */}
      <section id="features" className="streamlined-section">
        <div className="container">
          <div className="streamlined-header">
            <span className="streamlined-tag">Unified Platform Capabilities</span>
            <h2 className="streamlined-title">From Pre-Spud Planning to Real-Time Telemetry</h2>
            <p className="streamlined-sub">
              A continuous decision-support workflow combining historical well data, geospatial constraints, and live WITSML sensor streams.
            </p>
          </div>

          <div className="cards-triad-grid">
            {/* Card 1 */}
            <div className="triad-card" onClick={() => onOpenModal({
              title: "Candidate Well Planning",
              subtitle: "Geospatial Surface + Subsurface Analysis",
              content: "Evaluate candidate locations (A/B/C) with composite suitability scores, trajectory anti-collision rules, and terrain constraints."
            })}>
              <div className="triad-icon-box">
                <Compass size={24} color="#8F7C3A" />
              </div>
              <span className="triad-num">01 / PLANNING</span>
              <h3 className="triad-card-title">Candidate Location Ranking</h3>
              <p className="triad-card-desc">
                Automated multi-factor suitability scoring combining 2D/3D trajectory feasibility, target formation depths, and exclusion zones.
              </p>
              <div className="triad-link">
                <span>Inspect Candidate Engine</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 2 */}
            <div className="triad-card" onClick={() => onOpenModal({
              title: "Offset Intelligence Engine",
              subtitle: "Subsurface Analogue Matching",
              content: "Correlates lithology, pore pressure regimes, and depth overlap across Volve Field and BSEE historical archives."
            })}>
              <div className="triad-icon-box">
                <Database size={24} color="#8F7C3A" />
              </div>
              <span className="triad-num">02 / OFFSET INTEL</span>
              <h3 className="triad-card-title">Analogue Well Correlation</h3>
              <p className="triad-card-desc">
                Weighted similarity matching (Formation 30%, Depth 25%, Trajectory 20%) to identify proven analogues and historic hazard intervals.
              </p>
              <div className="triad-link">
                <span>View Analogue Matching</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 3 */}
            <div className="triad-card" onClick={() => onOpenModal({
              title: "WITSML Live Telemetry & Risk Alerts",
              subtitle: "High-Frequency Surface Sensor Replay",
              content: "Replays standardized WITSML 1.4/2.0 drilling feeds, compares real-time parameters with historical loss zones, and issues early alerts."
            })}>
              <div className="triad-icon-box">
                <Activity size={24} color="#8F7C3A" />
              </div>
              <span className="triad-num">03 / MONITORING</span>
              <h3 className="triad-card-title">Real-Time Risk Forecast</h3>
              <p className="triad-card-desc">
                Early anomaly detection for mud losses, stuck pipe, and pressure kicks—backed by auditable Daily Drilling Report (DDR) citations.
              </p>
              <div className="triad-link">
                <span>Launch Telemetry HUD</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Compact Interactive Telemetry & Evidence HUD */}
      <section id="telemetry" className="streamlined-section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="compact-hud-box">
            <div className="compact-hud-top">
              <div>
                <div className="compact-hud-title">
                  <Activity size={18} color="#8F7C3A" style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                  <span>WITSML Telemetry & Risk Replay</span>
                  <span className="compact-badge">VOLVE 15/9-F-1</span>
                </div>
                <div className="compact-hud-desc">
                  Simulating active drilling telemetry calibrated against historical well data.
                </div>
              </div>

              <button 
                className="btn btn-hud-play"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? "Pause Stream" : "Start Live Stream"}</span>
              </button>
            </div>

            {/* Metric Gauges Grid */}
            <div className="compact-gauges-row">
              <div className="compact-gauge">
                <div className="gauge-label">BIT DEPTH</div>
                <div className="gauge-val">{depth} <span className="gauge-unit">m MD</span></div>
              </div>
              <div className="compact-gauge">
                <div className="gauge-label">RATE OF PENETRATION</div>
                <div className="gauge-val">12.4 <span className="gauge-unit">m/h</span></div>
              </div>
              <div className="compact-gauge">
                <div className="gauge-label">SURFACE TORQUE</div>
                <div className="gauge-val">24.2 <span className="gauge-unit">kN·m</span></div>
              </div>
              <div className="compact-gauge">
                <div className="gauge-label">STANDPIPE PRESSURE</div>
                <div className="gauge-val">8,200 <span className="gauge-unit">kPa</span></div>
              </div>
              <div className="compact-gauge">
                <div className="gauge-label">RISK CLASSIFICATION</div>
                <div className="gauge-val" style={{ color: '#F59E0B' }}>MEDIUM <span className="gauge-unit">● Alert 58m Ahead</span></div>
              </div>
            </div>

            {/* Auditable Evidence Citation Bar */}
            <div className="compact-evidence-bar">
              <div className="evidence-text">
                <FileText size={16} color="#8F7C3A" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Ground Truth Evidence:</strong> DDR #43 in offset well 15/9-19 A reported 35 bbl/hr mud loss at 2,840m.
                </span>
              </div>
              <button 
                className="btn-evidence-link"
                onClick={() => onOpenModal({
                  title: "Daily Drilling Report #43 (Volve Field)",
                  subtitle: "Auditable Ground Truth Incident Record",
                  content: "Losses observed while drilling 12-1/4\" hole section at 2,840m MD. 50 bbl high-viscosity LCM pill pumped; full returns regained after 2.5 hours."
                })}
              >
                View Full DDR Report
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Ask NWIS Quick Query Interface */}
      <section id="assistant" className="streamlined-section" style={{ paddingTop: 20, paddingBottom: 70 }}>
        <div className="container">
          <div className="compact-ask-box">
            <div className="ask-header-row">
              <div>
                <h3 className="ask-title">Ask NWIS Drilling Intelligence</h3>
                <p className="ask-subtitle">Query historical offset well logs, formations, and drilling incidents in natural language.</p>
              </div>
            </div>

            <form 
              className="ask-input-row"
              onSubmit={(e) => {
                e.preventDefault();
                onOpenModal({
                  title: "NWIS Drilling Intelligence Assistant",
                  subtitle: `Query: "${assistantQuery || "Which offset wells had mud losses near 2,500m?"}"`,
                  content: "Searching 1,420 Daily Drilling Reports and Volve Field formation logs. Found 3 matching offset well incidents with verified DDR citations."
                });
              }}
            >
              <input
                type="text"
                placeholder="E.g. Which offset wells experienced lost circulation between 2,200m and 2,500m?"
                value={assistantQuery}
                onChange={(e) => setAssistantQuery(e.target.value)}
                className="ask-input"
              />
              <button type="submit" className="btn btn-ask-submit">
                <Send size={15} />
                <span>Ask NWIS</span>
              </button>
            </form>

            <div className="prompt-chips-row">
              <span className="chips-label">SUGGESTIONS:</span>
              {[
                "Which offset wells had lost circulation near 2,500m?",
                "Why is Candidate B ranked highest?",
                "What is the expected pore pressure in Forties Sand?"
              ].map((sug, i) => (
                <button
                  key={i}
                  className="prompt-chip"
                  onClick={() => {
                    setAssistantQuery(sug);
                    onOpenModal({
                      title: "NWIS Query Result",
                      subtitle: sug,
                      content: "Context: Active exploration block in Volve Field. Retrieved 3 direct DDR citations and 2 directional survey analogues."
                    });
                  }}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
