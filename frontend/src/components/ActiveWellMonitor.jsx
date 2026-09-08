import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Activity, 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  ChevronRight, 
  FileText, 
  Sparkles, 
  Compass, 
  Layers, 
  Maximize2 
} from 'lucide-react';

export default function ActiveWellMonitor({ project, onOpenModal, onOpenAIDrawer, onNavigateToOffsets }) {
  const { well } = useParams();
  const activeWellName = well || project?.name || '15/9-F-1';

  // Channel toggle state for the parameter chart
  const [activeChannel, setActiveChannel] = useState('Torque'); // 'ROP' | 'WOB' | 'RPM' | 'Torque' | 'Pressure' | 'Flow' | 'Hookload'

  const channelConfigs = {
    ROP: { label: 'ROP', unit: 'm/h', color: '#10B981', current: '18 m/h', alertVal: 'Rapid decrease (tight hole)' },
    WOB: { label: 'WOB', unit: 'kkgf', color: '#3B82F6', current: '12 kkgf', alertVal: 'Weight transfer degradation' },
    RPM: { label: 'RPM', unit: 'RPM', color: '#8B5CF6', current: '120', alertVal: 'Minor stick-slip oscillation' },
    Torque: { label: 'Torque', unit: 'kN·m', color: '#EF4444', current: '8 kN·m', alertVal: 'ERRATIC SPIKE @ 2,145m' },
    Pressure: { label: 'Standpipe Pressure', unit: 'kPa', color: '#F59E0B', current: '14,000 kPa', alertVal: 'Pressure cycling +450 kPa' },
    Flow: { label: 'Flow Out', unit: 'L/min', color: '#06B6D4', current: '1,150 L/min', alertVal: 'Steady return' },
    Hookload: { label: 'Hookload', unit: 'klbf', color: '#EC4899', current: '185 klbf', alertVal: 'Overpull detected on reaming' }
  };

  const channelDataPoints = [
    { depth: 2000, ROP: 24, WOB: 10, RPM: 125, Torque: 4.8, Pressure: 13200 },
    { depth: 2030, ROP: 22, WOB: 11, RPM: 122, Torque: 5.1, Pressure: 13350 },
    { depth: 2060, ROP: 21, WOB: 11, RPM: 120, Torque: 5.4, Pressure: 13500 },
    { depth: 2090, ROP: 19, WOB: 12, RPM: 120, Torque: 6.2, Pressure: 13700 },
    { depth: 2120, ROP: 17, WOB: 12, RPM: 118, Torque: 7.0, Pressure: 13900 },
    { depth: 2140, ROP: 15, WOB: 13, RPM: 115, Torque: 8.4, Pressure: 14150 }, // ALERT REGION
    { depth: 2150, ROP: 18, WOB: 12, RPM: 120, Torque: 8.0, Pressure: 14000 }
  ];

  return (
    <div className="active-monitor-layout">
      {/* 1. Command Center Top Bar */}
      <div className="monitor-command-header">
        <div className="mch-left">
          <span className="well-id-badge">{activeWellName}</span>
          <span className="mch-title">DRILLING MONITOR</span>
          <span className="live-stream-badge">
            <span className="stream-dot" />
            <span>WITSML TELEMETRY REPLAY</span>
          </span>
        </div>

        <div className="mch-right">
          <div className="risk-level-banner risk-high">
            <span className="risk-icon">🔴</span>
            <span className="risk-text">ELEVATED OFFSET HAZARD CORRELATION</span>
          </div>
        </div>
      </div>

      {/* 2. Core 2x2 Command Grid */}
      <div className="monitor-quad-grid">
        {/* Quad 1: Well Map */}
        <div className="quad-card quad-map">
          <div className="quad-head">
            <div className="quad-title-wrap">
              <MapPin size={16} color="#8F7C3A" />
              <span>WELL MAP &amp; OFFSET CLUSTER</span>
            </div>
            <span className="quad-sub-badge">59°17' N &bull; 01°51' E</span>
          </div>

          <div className="quad-map-stage">
            <svg viewBox="0 0 360 220" className="quad-map-svg">
              <defs>
                <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />

              {/* Bathymetry / Formation contour lines */}
              <path d="M 10 70 Q 180 50 350 110" fill="none" stroke="rgba(143,124,58,0.18)" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 10 130 Q 180 110 350 170" fill="none" stroke="rgba(143,124,58,0.18)" strokeWidth="1.5" strokeDasharray="4 4" />
              
              {/* Fault line danger corridor */}
              <path d="M 120 10 L 260 210" fill="none" stroke="rgba(239,68,68,0.25)" strokeWidth="2" strokeDasharray="3 3" />
              <text x="245" y="200" fill="rgba(239,68,68,0.6)" fontSize="9" fontFamily="monospace">FAULT PLANE 1</text>

              {/* Offset Wells (●) */}
              <g className="map-node" transform="translate(90, 70)">
                <circle r="6" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="10" y="4" fill="#A1A1AA" fontSize="10" fontFamily="monospace">15/9-19 B</text>
              </g>

              <g className="map-node" transform="translate(140, 150)">
                <circle r="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="12" y="4" fill="#EF4444" fontSize="10" fontWeight="bold" fontFamily="monospace">15/9-19 A (Stuck @ 2162m)</text>
              </g>

              <g className="map-node" transform="translate(260, 80)">
                <circle r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="10" y="4" fill="#A1A1AA" fontSize="10" fontFamily="monospace">15/9-F-5</text>
              </g>

              <g className="map-node" transform="translate(280, 160)">
                <circle r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="10" y="4" fill="#A1A1AA" fontSize="10" fontFamily="monospace">15/9-F-7</text>
              </g>

              {/* Active Current Well Bit (★) */}
              <g className="map-node active-bit" transform="translate(195, 125)">
                <circle r="14" fill="rgba(239,68,68,0.2)" className="pulse-ring" />
                <circle r="8" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">★</text>
                <text x="14" y="4" fill="#FFFFFF" fontSize="11" fontWeight="bold">15/9-F-1 (Current)</text>
              </g>
            </svg>
            <div className="map-legend-bar">
              <span>● Offset Wells</span>
              <span style={{ color: '#EF4444' }}>★ Current Drilling Bit</span>
              <span style={{ color: 'rgba(239,68,68,0.7)' }}>--- Fault Corridor</span>
            </div>
          </div>
        </div>

        {/* Quad 2: Current Well Parameters */}
        <div className="quad-card quad-telemetry">
          <div className="quad-head">
            <div className="quad-title-wrap">
              <Activity size={16} color="#8F7C3A" />
              <span>CURRENT WELL SENSORS</span>
            </div>
            <span className="telemetry-depth-pill">DEPTH: 2,150 m</span>
          </div>

          <div className="telemetry-readout-grid">
            <div className="readout-box">
              <span className="r-label">Bit Depth</span>
              <span className="r-val highlight">2,150 <small>m</small></span>
              <span className="r-sub">TVD: 2,042 m</span>
            </div>

            <div className="readout-box">
              <span className="r-label">ROP</span>
              <span className="r-val">18 <small>m/h</small></span>
              <span className="r-sub">Avg: 22 m/h</span>
            </div>

            <div className="readout-box">
              <span className="r-label">WOB</span>
              <span className="r-val">12 <small>kkgf</small></span>
              <span className="r-sub">Max: 15 kkgf</span>
            </div>

            <div className="readout-box">
              <span className="r-label">RPM</span>
              <span className="r-val">120 <small>RPM</small></span>
              <span className="r-sub">Top Drive</span>
            </div>

            <div className="readout-box warning-box">
              <span className="r-label">Torque</span>
              <span className="r-val text-red">8 <small>kN·m</small></span>
              <span className="r-sub text-red">▲ Micro-spikes</span>
            </div>

            <div className="readout-box">
              <span className="r-label">Pressure</span>
              <span className="r-val">14,000 <small>kPa</small></span>
              <span className="r-sub">SPP steady</span>
            </div>
          </div>
        </div>

        {/* Quad 3: Drilling Parameters Graph (with Channel Toggles) */}
        <div className="quad-card quad-graph">
          <div className="quad-head">
            <div className="quad-title-wrap">
              <TrendingUp size={16} color="#8F7C3A" />
              <span>DRILLING PARAMETERS OVER DEPTH</span>
            </div>
            <span className="graph-alert-tag">⚠ Torque Spike Anomaly at 2,145m</span>
          </div>

          {/* Channel Toggle Buttons */}
          <div className="channel-toggle-strip">
            {Object.keys(channelConfigs).map((ch) => (
              <button
                key={ch}
                className={`channel-btn ${activeChannel === ch ? 'active' : ''}`}
                onClick={() => setActiveChannel(ch)}
              >
                <span>{ch}</span>
              </button>
            ))}
          </div>

          {/* Graphical Visualization Stage */}
          <div className="parameter-chart-stage">
            <svg viewBox="0 0 500 160" className="param-svg">
              {/* Horizontal Grid */}
              <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.06)" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(255,255,255,0.06)" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="rgba(255,255,255,0.06)" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="rgba(255,255,255,0.12)" />

              {/* Threshold warning band */}
              <rect x="40" y="20" width="440" height="35" fill="rgba(239,68,68,0.08)" />

              {/* Trend line based on channel */}
              {activeChannel === 'Torque' ? (
                <>
                  <path 
                    d="M 50 120 L 120 115 L 200 110 L 280 90 L 360 70 L 420 35 L 470 45" 
                    fill="none" 
                    stroke="#EF4444" 
                    strokeWidth="3" 
                  />
                  {/* Alert marker */}
                  <circle cx="420" cy="35" r="5" fill="#EF4444" stroke="#FFF" strokeWidth="2" />
                  <g transform="translate(370, 20)">
                    <rect x="0" y="0" width="100" height="18" rx="4" fill="#EF4444" />
                    <text x="50" y="12" textAnchor="middle" fill="#FFF" fontSize="9" fontWeight="bold">ALERT: 8.4 kN·m</text>
                  </g>
                </>
              ) : activeChannel === 'ROP' ? (
                <>
                  <path 
                    d="M 50 40 L 120 45 L 200 60 L 280 80 L 360 100 L 420 125 L 470 120" 
                    fill="none" 
                    stroke="#10B981" 
                    strokeWidth="3" 
                  />
                  <circle cx="420" cy="125" r="5" fill="#10B981" stroke="#FFF" strokeWidth="2" />
                </>
              ) : (
                <path 
                  d="M 50 90 L 120 85 L 200 80 L 280 75 L 360 65 L 420 50 L 470 52" 
                  fill="none" 
                  stroke={channelConfigs[activeChannel]?.color || '#8F7C3A'} 
                  strokeWidth="3" 
                />
              )}

              {/* Depth X-Axis Markers */}
              <text x="50" y="155" fill="#71717A" fontSize="9" fontFamily="monospace">2,000m</text>
              <text x="190" y="155" fill="#71717A" fontSize="9" fontFamily="monospace">2,060m</text>
              <text x="330" y="155" fill="#71717A" fontSize="9" fontFamily="monospace">2,120m</text>
              <text x="450" y="155" fill="#EF4444" fontSize="9" fontWeight="bold" fontFamily="monospace">2,150m (Now)</text>
            </svg>

            <div className="chart-footer-caption">
              <span>Channel: <strong>{channelConfigs[activeChannel]?.label}</strong> ({channelConfigs[activeChannel]?.current})</span>
              <span className="danger-caption">{channelConfigs[activeChannel]?.alertVal}</span>
            </div>
          </div>
        </div>

        {/* Quad 4: Historical Offset Hazard Correlation */}
        <div className="quad-card quad-risk">
          <div className="quad-head">
            <div className="quad-title-wrap">
              <AlertTriangle size={16} color="#8F7C3A" />
              <span>DEPTH-INDEXED HAZARD INDEX</span>
            </div>
            <span className="quad-sub-badge">Volve Offset Calibration (2,150m)</span>
          </div>

          <div className="risk-bars-stack">
            {/* Stuck Pipe */}
            <div className="risk-bar-item risk-crit">
              <div className="risk-bar-head">
                <div className="risk-title-left">
                  <span className="risk-status-icon">🔴</span>
                  <span className="risk-name">STUCK PIPE</span>
                </div>
                <span className="risk-severity-pill pill-high">HIGH &bull; 86/100 Index</span>
              </div>
              <div className="risk-meter-track">
                <div className="risk-meter-fill fill-high" style={{ width: '86%' }} />
              </div>
              <div className="risk-bar-desc">Overpull pattern aligns with Volve 15/9-19 A differential sticking at 2,162m.</div>
            </div>

            {/* Pack-off */}
            <div className="risk-bar-item risk-med">
              <div className="risk-bar-head">
                <div className="risk-title-left">
                  <span className="risk-status-icon">🟡</span>
                  <span className="risk-name">PACK-OFF</span>
                </div>
                <span className="risk-severity-pill pill-med">MEDIUM &bull; 54/100 Index</span>
              </div>
              <div className="risk-meter-track">
                <div className="risk-meter-fill fill-med" style={{ width: '54%' }} />
              </div>
              <div className="risk-bar-desc">Cuttings accumulation suspected across 24° inclination build section.</div>
            </div>

            {/* Mud Loss */}
            <div className="risk-bar-item risk-low">
              <div className="risk-bar-head">
                <div className="risk-title-left">
                  <span className="risk-status-icon">🟢</span>
                  <span className="risk-name">MUD LOSS</span>
                </div>
                <span className="risk-severity-pill pill-low">LOW &bull; 22/100 Index</span>
              </div>
              <div className="risk-meter-track">
                <div className="risk-meter-fill fill-low" style={{ width: '22%' }} />
              </div>
              <div className="risk-bar-desc">Formation fracture gradient safe; no significant pit loss registered.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Similar Offset Wells List */}
      <div className="similar-offsets-section">
        <div className="so-header">
          <div className="so-title-group">
            <Compass size={17} color="#8F7C3A" />
            <h3>SIMILAR OFFSET WELLS</h3>
            <span className="so-subtitle">Multi-parameter matching based on lithology &amp; trajectory profile</span>
          </div>
          <button 
            className="btn-view-all-offsets"
            onClick={onNavigateToOffsets}
          >
            <span>Full Offset Similarity Screen</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="so-table-card">
          <table className="so-table">
            <thead>
              <tr>
                <th>WELL ID</th>
                <th>SIMILARITY</th>
                <th>DEPTH OVERLAP</th>
                <th>HISTORICAL INCIDENT CALIBRATION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr className="row-danger-match">
                <td className="well-cell">
                  <strong>15/9-19 A</strong>
                  <span className="sub-tag">Volve Field &bull; Forties</span>
                </td>
                <td>
                  <div className="sim-badge sim-high">89% Match</div>
                </td>
                <td>91% Overlap (2,000m &ndash; 2,250m)</td>
                <td className="incident-cell text-red">
                  <strong>⚠ Stuck Pipe @ ~2,162m</strong>
                  <span>Differential sticking in permeable sandstone</span>
                </td>
                <td>
                  <button 
                    className="btn-inspect-small"
                    onClick={() => onOpenModal({
                      title: "Offset Well 15/9-19 A Stuck Pipe Incident",
                      subtitle: "Source: Daily Drilling Report #43",
                      content: "At 2,162m MD, drill string experienced sudden torque spike from 5.1 to 9.2 kN·m followed by inability to rotate or reciprocate pipe. Overpull exceeded 75 klbf. Jarred for 4.5 hours with pipe-freeing agent before circulation was restored."
                    })}
                  >
                    View DDR
                  </button>
                </td>
              </tr>

              <tr>
                <td className="well-cell">
                  <strong>15/9-F-5</strong>
                  <span className="sub-tag">Volve Field &bull; Forties</span>
                </td>
                <td>
                  <div className="sim-badge sim-med">82% Match</div>
                </td>
                <td>85% Overlap (1,950m &ndash; 2,200m)</td>
                <td className="incident-cell text-green">
                  <span>No major non-productive time (NPT) recorded</span>
                </td>
                <td>
                  <button 
                    className="btn-inspect-small"
                    onClick={() => onOpenModal({
                      title: "Offset Well 15/9-F-5 Reference",
                      subtitle: "Volve Production Hole Section",
                      content: "Drilled without severe incident. Maintained mud weight at 1.25 SG with flow rate 1,150 L/min."
                    })}
                  >
                    View Log
                  </button>
                </td>
              </tr>

              <tr>
                <td className="well-cell">
                  <strong>15/9-F-7</strong>
                  <span className="sub-tag">Volve Field &bull; Hugin</span>
                </td>
                <td>
                  <div className="sim-badge sim-low">76% Match</div>
                </td>
                <td>78% Overlap (1,850m &ndash; 2,100m)</td>
                <td className="incident-cell text-amber">
                  <span>Partial fluid loss (15 bbl/hr) at 1,900m</span>
                </td>
                <td>
                  <button 
                    className="btn-inspect-small"
                    onClick={() => onOpenModal({
                      title: "Offset Well 15/9-F-7 Fluid Loss Record",
                      subtitle: "Source: DDR Day 28",
                      content: "Encountered micro-fractures in upper limestone cap. Mixed and pumped 25 bbl medium nut-plug pill."
                    })}
                  >
                    View DDR
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Actionable Alert Banner */}
      <div className="actionable-alert-banner">
        <div className="aab-left">
          <AlertTriangle size={24} color="#EF4444" style={{ flexShrink: 0 }} />
          <div className="aab-text-col">
            <h4 className="aab-title">⚠ HIGH RISK ALERT: Current behaviour resembles historical stuck-pipe intervals</h4>
            <p className="aab-desc">
              Torque micro-fluctuations and ROP deceleration at 2,150m correlate with pre-stuck events in offset well 15/9-19 A. Recommended action: reduce WOB and circulate hole clean.
            </p>
          </div>
        </div>

        <div className="aab-actions">
          <button 
            className="btn btn-secondary btn-evidence"
            onClick={() => onOpenModal({
              title: "Daily Drilling Report #43 Historical Record",
              subtitle: "Well 15/9-19 A Differential Sticking Incident",
              content: "Incident Date: 2008-04-12\nDepth: 2,162m MD\nFormation: Forties Sandstone\n\nExcerpt from Morning Tour Shift Notes:\n'While drilling ahead at 2,162m MD, experienced rapid torque increase from 5 kN·m to 9.2 kN·m. Standpipe pressure rose by 350 psi. Attempted to pull up with 60 klbf overpull with no movement. Pumped 40 bbl lubricating pill and initiated jarring operations.'"
            })}
          >
            <FileText size={15} />
            <span>View Evidence</span>
          </button>

          <button 
            className="btn btn-primary btn-ask-ai"
            onClick={() => onOpenAIDrawer ? onOpenAIDrawer("Why is 15/9-F-1 classified as high risk for stuck pipe near 2,150m?") : null}
          >
            <Sparkles size={15} />
            <span>Ask eRTMAC Assistant &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
