import React, { useState } from 'react';
import { 
  Activity, 
  MapPin, 
  Compass, 
  Database, 
  FileText, 
  LogOut, 
  FolderKanban, 
  ChevronRight, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import ActiveWellMonitor from './ActiveWellMonitor';
import PlanningWorkspace from './PlanningWorkspace';
import OffsetIntelligence from './OffsetIntelligence';
import HistoricalExplorer from './HistoricalExplorer';
import AIAssistantDrawer from './AIAssistantDrawer';

export default function EngineeringConsole({ 
  project, 
  activeTab = 'active_well', 
  onTabChange, 
  onSwitchProject, 
  onExit, 
  onOpenModal,
  user
}) {
  // State for persistent AI Copilot Drawer
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [aiDrawerPrompt, setAiDrawerPrompt] = useState('');

  const navItems = [
    { 
      id: 'active_well', 
      label: 'Active Well', 
      icon: Activity, 
      tag: 'Command Center',
      indicatorColor: '#EF4444' 
    },
    { 
      id: 'planning', 
      label: 'New Well Planning', 
      icon: Compass, 
      tag: 'Candidate Ranking',
      indicatorColor: '#8F7C3A' 
    },
    { 
      id: 'offsets', 
      label: 'Offset Intelligence', 
      icon: Database, 
      tag: 'Analogue Radar',
      indicatorColor: '#3B82F6' 
    },
    { 
      id: 'historical', 
      label: 'Historical Events', 
      icon: FileText, 
      tag: 'DDR Archive',
      indicatorColor: '#10B981' 
    },
  ];

  const handleOpenAIDrawerWithPrompt = (prompt) => {
    setAiDrawerPrompt(prompt);
    setIsAIDrawerOpen(true);
  };

  return (
    <div className="console-shell">
      {/* 1. Persistent Top Bar */}
      <header className="console-topbar ertmac-topbar">
        <div className="topbar-left">
          {/* Brand Logo */}
          <div 
            className="brand-logo" 
            style={{ cursor: 'pointer' }} 
            onClick={() => onTabChange('active_well')}
          >
            <div className="brand-bars-icon">
              <div className="brand-bar brand-bar-1" />
              <div className="brand-bar brand-bar-2" />
              <div className="brand-bar brand-bar-3" />
            </div>
            <span className="brand-title">eRTMAC-NWIS</span>
          </div>

          <div className="topbar-divider" />

          {/* Project Switcher Pill */}
          <div 
            className="project-switcher-pill" 
            onClick={onSwitchProject} 
            title="Click to switch or create projects"
          >
            <FolderKanban size={16} color="#8F7C3A" />
            <div className="proj-info">
              <span className="proj-label">ACTIVE PROSPECT</span>
              <span className="proj-val">{project?.name || "15/9-F-1 (KG Basin D6)"}</span>
            </div>
            <span className="switch-badge">Switch ▼</span>
          </div>

          {/* Status Badge */}
          <span className={`status-indicator-badge badge-${project?.statusType || 'active'}`}>
            <span className="pulse-dot" />
            <span>{project?.status || "DRILLING MONITOR"}</span>
          </span>
        </div>

        <div className="topbar-right">
          {/* Target Formation Context */}
          <div className="topbar-well-context">
            <span className="context-label">FORMATION:</span>
            <span className="context-val">{project?.formation || "Forties Sandstone"}</span>
          </div>

          {/* Engineer Profile */}
          <div className="engineer-badge">
            <div className="engineer-avatar">{user ? user.username : '123'}</div>
            <span>Engineer {user ? user.username : '123'}</span>
          </div>

          {/* Exit Button */}
          <button 
            className="btn-console-exit" 
            onClick={onExit} 
            title="Return to Landing Page"
          >
            <LogOut size={16} />
            <span>Exit Workspace</span>
          </button>
        </div>
      </header>

      {/* 2. Main Console Body (Sidebar + Workspace Canvas) */}
      <div className="console-body">
        {/* Left Sidebar */}
        <aside className="console-sidebar">
          <div className="sidebar-menu-label">ENGINEERING WORKFLOWS</div>
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
                  <Icon size={18} className="nav-icon" style={isActive ? { color: item.indicatorColor } : {}} />
                  <div className="nav-text-col">
                    <span className="nav-title">{item.label}</span>
                    <span className="nav-tag">{item.tag}</span>
                  </div>
                  {isActive && <div className="nav-active-indicator" style={{ background: item.indicatorColor }} />}
                </button>
              );
            })}
          </nav>

          {/* Projects Switcher Shortcut at Bottom of Sidebar */}
          <div className="sidebar-footer-card" onClick={onSwitchProject} style={{ cursor: 'pointer' }}>
            <div className="sfc-title">
              <FolderKanban size={14} color="#8F7C3A" />
              <span>Workspace Projects</span>
            </div>
            <p className="sfc-desc">
              Switch between Active Wells, New Planning, and Historical Analogue datasets.
            </p>
          </div>
        </aside>

        {/* Workspace Canvas */}
        <main className="console-canvas ertmac-canvas">
          {/* Screen 1: Active Well (Drilling Command Center) */}
          {activeTab === 'active_well' && (
            <ActiveWellMonitor 
              project={project}
              onOpenModal={onOpenModal}
              onOpenAIDrawer={handleOpenAIDrawerWithPrompt}
              onNavigateToOffsets={() => onTabChange('offsets')}
            />
          )}

          {/* Screen 2: New Well Planning */}
          {activeTab === 'planning' && (
            <PlanningWorkspace 
              project={project}
              onOpenModal={onOpenModal}
            />
          )}

          {/* Screen 3: Offset Intelligence & Similarity */}
          {activeTab === 'offsets' && (
            <OffsetIntelligence 
              project={project}
              onOpenModal={onOpenModal}
            />
          )}

          {/* Screen 4: Historical Event Explorer */}
          {activeTab === 'historical' && (
            <HistoricalExplorer 
              onOpenModal={onOpenModal}
            />
          )}
        </main>
      </div>

      {/* 3. Persistent 'Ask eRTMAC' AI Assistant Floating Drawer */}
      <AIAssistantDrawer 
        isOpen={isAIDrawerOpen}
        onToggle={setIsAIDrawerOpen}
        initialQuery={aiDrawerPrompt}
        onOpenModal={onOpenModal}
      />
    </div>
  );
}
