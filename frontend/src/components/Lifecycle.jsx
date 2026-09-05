import React, { useState } from 'react';
import { LIFECYCLE_STAGES } from '../data/mockData';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default function Lifecycle({ onOpenModal }) {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <section id="workflow" className="section-wrapper">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Continuous Decision Support Loop</span>
          <h2 className="section-title">
            The Complete 5-Stage Well Lifecycle
          </h2>
          <p className="section-description">
            Instead of just warning engineers when a drill bit is already in danger, NWIS empowers drilling teams before spudding, guides trajectory design, predicts depth-correlated hazards, and preserves lessons learned into institutional memory.
          </p>
        </div>

        {/* 5-Stage Pipeline Cards */}
        <div className="lifecycle-grid">
          {LIFECYCLE_STAGES.map((stage, idx) => {
            const isSelected = activeStage === idx;
            return (
              <div 
                key={stage.step}
                className={`lifecycle-card ${isSelected ? 'is-active' : ''}`}
                onClick={() => setActiveStage(idx)}
                style={{ cursor: 'pointer' }}
              >
                <span className="lifecycle-step-num">{stage.step} / 05</span>
                <h3 className="lifecycle-phase">{stage.phase}</h3>
                <span className="lifecycle-badge">{stage.badge}</span>
                
                <h4 className="lifecycle-question">{stage.title}</h4>
                <p className="lifecycle-desc">{stage.description}</p>

                <ul className="lifecycle-points">
                  {stage.points.map((pt, pIdx) => (
                    <li key={pIdx}>
                      <CheckCircle2 size={13} color="var(--brand-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className="btn btn-outline-pill"
                  style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenModal({
                      title: `Stage ${stage.step}: ${stage.phase} Intelligence Module`,
                      subtitle: stage.title,
                      content: `${stage.description} This module connects with the SIH 26121 backend engine to evaluate geospatial layers, risk correlations, and telemetry feeds.`
                    });
                  }}
                >
                  <span>Explore {stage.phase}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
