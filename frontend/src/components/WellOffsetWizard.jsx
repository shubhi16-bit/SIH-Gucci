import React, { useMemo, useState } from 'react';
import WellMap from './WellMap';
import ProjectCreatedView from './ProjectCreated';
import {
  candidateLocations,
  candidateRisk,
  haversineKm,
  nearbyWells,
  riskColors,
} from '../data/wellData';

const STEPS = [
  'Search Area',
  'View Nearby Wells',
  'Inspect Well Details',
  'Shortlist Candidates',
  'Create Project',
];

const STEP_HINTS = {
  1: 'Search an area to drill to establish your target region.',
  2: 'Review all the nearby dug up wells surrounding your target area.',
  3: 'View the description and risk profile of those dug up wells.',
  4: 'Compare risks and choose from your shortlisted candidate locations.',
  5: 'Finalize your selection and create the project permanently.',
};

export default function WellOffsetWizard({ theme = 'dark', onGoDashboard }) {
  const isDark = theme === 'dark';
  const [phase, setPhase] = useState('explore');
  const [project, setProject] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [selectedWellId, setSelectedWellId] = useState(null);
  const [selectedCandidates, setSelectedCandidates] = useState(() => new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [referencePoint, setReferencePoint] = useState(null);

  const legend = useMemo(
    () => [
      { color: '#22c55e', label: 'Successful Wells' },
      { color: '#ef4444', label: 'Problem Wells' },
      { color: isDark ? '#dfe6f3' : '#6d6d6d', label: 'Historical Wells' },
      { color: isDark ? '#f1d84a' : '#d1a937', label: 'Risk Zones' },
      { color: '#3b82f6', label: 'Candidate Locations' },
    ],
    [isDark]
  );

  const chosen = useMemo(
    () => candidateLocations.filter((c) => selectedCandidates.has(c.id)),
    [selectedCandidates]
  );

  const sortedWells = useMemo(() => {
    if (!referencePoint) return nearbyWells;
    return [...nearbyWells].sort(
      (a, b) => haversineKm(referencePoint, a) - haversineKm(referencePoint, b)
    );
  }, [referencePoint]);

  const selectWell = (id) => {
    if (!id) {
      setSelectedWellId(null);
      return;
    }
    const next = selectedWellId === id ? null : id;
    setSelectedWellId(next);
    if (next && activeStep < 3) setActiveStep(3);
  };

  const toggleCandidate = (id) => {
    const next = new Set();
    if (!selectedCandidates.has(id)) {
      next.add(id);
      if (activeStep < 4) setActiveStep(4);
    } else {
      setConfirmed(false);
    }
    setSelectedCandidates(next);
  };

  const confirmSelection = () => {
    if (selectedCandidates.size === 0) return;
    setConfirmed(true);
    setActiveStep(5);
  };

  const createProject = () => {
    if (!confirmed) return;
    const inspected = selectedWellId
      ? nearbyWells.find((w) => w.id === selectedWellId) ?? null
      : null;
    setProject({
      id: `WIS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleString(),
      reference: referencePoint,
      inspectedWell: inspected,
      candidates: chosen.map((c) => ({ candidate: c, risk: candidateRisk(c) })),
    });
    setPhase('created');
  };

  const startNew = () => {
    setPhase('explore');
    setProject(null);
    setActiveStep(1);
    setSelectedWellId(null);
    setSelectedCandidates(new Set());
    setConfirmed(false);
    setReferencePoint(null);
  };

  const canProceedTo = (next) => {
    if (next === 4) return selectedWellId !== null;
    if (next === 5) return confirmed;
    return true;
  };

  const goNext = () => {
    const next = activeStep + 1;
    if (next > STEPS.length || !canProceedTo(next)) return;
    setActiveStep(next);
  };

  if (phase === 'created' && project) {
    return <ProjectCreatedView project={project} onRestart={startNew} onGoDashboard={onGoDashboard} />;
  }

  const p = {
    bg: 'var(--w-bg)',
    panel: 'var(--w-panel)',
    panel2: 'var(--w-panel2)',
    border: 'var(--w-border)',
    border2: 'var(--w-border2)',
    text: 'var(--w-text)',
    muted: 'var(--w-muted)',
    pale: 'var(--w-pale)',
    accent: 'var(--w-accent)',
    accent2: 'var(--w-accent2)',
    onAccent: 'var(--w-on-accent)',
    accentSoft: 'var(--w-accent-soft)',
    row: 'var(--w-row)',
  };

  return (
    <div data-theme={theme} className="welloffset-page" style={{ minHeight: '100vh', background: p.bg, color: p.text, transition: 'color 0.3s, background 0.3s', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <header className="welloffset-header" style={{ borderBottom: `1px solid ${p.border}`, background: p.panel, padding: '14px 24px' }}>
        <div style={{ margin: '0 auto', maxWidth: 1400, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
              <div style={{ width: 3, borderRadius: 2, background: p.accent, height: 12 }} />
              <div style={{ width: 3, borderRadius: 2, background: p.accent, height: 16 }} />
              <div style={{ width: 3, borderRadius: 2, background: p.accent, height: 22 }} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.5, color: p.accent }}>NWIS</span>
          </div>

          <button
            onClick={onGoDashboard}
            className="welloffset-exit"
            title="Exit exploration and return to workspace"
            style={{ borderRadius: 8, border: `1px solid ${p.border2}`, background: p.row, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: p.text, cursor: 'pointer' }}
          >
            Exit Exploration
          </button>
        </div>
      </header>

      <main style={{ margin: '0 auto', maxWidth: 1400, padding: '16px 16px' }}>
        <div className="welloffset-hint" style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 12, border: `1px solid ${p.border}`, background: p.panel, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0, flex: 1 }}>
            <span style={{ marginTop: 2, flexShrink: 0, height: 28, width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: p.accent, fontSize: 12, fontWeight: 700, color: p.onAccent }}>
              {activeStep}
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{STEPS[activeStep - 1]}</p>
              <p style={{ margin: 0, fontSize: 12, color: p.muted }}>{STEP_HINTS[activeStep]}</p>
              {activeStep < 5 && !canProceedTo(activeStep + 1) && (
                <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 500, color: p.accent }}>
                  {activeStep + 1 === 4
                    ? 'Select an offset well on the map to unlock this step.'
                    : 'Confirm your selection to unlock this step.'}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexShrink: 0, alignItems: 'center', gap: 8 }}>
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                style={{ borderRadius: 8, border: `1px solid ${p.border2}`, background: p.row, padding: '6px 12px', fontSize: 12, fontWeight: 500, color: p.muted, cursor: 'pointer' }}
              >
                ← Back
              </button>
            )}
            {activeStep < 5 && (
              <button
                onClick={goNext}
                disabled={!canProceedTo(activeStep + 1)}
                style={{ borderRadius: 8, border: `1px solid ${p.border2}`, background: p.row, padding: '6px 12px', fontSize: 12, fontWeight: 600, color: canProceedTo(activeStep + 1) ? p.text : p.pale, cursor: canProceedTo(activeStep + 1) ? 'pointer' : 'not-allowed' }}
              >
                Next: {STEPS[activeStep]} →
              </button>
            )}
            {activeStep === 5 && (
              <button
                onClick={createProject}
                disabled={!confirmed}
                style={{ borderRadius: 8, background: p.accent, border: 'none', padding: '8px 16px', fontSize: 12, fontWeight: 600, color: p.onAccent, cursor: confirmed ? 'pointer' : 'not-allowed', opacity: confirmed ? 1 : 0.4 }}
              >
                Create Project ✓
              </button>
            )}
          </div>
        </div>

        <div className="welloffset-layout" style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start', width: '100%' }}>
          <aside className="welloffset-aside" style={{ width: 240, flexShrink: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ borderRadius: 12, border: `1px solid ${p.border}`, background: p.panel, padding: 12 }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: p.accent2 }}>Workflow</h2>
                <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {STEPS.map((step, i) => {
                    const n = i + 1;
                    const done = n < activeStep;
                    return (
                      <li key={step}>
                        <button
                          onClick={() => setActiveStep(n)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '6px 10px',
                            borderRadius: 8, textAlign: 'left', fontSize: 14, border: 'none', cursor: 'pointer',
                            ...(n === activeStep
                              ? { background: p.accentSoft, color: p.accent, boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--w-accent) 30%, transparent)' }
                              : { background: 'transparent', color: p.muted }),
                          }}
                        >
                          <span
                            style={{
                              flexShrink: 0, height: 20, width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: '50%', fontSize: 10, fontWeight: 600,
                              ...(n === activeStep
                                ? { background: p.accent, color: p.onAccent }
                                : done
                                  ? { background: p.accentSoft, color: p.accent }
                                  : { border: `1px solid ${p.border2}`, background: p.row, color: p.pale }),
                            }}
                          >
                            {done ? '✓' : n}
                          </span>
                          {step}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div style={{ borderRadius: 12, border: `1px solid ${p.border}`, background: p.panel, padding: 12 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: p.accent2 }}>Selected Candidate</h3>
                {chosen.length === 0 ? (
                  <p style={{ margin: '8px 0 0', fontSize: 11, color: p.muted }}>Review candidates and select one to proceed.</p>
                ) : (
                  <div style={{ marginTop: 8 }}>
                    {chosen.map((c) => (
                      <div key={c.id} style={{ fontSize: 14, fontWeight: 600, color: p.text }}>
                        <span style={{ color: p.accent, marginRight: 4 }}>📍</span> {c.name}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={confirmSelection}
                  disabled={selectedCandidates.size === 0}
                  style={{ marginTop: 12, width: '100%', borderRadius: 8, border: `1px solid ${p.border2}`, background: p.row, padding: '8px 0', fontSize: 14, fontWeight: 600, color: p.text, cursor: selectedCandidates.size === 0 ? 'not-allowed' : 'pointer', opacity: selectedCandidates.size === 0 ? 0.4 : 1 }}
                >
                  {confirmed ? 'Selection Confirmed ✓' : 'Confirm Selection'}
                </button>
                <button
                  onClick={createProject}
                  disabled={!confirmed}
                  style={{ marginTop: 8, width: '100%', borderRadius: 8, background: p.accent, border: 'none', padding: '8px 0', fontSize: 14, fontWeight: 600, color: p.onAccent, cursor: confirmed ? 'pointer' : 'not-allowed', opacity: confirmed ? 1 : 0.4 }}
                >
                  Create Project
                </button>
              </div>
            </div>
          </aside>

          <section style={{ minWidth: 0, flex: 1 }}>
            <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 12px', paddingLeft: 4, fontSize: 11, color: p.muted }}>
              {legend.map((l) => (
                <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', height: 10, width: 10, borderRadius: '50%', backgroundColor: l.color, border: '1px solid rgba(128,128,128,0.25)' }} />
                  {l.label}
                </span>
              ))}
            </div>

            <div className="welloffset-mapgrid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <div style={{ height: 440, overflow: 'hidden', borderRadius: 12, border: `1px solid ${p.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', minHeight: 440 }}>
                <WellMap
                  isDark={isDark}
                  selectedWellId={selectedWellId}
                  onWellSelect={selectWell}
                  selectedCandidateIds={Array.from(selectedCandidates)}
                  onCandidateToggle={toggleCandidate}
                  referencePoint={referencePoint}
                  onReferenceChange={(pt) => setReferencePoint({ lat: pt.lat, lng: pt.lng, name: pt.name ?? 'Custom point' })}
                />
              </div>

              {activeStep >= 2 && (
                <aside className="welloffset-welllist" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 12, border: `1px solid ${p.border}`, background: p.panel, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', minHeight: 440, maxHeight: 440 }}>
                  <div style={{ borderBottom: `1px solid ${p.border}`, background: p.panel2, padding: '12px 16px' }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                      Nearby Wells{' '}
                      <span style={{ marginLeft: 4, borderRadius: 4, border: `1px solid ${p.border2}`, background: p.row, padding: '2px 6px', fontSize: 10, fontWeight: 600, color: p.muted }}>
                        {sortedWells.length}
                      </span>
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: p.muted }}>
                      {referencePoint ? `nearest to “${referencePoint.name}”` : 'search to rank by distance'}
                    </p>
                  </div>
                  <div className="welloffset-scroll" style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sortedWells.map((well) => {
                      const active = well.id === selectedWellId;
                      const dist = referencePoint
                        ? haversineKm(referencePoint, { lat: well.lat, lng: well.lng }).toFixed(1)
                        : '';
                      return (
                        <button
                          key={well.id}
                          onClick={() => selectWell(well.id)}
                          style={{
                            width: '100%', borderRadius: 8, border: active ? `1px solid color-mix(in srgb, var(--w-accent) 50%, transparent)` : `1px solid ${p.border}`, padding: 12, textAlign: 'left', cursor: 'pointer',
                            ...(active
                              ? { background: p.accentSoft, boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--w-accent) 20%, transparent)' }
                              : { background: p.row }),
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 600 }}>{well.name}</span>
                            <span
                              style={{ flexShrink: 0, borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 600, color: '#fff', backgroundColor: riskColors[well.risk] }}
                            >
                              {well.risk.toUpperCase()}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0 0', fontSize: 12, color: p.muted }}>
                            {well.depth.toLocaleString()} m · {well.formation}
                            {dist && <span style={{ fontWeight: 600, color: p.accent }}> · {dist} km away</span>}
                          </p>
                          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <StatusBadge status={well.status} />
                            {active && <span style={{ fontSize: 10, color: p.accent }}>highlighted →</span>}
                          </div>
                          {active && (
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${p.border}`, fontSize: 12, color: p.muted }} className="welloffset-wellmeta">
                              <p style={{ margin: 0 }}>
                                Stuck pipe: <b style={{ color: p.text }}>{well.stuckPipeRisk}%</b> · Mud loss: <b style={{ color: p.text }}>{well.mudLossRisk}%</b>
                              </p>
                              <p style={{ margin: '2px 0 0', color: p.pale }}>
                                {well.lat.toFixed(4)}, {well.lng.toFixed(4)}
                              </p>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </aside>
              )}
            </div>

            <RiskComparison
              data={candidateLocations}
              selected={selectedCandidates}
              onToggle={toggleCandidate}
              enabled={activeStep >= 4}
              isConfirmed={confirmed}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    drilling: { fg: '#3b82f6', bg: 'rgba(59,130,246,.12)', bd: 'rgba(59,130,246,.35)' },
    completed: { fg: 'var(--w-accent)', bg: 'var(--w-accent-soft)', bd: 'var(--w-accent)' },
    planning: { fg: 'var(--w-muted)', bg: 'var(--w-row)', bd: 'var(--w-border2)' },
    suspended: { fg: 'var(--w-pale)', bg: 'var(--w-row)', bd: 'var(--w-border2)' },
  };
  const c = map[status];
  if (!c) return null;
  return (
    <span style={{ display: 'inline-block', borderRadius: 999, border: `1px solid ${c.bd}`, padding: '2px 8px', fontSize: 10, fontWeight: 500, color: c.fg, backgroundColor: c.bg }}>
      {status}
    </span>
  );
}

function RiskComparison({ data, selected, onToggle, enabled, isConfirmed }) {
  if (!enabled) return null;
  const p = {
    accent: 'var(--w-accent)',
    accentSoft: 'var(--w-accent-soft)',
    onAccent: 'var(--w-on-accent)',
    panel: 'var(--w-panel)',
    row: 'var(--w-row)',
    border: 'var(--w-border)',
    border2: 'var(--w-border2)',
    text: 'var(--w-text)',
    muted: 'var(--w-muted)',
    accent2: 'var(--w-accent2)',
  };
  return (
    <div style={{ marginTop: 16, borderRadius: 12, border: '1px solid color-mix(in srgb, var(--w-accent) 25%, transparent)', background: p.panel, padding: 16, boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--w-accent) 10%, transparent)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Candidate Recommendations</h3>
        {isConfirmed && (
          <span style={{ borderRadius: 999, border: '1px solid color-mix(in srgb, var(--w-accent) 40%, transparent)', background: p.accentSoft, padding: '4px 10px', fontSize: 12, fontWeight: 500, color: p.accent }}>
            Selection confirmed
          </span>
        )}
      </div>
      <div className="welloffset-riskgrid" style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {data.map((c) => {
          const risk = candidateRisk(c);
          const isSelected = selected.has(c.id);
          return (
            <div key={c.id} style={{
              display: 'flex', flexDirection: 'column', borderRadius: 8, border: `1px solid ${isSelected ? 'var(--w-accent)' : p.border}`, padding: 16,
              background: isSelected ? p.accentSoft : p.row,
              boxShadow: isSelected ? '0 8px 16px rgba(0,0,0,0.2)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{c.name}</p>
                {isSelected && (
                  <span style={{ borderRadius: 999, border: `1px solid ${p.accent}`, padding: '4px 12px', fontSize: 10, fontWeight: 700, color: p.accent }}>
                    SELECTED
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: p.muted }}>
                ~{c.distanceKm} km from reference point
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: p.text, lineHeight: 1.5, fontStyle: 'italic', borderLeft: `2px solid ${p.border2}`, paddingLeft: 8 }}>
                "{c.description}"
              </p>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <RiskBar label="Stuck pipe" value={risk.stuck} color={risk.color} />
                <RiskBar label="Mud loss" value={risk.loss} color={p.accent2} />
                <RiskBar label="Kick" value={risk.kick} color="#3b82f6" />
              </div>
              <button
                onClick={() => onToggle(c.id)}
                style={{
                  marginTop: 16, width: '100%', borderRadius: 8, border: `1px solid ${isSelected ? 'var(--w-accent)' : p.border2}`, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  ...(isSelected
                    ? { background: p.accent, color: p.onAccent }
                    : { background: 'transparent', color: p.text }),
                }}
              >
                {isSelected ? 'Selected Candidate ✓' : 'Select this candidate'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RiskBar({ label, value, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--w-muted)' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 500, color: 'var(--w-text)' }}>{value}%</span>
      </div>
      <div style={{ marginTop: 4, height: 6, width: '100%', overflow: 'hidden', borderRadius: 999, background: 'var(--w-row)' }}>
        <div style={{ height: '100%', borderRadius: 999, width: `${value}%`, backgroundColor: color, transition: 'width 0.7s ease-out' }} />
      </div>
    </div>
  );
}