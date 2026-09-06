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
  FileText 
} from 'lucide-react';

export default function ProjectHub({ onSelectProject, onCreateProject, onClose, user, onLogout }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for creating a new well project
  const [area, setArea] = useState('Rajasthan Block A');
  const [formation, setFormation] = useState('Forties Sandstone');
  const [depth, setDepth] = useState('3200');
  const [objective, setObjective] = useState('Exploration');

  // Real drilling workflow-state projects
  const workflowProjects = [
    {
      id: 'kg-basin',
      name: 'KG Basin D6',
      field: 'Krishna-Godavari',
      formation: 'Ravva Sandstone',
      status: 'DRILLING',
      statusType: 'active',
      workflowType: 'Active Well Monitoring',
      depthDisplay: 'Current: 2,184 m',
      depth: '2,184 m',
      targetDepth: '3,450 m',
      risk: 'HIGH',
      riskLevel: 'high',
      offsetWells: '8 Offset Wells',
      offsetCount: 8,
      defaultScreen: 'active_well',
      desc: 'Real-time telemetry stream indicating torque micro-fluctuations matching offset stuck-pipe signatures.'
    },
    {
      id: 'raj-block-a',
      name: 'Rajasthan Block A',
      field: 'Barmer Basin',
      formation: 'Fatehgarh Sandstone',
      status: 'PLANNING',
      statusType: 'planning',
      workflowType: 'New Exploration Area',
      depthDisplay: 'Target: 3,200 m',
      depth: '3,200 m',
      targetDepth: '3,200 m',
      risk: 'LOW',
      riskLevel: 'low',
      offsetWells: '5 Offset Wells',
      offsetCount: 5,
      defaultScreen: 'planning',
      desc: 'Pre-spud planning with 5 offset wells correlated. Candidate B selected for optimal trajectory feasibility.'
    },
    {
      id: 'assam-shelf',
      name: 'Assam Shelf Block B',
      field: 'Upper Assam Basin',
      formation: 'Barail Group',
      status: 'APPRAISAL',
      statusType: 'appraisal',
      workflowType: 'Offset / Historical Analysis',
      depthDisplay: 'Target: 3,850 m',
      depth: '3,850 m',
      targetDepth: '3,850 m',
      risk: 'MEDIUM',
      riskLevel: 'medium',
      offsetWells: '12 Offset Wells',
      offsetCount: 12,
      defaultScreen: 'offsets',
      desc: 'Regional multi-factor suitability scoring assessing fault intersections and offset pressure regimes.'
    },
    {
      id: 'volve-replay',
      name: 'Volve Field 15/9 Replay',
      field: 'North Sea Block 15/9',
      formation: 'Hugin / Forties',
      status: 'HISTORICAL REPLAY',
      statusType: 'replay',
      workflowType: 'WITSML Sensor Prototype',
      depthDisplay: 'Current: 1,842 m',
      depth: '1,842 m',
      targetDepth: '3,400 m',
      risk: 'MEDIUM',
      riskLevel: 'medium',
      offsetWells: '7 Offset Wells',
      offsetCount: 7,
      defaultScreen: 'active_well',
      desc: 'Standardized WITSML sensor stream calibrated against Daily Drilling Report #43 mud-loss records.'
    }
  ];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const newProject = {
      id: `proj-${Date.now()}`,
      name: area,
      field: area.includes('Rajasthan') ? 'Barmer Basin' : area.includes('KG') ? 'Krishna-Godavari' : 'Exploration Block',
      formation: formation,
      status: 'PLANNING',
      statusType: 'planning',
      workflowType: 'New Exploration Area',
      depthDisplay: `Target: ${depth} m`,
      depth: `${depth} m`,
      targetDepth: `${depth} m`,
      risk: 'LOW',
      riskLevel: 'low',
      offsetWells: '5 Offset Wells',
      offsetCount: 5,
      defaultScreen: 'planning',
      desc: `Newly initialized well planning prospect targeting ${formation} at ${depth}m.`
    };
    setShowCreateModal(false);
    onCreateProject(newProject);
  };

  const handleMonitorActiveDirect = () => {
    // Direct launch into the active drilling well (KG Basin D6)
    const activeProject = workflowProjects[0];
    onSelectProject(activeProject, 'active_well');
  };

  const handleNewPlanningDirect = () => {
    // Direct launch into the planning workflow
    const planningProject = workflowProjects[1];
    onSelectProject(planningProject, 'planning');
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
            onClick={handleNewPlanningDirect}
          >
            <Compass size={18} color="#C0AA8A" />
            <div className="action-text-col">
              <span className="action-title">＋ New Well Planning</span>
              <span className="action-sub">Candidate scouting &amp; constraints</span>
            </div>
          </button>

          <button 
            className="btn-main-action btn-action-monitor"
            onClick={handleMonitorActiveDirect}
          >
            <div className="pulse-indicator-red" />
            <div className="action-text-col">
              <span className="action-title">Monitor Active Well</span>
              <span className="action-sub">KG Basin D6 &bull; Real-time telemetry</span>
            </div>
            <ArrowRight size={16} className="action-arrow" />
          </button>
        </div>

        {/* Existing Projects Section Header */}
        <div className="ertmac-section-head">
          <h2 className="section-title-label">Existing Projects</h2>
          <button 
            className="btn-create-toggle"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={14} />
            <span>Custom Project</span>
          </button>
        </div>

        {/* 4 Workflow-State Cards Grid */}
        <div className="ertmac-cards-grid">
          {workflowProjects.map((p) => {
            const isDrilling = p.status === 'DRILLING';
            const isHighRisk = p.risk === 'HIGH';

            return (
              <div 
                key={p.id}
                className={`ertmac-project-card status-${p.statusType}`}
                onClick={() => onSelectProject(p, p.defaultScreen)}
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
                      <option value="Rajasthan Block A">Rajasthan Block A (Barmer Basin)</option>
                      <option value="KG Basin D6">KG Basin D6 (Krishna-Godavari)</option>
                      <option value="Assam Shelf Block B">Assam Shelf Block B (Upper Assam)</option>
                      <option value="Offshore Field 7">Offshore Field 7 (Volve 15/9)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Formation / Reservoir</label>
                    <select 
                      value={formation} 
                      onChange={(e) => setFormation(e.target.value)} 
                      className="form-select"
                    >
                      <option value="Forties Sandstone">Forties Sandstone (Paleocene)</option>
                      <option value="Fatehgarh Sandstone">Fatehgarh Sandstone (Cretaceous)</option>
                      <option value="Ravva Sandstone">Ravva Sandstone (Miocene)</option>
                      <option value="Barail Group">Barail Group (Oligocene)</option>
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
