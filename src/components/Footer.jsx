import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function Footer({ onOpenModal }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <a href="#top" className="brand-logo" style={{ marginBottom: 12 }}>
              <div className="brand-bars-icon">
                <div className="brand-bar brand-bar-1" />
                <div className="brand-bar brand-bar-2" />
                <div className="brand-bar brand-bar-3" />
              </div>
              <span className="brand-title">NWIS</span>
            </a>
            <p>
              National Well Intelligence System — Turning historical drilling experience and geospatial telemetry into continuous decision support across the entire well lifecycle.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="provenance-tag">SIH 2026 Problem Statement SIH26121</span>
              <span className="provenance-tag">Volve Field & BSEE Datasets</span>
              <span className="provenance-tag">WITSML 1.4 / 2.0</span>
            </div>
          </div>

          {/* Workflow Links */}
          <div>
            <div className="footer-col-title">5-Stage Workflow</div>
            <ul className="footer-links">
              <li><a href="#workflow" className="footer-link">01. Explore (Geospatial)</a></li>
              <li><a href="#planning" className="footer-link">02. Plan (Candidate Ranking)</a></li>
              <li><a href="#offsets" className="footer-link">03. Predict (Risk Zones)</a></li>
              <li><a href="#monitor" className="footer-link">04. Drill (WITSML Replay)</a></li>
              <li><a href="#workflow" className="footer-link">05. Learn (Memory Loop)</a></li>
            </ul>
          </div>

          {/* Modules */}
          <div>
            <div className="footer-col-title">Core Modules</div>
            <ul className="footer-links">
              <li>
                <button 
                  className="footer-link" 
                  onClick={() => onOpenModal({
                    title: "Candidate Location Engine",
                    subtitle: "Subsurface Suitability vs Surface Accessibility",
                    content: "Combines 2D/3D trajectory planning, anti-collision rules, and regional lithology correlation."
                  })}
                >
                  Candidate Ranking
                </button>
              </li>
              <li>
                <button 
                  className="footer-link" 
                  onClick={() => onOpenModal({
                    title: "Analogue Similarity Radar",
                    subtitle: "Lithology & Pore Pressure Matching",
                    content: "Finds comparable historical wells across Volve and BSEE basins using multi-parameter weighted scoring."
                  })}
                >
                  Offset Intelligence
                </button>
              </li>
              <li>
                <button 
                  className="footer-link" 
                  onClick={() => onOpenModal({
                    title: "WITSML 1.4/2.0 Telemetry Stream",
                    subtitle: "Historical Drilling Telemetry Replay",
                    content: "High-frequency surface sensor replay (ROP, WOB, RPM, Torque, SPP, Flow) with synchronized depth intervals."
                  })}
                >
                  Drilling Monitor
                </button>
              </li>
              <li>
                <button 
                  className="footer-link" 
                  onClick={() => onOpenModal({
                    title: "Daily Drilling Report (DDR) Archive",
                    subtitle: "Ground Truth Verifiable Citations",
                    content: "Physical daily drilling reports with OCR text search, event logs, and engineer shift notes."
                  })}
                >
                  Evidence Archive
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            © 2026 NWIS Drilling Intelligence Platform. Smart India Hackathon Prototype.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Security</span>
            <span>•</span>
            <span>WITSML Standard 1.4 / 2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
