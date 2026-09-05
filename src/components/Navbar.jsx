import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function Navbar({ theme, onToggleTheme, onOpenModal }) {
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
          <span className="brand-title">NWIS</span>
        </a>

        {/* Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li><a href="#overview" className="nav-link">Platform</a></li>
            <li><a href="#features" className="nav-link">Capabilities</a></li>
            <li><a href="#telemetry" className="nav-link">Live Telemetry</a></li>
          </ul>
        </nav>

        {/* Actions: Theme Toggle & Log in */}
        <div className="nav-actions">
          <button 
            className="theme-toggle-btn" 
            onClick={onToggleTheme} 
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} color="#E1D3A9" /> : <Moon size={18} color="#FAF7F2" />}
          </button>

          <button 
            className="btn-nav-login"
            onClick={() => onOpenModal({
              title: "Log In to NWIS Console",
              subtitle: "Unified Drilling Decision Support System",
              content: "Sign in with your engineer credentials to access active well trajectories, WITSML telemetry, and offset well databases."
            })}
          >
            Log in
          </button>
        </div>
      </div>
    </header>
  );
}
