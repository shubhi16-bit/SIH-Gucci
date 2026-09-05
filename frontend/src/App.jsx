import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StreamlinedFeatures from './components/StreamlinedFeatures';
import ProjectHub from './components/ProjectHub';
import EngineeringConsole from './components/EngineeringConsole';
import ActionModal from './components/ActionModal';
import Footer from './components/Footer';

export default function App() {
  // Navigation View: 'landing' | 'project_hub' | 'console'
  const [view, setView] = useState('landing');
  
  // Current active project
  const [currentProject, setCurrentProject] = useState({
    id: 'raj-a',
    name: 'Rajasthan Block A',
    basin: 'Barmer Basin / Western Onshore',
    status: 'Planning Mode',
    candidate: 'Candidate B (Recommended)',
    score: 89,
    depth: '3,200 m',
    formation: 'Fatehgarh Sandstone',
    offsetWells: 5,
    alerts: 1,
    desc: 'Pre-spud planning with 5 offset wells correlated. Candidate B selected for optimal trajectory feasibility.'
  });

  // Active module tab in console
  const [activeConsoleTab, setActiveConsoleTab] = useState('dashboard');

  // Modal state for interactive details
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const handleOpenLogin = () => {
    setView('project_hub');
  };

  const handleSelectProject = (project) => {
    setCurrentProject(project);
    setActiveConsoleTab('dashboard');
    setView('console');
  };

  const handleCreateProject = (newProject) => {
    setCurrentProject(newProject);
    setActiveConsoleTab('explore'); // Per document: go directly to Explore & Plan map to place candidates
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
        />
      ) : (
        /* Minimal Landing Page */
        <>
          <Navbar onOpenModal={handleOpenLogin} />
          <Hero onOpenModal={handleOpenLogin} />
          <div className="hero-scroll-fade-transition" />
          <StreamlinedFeatures onOpenModal={handleOpenModal} />
          <Footer onOpenModal={handleOpenModal} />
        </>
      )}

      {/* Project Hub Modal / Wizard */}
      {view === 'project_hub' && (
        <ProjectHub
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onClose={() => setView('landing')}
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
