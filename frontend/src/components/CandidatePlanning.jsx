import React, { useState } from 'react';
import { CANDIDATES_DATA } from '../data/mockData';
import { Award, CheckCircle, AlertTriangle, Layers, Compass, FileText, ArrowRight } from 'lucide-react';

export default function CandidatePlanning({ onOpenModal }) {
  const [selectedCandidateId, setSelectedCandidateId] = useState("B");

  const currentCandidate = CANDIDATES_DATA.find(c => c.id === selectedCandidateId) || CANDIDATES_DATA[0];

  return (
    <section id="planning" className="section-wrapper">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Pre-Spud Well Engineering</span>
          <h2 className="section-title">
            Candidate Location Ranking & Feasibility
          </h2>
          <p className="section-description">
            Evaluate candidate surface locations and trajectories against subsurface historical risk, terrain constraints, and offset well evidence before committing multi-million dollar drilling assets.
          </p>
        </div>

        <div className="feature-box">
          {/* Candidate Tabs */}
          <div className="candidate-selector">
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: 8 }}>
              SELECT CANDIDATE:
            </span>
            {CANDIDATES_DATA.map(c => (
              <button
                key={c.id}
                className={`candidate-tab-btn ${c.id === selectedCandidateId ? 'selected' : ''}`}
                onClick={() => setSelectedCandidateId(c.id)}
              >
                <span>{c.name}</span>
                {c.recommended && (
                  <span className="star-tag">RECOMMENDED</span>
                )}
              </button>
            ))}
          </div>

          <div className="candidate-content-grid">
            {/* Left: Overall Suitability & Scoring Breakdown */}
            <div>
              <div className="score-hero-box">
                <div>
                  <div className="score-title">{currentCandidate.name} Suitability</div>
                  <div className="score-sub">
                    Target: {currentCandidate.targetFormation} • TVD {currentCandidate.targetDepth}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="score-digit">{currentCandidate.score}<span style={{ fontSize: '1.5rem' }}>%</span></div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-secondary)' }}>
                    {currentCandidate.recommended ? "HIGHEST RANKED" : "EVALUATED"}
                  </div>
                </div>
              </div>

              {/* Multi-Factor Scoring Meters */}
              <div className="meter-list">
                <div className="meter-row">
                  <div className="meter-header">
                    <span>Trajectory Feasibility (Max Inclination 24°)</span>
                    <span style={{ fontWeight: 700 }}>{currentCandidate.trajectoryFeasibility}%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${currentCandidate.trajectoryFeasibility}%` }} />
                  </div>
                </div>

                <div className="meter-row">
                  <div className="meter-header">
                    <span>Historical Offset Evidence Quality</span>
                    <span style={{ fontWeight: 700 }}>{currentCandidate.offsetEvidence}%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${currentCandidate.offsetEvidence}%` }} />
                  </div>
                </div>

                <div className="meter-row">
                  <div className="meter-header">
                    <span>Surface & Logistics Accessibility</span>
                    <span style={{ fontWeight: 700 }}>{currentCandidate.surfaceAccessibility}%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${currentCandidate.surfaceAccessibility}%` }} />
                  </div>
                </div>

                <div className="meter-row">
                  <div className="meter-header">
                    <span>Historical Drilling Risk Score (Lower is safer)</span>
                    <span style={{ fontWeight: 700, color: currentCandidate.historicalRiskScore > 40 ? 'var(--brand-danger)' : 'var(--brand-secondary)' }}>
                      {currentCandidate.historicalRiskScore}/100
                    </span>
                  </div>
                  <div className="meter-track">
                    <div 
                      className="meter-fill" 
                      style={{ 
                        width: `${currentCandidate.historicalRiskScore}%`, 
                        background: currentCandidate.historicalRiskScore > 40 ? 'var(--brand-danger)' : 'var(--palette-deep-peach)' 
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Explainability & Evidence Points */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={18} color="var(--brand-accent)" />
                  <span>Explainability & Rationale</span>
                </h4>

                {/* Pros */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--palette-river-pine)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Why this candidate scored {currentCandidate.score}%:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentCandidate.pros.map((pro, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle size={15} color="#8F7C3A" style={{ flexShrink: 0, marginTop: 3 }} />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concerns */}
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--palette-maroon)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Identified Subsurface Concerns:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentCandidate.concerns.map((con, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                        <AlertTriangle size={15} color="var(--brand-danger)" style={{ flexShrink: 0, marginTop: 3 }} />
                        <span>{con}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => onOpenModal({
                    title: `Generate Well Plan: ${currentCandidate.name}`,
                    subtitle: `Target: ${currentCandidate.targetFormation} (${currentCandidate.targetDepth})`,
                    content: `Compiling well planning report for ${currentCandidate.name}. Linking ${currentCandidate.existingOffsetCount} supporting offset wells, directional survey constraints, and geological risk mitigation steps.`
                  })}
                >
                  <FileText size={16} />
                  <span>Generate Well Plan</span>
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => onOpenModal({
                    title: "Subsurface vs Surface Geospatial Layers",
                    subtitle: "Multi-Source Satellite & Bathymetry Overlays",
                    content: "Toggling active layers: Existing Wells, 2D Trajectories, Surface Water Corridors, Infrastructure Rights-of-Way, and Fault Hazard Polygons."
                  })}
                >
                  <Layers size={16} />
                  <span>Toggle Layers</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
