/**
 * [LEGACY / UNUSED WORKFLOW COMPONENT]
 * Retained for code reference only; disconnected from active routes.
 */
import React from 'react';
import { nearbyWells } from '../data/wellData';

const LIFECYCLE = [
  { label: 'Explore', what: 'Location scouting, nearby wells & candidate selection', state: 'done' },
  { label: 'Plan', what: 'Trajectory design, offsets, cost & timeline estimates', state: 'next' },
  { label: 'Predict', what: 'Historical hazard correlation from the similarity engine', state: 'todo' },
  { label: 'Drill', what: 'Replayed drilling telemetry & field alerts', state: 'todo' },
  { label: 'Learn', what: 'Post-well review feeds the institutional knowledge base', state: 'todo' },
];

export default function ProjectCreatedView({ project, onRestart, onGoDashboard }) {
  const best =
    project.candidates.length > 0
      ? [...project.candidates].sort((a, b) => a.risk.stuck - b.risk.stuck)[0]
      : null;

  return (
    <div className="welloffset-page" style={baseStyles.wrapper}>
      <header style={baseStyles.header}>
        <div style={{ margin: '0 auto', maxWidth: 900, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5, margin: 0 }}>
              WellOffset · <span style={{ color: 'var(--w-accent)' }}>WIS</span>
            </h1>
            <p style={{ fontSize: 12, color: 'var(--w-muted)', margin: '2px 0 0' }}>
              National Well Intelligence System
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ borderRadius: 999, background: 'var(--w-accent-soft)', padding: '4px 12px', fontSize: 12, color: 'var(--w-accent)', border: '1px solid color-mix(in srgb, var(--w-accent) 30%, transparent)' }}>
              Explore complete
            </span>
            <button
              onClick={onRestart}
              style={baseStyles.btnGhost}
            >
              Start New Exploration
            </button>
          </div>
        </div>
      </header>

      <main style={{ margin: '0 auto', maxWidth: 900, padding: '32px 16px' }}>
        <div style={baseStyles.successHero}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ height: 64, width: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(0,0,0,0.12)' }}>
              <svg viewBox="0 0 52 52" style={{ height: 40, width: 40 }}>
                <path d="M14 27l8 8 16-16" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8, margin: 0 }}>
                Exploration phase complete
              </p>
              <h2 style={{ margin: '4px 0', fontSize: 30, fontWeight: 700 }}>Project Created</h2>
              <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 500, opacity: 0.9 }}>
                <span style={{ borderRadius: 4, background: 'rgba(0,0,0,0.1)', padding: '2px 8px', fontFamily: 'monospace' }}>
                  {project.id}
                </span>{' '}
                · created {project.createdAt}
              </p>
            </div>
          </div>
          <p style={{ margin: '20px 0 0', fontSize: 14, fontWeight: 500, opacity: 0.9 }}>
            The hand-off package (reference location, surveyed wells, selected candidate and risk profile) is now queued for the Planning phase.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 24 }}>
          <StatCard label="Reference location" value={project.reference?.name.split(',')[0] ?? 'Not set'} sub={project.reference ? coords(project.reference) : 'Use the map search'} />
          <StatCard label="Wells surveyed" value={String(nearbyWells.length)} sub="across the exploration radius" />
          <StatCard label="Candidate Selected" value={String(project.candidates.length)} sub="of 3 evaluated" />
          <StatCard label="Last inspected well" value={project.inspectedWell?.name ?? '—'} sub={project.inspectedWell ? `${project.inspectedWell.depth.toLocaleString()} m · ${project.inspectedWell.status}` : 'Open a well and inspect next time'} />
        </div>

        <div style={baseStyles.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Selected Candidate &amp; Risk</h3>
          </div>
          {project.candidates.length === 0 ? (
            <p style={{ marginTop: 12, fontSize: 14, color: 'var(--w-muted)' }}>No candidate selected during exploration.</p>
          ) : (
            <div style={{ marginTop: 16 }}>
              {project.candidates.map(({ candidate, risk }) => (
                <div key={candidate.id} style={{ borderRadius: 12, border: '1px solid var(--w-border2)', background: 'var(--w-row)', padding: 16, marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                      <span style={{ color: 'var(--w-accent)', marginRight: 4 }}>📍</span> {candidate.name}
                    </p>
                    <span style={{ borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: '#fff', backgroundColor: risk.color }}>
                      {risk.overall.toUpperCase()} RISK
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--w-muted)' }}>
                    ~{candidate.distanceKm} km from reference point · {candidate.lat.toFixed(4)}, {candidate.lng.toFixed(4)}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 12 }}>
                    <RiskBar label="Stuck pipe" value={risk.stuck} color={risk.color} />
                    <RiskBar label="Mud loss" value={risk.loss} color="var(--w-accent2)" />
                    <RiskBar label="Kick" value={risk.kick} color="#3b82f6" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={baseStyles.card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Well Lifecycle Roadmap</h3>
          <ol style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, listStyle: 'none', padding: 0, margin: '16px 0 0' }}>
            {LIFECYCLE.map((step, i) => (
              <li key={step.label} style={{ borderRadius: 12, border: '1px solid var(--w-border2)', background: 'var(--w-row)', padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    height: 28, width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', fontSize: 12, fontWeight: 700,
                    ...(step.state === 'done'
                      ? { background: 'var(--w-accent)', color: 'var(--w-on-accent)' }
                      : step.state === 'next'
                        ? { background: 'var(--w-accent-soft)', color: 'var(--w-accent)', border: '1px solid color-mix(in srgb, var(--w-accent) 40%, transparent)' }
                        : { background: 'var(--w-border)', color: 'var(--w-muted)' }),
                  }}>
                    {step.state === 'done' ? '✓' : i + 1}
                  </span>
                  {step.state === 'next' && (
                    <span style={{ borderRadius: 999, background: 'var(--w-accent-soft)', padding: '2px 8px', fontSize: 10, fontWeight: 700, color: 'var(--w-accent)' }}>
                      Up next
                    </span>
                  )}
                </div>
                <p style={{ margin: '8px 0 4px', fontSize: 14, fontWeight: 600 }}>{step.label}</p>
                <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4, color: 'var(--w-muted)' }}>{step.what}</p>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ ...baseStyles.card, borderColor: 'color-mix(in srgb, var(--w-accent) 30%, transparent)', background: 'var(--w-accent-soft)', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Hand off to the Planning phase</h3>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--w-muted)' }}>
              WIS will now design candidate trajectories, pull comparable wells from {nearbyWells.length} well records and flag formation-based risks.
            </p>
          </div>
          <button onClick={onGoDashboard} style={baseStyles.btnPrimary}>
            Go to Dashboard →
          </button>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={baseStyles.card}>
      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--w-muted)', margin: 0 }}>{label}</p>
      <p style={{ margin: '4px 0', fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</p>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--w-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</p>
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
      <div style={{ marginTop: 4, height: 6, width: '100%', overflow: 'hidden', borderRadius: 999, background: 'var(--w-border)' }}>
        <div style={{ height: '100%', borderRadius: 999, width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function coords({ lat, lng }) {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
}

const baseStyles = {
  wrapper: {
    minHeight: '100vh',
    background: 'var(--w-bg)',
    color: 'var(--w-text)',
    transition: 'color 0.2s, background 0.2s',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  header: {
    borderBottom: '1px solid var(--w-border)',
    background: 'var(--w-panel)',
    padding: '14px 24px',
  },
  btnGhost: {
    borderRadius: 8,
    border: '1px solid var(--w-border2)',
    background: 'var(--w-row)',
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--w-text)',
    cursor: 'pointer',
  },
  btnPrimary: {
    borderRadius: 8,
    background: 'var(--w-accent)',
    border: 'none',
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--w-on-accent)',
    cursor: 'pointer',
    boxShadow: '0 4px 12px color-mix(in srgb, var(--w-accent) 20%, transparent)',
    whiteSpace: 'nowrap',
  },
  successHero: {
    borderRadius: 24,
    background: 'var(--w-accent)',
    color: 'var(--w-on-accent)',
    padding: 32,
    boxShadow: '0 8px 24px color-mix(in srgb, var(--w-accent) 10%, transparent)',
  },
  card: {
    borderRadius: 16,
    border: '1px solid var(--w-border)',
    background: 'var(--w-panel)',
    padding: 20,
    marginTop: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
};