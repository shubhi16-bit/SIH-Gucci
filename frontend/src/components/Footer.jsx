import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        {/* Brand Block */}
        <div className="footer-brand" style={{ maxWidth: '640px', marginBottom: '36px' }}>
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
            <span className="provenance-tag">Volve Field &amp; BSEE Datasets</span>
            <span className="provenance-tag">WITSML 1.4 / 2.0</span>
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
