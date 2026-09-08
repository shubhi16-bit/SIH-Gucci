import React, { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext(null);

export const DEFAULT_PROJECTS = [
  {
    id: 'kg-basin',
    name: 'KG Basin D6 (15/9-F-1 Context)',
    field: 'Krishna-Godavari / Volve Analogue',
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
    desc: 'WITSML telemetry stream indicating torque micro-fluctuations matching offset stuck-pipe signatures at 2,145m.'
  },
  {
    id: 'volve-p1',
    name: 'Volve Block 15/9 Prospect',
    field: 'North Sea Block 15/9',
    formation: 'Hugin / Forties Sandstone',
    status: 'PLANNING',
    statusType: 'planning',
    workflowType: 'New Exploration Prospect',
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

export function ProjectProvider({ children }) {
  // 1. Current Project Context
  const [currentProject, setCurrentProject] = useState(() => {
    try {
      const saved = localStorage.getItem('nwis-active-project');
      return saved ? JSON.parse(saved) : DEFAULT_PROJECTS[0];
    } catch {
      return DEFAULT_PROJECTS[0];
    }
  });

  // 2. Selected Planning Candidate Context
  const [selectedCandidate, setSelectedCandidate] = useState(() => {
    try {
      const saved = localStorage.getItem('nwis-selected-candidate');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 3. User Authentication
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nwis-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 4. Workspace Theme
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nwis-theme') || 'dark';
  });

  // Keep theme attribute in sync with document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nwis-theme', theme);
  }, [theme]);

  const selectProject = (proj) => {
    setCurrentProject(proj);
    localStorage.setItem('nwis-active-project', JSON.stringify(proj));
  };

  const createProject = (proj) => {
    setCurrentProject(proj);
    localStorage.setItem('nwis-active-project', JSON.stringify(proj));
  };

  const selectCandidate = (cand) => {
    setSelectedCandidate(cand);
    localStorage.setItem('nwis-selected-candidate', JSON.stringify(cand));
  };

  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem('nwis-user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('nwis-user');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects: DEFAULT_PROJECTS,
        currentProject,
        selectProject,
        createProject,
        selectedCandidate,
        selectCandidate,
        user,
        isLoggedIn: !!user,
        loginUser,
        logoutUser,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

