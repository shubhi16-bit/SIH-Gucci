import React, { useState } from 'react';
import { EVIDENCE_SAMPLE } from '../data/mockData';
import { ShieldAlert, FileText, CheckCircle, ExternalLink, Bookmark, Info } from 'lucide-react';

export default function RiskEvidence({ onOpenModal }) {
  const [activeRiskCategory, setActiveRiskCategory] = useState("pressure");

  const riskCategories = [
    { id: "pressure", name: "Standpipe Pressure Issue", level: "HIGH", color: "#5E2A25", score: "0.84" },
    { id: "stuck", name: "Differential Stuck Pipe", level: "MEDIUM", color: "#A85530", score: "0.48" },
    { id: "loss", name: "Lost Circulation / Fracturing", level: "MEDIUM", color: "#A85530", score: "0.52" },
    { id: "kick", name: "Influx / Wellbore Kick", level: "LOW", color: "#534831", score: "0.14" },
  ];

  return (
    <section id="evidence" className="section-wrapper">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Explainable Engineering Provenance</span>
          <h2 className="section-title">
            Risk Predictions Backed by Auditable Source Evidence
          </h2>
          <p className="section-description">
            No black-box hallucinations. Every risk alert links directly to physical Daily Drilling Reports (DDR), lithology logs, and regulatory event filings from analogous wells.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '32px' }}>
          {/* Left: Active Drilling Risk Categories */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '14px' }}>
              Real-Time Risk Classification (Depth 1,842m)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {riskCategories.map(cat => {
                const isSelected = activeRiskCategory === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setActiveRiskCategory(cat.id)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: `1.5px solid ${isSelected ? 'var(--palette-deep-peach)' : 'var(--border-card)'}`,
                      borderRadius: '14px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Model confidence score: <strong style={{ fontFamily: 'monospace' }}>{cat.score}</strong>
                      </div>
                    </div>

                    <div style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#FFF',
                      background: cat.color
                    }}>
                      {cat.level}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Provenance Tier Badges */}
            <div style={{ marginTop: '24px', background: 'var(--bg-subtle)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                DATA PROVENANCE TIERS:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.72rem' }}>
                <span style={{ background: '#534831', color: '#FFF', padding: '3px 8px', borderRadius: '6px' }}>● Directly Reported (DDR)</span>
                <span style={{ background: '#8F7C3A', color: '#FFF', padding: '3px 8px', borderRadius: '6px' }}>▲ Rule-Derived</span>
                <span style={{ background: '#A85530', color: '#FFF', padding: '3px 8px', borderRadius: '6px' }}>◆ ML Model Forecast</span>
              </div>
            </div>
          </div>

          {/* Right: Source Evidence Card */}
          <div className="feature-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <span className="provenance-tag">
                  <Bookmark size={13} />
                  <span>{EVIDENCE_SAMPLE.provenance}</span>
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 8 }}>
                  Incident Dossier: {EVIDENCE_SAMPLE.incident}
                </h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--brand-secondary)' }}>
                  {EVIDENCE_SAMPLE.confidence}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ANALOGUE WELL</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{EVIDENCE_SAMPLE.wellId}</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>INCIDENT DEPTH</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{EVIDENCE_SAMPLE.depth}</div>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ARCHIVE SOURCE</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{EVIDENCE_SAMPLE.source}</div>
              </div>
            </div>

            {/* Quote excerpt from actual DDR */}
            <div className="evidence-quote">
              "{EVIDENCE_SAMPLE.excerpt}"
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Report Date: {EVIDENCE_SAMPLE.date} • Operator: Equinor (Volve Field)
              </span>

              <button
                className="btn btn-secondary"
                onClick={() => onOpenModal({
                  title: `Daily Drilling Report: ${EVIDENCE_SAMPLE.source}`,
                  subtitle: `Well ${EVIDENCE_SAMPLE.wellId} • Depth ${EVIDENCE_SAMPLE.depth}`,
                  content: `Displaying verbatim OCR transcript and sensor log attachments for Daily Drilling Report #43. Includes standpipe pressure trace, mud rheology, BHA component serials, and drill crew shift notes.`
                })}
              >
                <ExternalLink size={15} />
                <span>View Full DDR Document</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
