import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  CheckSquare, 
  Square, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Sliders 
} from 'lucide-react';

export default function PlanningWorkspace({ project, onOpenModal }) {
  const [selectedCandidate, setSelectedCandidate] = useState('B');

  // Constraints checklist state
  const [constraints, setConstraints] = useState({
    existingWells: true,
    exclusionZones: true,
    formationTarget: true,
    wellSpacing: true
  });

  const candidates = [
    {
      id: 'B',
      rank: '#1',
      name: 'Candidate Location B',
      code: 'LOC-B',
      isRecommended: true,
      score: 82,
      formation: 'Strong (Fatehgarh / Forties Sandstone)',
      offsetCoverage: 'High (5 offset wells correlated)',
      historicalRisk: 'Low (0 major fault intersections)',
      targetDepth: '3,200 m',
      inclination: 'Max 24° deviation build',
      surfaceAccess: 'Direct access via primary rig road corridor (1.2 km)',
      x: 210,
      y: 110,
      pros: [
        'Optimal offset well density within 2 km radius',
        'Seismic reflector indicates uniform structural thickness',
        'Clearance exceeds 400m from historical blowout zone'
      ]
    },
    {
      id: 'A',
      rank: '#2',
      name: 'Candidate Location A',
      code: 'LOC-A',
      isRecommended: false,
      score: 74,
      formation: 'Moderate (Interbedded Shale / Sand)',
      offsetCoverage: 'Medium (3 offset wells)',
      historicalRisk: 'Medium (Minor fault proximity)',
      targetDepth: '3,150 m',
      inclination: 'Max 28° deviation build',
      surfaceAccess: 'Requires 3.4 km secondary rig pad extension',
      x: 110,
      y: 70,
      pros: [
        'Proximity to existing gathering facility',
        'Proven seal integrity across overlying caprock'
      ]
    },
    {
      id: 'C',
      rank: '#3',
      name: 'Candidate Location C',
      code: 'LOC-C',
      isRecommended: false,
      score: 61,
      formation: 'Uncertain (Marginal sand facies)',
      offsetCoverage: 'Low (Sparse historical control)',
      historicalRisk: 'Elevated (Pore pressure transition zone)',
      targetDepth: '3,400 m',
      inclination: 'Max 34° high-dogleg profile',
      surfaceAccess: 'Steep terrain slope requiring pad grading',
      x: 120,
      y: 165,
      pros: [
        'Explores potential high-upside reservoir compartment'
      ]
    }
  ];

  const current = candidates.find(c => c.id === selectedCandidate) || candidates[0];

  const toggleConstraint = (key) => {
    setConstraints(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
                {/* Background Grid */}
                <defs>
                  <pattern id="plan-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                    <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#plan-grid)" />

                {/* Exclusion Zone Poly (conditionally rendered) */}
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

                {/* Existing Offset Wells (conditionally rendered) */}
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

                {/* Formation target boundary */}
                {constraints.formationTarget && (
                  <ellipse cx="190" cy="120" rx="140" ry="75" fill="none" stroke="rgba(143,124,58,0.25)" strokeWidth="2" strokeDasharray="6 4" />
                )}

                {/* Candidate A Marker */}
                <g 
                  className={`candidate-marker ${selectedCandidate === 'A' ? 'active-candidate' : ''}`}
                  onClick={() => setSelectedCandidate('A')}
                  transform="translate(110, 70)"
                  style={{ cursor: 'pointer' }}
                >
                  <circle r={selectedCandidate === 'A' ? 14 : 10} fill={selectedCandidate === 'A' ? '#8F7C3A' : '#1A1817'} stroke="#C0AA8A" strokeWidth="2" />
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">A</text>
                  <text x="16" y="4" fill="#D4D4D8" fontSize="10" fontWeight="600">Candidate A (74)</text>
                </g>

                {/* Candidate B Marker (Recommended ★) */}
                <g 
                  className={`candidate-marker ${selectedCandidate === 'B' ? 'active-candidate' : ''}`}
                  onClick={() => setSelectedCandidate('B')}
                  transform="translate(210, 110)"
                  style={{ cursor: 'pointer' }}
                >
                  <circle r="18" fill="rgba(143,124,58,0.25)" className="pulse-ring" />
                  <circle r={selectedCandidate === 'B' ? 16 : 12} fill="#8F7C3A" stroke="#FFFFFF" strokeWidth="2.5" />
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">★ B</text>
                  <text x="22" y="4" fill="#FFFFFF" fontSize="11" fontWeight="bold">Candidate B (82) [REC]</text>
                </g>

                {/* Candidate C Marker */}
                <g 
                  className={`candidate-marker ${selectedCandidate === 'C' ? 'active-candidate' : ''}`}
                  onClick={() => setSelectedCandidate('C')}
                  transform="translate(120, 165)"
                  style={{ cursor: 'pointer' }}
                >
                  <circle r={selectedCandidate === 'C' ? 14 : 10} fill={selectedCandidate === 'C' ? '#8F7C3A' : '#1A1817'} stroke="#A1A1AA" strokeWidth="2" />
                  <text x="0" y="4" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">C</text>
                  <text x="16" y="4" fill="#9CA3AF" fontSize="10" fontWeight="600">Candidate C (61)</text>
                </g>
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
                  <span>Minimum 800m reservoir drainage spacing</span>
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
              <span className="pcard-count">3 Scored</span>
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
                <span className="factor-lbl">Formation Target</span>
                <span className="factor-val text-green">{current.formation}</span>
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
                <span className="factor-lbl">Surface Accessibility</span>
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
                content: `Generating directional survey and casing program for ${current.name}.\n\n• Kickoff Point (KOP): 600m MD\n• Build Rate: 2.5°/30m to reach 24° inclination\n• Casing Strings: 20" Conductor @ 150m, 13-3/8" Surface @ 900m, 9-5/8" Intermediate @ 2,400m, 7" Production Liner @ 3,200m.\n• Anti-collision check: Verified against 5 offset wells with minimum separation factor > 2.5.`
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
