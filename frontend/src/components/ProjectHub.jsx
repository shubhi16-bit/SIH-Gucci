import React, { useState } from 'react';
import { 
  Compass, 
  Activity, 
  Plus, 
  Radio, 
  ArrowRight, 
  X, 
  Layers, 
  LogOut, 
  FolderKanban, 
  FileText,
  Sun,
  Moon
} from 'lucide-react';

export default function ProjectHub({ 
  onSelectProject, 
  onCreateProject, 
  onOpenWellOffset,
  onClose, 
  user, 
  onLogout,
  theme = 'dark',
  onToggleTheme 
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for creating a new well project
  // Form state for creating a new well project
  const [area, setArea] = useState('Offshore Field 7 (Volve 15/9)');
  const [formation, setFormation] = useState('Hugin Formation');
  const [depth, setDepth] = useState('3200');
  const [objective, setObjective] = useState('Exploration');

  // Real drilling workflow-state projects
  const workflowProjects = [
    {
      id: 'volve-f1',
      name: '15/9-F-1 (Telemetry Replay)',
      field: 'North Sea Block 15/9 (Volve)',
      formation: 'Forties Sandstone',
      status: 'DRILLING',
      statusType: 'active',
      workflowType: 'Active Well Monitoring',
      depthDisplay: 'Current: 2,184 m',
      depth: '2,184 m',
      targetDepth: '3,450 m',
      risk: 'HIGH',
      riskLevel: 'high',
      offsetWells: '6 Offset Wells Correlated',
      offsetCount: 6,
      defaultScreen: 'active_well',
      defaultRoute: '/active',
      desc: 'WITSML telemetry replay indicating torque micro-fluctuations matching offset stuck-pipe signatures at 2,145m.'
    },
    {
      id: 'volve-p1',
      name: 'Volve Block 15/9 Prospect',
      field: 'North Sea Block 15/9',
      formation: 'Hugin / Forties Sandstone',
      status: 'PLANNING',
      statusType: 'planning',
      workflowType: 'New Well Planning',
      depthDisplay: 'Target: 3,200 m',
      depth: '3,200 m',
      targetDepth: '3,200 m',
      risk: 'LOW',
      riskLevel: 'low',
      offsetWells: '28 Catalog Wells',
      offsetCount: 28,
      defaultScreen: 'planning',
      defaultRoute: '/planning',
      desc: 'Pre-spud planning with 28 Volve well records indexed. Multi-factor candidate scoring against spacing constraints.'
    },
    {
      id: 'volve-replay',
      name: 'Volve Field 15/9-19 A Analogue',
      field: 'North Sea Block 15/9',
      formation: 'Hugin / Forties',
      status: 'HISTORICAL REPLAY',
      statusType: 'replay',
      workflowType: 'DDR Incident Archive',
      depthDisplay: 'TD: 3,200 m',
      depth: '3,200 m',
      targetDepth: '3,200 m',
      risk: 'MEDIUM',
      riskLevel: 'medium',
      offsetWells: '1,604 Historical Events',
      offsetCount: 1604,
      defaultScreen: 'historical',
      defaultRoute: '/history',
      desc: 'Historical Daily Drilling Reports indexing stuck pipe at 2,162m and mud losses at 2,850m.'
    }
  ];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      id: `proj-${Date.now()}`,
      name: area,
      field: 'North Sea Block 15/9 (Volve)',
      formation: formation,
      status: 'PLANNING',
      statusType: 'planning',
      workflowType: 'New Exploration Prospect',
      depthDisplay: `Target: ${depth} m`,
      depth: `${depth} m`,
      targetDepth: `${depth} m`,
      risk: 'LOW',
      riskLevel: 'low',
      offsetWells: '28 Catalog Wells',
      offsetCount: 28,
      defaultScreen: 'planning',
      defaultRoute: '/planning',
      desc: `Newly initialized well planning prospect targeting ${formation} at ${depth}m.`
    };
    setShowCreateModal(false);
    onCreateProject(newProject);
  };



  return (
    <div className="project-hub-overlay" onClick={onClose}>
      <div className="project-hub-modal ertmac-hub-modal" onClick={e => e.stopPropagation()}>
        {/* Hub Header */}
        <div className="hub-header ertmac-header">
          <div className="ertmac-title-block">
            <span className="ertmac-badge">eRTMAC-NWIS</span>
            <h1 className="ertmac-main-title">Well Intelligence Workspace</h1>
            <p className="ertmac-subtext">
              Plan a new well or monitor an existing drilling operation.
            </p>
          </div>

          <div className="hub-header-actions">
            {onToggleTheme && (
              <button 
                className="btn-theme-toggle" 
                onClick={onToggleTheme} 
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={15} color="#C0AA8A" /> : <Moon size={15} color="#8F7C3A" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            )}
            {onLogout && (
              <button className="btn-hub-logout" onClick={onLogout} title="Log out">
                <LogOut size={15} />
                <span>Log out</span>
              </button>
            )}
            <button className="hub-close-btn" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Operational Actions Strip */}
        <div className="ertmac-actions-bar">
          <button 
            className="btn-main-action btn-action-plan"
            onClick={() => setShowCreateModal(true)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <Plus size={18} color="#C0AA8A" />
            <div className="action-text-col">
              <span className="action-title">Create Project</span>
              <span className="action-sub">Initialize custom well prospect</span>
            </div>
          </button>
        </div>

        {/* Existing Projects Section Header */}
        <div className="ertmac-section-head">
          <h2 className="section-title-label">Existing Projects</h2>
        </div>

        {/* 3 Workflow-State Cards Grid */}
        <div className="ertmac-cards-grid">
          {workflowProjects.map((p) => {
            const isDrilling = p.status === 'DRILLING';
            const isHighRisk = p.risk === 'HIGH';

            return (
              <div 
                key={p.id}
                className={`ertmac-project-card status-${p.statusType}`}
                onClick={() => onSelectProject(p, p.defaultScreen || 'active_well')}
                role="button"
                tabIndex={0}
              >
                {/* Project Header */}
                <div className="card-top-row">
                  <div>
                    <h3 className="card-proj-name">{p.name}</h3>
                    <div className="card-field-name">{p.field} &bull; {p.formation}</div>
                  </div>
                  <span className={`card-status-pill pill-${p.statusType}`}>
                    <span className="dot" />
                    <span>{p.status}</span>
                  </span>
                </div>

                {/* Card Specs */}
                <div className="card-specs-box">
                  <div className="spec-item">
                    <span className="spec-label">DEPTH</span>
                    <span className="spec-val depth-val">{p.depthDisplay}</span>
                  </div>

                  <div className="spec-item">
                    <span className="spec-label">RISK STATUS</span>
                    <span className={`spec-val risk-val risk-${p.riskLevel}`}>
                      {isHighRisk ? '🔴 HIGH' : p.risk === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW'}
                    </span>
                  </div>

                  <div className="spec-item full-width">
                    <span className="spec-label">OFFSETS</span>
                    <span className="spec-val offsets-val">{p.offsetWells}</span>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="card-action-row">
                  <span className="card-workflow-tag">{p.workflowType}</span>
                  <div className="card-open-link">
                    <span>Open</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Project Creation Modal */}
        {showCreateModal && (
          <div className="custom-create-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="custom-create-dialog" onClick={e => e.stopPropagation()}>
              <div className="dialog-header">
                <h3>Initialize Custom Well Prospect</h3>
                <button className="dialog-close" onClick={() => setShowCreateModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="hub-create-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Field / Exploration Basin</label>
                    <select 
                      value={area} 
                      onChange={(e) => setArea(e.target.value)} 
                      className="form-select"
                    >
                      <option value="Offshore Field 7 (Volve 15/9)">Offshore Field 7 (Volve 15/9)</option>
                      <option value="Custom Prospect (Volve Offset Reference)">Custom Prospect (Volve Offset Reference)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Formation / Reservoir</label>
                    <select 
                      value={formation} 
                      onChange={(e) => setFormation(e.target.value)} 
                      className="form-select"
                    >
                      <option value="Hugin Formation">Hugin Formation (Jurassic)</option>
                      <option value="Forties Sandstone">Forties Sandstone (Paleocene)</option>
                      <option value="Smith Bank Formation">Smith Bank Formation (Triassic)</option>
                      <option value="Skagerrak Formation">Skagerrak Formation (Triassic)</option>
                      <option value="Lista Formation">Lista Formation (Paleocene)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Total Depth (m MD)</label>
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

                  <div className="form-group">
                    <label className="form-label">Drilling Objective</label>
                    <select 
                      value={objective} 
                      onChange={(e) => setObjective(e.target.value)} 
                      className="form-select"
                    >
                      <option value="Exploration">Exploration (Wildcat)</option>
                      <option value="Appraisal">Appraisal (Delineation)</option>
                      <option value="Development">Development (Infill)</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions-row">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Compass size={16} />
                    <span>Initialize Prospect</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
