import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StreamlinedFeatures from './components/StreamlinedFeatures';
import LoginModal from './components/LoginModal';
import ProjectHub from './components/ProjectHub';
import EngineeringConsole from './components/EngineeringConsole';
import ActionModal from './components/ActionModal';
import Footer from './components/Footer';
import { ProjectProvider, useProject } from './context/ProjectContext';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentProject,
    selectProject,
    createProject,
    user,
    isLoggedIn,
    loginUser,
    logoutUser,
    theme,
    toggleTheme,
  } = useProject();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const isLanding = location.pathname === '/';

  useEffect(() => {
    // Landing page stays strictly in dark mode; post-landing follows user theme
    if (isLanding) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [isLanding, theme]);

  const handleOpenLogin = () => {
    if (isLoggedIn) {
      navigate('/projects');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (userData) => {
    loginUser(userData);
    setShowLoginModal(false);
    navigate('/projects');
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const handleSelectProject = (project, targetScreen = 'active_well') => {
    selectProject(project);
    const routeMap = {
      active_well: '/active',
      planning: '/planning',
      map: '/map',
      offsets: '/offsets',
      historical: '/history'
    };
    navigate(routeMap[targetScreen] || '/active');
  };

  const handleCreateProject = (newProject) => {
    createProject(newProject);
    navigate('/planning');
  };

  const handleOpenModal = (data) => {
    setModalData(data);
  };

  const handleCloseModal = () => {
    setModalData(null);
  };

  return (
    <div className="app-wrapper">
      <Routes>
        {/* Route 1: Landing Page */}
        <Route
          path="/"
          element={
            <>
              <Navbar 
                isLoggedIn={isLoggedIn}
                user={user}
                onOpenLogin={handleOpenLogin}
                onOpenProjects={() => navigate('/projects')}
                onOpenDemo={() => navigate('/active')}
                onLogout={handleLogout}
              />
              <Hero 
                isLoggedIn={isLoggedIn}
                onOpenLogin={handleOpenLogin}
                onOpenProjects={() => navigate('/projects')}
                onOpenDemo={() => navigate('/active')}
                onOpenModal={handleOpenModal} 
              />
              <div className="hero-scroll-fade-transition" />
              <StreamlinedFeatures onOpenModal={handleOpenModal} />
              <Footer />
            </>
          }
        />

        {/* Route 2: Project Hub */}
        <Route
          path="/projects"
          element={
            <ProjectHub
              user={user}
              onSelectProject={handleSelectProject}
              onCreateProject={handleCreateProject}
              onClose={() => navigate(-1 || '/')}
              onLogout={handleLogout}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        {/* Route 3: Console Tabs with Deep Link Routes */}
        <Route
          path="/active"
          element={
            <EngineeringConsole
              project={currentProject}
              activeTab="active_well"
              onTabChange={(tab) => {
                const map = { active_well: '/active', planning: '/planning', map: '/map', offsets: '/offsets', historical: '/history' };
                navigate(map[tab] || '/active');
              }}
              onSwitchProject={() => navigate('/projects')}
              onExit={() => navigate('/')}
              onOpenModal={handleOpenModal}
              user={user}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/active/:well"
          element={
            <EngineeringConsole
              project={currentProject}
              activeTab="active_well"
              onTabChange={(tab) => {
                const map = { active_well: '/active', planning: '/planning', map: '/map', offsets: '/offsets', historical: '/history' };
                navigate(map[tab] || '/active');
              }}
              onSwitchProject={() => navigate('/projects')}
              onExit={() => navigate('/')}
              onOpenModal={handleOpenModal}
              user={user}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/planning"
          element={
            <EngineeringConsole
              project={currentProject}
              activeTab="planning"
              onTabChange={(tab) => {
                const map = { active_well: '/active', planning: '/planning', map: '/map', offsets: '/offsets', historical: '/history' };
                navigate(map[tab] || '/planning');
              }}
              onSwitchProject={() => navigate('/projects')}
              onExit={() => navigate('/')}
              onOpenModal={handleOpenModal}
              user={user}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/map"
          element={
            <EngineeringConsole
              project={currentProject}
              activeTab="map"
              onTabChange={(tab) => {
                const map = { active_well: '/active', planning: '/planning', map: '/map', offsets: '/offsets', historical: '/history' };
                navigate(map[tab] || '/map');
              }}
              onSwitchProject={() => navigate('/projects')}
              onExit={() => navigate('/')}
              onOpenModal={handleOpenModal}
              user={user}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/offsets"
          element={
            <EngineeringConsole
              project={currentProject}
              activeTab="offsets"
              onTabChange={(tab) => {
                const map = { active_well: '/active', planning: '/planning', map: '/map', offsets: '/offsets', historical: '/history' };
                navigate(map[tab] || '/offsets');
              }}
              onSwitchProject={() => navigate('/projects')}
              onExit={() => navigate('/')}
              onOpenModal={handleOpenModal}
              user={user}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        <Route
          path="/history"
          element={
            <EngineeringConsole
              project={currentProject}
              activeTab="historical"
              onTabChange={(tab) => {
                const map = { active_well: '/active', planning: '/planning', map: '/map', offsets: '/offsets', historical: '/history' };
                navigate(map[tab] || '/history');
              }}
              onSwitchProject={() => navigate('/projects')}
              onExit={() => navigate('/')}
              onOpenModal={handleOpenModal}
              user={user}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          }
        />

        {/* Console root redirect */}
        <Route path="/console" element={<Navigate to="/active" replace />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Engineer Login Modal */}
      {showLoginModal && (
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
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

export default function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ProjectProvider>
  );
}
