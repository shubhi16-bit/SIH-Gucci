import React from 'react';
import { User, LogOut, FolderKanban } from 'lucide-react';

export default function Navbar({ isLoggedIn, user, onOpenLogin, onOpenProjects, onLogout }) {
  return (
    <header className="navbar">
      <div className="container nav-content">
        {/* Brand Logo with 3 vertical bars matching screenshot */}
        <a href="#overview" className="brand-logo">
          <div className="brand-bars-icon">
            <div className="brand-bar brand-bar-1" />
            <div className="brand-bar brand-bar-2" />
            <div className="brand-bar brand-bar-3" />
          </div>
          <span className="brand-title">eRTMAC-NWIS</span>
        </a>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li><a href="#overview" className="nav-link">Platform</a></li>
            <li><a href="#workflow" className="nav-link">Lifecycle</a></li>
            <li><a href="#phases" className="nav-link">Core Phases</a></li>
          </ul>
        </nav>

        {/* Actions: Log in / User Session */}
        <div className="nav-actions">
          {isLoggedIn ? (
            <div className="nav-user-session">
              <button 
                className="btn-nav-projects"
                onClick={onOpenProjects}
                title="View Well Projects"
              >
                <FolderKanban size={15} color="#8F7C3A" />
                <span>My Projects</span>
              </button>

              <div className="nav-user-pill">
                <User size={14} color="#8F7C3A" />
                <span>Engineer {user ? user.username : '123'}</span>
              </div>

              <button 
                className="btn-nav-logout"
                onClick={onLogout}
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button 
              className="btn-nav-login"
              onClick={onOpenLogin}
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
