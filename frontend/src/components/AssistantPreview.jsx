import React, { useState } from 'react';
import { ASSISTANT_SUGGESTIONS } from '../data/mockData';
import { Bot, Send, Sparkles, MessageSquare, Terminal, FileCheck } from 'lucide-react';

export default function AssistantPreview({ onOpenModal }) {
  const [inputValue, setInputValue] = useState("");

  const handleAsk = (query) => {
    const q = query || inputValue || "Which offset wells had lost circulation between 2,200m and 2,500m?";
    onOpenModal({
      title: "NWIS Drilling Intelligence Assistant",
      subtitle: `Query: "${q}"`,
      content: `Searching structured wellbore database and 1,420 Daily Drilling Reports. Context: Active Well 15/9-F-1 at 1,842m MD in Forties Formation. Retaining 3 direct DDR citations and 2 directional survey analogues.`
    });
  };

  return (
    <section id="assistant" className="section-wrapper">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Natural Language Query Engine</span>
          <h2 className="section-title">
            Ask NWIS: Context-Aware Drilling Assistant
          </h2>
          <p className="section-description">
            Query thousands of offset Daily Drilling Reports, lithology logs, and risk forecasts in plain English. Every answer is grounded in factual engineering records with clickable citations.
          </p>
        </div>

        <div className="feature-box" style={{ maxWidth: '920px', margin: '0 auto' }}>
          {/* Chat Assistant Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--brand-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>NWIS Engineering Copilot</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Connected to Volve Field & BSEE Relational Database</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--palette-river-pine)' }}>
              CONTEXT: 15/9-F-1 @ 1,842m
            </div>
          </div>

          {/* Sample Chat Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {/* User Message */}
            <div style={{ alignSelf: 'flex-end', maxWidth: '80%', background: 'var(--brand-primary)', color: '#FFF', padding: '12px 18px', borderRadius: '16px 16px 4px 16px', fontSize: '0.9rem' }}>
              Which nearby offset wells experienced severe mud losses between 2,200m and 2,600m depth?
            </div>

            {/* Assistant Response with Citations */}
            <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', padding: '16px 20px', borderRadius: '16px 16px 16px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--palette-deep-peach)', marginBottom: '8px' }}>
                <Sparkles size={14} />
                <span>3 RELEVANT OFFSET WELLS IDENTIFIED</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.55, marginBottom: '12px' }}>
                Based on historical Volve Field data, 3 analogue wells reported lost circulation within this depth window:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                <div style={{ background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <strong>15/9-19 A</strong>: 35 bbl/hr total losses at 2,241m. <span style={{ color: 'var(--brand-secondary)', fontWeight: 600 }}>[DDR Day 43 • Regained returns via LCM pill]</span>
                </div>
                <div style={{ background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <strong>15/9-19 B</strong>: Partial seepage (12 bbl/hr) at 2,263m in Horda formation. <span style={{ color: 'var(--brand-secondary)', fontWeight: 600 }}>[DDR Day 38]</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
              SUGGESTED ENGINEERING QUERIES:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ASSISTANT_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(sug)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--palette-deep-peach)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Input Bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleAsk(); }}
            style={{ display: 'flex', gap: '10px' }}
          >
            <input
              type="text"
              placeholder="Ask NWIS about offset wells, formation risks, or parameter anomalies..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.92rem'
              }}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '12px 24px' }}
            >
              <Send size={16} />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
