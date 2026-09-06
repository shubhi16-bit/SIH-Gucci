import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StreamlinedFeatures from './components/StreamlinedFeatures';
import LoginModal from './components/LoginModal';
import ProjectHub from './components/ProjectHub';
import EngineeringConsole from './components/EngineeringConsole';
import ActionModal from './components/ActionModal';
import Footer from './components/Footer';

export default function App() {
  // Navigation View: 'landing' | 'project_hub' | 'console'
  const [view, setView] = useState('landing');
  
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Current active project
  const [currentProject, setCurrentProject] = useState({
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
    defaultScreen: 'active_well'
  });

  // Active module tab in console ('active_well' | 'planning' | 'offsets' | 'historical')
  const [activeConsoleTab, setActiveConsoleTab] = useState('active_well');

  // Modal state for interactive details
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const handleOpenLogin = () => {
    if (isLoggedIn) {
      setView('project_hub');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setShowLoginModal(false);
    setView('project_hub');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setView('landing');
  };

  const handleOpenProjects = () => {
    setView('project_hub');
  };

  const handleOpenDemo = () => {
    // Directly launch into the active drilling well command center for reviewers
    setCurrentProject({
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
      defaultScreen: 'active_well'
    });
    setActiveConsoleTab('active_well');
    setView('console');
  };

  const handleSelectProject = (project, targetScreen = 'active_well') => {
    setCurrentProject(project);
    setActiveConsoleTab(targetScreen || project.defaultScreen || 'active_well');
    setView('console');
  };

  const handleCreateProject = (newProject) => {
    setCurrentProject(newProject);
    setActiveConsoleTab('planning');
    setView('console');
  };

  const handleOpenModal = (data) => {
    setModalData(data);
  };

  const handleCloseModal = () => {
    setModalData(null);
  };

  return (
    <div className="app-wrapper">
      {view === 'console' ? (
        /* Full Authenticated Engineering Console */
        <EngineeringConsole
          project={currentProject}
          activeTab={activeConsoleTab}
          onTabChange={setActiveConsoleTab}
          onSwitchProject={() => setView('project_hub')}
          onExit={() => setView('landing')}
          onOpenModal={handleOpenModal}
          user={user}
        />
      ) : (
        /* Minimal Landing Page */
        <>
          <Navbar 
            isLoggedIn={isLoggedIn}
            user={user}
            onOpenLogin={handleOpenLogin}
            onOpenProjects={handleOpenProjects}
            onOpenDemo={handleOpenDemo}
            onLogout={handleLogout}
          />
          <Hero 
            isLoggedIn={isLoggedIn}
            onOpenLogin={handleOpenLogin}
            onOpenProjects={handleOpenProjects}
            onOpenDemo={handleOpenDemo}
            onOpenModal={handleOpenModal} 
          />
          <div className="hero-scroll-fade-transition" />
          <StreamlinedFeatures onOpenModal={handleOpenModal} />
          <Footer />
        </>
      )}

      {/* Engineer Login Modal */}
      {showLoginModal && (
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* eRTMAC-NWIS Workspace & Project Hub */}
      {view === 'project_hub' && (
        <ProjectHub
          user={user}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onClose={() => setView('landing')}
          onLogout={handleLogout}
        />
      )}

      {/* Detail Action Modal */}
      <ActionModal 
        data={modalData} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}
