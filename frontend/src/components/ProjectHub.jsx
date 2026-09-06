import React, { useState } from 'react';
import { 
  FolderPlus, 
  FolderKanban, 
  ArrowRight, 
  X, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  LogOut, 
  CheckCircle2, 
  MapPin, 
  Layers, 
  Activity, 
  Database 
} from 'lucide-react';

export default function ProjectHub({ onSelectProject, onCreateProject, onClose, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' | 'create'
  
  // Only titles shown initially; details expand when clicked on title!
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  // Create Project Form State
  const [area, setArea] = useState('Rajasthan Block A');
  const [formation, setFormation] = useState('Forties Sandstone');
  const [depth, setDepth] = useState('3200');
  const [objective, setObjective] = useState('Exploration');

  const existingProjects = [
    {
      id: 'raj-a',
      name: 'Rajasthan Block A',
      basin: 'Barmer Basin / Western Onshore',
      status: 'Planning Mode',
      statusColor: '#8F7C3A',
      candidate: 'Candidate B (Recommended)',
      score: 89,
      depth: '3,200 m',
      formation: 'Fatehgarh Sandstone',
      offsetWells: 5,
      alerts: 1,
      lastActive: '10 mins ago',
      desc: 'Pre-spud planning with 5 offset wells correlated. Candidate B selected for optimal trajectory feasibility and minimum geological fault hazards.'
    },
    {
      id: 'volve-15',
      name: 'Offshore Field 7 (Volve 15/9)',
      basin: 'North Sea Block 15/9',
      status: 'Drilling Replay',
      statusColor: '#10B981',
      candidate: 'Well 15/9-F-1',
      score: 94,
      depth: '1,842 m / 3,400 m',
      formation: 'Hugin Formation',
      offsetWells: 7,
      alerts: 2,
      lastActive: 'Active Stream',
      desc: 'Real-time WITSML telemetry replay calibrated with DDR #43 mud-loss incident records and high-frequency sensor streams.'
    },
    {
      id: 'kg-deep',
      name: 'KG Basin Deepwater Prospect',
      basin: 'Krishna-Godavari Offshore',
      status: 'Exploration Scouting',
      statusColor: '#6366F1',
      candidate: 'Candidate KG-01',
      score: 82,
      depth: '3,450 m',
      formation: 'Ravva Formation',
      offsetWells: 12,
      alerts: 0,
      lastActive: '2 days ago',
      desc: 'Regional multi-factor suitability scoring assessing seabed terrain, bathymetric slope stability, and offset pore pressure regimes.'
    }
  ];

  const toggleExpand = (id) => {
    setExpandedProjectId(prev => prev === id ? null : id);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      id: `proj-${Date.now()}`,
      name: area,
      basin: area.includes('Rajasthan') ? 'Barmer Basin' : area.includes('KG') ? 'Krishna-Godavari' : 'Offshore Field',
      status: 'Planning Mode',
      statusColor: '#8F7C3A',
      candidate: 'Candidate B',
      score: 88,
      depth: `${depth} m`,
      formation: formation,
      objective: objective,
      offsetWells: 5,
      alerts: 1,
      desc: `Newly initialized well planning project for ${area} targeting ${formation} at ${depth}m.`
    };
    onCreateProject(newProject);
  };

  return (
    <div className="project-hub-overlay" onClick={onClose}>
      <div className="project-hub-modal" onClick={e => e.stopPropagation()}>
        {/* Top Header */}
        <div className="hub-header">
          <div>
            <div className="hub-tag-row">
              <span className="hub-tag">ENGINEER WORKSPACE PORTAL</span>
              {user && (
                <span className="hub-auth-badge">
                  <CheckCircle2 size={13} color="#10B981" />
                  <span>Authenticated as Engineer {user.username}</span>
                </span>
              )}
            </div>
            <h2 className="hub-title">
              {user ? `Welcome, ${user.name}` : 'Welcome, Lead Drilling Engineer'}
            </h2>
            <p className="hub-sub">
              Select an existing well project to view details and launch the dashboard, or create a new project.
            </p>
          </div>

          <div className="hub-header-actions">
            {onLogout && (
              <button className="btn-hub-logout" onClick={onLogout} title="Log out">
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            )}
            <button className="hub-close-btn" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="hub-tab-bar">
          <button 
            className={`hub-tab-btn ${activeTab === 'existing' ? 'active' : ''}`}
            onClick={() => setActiveTab('existing')}
          >
            <FolderKanban size={17} />
            <span>Existing Projects ({existingProjects.length})</span>
          </button>

          <button 
            className={`hub-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <FolderPlus size={17} />
            <span>+ Create New Well Project</span>
          </button>
        </div>

        {/* Tab 1: Existing Projects (Title only by default, details expand on click) */}
        {activeTab === 'existing' && (
          <div className="hub-existing-wrap">
            <div className="hub-compact-list">
              {existingProjects.map((p) => {
                const isExpanded = expandedProjectId === p.id;
                return (
                  <div 
                    key={p.id} 
                    className={`hub-accordion-item ${isExpanded ? 'is-expanded' : ''}`}
                  >
                    {/* Compact Title Row — Clickable */}
                    <div 
                      className="accordion-title-bar"
                      onClick={() => toggleExpand(p.id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                    >
                      <div className="accordion-title-left">
                        <div className="accordion-folder-icon">
                          <FolderKanban size={18} color="#8F7C3A" />
                        </div>
                        <div>
                          <h3 className="accordion-project-name">{p.name}</h3>
                          <span className="accordion-basin-sub">{p.basin}</span>
                        </div>
                      </div>

                      <div className="accordion-title-right">
                        <span 
                          className="accordion-status-pill"
                          style={{ borderColor: p.statusColor, color: p.statusColor }}
                        >
                          {p.status}
                        </span>
                        <div className="accordion-toggle-indicator">
                          {isExpanded ? (
                            <>
                              <span className="toggle-text">Hide Details</span>
                              <ChevronUp size={16} />
                            </>
                          ) : (
                            <>
                              <span className="toggle-text">Click for Details</span>
                              <ChevronDown size={16} />
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details Container */}
                    {isExpanded && (
                      <div className="accordion-details-panel">
                        <p className="accordion-desc">{p.desc}</p>

                        <div className="accordion-stats-grid">
                          <div className="accordion-stat">
                            <span className="stat-label">SELECTED / ACTIVE CANDIDATE</span>
                            <span className="stat-val">{p.candidate}</span>
                          </div>
                          <div className="accordion-stat">
                            <span className="stat-label">TARGET TOTAL DEPTH</span>
                            <span className="stat-val">{p.depth}</span>
                          </div>
                          <div className="accordion-stat">
                            <span className="stat-label">TARGET FORMATION</span>
                            <span className="stat-val">{p.formation}</span>
                          </div>
                          <div className="accordion-stat">
                            <span className="stat-label">CORRELATED OFFSET WELLS</span>
                            <span className="stat-val" style={{ color: '#8F7C3A' }}>{p.offsetWells} Wells</span>
                          </div>
                        </div>

                        <div className="accordion-action-footer">
                          <div className="accordion-meta-hint">
                            <span>Last accessed: {p.lastActive} &bull; Suitability Score: <strong>{p.score}%</strong></span>
                          </div>
                          <button 
                            className="btn btn-primary btn-open-dashboard"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(p);
                            }}
                          >
                            <span>Open Project Dashboard</span>
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Quick Card to Create New Project directly from list */}
              <div 
                className="hub-create-shortcut-card"
                onClick={() => setActiveTab('create')}
              >
                <div className="create-shortcut-left">
                  <FolderPlus size={20} color="#8F7C3A" />
                  <div>
                    <h4 className="create-shortcut-title">+ Create New Well Project</h4>
                    <span className="create-shortcut-sub">Initialize target coordinates, formation, and planning constraints</span>
                  </div>
                </div>
                <div className="create-shortcut-btn">
                  <span>Start New Project</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Create New Well Project Form */}
        {activeTab === 'create' && (
          <div className="hub-create-wrap">
            <form onSubmit={handleCreateSubmit} className="hub-create-form">
              <div className="form-info-banner">
                <Compass size={20} color="#8F7C3A" style={{ flexShrink: 0 }} />
                <div>
                  <strong>New Well Project Initialization:</strong> Define exploration coordinates and target formations. The planning engine will automatically correlate offset wells and score surface candidate locations.
                </div>
              </div>

              <div className="form-grid">
                {/* Field / Area */}
                <div className="form-group">
                  <label className="form-label">Field / Exploration Area</label>
                  <select 
                    value={area} 
                    onChange={(e) => setArea(e.target.value)} 
                    className="form-select"
                  >
                    <option value="Rajasthan Block A">Rajasthan Block A (Barmer Basin)</option>
                    <option value="KG Basin Deepwater">KG Basin Deepwater (Offshore East Coast)</option>
                    <option value="Offshore Field 7 (Volve 15/9)">Offshore Field 7 (Volve Field Block 15/9)</option>
                    <option value="Assam Shelf Block B">Assam Shelf Block B (Upper Assam Basin)</option>
                    <option value="Cambay Basin Block 4">Cambay Basin Block 4 (Western Onshore)</option>
                  </select>
                </div>

                {/* Target Formation */}
                <div className="form-group">
                  <label className="form-label">Target Formation / Reservoir</label>
                  <select 
                    value={formation} 
                    onChange={(e) => setFormation(e.target.value)} 
                    className="form-select"
                  >
                    <option value="Forties Sandstone">Forties Sandstone (Paleocene Reservoir)</option>
                    <option value="Fatehgarh Sandstone">Fatehgarh Sandstone (Barmer Cretaceous)</option>
                    <option value="Hugin Formation">Hugin Formation (Middle Jurassic)</option>
                    <option value="Ravva Sandstone">Ravva Sandstone (KG Basin Miocene)</option>
                    <option value="Barail Group">Barail Group (Oligocene Sandstone)</option>
                  </select>
                </div>

                {/* Target Depth */}
                <div className="form-group">
                  <label className="form-label">Target Total Depth (m MD / TVD)</label>
                  <div className="input-with-unit">
                    <input 
                      type="number" 
                      value={depth} 
                      onChange={(e) => setDepth(e.target.value)} 
                      className="form-input"
                      placeholder="3200"
                      required
                    />
                    <span className="input-unit">m</span>
                  </div>
                </div>

                {/* Objective */}
                <div className="form-group">
                  <label className="form-label">Well Project Objective</label>
                  <select 
                    value={objective} 
                    onChange={(e) => setObjective(e.target.value)} 
                    className="form-select"
                  >
                    <option value="Exploration">Exploration (Wildcat / High Step-out)</option>
                    <option value="Appraisal">Appraisal (Delineating Proven Discovery)</option>
                    <option value="Development">Development (Infill Production Well)</option>
                  </select>
                </div>
              </div>

              {/* Form Action Row */}
              <div className="form-actions-row">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('existing')}>
                  Back to Existing Projects
                </button>
                <button type="submit" className="btn btn-primary btn-start-planning">
                  <Compass size={18} />
                  <span>Start Planning Mode</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
