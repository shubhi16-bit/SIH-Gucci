import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Compass, 
  Database, 
  Activity, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  LogOut, 
  FolderKanban, 
  CheckCircle2, 
  Layers, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import CandidatePlanning from './CandidatePlanning';
import OffsetIntelligence from './OffsetIntelligence';
import DrillingMonitor from './DrillingMonitor';
import RiskEvidence from './RiskEvidence';

export default function EngineeringConsole({ 
  project, 
  activeTab, 
  onTabChange, 
  onSwitchProject, 
  onExit, 
  onOpenModal 
}) {
  // Map simulation state
  const [selectedMapWell, setSelectedMapWell] = useState(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, tag: 'Overview' },
    { id: 'explore', label: 'Explore & Plan', icon: MapPin, tag: 'Candidate Ranking' },
    { id: 'planning', label: 'Well Planning', icon: Compass, tag: 'Trajectory 3D' },
    { id: 'offsets', label: 'Offset Intelligence', icon: Database, tag: 'Analogue Radar' },
    { id: 'monitor', label: 'Drilling Monitor', icon: Activity, tag: 'WITSML Replay' },
    { id: 'risks', label: 'Risk & Forecast', icon: AlertTriangle, tag: 'Depth Hazards' },
    { id: 'evidence', label: 'Evidence Archive', icon: FileText, tag: 'DDR Ground Truth' },
  ];

  const mapWells = [
    { id: 'w1', name: '15/9-F-1', type: 'Producing', status: 'active', x: '58%', y: '42%', color: '#3B82F6', td: '3,400 m', events: 0 },
    { id: 'w2', name: '15/9-19 A', type: 'Problematic', status: 'mud_loss', x: '42%', y: '32%', color: '#EF4444', td: '3,240 m', events: 4, note: 'Mud loss at 2,840m MD (DDR #43)' },
    { id: 'w3', name: '15/9-19 B', type: 'Historical', status: 'plugged', x: '68%', y: '65%', color: '#9CA3AF', td: '3,180 m', events: 1 },
    { id: 'w4', name: '15/9-F-4', type: 'Successful', status: 'proven', x: '35%', y: '72%', color: '#10B981', td: '3,520 m', events: 2 },
    { id: 'ca', name: 'Candidate A', type: 'Candidate', status: 'candidate', x: '48%', y: '50%', color: '#A38E45', td: '3,150 m', score: '74%' },
    { id: 'cb', name: 'Candidate B (Rec)', type: 'Recommended', status: 'candidate_rec', x: '54%', y: '56%', color: '#8F7C3A', td: '3,200 m', score: '88%' },
    { id: 'cc', name: 'Candidate C', type: 'Candidate', status: 'candidate', x: '62%', y: '38%', color: '#A38E45', td: '3,300 m', score: '71%' },
  ];

  return (
    <div className="console-shell">
      {/* 1. Persistent Console Top Bar */}
      <header className="console-topbar">
        <div className="topbar-left">
          {/* Logo */}
          <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => onTabChange('dashboard')}>
            <div className="brand-bars-icon">
              <div className="brand-bar brand-bar-1" />
              <div className="brand-bar brand-bar-2" />
              <div className="brand-bar brand-bar-3" />
            </div>
            <span className="brand-title">NWIS</span>
          </div>

          <div className="topbar-divider" />

          {/* Project Switcher Pill */}
          <div className="project-switcher-pill" onClick={onSwitchProject} title="Click to switch or create projects">
            <FolderKanban size={16} color="#8F7C3A" />
            <div className="proj-info">
              <span className="proj-label">ACTIVE PROJECT</span>
              <span className="proj-val">{project?.name || "Rajasthan Block A"}</span>
            </div>
            <span className="switch-badge">Switch ▼</span>
          </div>

          {/* Status Badge */}
          <span className="status-indicator-badge">
            <span className="pulse-dot" />
            <span>{project?.status || "Planning Mode"}</span>
          </span>
        </div>

        <div className="topbar-right">
          {/* Well context */}
          <div className="topbar-well-context">
            <span className="context-label">TARGET FORMATION:</span>
            <span className="context-val">{project?.formation || "Forties Sandstone"}</span>
          </div>

          {/* User Profile */}
          <div className="engineer-badge">
            <div className="engineer-avatar">SA</div>
            <span>Eng. Shivanshi Agarwal</span>
          </div>

          {/* Exit Button */}
          <button className="btn-console-exit" onClick={onExit} title="Return to Landing Page">
            <LogOut size={16} />
            <span>Exit Console</span>
          </button>
        </div>
      </header>

      {/* 2. Main Console Body (Sidebar + Workspace) */}
      <div className="console-body">
        {/* Left Sidebar */}
        <aside className="console-sidebar">
          <div className="sidebar-menu-label">DECISION WORKSPACE</div>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onTabChange(item.id)}
                >
                  <Icon size={18} className="nav-icon" />
                  <div className="nav-text-col">
                    <span className="nav-title">{item.label}</span>
                    <span className="nav-tag">{item.tag}</span>
                  </div>
                  {isActive && <div className="nav-active-indicator" />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer Info */}
          <div className="sidebar-footer-card">
            <div className="sfc-title">
              <Activity size={14} color="#8F7C3A" />
              <span>SIH26121 Sandbox</span>
            </div>
            <p className="sfc-desc">
              Calibrated against Volve Field 15/9 & BSEE Gulf of Mexico historical records.
            </p>
          </div>
        </aside>

        {/* Workspace Canvas Area */}
        <main className="console-canvas">
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-view-wrap">
              {/* Project Hero Row */}
              <div className="dash-hero-banner">
                <div>
                  <span className="streamlined-tag">{project?.basin || "Barmer Basin Exploration Area"}</span>
                  <h1 className="dash-hero-title">{project?.name || "Rajasthan Block A"} Overview</h1>
                  <p className="dash-hero-desc">
                    {project?.desc || "Continuous decision-support dashboard correlating geospatial constraints, candidate suitability scores, and analogue well records."}
                  </p>
                </div>

                <div className="dash-quick-actions">
                  <button className="btn btn-primary" onClick={() => onTabChange('explore')}>
                    <MapPin size={16} />
                    <span>Scout Candidates (A/B/C)</span>
                  </button>
                  <button className="btn btn-secondary" onClick={() => onTabChange('monitor')}>
                    <Activity size={16} />
                    <span>Launch WITSML Replay</span>
                  </button>
                </div>
              </div>

              {/* Key Metrics Strip */}
              <div className="dash-metrics-grid">
                <div className="dash-metric-card" onClick={() => onTabChange('explore')}>
                  <span className="dm-lbl">RECOMMENDED CANDIDATE</span>
                  <span className="dm-val" style={{ color: '#8F7C3A' }}>{project?.candidate || "Candidate B"}</span>
                  <span className="dm-sub">Overall Score: 88/100 (Highest Ranked)</span>
                </div>

                <div className="dash-metric-card" onClick={() => onTabChange('planning')}>
                  <span className="dm-lbl">PLANNED TARGET DEPTH</span>
                  <span className="dm-val">{project?.depth || "3,200 m"}</span>
                  <span className="dm-sub">Target: {project?.formation || "Forties Sandstone"}</span>
                </div>

                <div className="dash-metric-card" onClick={() => onTabChange('offsets')}>
                  <span className="dm-lbl">CORRELATED OFFSET WELLS</span>
                  <span className="dm-val">{project?.offsetWells || 5} Wells</span>
                  <span className="dm-sub">Top Analogue: 15/9-19 A (91% Match)</span>
                </div>

                <div className="dash-metric-card" onClick={() => onTabChange('risks')}>
                  <span className="dm-lbl">ACTIVE RISK FORECAST</span>
                  <span className="dm-val" style={{ color: '#F59E0B' }}>MEDIUM</span>
                  <span className="dm-sub">1 Historical Mud Loss Zone at 2,840m</span>
                </div>
              </div>

              {/* Interactive Regional Map + Well Inspector Grid */}
              <div className="dash-map-section">
                <div className="dash-map-container">
                  <div className="map-title-row">
                    <div className="map-title">
                      <MapPin size={18} color="#8F7C3A" />
                      <span>Regional Exploration & Candidate Placement Map</span>
                    </div>
                    <div className="map-legend">
                      <span><span className="dot blue" /> Producing</span>
                      <span><span className="dot green" /> Successful</span>
                      <span><span className="dot red" /> Problematic</span>
                      <span><span className="dot gold" /> Candidate (A/B/C)</span>
                    </div>
                  </div>

                  {/* Visual Map Surface */}
                  <div className="interactive-map-stage">
                    <div className="map-grid-mesh" />
                    
                    {/* Render Wells on Map */}
                    {mapWells.map((w) => (
                      <div
                        key={w.id}
                        className={`map-well-node ${selectedMapWell?.id === w.id ? 'selected' : ''}`}
                        style={{ left: w.x, top: w.y }}
                        onClick={() => setSelectedMapWell(w)}
                        title={`${w.name} (${w.type})`}
                      >
                        <div className="node-marker" style={{ backgroundColor: w.color }}>
                          {w.type === 'Recommended' ? '★' : w.name.slice(0, 2)}
                        </div>
                        <span className="node-label">{w.name}</span>
                      </div>
                    ))}

                    {/* Selected Well Mini Card */}
                    {selectedMapWell && (
                      <div className="map-inspect-flyout">
                        <div className="flyout-header">
                          <div>
                            <h4>{selectedMapWell.name}</h4>
                            <span className="flyout-type">{selectedMapWell.type}</span>
                          </div>
                          <button className="flyout-close" onClick={() => setSelectedMapWell(null)}>×</button>
                        </div>
                        <div className="flyout-body">
                          <div><strong>Total Depth:</strong> {selectedMapWell.td}</div>
                          {selectedMapWell.score && <div><strong>Suitability Score:</strong> {selectedMapWell.score}</div>}
                          {selectedMapWell.events !== undefined && <div><strong>Historic Incidents:</strong> {selectedMapWell.events}</div>}
                          {selectedMapWell.note && <div className="flyout-note">{selectedMapWell.note}</div>}
                        </div>
                        <button 
                          className="btn-flyout-action"
                          onClick={() => {
                            if (selectedMapWell.status.includes('candidate')) {
                              onTabChange('explore');
                            } else {
                              onTabChange('offsets');
                            }
                          }}
                        >
                          View Full Intelligence Report →
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Workflow Phase Quick Jump */}
                <div className="dash-workflow-sidebar">
                  <div className="dws-card">
                    <div className="dws-header">
                      <span className="phase-num">PHASE 01</span>
                      <h3>Where Should We Drill?</h3>
                    </div>
                    <p>
                      Evaluate Candidates A, B & C based on surface roads, terrain constraints, and subsurface offset similarity.
                    </p>
                    <button className="dws-btn" onClick={() => onTabChange('explore')}>
                      <span>Candidate Ranking</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>

                  <div className="dws-card">
                    <div className="dws-header">
                      <span className="phase-num">PHASE 02</span>
                      <h3>How Should We Plan It?</h3>
                    </div>
                    <p>
                      Inspect planned trajectory curvature and verify clearance against historical hazard intervals.
                    </p>
                    <button className="dws-btn" onClick={() => onTabChange('planning')}>
                      <span>Trajectory Preview</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>

                  <div className="dws-card">
                    <div className="dws-header">
                      <span className="phase-num">PHASE 03</span>
                      <h3>What is Happening Now?</h3>
                    </div>
                    <p>
                      Live WITSML sensor streams (ROP, Torque, SPP) with depth alerts and permanent institutional memory feedback.
                    </p>
                    <button className="dws-btn" onClick={() => onTabChange('monitor')}>
                      <span>Drilling Replay & Alerts</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXPLORE & CANDIDATE RANKING */}
          {activeTab === 'explore' && (
            <div className="console-module-wrap">
              <CandidatePlanning onOpenModal={onOpenModal} />
            </div>
          )}

          {/* TAB 3: WELL PLANNING & TRAJECTORY */}
          {activeTab === 'planning' && (
            <div className="console-module-wrap">
              <div className="planning-tab-container">
                <div className="section-header" style={{ textAlign: 'left', marginBottom: 32 }}>
                  <span className="section-eyebrow">Phase 2: Trajectory Engineering</span>
                  <h2 className="section-title">Well Path Trajectory & Planning Constraints</h2>
                  <p className="section-description">
                    Optimize wellbore trajectory profile to reach target reservoir while enforcing anti-collision rules and avoiding known offset fault zones.
                  </p>
                </div>

                <div className="planning-grid-2col">
                  {/* Trajectory Profile Visualizer */}
                  <div className="feature-box">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>
                      2D Vertical Wellbore Profile (Candidate W-02B)
                    </h3>
                    <div className="traj-stage-visual">
                      <div className="traj-surface-line">
                        <span>SURFACE EL: +28m</span>
                        <div className="rig-marker">⌂ RIG</div>
                      </div>
                      
                      <svg className="traj-svg" viewBox="0 0 500 300">
                        {/* Target Box */}
                        <rect x="360" y="210" width="120" height="70" fill="rgba(143, 124, 58, 0.15)" stroke="#8F7C3A" strokeDasharray="4" rx="6" />
                        <text x="370" y="250" fill="#C0AA8A" fontSize="12" fontWeight="700">TARGET ZONE</text>
                        <text x="370" y="268" fill="#9CA3AF" fontSize="10">Forties Sand (3,200m)</text>

                        {/* Historical Hazard Zone (Mud Loss at 2,840m) */}
                        <rect x="180" y="170" width="130" height="40" fill="rgba(239, 68, 68, 0.15)" stroke="#EF4444" strokeDasharray="3" rx="4" />
                        <text x="188" y="195" fill="#EF4444" fontSize="10" fontWeight="700">HAZARD: Mud Loss (DDR #43)</text>

                        {/* Planned Well Trajectory Path */}
                        <path 
                          d="M 60 20 Q 60 120, 200 170 T 420 230" 
                          fill="none" 
                          stroke="#10B981" 
                          strokeWidth="3.5" 
                        />

                        {/* Alternative Risky Path */}
                        <path 
                          d="M 60 20 Q 120 140, 240 185" 
                          fill="none" 
                          stroke="#EF4444" 
                          strokeWidth="2" 
                          strokeDasharray="4" 
                        />
                      </svg>

                      <div className="traj-legend-row">
                        <span style={{ color: '#10B981' }}>● Planned Path: Low Risk (Avoids Loss Zone)</span>
                        <span style={{ color: '#EF4444' }}>--- Unoptimized Path (Intersects Stuck Pipe Zone)</span>
                      </div>
                    </div>

                    <div className="traj-spec-table">
                      <div className="t-cell">
                        <span className="t-lbl">MEASURED DEPTH (MD)</span>
                        <span className="t-val">3,450 m</span>
                      </div>
                      <div className="t-cell">
                        <span className="t-lbl">TRUE VERTICAL DEPTH (TVD)</span>
                        <span className="t-val">3,200 m</span>
                      </div>
                      <div className="t-cell">
                        <span className="t-lbl">MAX INCLINATION</span>
                        <span className="t-val">24.2°</span>
                      </div>
                      <div className="t-cell">
                        <span className="t-lbl">DOGLEG SEVERITY</span>
                        <span className="t-val">2.8° / 30m</span>
                      </div>
                    </div>
                  </div>

                  {/* Planning Constraints Panel */}
                  <div className="feature-box">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>
                      Active Planning Rules & Constraints
                    </h3>
                    
                    <div className="constraints-list">
                      <div className="constraint-item">
                        <div className="c-head">
                          <CheckCircle2 size={16} color="#10B981" />
                          <span>Minimum Well Spacing</span>
                        </div>
                        <span className="c-val">500 m (Current: 2,100 m - SAFE)</span>
                      </div>

                      <div className="constraint-item">
                        <div className="c-head">
                          <CheckCircle2 size={16} color="#10B981" />
                          <span>Anti-Collision Safety Factor</span>
                        </div>
                        <span className="c-val">SF &gt; 3.0 (Nearest Offset: 15/9-19 A)</span>
                      </div>

                      <div className="constraint-item">
                        <div className="c-head">
                          <CheckCircle2 size={16} color="#10B981" />
                          <span>Max Allowable Inclination</span>
                        </div>
                        <span className="c-val">60° Limit (Planned Peak: 24.2°)</span>
                      </div>

                      <div className="constraint-item">
                        <div className="c-head">
                          <CheckCircle2 size={16} color="#10B981" />
                          <span>Target Entry Tolerance</span>
                        </div>
                        <span className="c-val">±50 m Radius Circle</span>
                      </div>
                    </div>

                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', marginTop: 24 }}
                      onClick={() => onOpenModal({
                        title: "Well Plan Summary Report",
                        subtitle: "Candidate W-02B Trajectory Authorization",
                        content: "All 4 engineering constraints satisfied. Recommended well path clears the 2,840m mud-loss zone by 68m horizontal distance. Ready for pre-spud signoff."
                      })}
                    >
                      Generate Official Well Plan Document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFSET INTELLIGENCE */}
          {activeTab === 'offsets' && (
            <div className="console-module-wrap">
              <OffsetIntelligence onOpenModal={onOpenModal} />
            </div>
          )}

          {/* TAB 5: DRILLING MONITOR */}
          {activeTab === 'monitor' && (
            <div className="console-module-wrap">
              <DrillingMonitor onOpenModal={onOpenModal} />
            </div>
          )}

          {/* TAB 6: RISK & PREDICTIONS */}
          {activeTab === 'risks' && (
            <div className="console-module-wrap">
              <RiskEvidence onOpenModal={onOpenModal} />
            </div>
          )}

          {/* TAB 7: EVIDENCE ARCHIVE */}
          {activeTab === 'evidence' && (
            <div className="console-module-wrap">
              <RiskEvidence onOpenModal={onOpenModal} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
