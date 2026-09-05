import React from 'react';

export default function Navbar({ onOpenModal }) {
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
            <li><a href="#workflow" className="nav-link">Lifecycle</a></li>
            <li><a href="#phases" className="nav-link">Core Phases</a></li>
          </ul>
        </nav>

        {/* Actions: Log in */}
        <div className="nav-actions">
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
