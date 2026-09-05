import React, { useState } from 'react';
import { FolderPlus, FolderKanban, ArrowRight, X, Compass, Activity, MapPin, CheckCircle2, Database } from 'lucide-react';

export default function ProjectHub({ onSelectProject, onCreateProject, onClose }) {
  const [activeTab, setActiveTab] = useState('existing'); // 'existing' | 'create'
  
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
      desc: 'Pre-spud planning with 5 offset wells correlated. Candidate B selected for optimal trajectory feasibility.'
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
      desc: 'Real-time WITSML telemetry replay calibrated with DDR #43 mud-loss incident records.'
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
      desc: 'Regional multi-factor suitability scoring assessing seabed terrain, slope stability, and offset pressure regimes.'
    }
  ];

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
            <span className="hub-tag">ENGINEER WORKSPACE PORTAL</span>
            <h2 className="hub-title">Welcome, Lead Drilling Engineer</h2>
            <p className="hub-sub">
              Access active drilling intelligence projects or initialize a new well planning workflow.
            </p>
          </div>
          <button className="hub-close-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="hub-tab-bar">
          <button 
            className={`hub-tab-btn ${activeTab === 'existing' ? 'active' : ''}`}
            onClick={() => setActiveTab('existing')}
          >
            <FolderKanban size={17} />
            <span>Select Existing Project ({existingProjects.length})</span>
          </button>

          <button 
            className={`hub-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <FolderPlus size={17} />
            <span>+ Create New Well Project</span>
          </button>
        </div>

        {/* Tab 1: Select Existing Project */}
        {activeTab === 'existing' && (
          <div className="hub-existing-wrap">
            <div className="hub-projects-list">
              {existingProjects.map((p) => (
                <div key={p.id} className="hub-project-card" onClick={() => onSelectProject(p)}>
                  <div className="pcard-header">
                    <div>
                      <div className="pcard-title-row">
                        <h3 className="pcard-name">{p.name}</h3>
                        <span className="pcard-status-pill" style={{ borderColor: p.statusColor, color: p.statusColor }}>
                          {p.status}
                        </span>
                      </div>
                      <div className="pcard-basin">{p.basin}</div>
                    </div>
                    <button className="btn-pcard-open" onClick={(e) => { e.stopPropagation(); onSelectProject(p); }}>
                      <span>Open Project</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <p className="pcard-desc">{p.desc}</p>

                  <div className="pcard-stats-grid">
                    <div className="pcard-stat">
                      <span className="stat-label">SELECTED / ACTIVE</span>
                      <span className="stat-val">{p.candidate}</span>
                    </div>
                    <div className="pcard-stat">
                      <span className="stat-label">TARGET DEPTH</span>
                      <span className="stat-val">{p.depth}</span>
                    </div>
                    <div className="pcard-stat">
                      <span className="stat-label">TARGET FORMATION</span>
                      <span className="stat-val">{p.formation}</span>
                    </div>
                    <div className="pcard-stat">
                      <span className="stat-label">OFFSET WELLS</span>
                      <span className="stat-val" style={{ color: '#8F7C3A' }}>{p.offsetWells} Wells</span>
                    </div>
                  </div>
                </div>
              ))}
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
