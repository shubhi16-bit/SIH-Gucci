import React, { useState } from 'react';
import { OFFSET_WELLS } from '../data/mockData';
import { Database, GitCompare, History, HelpCircle, ChevronRight, Check } from 'lucide-react';

export default function OffsetIntelligence({ onOpenModal }) {
  const [selectedWellId, setSelectedWellId] = useState("15/9-19 A");

  const activeWell = OFFSET_WELLS.find(w => w.id === selectedWellId) || OFFSET_WELLS[0];

  return (
    <section id="offsets" className="section-wrapper">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Subsurface Analogue Matching</span>
          <h2 className="section-title">
            Offset Intelligence & Well Similarity Engine
          </h2>
          <p className="section-description">
            Distance is not similarity. NWIS calculates multi-dimensional analogue compatibility based on lithology, formation pore pressure, trajectory curvature, and depth overlap.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '32px' }}>
          {/* Left Column: Ranked Similar Offset Wells */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Ranked Analogous Wells ({OFFSET_WELLS.length} Found in Volve Field)
            </div>

            {OFFSET_WELLS.map((well, idx) => {
              const isSelected = well.id === selectedWellId;
              return (
                <div
                  key={well.id}
                  onClick={() => setSelectedWellId(well.id)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: `1.5px solid ${isSelected ? 'var(--palette-deep-peach)' : 'var(--border-card)'}`,
                    borderRadius: '16px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--palette-clay-dust)', fontFamily: 'monospace' }}>
                        RANK #{idx + 1} • {well.field}
                      </span>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {well.id}
                      </h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--palette-deep-peach)' }}>
                        {well.similarity}%
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>SIMILARITY</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    <span>Target: <strong>{well.formation}</strong></span>
                    <span>•</span>
                    <span>TD: <strong>{well.td}</strong></span>
                    <span>•</span>
                    <span>Incidents: <strong>{well.eventsCount}</strong></span>
                  </div>

                  <div style={{ 
                    background: 'var(--bg-subtle)', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    fontSize: '0.78rem',
                    color: 'var(--palette-maroon)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Key historical event: {well.topEvent}</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Explainability - WHY IS THIS WELL SIMILAR? */}
          <div className="feature-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-secondary)', textTransform: 'uppercase' }}>
                    Analogue Compatibility Breakdown
                  </span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Why is {activeWell.id} {activeWell.similarity}% Similar?
                  </h3>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  onClick={() => onOpenModal({
                    title: `Well-to-Well Comparison: Planned vs ${activeWell.id}`,
                    subtitle: "Synchronized Depth Track Correlation",
                    content: `Comparing lithology columns, ROP curves, torque logs, and casing shoes between planned candidate and offset well ${activeWell.id} from surface down to 3,200m MD.`
                  })}
                >
                  <GitCompare size={14} />
                  <span>Compare Curves</span>
                </button>
              </div>

              {/* Similarity Factors Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  <span>Target Formation Match (Forties Reservoir)</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>30% / 30%</span>
                </div>
                <div className="meter-track">
                  <div className="meter-fill" style={{ width: '100%', background: 'var(--palette-river-pine)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  <span>Total Depth Overlap & Interval Correlation</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>25% / 25%</span>
                </div>
                <div className="meter-track">
                  <div className="meter-fill" style={{ width: '96%', background: 'var(--palette-river-pine)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  <span>Directional Trajectory & Dogleg Severity</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>18% / 20%</span>
                </div>
                <div className="meter-track">
                  <div className="meter-fill" style={{ width: '90%', background: 'var(--palette-river-pine)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  <span>Spatial Proximity within Volve Basin ({activeWell.td})</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>15% / 15%</span>
                </div>
                <div className="meter-track">
                  <div className="meter-fill" style={{ width: '100%', background: 'var(--palette-river-pine)' }} />
                </div>
              </div>

              {/* Historical Depth Event Timeline Preview */}
              <div style={{ background: 'var(--bg-subtle)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  <History size={16} color="var(--brand-accent)" />
                  <span>Historical Event Depth Markers in {activeWell.id}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '12px 0' }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, background: 'var(--palette-clay-dust)', zIndex: 1 }} />
                  
                  <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--palette-river-pine)', margin: '0 auto 4px' }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace' }}>0m Surface</span>
                  </div>

                  <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--palette-deep-peach)', margin: '0 auto 4px' }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--palette-deep-peach)' }}>1,840m Kick</span>
                  </div>

                  <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--palette-maroon)', margin: '0 auto 4px' }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--palette-maroon)' }}>2,840m Mud Loss</span>
                  </div>

                  <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--palette-river-pine)', margin: '0 auto 4px' }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace' }}>3,200m TD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <button
              className="btn btn-primary"
              style={{ marginTop: '20px', width: '100%' }}
              onClick={() => onOpenModal({
                title: `Offset Dossier: ${activeWell.id}`,
                subtitle: "Volve Field Digital Well Archive",
                content: `Loading complete daily drilling reports, directional survey records, mud weight windows, and casing programmes for offset well ${activeWell.id}.`
              })}
            >
              <span>Inspect Full Historical Offset Dossier</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
