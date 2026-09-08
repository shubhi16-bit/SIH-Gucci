import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { nearbyWells } from '../data/wellData';

// Reference point inside the Volve cluster used for the demo prospect.
const DEFAULT_REFERENCE = { lat: 58.4416, lng: 1.8875 };

const MOCK_SIMILAR_WELLS = [
  {
    id: "15/9-19 A",
    similarity: 89,
    formation: "Formation information where available (Forties Sandstone)",
    depthOverlap: "91%",
    trajectory: "Similar (24° build section)",
    eventsCount: 3,
    topEvent: "Stuck Pipe — 2,162m",
    eventSeverity: "high",
    factors: { geographic: 76, depth: 88, formation: 95, trajectory: 82, context: 84 },
    summary: "Paleocene reservoir analogue with correlated lithology contacts and mud weight pressure profile."
  },
  {
    id: "15/9-F-5",
    similarity: 82,
    formation: "Formation information where available (Forties Sandstone)",
    depthOverlap: "85%",
    trajectory: "Parallel build-and-hold",
    eventsCount: 0,
    topEvent: "Clean drilling run to TD",
    eventSeverity: "safe",
    factors: { geographic: 74, depth: 84, formation: 92, trajectory: 80, context: 81 },
    summary: "Production well drilled with synthetic-based mud. Encountered zero differential sticking or lost circulation intervals."
  },
  {
    id: "15/9-F-7",
    similarity: 76,
    formation: "Formation information where available (Hugin / Forties)",
    depthOverlap: "78%",
    trajectory: "High inclination (32°)",
    eventsCount: 1,
    topEvent: "Mud Loss — 1,900m",
    eventSeverity: "med",
    factors: { geographic: 78, depth: 75, formation: 78, trajectory: 73, context: 76 },
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
    geographic: Math.round(row.geographic_similarity || 0),
    depth: Math.round(row.depth_similarity || 0),
    formation: Math.round(row.formation_similarity || 0),
    trajectory: Math.round(row.trajectory_similarity || 0),
    context: Math.round(row.context_similarity || 0),
  };

  return {
    id: row.well,
    similarity: Math.round(row.similarity_score || 0),
    formation: row.formation_td || row.formation_hc || 'Formation information where available',
    depthOverlap: `${Math.round(row.depth_similarity || 0)}%`,
    trajectory: row.well_type ? `Type: ${row.well_type.replace(/_/g, ' ')}` : (factors.trajectory > 60 ? 'Parallel profile' : 'Divergent profile'),
    eventsCount: row.total_historical_events || 0,
    topEvent: primary.label,
    eventSeverity: primary.severity,
    factors,
    summary: `Weighted Similarity Index ${Math.round(row.similarity_score || 0)}/100 computed across Geographic Proximity, Depth, Formation, Trajectory, and Context against the proposed prospect.`,
    historical_events: row.historical_events || {},
  };
}

export default function OffsetIntelligence({ project, onOpenModal, onNavigateToHistory }) {
  const navigate = useNavigate();
  const location = useLocation();

  const targetWellName = location?.state?.well || project?.name || '15/9-19 A';
  const targetWellObj = nearbyWells.find(w => w.id === targetWellName || w.name.includes(targetWellName)) || nearbyWells[0];

  const [selectedWellId, setSelectedWellId] = useState("15/9-19 A");
  const [similarWells, setSimilarWells] = useState(MOCK_SIMILAR_WELLS);
  const [apiStatus, setApiStatus] = useState('checking');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSimilar = useCallback(async () => {
    setIsRefreshing(true);
    const payload = {
      lat: targetWellObj?.lat || DEFAULT_REFERENCE.lat,
      lng: targetWellObj?.lng || DEFAULT_REFERENCE.lng,
      depth: targetWellObj?.depth || 3200,
      field: 'VOLVE',
      formation: targetWellObj?.formation || 'HUGIN FM',
      top_k: 6,
      target_well_name: targetWellObj?.id || '15/9-19 A',
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
  }, [targetWellObj]);

  useEffect(() => {
    loadSimilar();
  }, [loadSimilar]);

  const currentWell = similarWells.find(w => w.id === selectedWellId) || similarWells[0];

  const handleGoToHistory = (wellId) => {
    if (onNavigateToHistory) {
      onNavigateToHistory(wellId);
    } else {
      navigate('/history', { state: { well: wellId } });
    }
  };

  return (
    <div className="offset-intel-layout">
      {/* 1. Header & Current Well Context Banner */}
      <div className="offset-header-block">
        <div className="ohb-left">
          <span className="ohb-tag">ANALOGUE MATCHING ENGINE</span>
          <h2 className="ohb-title">Offset Intelligence &amp; Well Similarity</h2>
          <p className="ohb-sub">
            Multi-dimensional feature scoring across geographic proximity, depth interval overlap, lithology, wellbore trajectory, and context.
          </p>
        </div>

        {/* Current Well Context Pill */}
        <div className="current-well-context-card">
          <div className="cwc-label">TARGET PROSPECT / REFERENCE WELL</div>
          <div className="cwc-id">{targetWellObj.id}</div>
          <div className="cwc-specs">
            <span>Depth: <strong>{targetWellObj.depth ? `${targetWellObj.depth.toLocaleString()} m MD` : '3,200 m'}</strong></span>
            <span>&bull;</span>
            <span>Formation: <strong>Formation information where available ({targetWellObj.formation || 'HUGIN FM'})</strong></span>
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

        {/* Right Column: Deep-Dive Similarity Breakdown for Selected Well */}
        <div className="offset-col-right">
          <div className="odp-card">
            <div className="odp-head">
              <div className="odp-title-group">
                <span className="odp-tag">ANALOGUE DOSSIER</span>
                <h3 className="odp-well-name">Offset Well {currentWell.id}</h3>
              </div>

              <div className="odp-overall-match">
                <span className="oom-label">Weighted Similarity Index (0–100)</span>
                <div className="oom-number-wrap">
                  <span className="oom-val">{currentWell.similarity}</span>
                  <span className="oom-denom">/100</span>
                </div>
              </div>
            </div>

            <p className="odp-summary-text">{currentWell.summary}</p>

            {/* 5-Factor Similarity Breakdown using actual backend dimensions */}
            <div className="factor-breakdown-section">
              <h4 className="fbs-title">MULTI-FACTOR SIMILARITY BREAKDOWN</h4>

              {/* 1. Geographic Proximity */}
              <div className="factor-bar-row">
                <div className="fbr-info">
                  <span className="fbr-label">Geographic Proximity</span>
                  <span className="fbr-val">{currentWell.factors.geographic}%</span>
                </div>
                <div className="fbr-track">
                  <div className="fbr-fill fill-gold" style={{ width: `${currentWell.factors.geographic}%` }} />
                </div>
              </div>

              {/* 2. Depth */}
              <div className="factor-bar-row">
                <div className="fbr-info">
                  <span className="fbr-label">Depth</span>
                  <span className="fbr-val">{currentWell.factors.depth}%</span>
                </div>
                <div className="fbr-track">
                  <div className="fbr-fill fill-gold" style={{ width: `${currentWell.factors.depth}%` }} />
                </div>
              </div>

              {/* 3. Formation */}
              <div className="factor-bar-row">
                <div className="fbr-info">
                  <span className="fbr-label">Formation</span>
                  <span className="fbr-val">{currentWell.factors.formation}%</span>
                </div>
                <div className="fbr-track">
                  <div className="fbr-fill fill-gold" style={{ width: `${currentWell.factors.formation}%` }} />
                </div>
              </div>

              {/* 4. Trajectory */}
              <div className="factor-bar-row">
                <div className="fbr-info">
                  <span className="fbr-label">Trajectory</span>
                  <span className="fbr-val">{currentWell.factors.trajectory}%</span>
                </div>
                <div className="fbr-track">
                  <div className="fbr-fill fill-gold" style={{ width: `${currentWell.factors.trajectory}%` }} />
                </div>
              </div>

              {/* 5. Context */}
              <div className="factor-bar-row">
                <div className="fbr-info">
                  <span className="fbr-label">Context</span>
                  <span className="fbr-val">{currentWell.factors.context}%</span>
                </div>
                <div className="fbr-track">
                  <div className="fbr-fill fill-gold" style={{ width: `${currentWell.factors.context}%` }} />
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              <button 
                className="btn btn-primary btn-view-dossier"
                style={{ background: '#10B981', color: '#FFFFFF' }}
                onClick={() => handleGoToHistory(currentWell.id)}
              >
                <FileText size={16} />
                <span>Inspect Historical DDR Records for {currentWell.id}</span>
                <ArrowRight size={15} />
              </button>

              <button 
                className="btn btn-secondary btn-view-dossier"
                onClick={() => onOpenModal({
                  title: `Analogue Well Dossier: ${currentWell.id}`,
                  subtitle: `Weighted Similarity Index: ${currentWell.similarity}/100 • ${currentWell.formation}`,
                  content: `Displaying composite historical dossier for ${currentWell.id}.\n\n• Weighted Similarity Index: ${currentWell.similarity}/100\n• Historical events recorded: ${currentWell.eventsCount}\n• Primary event: ${currentWell.topEvent}\n• Analogue corridor: comparable depth window within the Volve field.\n\nEvidence is drawn from the Volve Daily Drilling Report (DDR) archive.` +
                    (apiStatus === 'live' ? '\n\nComputed live by the NWIS Similarity Engine.' : '\n\nDemo fallback data shown — start the backend API for live computations.')
                })}
              >
                <FileText size={16} />
                <span>View Full Similarity Breakdown</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}