import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  GitCompare, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Activity, 
  FileText,
  RefreshCw 
} from 'lucide-react';
import { fetchSimilarWells, tryBackend } from '../data/apiClient';

// Reference point inside the Volve cluster used for the demo prospect.
const DEFAULT_REFERENCE = { lat: 58.437, lng: 1.873 };

const MOCK_SIMILAR_WELLS = [
  {
    id: "15/9-19 A",
    similarity: 89,
    formation: "Forties Sandstone",
    depthOverlap: "91%",
    trajectory: "Similar (24° build section)",
    eventsCount: 3,
    topEvent: "Stuck Pipe — 2,162m",
    eventSeverity: "high",
    factors: { formation: 95, depth: 88, trajectory: 82, location: 76, drillingProfile: 84 },
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
    factors: { formation: 92, depth: 84, trajectory: 80, location: 74, drillingProfile: 81 },
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
    factors: { formation: 78, depth: 75, trajectory: 73, location: 78, drillingProfile: 76 },
    summary: "Offset reservoir appraisal well. Experienced micro-fracture fluid losses in upper transition zone at 1,900m MD."
  }
];

const EVENT_SEVERITY = {
  STUCK_PIPE: 'high',
  KICK: 'high',
  PACK_OFF: 'high',
  MUD_LOSS: 'med',
  EQUIPMENT_FAILURE: 'med',
  NPT: 'med',
  ABNORMAL_OPERATION: 'low',
};

function primaryEvent(eventSummary) {
  const entries = Object.entries(eventSummary || {});
  if (!entries.length) return { label: 'Clean drilling run to TD', severity: 'safe' };
  const [type, count] = entries.sort((a, b) => b[1] - a[1])[0];
  const label = `${type.replace(/_/g, ' ')} — ${count} recorded`;
  return { label, severity: EVENT_SEVERITY[type] || 'low' };
}

/** Map a backend comparable-well report row into the "why similar" UI card shape. */
function toSimilarWell(row, idx) {
  const primary = primaryEvent(row.historical_events);
  const factors = {
    formation: Math.round(row.formation_similarity || 0),
    depth: Math.round(row.depth_similarity || 0),
    trajectory: Math.round(row.trajectory_similarity || 0),
    location: Math.round(row.geographic_similarity || 0),
    drillingProfile: Math.round(row.context_similarity || 0),
  };

  return {
    id: row.well,
    similarity: Math.round(row.similarity_score || 0),
    formation: row.formation_td || row.formation_hc || 'Correlated interval',
    depthOverlap: `${Math.round(row.depth_similarity || 0)}%`,
    trajectory: row.well_type ? `Type: ${row.well_type.replace(/_/g, ' ')}` : (factors.trajectory > 60 ? 'Parallel profile' : 'Divergent profile'),
    eventsCount: row.total_historical_events || 0,
    topEvent: primary.label,
    eventSeverity: primary.severity,
    factors,
    summary: `Similarity score ${Math.round(row.similarity_score || 0)}% computed across geography, depth, formation, trajectory and well context against the proposed prospect.`,
    historical_events: row.historical_events || {},
  };
}

export default function OffsetIntelligence({ project, onOpenModal }) {
  const [selectedWellId, setSelectedWellId] = useState("15/9-19 A");
  const [similarWells, setSimilarWells] = useState(MOCK_SIMILAR_WELLS);
  const [apiStatus, setApiStatus] = useState('checking');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSimilar = useCallback(async () => {
    setIsRefreshing(true);
    const payload = {
      lat: DEFAULT_REFERENCE.lat,
      lng: DEFAULT_REFERENCE.lng,
      depth: 3200,
      field: 'VOLVE',
      formation: 'HUGIN FM',
      top_k: 6,
    };
    const res = await tryBackend(() => fetchSimilarWells(payload));
    if (res.ok && res.data.comparable_wells && res.data.comparable_wells.length) {
      const mapped = res.data.comparable_wells.map(toSimilarWell);
      setSimilarWells(mapped);
      setSelectedWellId(mapped[0].id);
      setApiStatus('live');
    } else {
      setSimilarWells(MOCK_SIMILAR_WELLS);
      setSelectedWellId('15/9-19 A');
      setApiStatus('mock');
    }
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadSimilar();
  }, [loadSimilar]);

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
            <span className="csh-count">
              {apiStatus === 'live' ? `${similarWells.length} API Analogues` : `${similarWells.length} High Analogues (Demo)`}
            </span>
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
            <button
              className={`api-status-button status-${apiStatus}`}
              onClick={() => loadSimilar()}
              disabled={isRefreshing}
              title={apiStatus === 'live' ? 'Connected to NWIS backend API' : 'Backend unreachable — showing demo data'}
            >
              {isRefreshing
                ? <RefreshCw size={13} className="spin" />
                : <span className="status-dot" />}
              <span>{apiStatus === 'live' ? 'Live API' : apiStatus === 'mock' ? 'Demo data' : 'Connecting…'}</span>
            </button>
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
            {(currentWell.id === '15/9-19 A' || currentWell.eventSeverity === 'high') && (
              <div className="analogue-incident-dossier">
                <div className="aid-head">
                  <AlertTriangle size={16} color="#EF4444" />
                  <strong>CRITICAL HISTORICAL LESSON (DDR EVIDENCE)</strong>
                </div>
                <p className="aid-text">
                  Offset {currentWell.id} carries {currentWell.eventsCount} recorded operational hazards in the Volve DDR archive
                  ({currentWell.topEvent}). Recommended mitigation: validate offset history before spud and maintain continuous
                  pipe rotation through correlated intervals.
                </p>
              </div>
            )}

            <button 
              className="btn btn-primary btn-view-dossier"
              onClick={() => onOpenModal({
                title: `Analogue Well Dossier: ${currentWell.id}`,
                subtitle: `Similarity Match: ${currentWell.similarity}% • Formation: ${currentWell.formation}`,
                content: `Displaying composite historical dossier for ${currentWell.id}.\n\n• Similarity Score: ${currentWell.similarity}%\n• Historical events recorded: ${currentWell.eventsCount}\n• Primary event: ${currentWell.topEvent}\n• Forecast horizon: comparable depth corridor within the Volve field.\n\nEvidence is drawn from the Volve Daily Drilling Report (DDR) archive.` +
                  (apiStatus === 'live' ? '\n\nComputed live by the NWIS Similarity Engine.' : '\n\nDemo fallback data shown — start the backend API for live computations.')
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