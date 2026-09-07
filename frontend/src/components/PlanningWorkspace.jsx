import React, { useState, useEffect, useCallback } from 'react';
import { 
  Compass, 
  MapPin, 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Sliders,
  RefreshCw 
} from 'lucide-react';
import { fetchPlanningCandidates, tryBackend } from '../data/apiClient';

// Reference point inside the Volve cluster used for the demo prospects.
const DEFAULT_REFERENCE = { lat: 58.437, lng: 1.873, name: 'Proposed Well (15/9 block)' };
const DEFAULT_DEPTH = 3200;

const MOCK_CANDIDATES = [
  {
    id: 'B', rank: '#1', code: 'LOC-B', name: 'Candidate Location B', isRecommended: true,
    score: 82, formation: 'Strong (Fatehgarh / Forties Sandstone)',
    offsetCoverage: 'High (5 offset wells correlated)', historicalRisk: 'Low (0 major fault intersections)',
    targetDepth: '3,200 m', inclination: 'Max 24° deviation build',
    surfaceAccess: 'Direct access via primary rig road corridor (1.2 km)', x: 210, y: 110,
    pros: ['Optimal offset well density within 2 km radius', 'Seismic reflector indicates uniform structural thickness', 'Clearance exceeds 400m from historical blowout zone']
  },
  {
    id: 'A', rank: '#2', code: 'LOC-A', name: 'Candidate Location A', isRecommended: false,
    score: 74, formation: 'Moderate (Interbedded Shale / Sand)',
    offsetCoverage: 'Medium (3 offset wells)', historicalRisk: 'Medium (Minor fault proximity)',
    targetDepth: '3,150 m', inclination: 'Max 28° deviation build',
    surfaceAccess: 'Requires 3.4 km secondary rig pad extension', x: 110, y: 70,
    pros: ['Proximity to existing gathering facility', 'Proven seal integrity across overlying caprock']
  },
  {
    id: 'C', rank: '#3', code: 'LOC-C', name: 'Candidate Location C', isRecommended: false,
    score: 61, formation: 'Uncertain (Marginal sand facies)',
    offsetCoverage: 'Low (Sparse historical control)', historicalRisk: 'Elevated (Pore pressure transition zone)',
    targetDepth: '3,400 m', inclination: 'Max 34° high-dogleg profile',
    surfaceAccess: 'Steep terrain slope requiring pad grading', x: 120, y: 165,
    pros: ['Explores potential high-upside reservoir compartment']
  }
];

function formatDepth(m) {
  return m ? `${Number(m).toLocaleString('en-US')} m` : '—';
}

function kmAway(m) {
  if (!m && m !== 0) return '—';
  const km = Number(m) / 1000;
  return km >= 1 ? `${km.toFixed(1)} km` : `${Math.floor(Number(m))} m`;
}

/**
 * Map a backend candidate object into the display shape used by the workspace UI.
 * x/y are deterministic positions inside the SVG viewBox (380 x 230).
 */
function toDisplayCandidate(cand, idx) {
  const overall = cand?.scores?.overall ?? 0;
  const risk = cand?.risk_profile || {};
  const positive = cand?.positive_factors || [];
  const negative = cand?.negative_factors || [];
  const insights = risk.insights || [];
  const id = `C${idx + 1}`;
  const x = 110 + (idx % 3) * 50;
  const y = 70 + (idx % 3) * 47;

  return {
    id,
    rank: `#${idx + 1}`,
    code: cand?.candidate_id || `LOC-${id}`,
    name: `Candidate Location ${id}`,
    isRecommended: idx === 0,
    score: overall,
    formation: (cand?.closest_well ? `Offset cluster: ${cand.closest_well} (${kmAway(cand.closest_dist)} away)` : 'No offset control detected'),
    offsetCoverage: positive[0] ? positive[0] : 'Adequate spacing maintained',
    historicalRisk: `${risk.level || 'LOW'} — ${risk.label || 'No comparable incident density near target'}`,
    targetDepth: formatDepth(cand?.target_depth),
    inclination: (cand?.trajectory_estimate?.[1]?.inclination ?? 0) > 0
      ? `Max ${cand.trajectory_estimate[1].inclination}° deviation profile`
      : 'Simple near-vertical trajectory estimated',
    surfaceAccess: cand ? `Lat ${cand.lat?.toFixed(4)}°, Lon ${cand.lon?.toFixed(4)}° in prospect polygon` : '—',
    x, y,
    pros: insights.length ? insights : [
      positive[1] || 'Satisfies hard spatial constraints',
      negative.length ? `Watch: ${negative[0]}` : 'No blocking negative factors returned'
    ],
    evidence_count: risk.evidence_count ?? 0,
    lat: cand?.lat,
    lon: cand?.lon,
  };
}

export default function PlanningWorkspace({ project, onOpenModal }) {
  const [selectedCandidate, setSelectedCandidate] = useState('B');
  const [candidates, setCandidates] = useState(MOCK_CANDIDATES);
  const [apiStatus, setApiStatus] = useState('checking'); // 'live' | 'mock' | 'checking'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Constraints checklist state
  const [constraints, setConstraints] = useState({
    existingWells: true,
    exclusionZones: true,
    formationTarget: true,
    wellSpacing: true
  });

  const loadCandidates = useCallback(async (spacingOverride) => {
    setIsRefreshing(true);
    const spacing = spacingOverride != null
      ? spacingOverride
      : (constraints.wellSpacing ? 500 : 0);
    const payload = {
      reference: DEFAULT_REFERENCE,
      target_depth: DEFAULT_DEPTH,
      formation: project?.formation || 'HUGIN FM',
      constraints: { minimum_well_spacing: spacing || 100 },
    };
    const res = await tryBackend(() => fetchPlanningCandidates(payload));
    if (res.ok && res.data.candidates && res.data.candidates.length) {
      const mapped = res.data.candidates.map(toDisplayCandidate);
      setCandidates(mapped);
      setSelectedCandidate(mapped[0]?.id || 'C1');
      setApiStatus('live');
    } else {
      setCandidates(MOCK_CANDIDATES);
      setSelectedCandidate('B');
      setApiStatus('mock');
    }
    setIsRefreshing(false);
  }, [constraints.wellSpacing, project?.formation]);

  useEffect(() => {
    loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleConstraint = (key) => {
    setConstraints(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'wellSpacing' || key === 'existingWells') {
        loadCandidates(next.wellSpacing ? 500 : 100);
      }
      return next;
    });
  };

  const current = candidates.find(c => c.id === selectedCandidate) || candidates[0];

  return (
    <div className="planning-workspace-layout">
      {/* Workspace Header */}
      <div className="planning-header-bar">
        <div className="phb-left">
          <span className="phb-tag">PRE-SPUD WORKFLOW</span>
          <h2 className="phb-title">New Well Planning &amp; Candidate Ranking</h2>
          <span className="phb-sub">Multi-factor surface accessibility and subsurface geological scoring</span>
        </div>
        <div className="phb-right">
          <div className="active-prospect-badge">
            <Compass size={15} color="#8F7C3A" />
            <span>Target Prospect: {project?.name || "Rajasthan Block A"}</span>
          </div>
          <button
            className={`api-status-button status-${apiStatus}`}
            onClick={() => loadCandidates()}
            disabled={isRefreshing}
            title={apiStatus === 'live' ? 'Connected to NWIS backend API' : 'Backend unreachable — showing demo data'}
          >
            {isRefreshing
              ? <RefreshCw size={13} className="spin" />
              : <span className="status-dot" />}
            <span>{apiStatus === 'live' ? 'Live API' : apiStatus === 'mock' ? 'Demo data' : 'Connecting…'}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Split: Map & Constraints (Left) | Candidates & Details (Right) */}
      <div className="planning-split-grid">
        {/* Left Column: Map & Constraints */}
        <div className="planning-col-left">
          {/* 1. Exploration Map */}
          <div className="planning-card plan-map-card">
            <div className="pcard-head">
              <div className="pcard-title">
                <MapPin size={16} color="#8F7C3A" />
                <span>CANDIDATE GEOSPATIAL MAP</span>
              </div>
              <span className="map-zoom-badge">Grid: 1:25,000</span>
            </div>

            <div className="interactive-plan-map">
              <svg viewBox="0 0 380 230" className="plan-map-svg">
                <defs>
                  <pattern id="plan-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#plan-grid)" />

                {constraints.exclusionZones && (
                  <g className="exclusion-zone-group">
                    <polygon 
                      points="260,20 370,40 350,130 240,90" 
                      fill="rgba(239,68,68,0.12)" 
                      stroke="rgba(239,68,68,0.4)" 
                      strokeDasharray="4 3" 
                    />
                    <text x="260" y="70" fill="rgba(239,68,68,0.7)" fontSize="9" fontWeight="bold">PROTECTED WATERWAY</text>
                  </g>
                )}

                {constraints.existingWells && (
                  <g className="offset-wells-layer">
                    <circle cx="70" cy="110" r="5" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" />
                    <text x="80" y="114" fill="#9CA3AF" fontSize="9" fontFamily="monospace">WELL-01</text>

                    <circle cx="160" cy="40" r="5" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" />
                    <text x="170" y="44" fill="#9CA3AF" fontSize="9" fontFamily="monospace">WELL-04</text>

                    <circle cx="300" cy="180" r="5" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
                    <text x="310" y="184" fill="#9CA3AF" fontSize="9" fontFamily="monospace">WELL-19</text>
                  </g>
                )}

                {constraints.formationTarget && (
                  <ellipse cx="190" cy="120" rx="140" ry="75" fill="none" stroke="rgba(143,124,58,0.25)" strokeWidth="2" strokeDasharray="6 4" />
                )}

                {candidates.map((c) => (
                  <g 
                    key={c.id}
                    className={`candidate-marker ${selectedCandidate === c.id ? 'active-candidate' : ''}`}
                    onClick={() => setSelectedCandidate(c.id)}
                    transform={`translate(${c.x}, ${c.y})`}
                    style={{ cursor: 'pointer' }}
                  >
                    {c.isRecommended && <circle r="18" fill="rgba(143,124,58,0.25)" className="pulse-ring" />}
                    <circle r={selectedCandidate === c.id ? (c.isRecommended ? 16 : 14) : (c.isRecommended ? 12 : 10)}
                      fill={selectedCandidate === c.id ? '#8F7C3A' : '#1A1817'}
                      stroke={c.isRecommended ? '#FFFFFF' : '#C0AA8A'}
                      strokeWidth="2"
                    />
                    <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                      {c.isRecommended ? '★' : c.id}
                    </text>
                    <text x="18" y="4" fill="#D4D4D8" fontSize="10" fontWeight="600">
                      {c.name.replace('Candidate Location ', 'Candidate ')} ({c.score})
                    </text>
                  </g>
                ))}
              </svg>

              <div className="plan-map-legend">
                <span>★ Recommended Candidate</span>
                <span>● Evaluated Locations</span>
                <span style={{ color: '#3B82F6' }}>● Offset Wells</span>
                <span style={{ color: '#EF4444' }}>■ Exclusion Zone</span>
              </div>
            </div>
          </div>

          {/* 2. Constraints Checklist */}
          <div className="planning-card plan-constraints-card">
            <div className="pcard-head">
              <div className="pcard-title">
                <Sliders size={16} color="#8F7C3A" />
                <span>SPATIAL &amp; DRILLING CONSTRAINTS</span>
              </div>
              <span className="constraints-count">4 Active Filters</span>
            </div>

            <div className="constraints-toggle-grid">
              <div 
                className={`constraint-toggle-item ${constraints.existingWells ? 'checked' : ''}`}
                onClick={() => toggleConstraint('existingWells')}
              >
                {constraints.existingWells ? <CheckSquare size={16} color="#8F7C3A" /> : <Square size={16} color="#71717A" />}
                <div className="ct-text">
                  <strong>Existing wells</strong>
                  <span>250m safety collision buffer enforced</span>
                </div>
              </div>

              <div 
                className={`constraint-toggle-item ${constraints.exclusionZones ? 'checked' : ''}`}
                onClick={() => toggleConstraint('exclusionZones')}
              >
                {constraints.exclusionZones ? <CheckSquare size={16} color="#8F7C3A" /> : <Square size={16} color="#71717A" />}
                <div className="ct-text">
                  <strong>Exclusion zones</strong>
                  <span>Protected waterways &amp; pipeline corridors</span>
                </div>
              </div>

              <div 
                className={`constraint-toggle-item ${constraints.formationTarget ? 'checked' : ''}`}
                onClick={() => toggleConstraint('formationTarget')}
              >
                {constraints.formationTarget ? <CheckSquare size={16} color="#8F7C3A" /> : <Square size={16} color="#71717A" />}
                <div className="ct-text">
                  <strong>Formation target</strong>
                  <span>Encounter pay zone within structural crest</span>
                </div>
              </div>

              <div 
                className={`constraint-toggle-item ${constraints.wellSpacing ? 'checked' : ''}`}
                onClick={() => toggleConstraint('wellSpacing')}
              >
                {constraints.wellSpacing ? <CheckSquare size={16} color="#8F7C3A" /> : <Square size={16} color="#71717A" />}
                <div className="ct-text">
                  <strong>Well spacing</strong>
                  <span>Minimum 500m reservoir drainage spacing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Candidates Ranking & Selected Candidate Breakdown */}
        <div className="planning-col-right">
          {/* 3. Candidate Locations Ranking List */}
          <div className="planning-card plan-ranking-card">
            <div className="pcard-head">
              <div className="pcard-title">
                <Compass size={16} color="#8F7C3A" />
                <span>CANDIDATE LOCATIONS RANKING</span>
              </div>
              <span className="pcard-count">
                {apiStatus === 'live' ? `${candidates.length} Scored (API)` : '3 Demo Scored'}
              </span>
            </div>

            <div className="candidate-ranking-list">
              {candidates.map((c) => {
                const isSelected = selectedCandidate === c.id;
                return (
                  <div
                    key={c.id}
                    className={`candidate-rank-item ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedCandidate(c.id)}
                  >
                    <div className="rank-left">
                      <span className="rank-badge">{c.rank}</span>
                      <div>
                        <div className="rank-name-row">
                          <h4 className="rank-name">{c.name}</h4>
                          {c.isRecommended && (
                            <span className="rec-star-badge">★ RECOMMENDED</span>
                          )}
                        </div>
                        <span className="rank-depth-sub">Depth: {c.targetDepth} &bull; {c.inclination}</span>
                      </div>
                    </div>

                    <div className="rank-right">
                      <div className="score-badge-box">
                        <span className="score-num">{c.score}</span>
                        <span className="score-den">/100</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Selected Candidate Details Panel */}
          <div className="planning-card plan-detail-card">
            <div className="pcard-head">
              <div className="pcard-title">
                <CheckCircle2 size={16} color="#10B981" />
                <span>SELECTED CANDIDATE: {current.name}</span>
              </div>
              <span className="candidate-suitability-pill">
                Suitability: <strong>{current.score}/100</strong>
              </span>
            </div>

            <div className="candidate-factor-grid">
              <div className="factor-box">
                <span className="factor-lbl">Formation / Offset Cluster</span>
                <span className="factor-val text-gold">{current.formation}</span>
              </div>

              <div className="factor-box">
                <span className="factor-lbl">Offset Coverage</span>
                <span className="factor-val text-gold">{current.offsetCoverage}</span>
              </div>

              <div className="factor-box">
                <span className="factor-lbl">Historical Risk</span>
                <span className="factor-val text-green">{current.historicalRisk}</span>
              </div>

              <div className="factor-box">
                <span className="factor-lbl">Surface Location</span>
                <span className="factor-val">{current.surfaceAccess}</span>
              </div>
            </div>

            <div className="candidate-pros-box">
              <span className="pros-title">GEOLOGICAL RATIONALE:</span>
              <ul className="pros-list">
                {current.pros.map((pro, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={13} color="#8F7C3A" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className="btn btn-primary btn-generate-trajectory"
              onClick={() => onOpenModal({
                title: `Trajectory Specification: ${current.name}`,
                subtitle: `Target: ${current.targetDepth} &bull; Score: ${current.score}/100`,
                content: `Generating directional survey and casing program for ${current.name}.\n\n${current.inclination}\n• Anti-collision check: proximity to ${current.offsetCoverage}\n• Historical risk corridor: ${current.historicalRisk}\n• ${apiStatus === 'live' ? 'Results computed live by the NWIS Planning Engine.' : 'Demo data: results cached for offline review.'}`
              })}
            >
              <Compass size={16} />
              <span>Generate Trajectory &amp; Anti-Collision Plan</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}