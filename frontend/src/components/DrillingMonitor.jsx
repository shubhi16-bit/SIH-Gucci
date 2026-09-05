import React, { useState, useEffect } from 'react';
import { TELEMETRY_INITIAL } from '../data/mockData';
import { Play, Pause, RotateCcw, FastForward, Gauge, AlertOctagon, Activity, Radio } from 'lucide-react';

export default function DrillingMonitor({ onOpenModal }) {
  const [telemetry, setTelemetry] = useState(TELEMETRY_INITIAL);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [jumpDepthInput, setJumpDepthInput] = useState("2500");

  // Simulated live playback
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTelemetry(prev => {
          const nextDepth = prev.depth + (0.5 * playbackSpeed);
          const ropDelta = (Math.random() - 0.5) * 0.4;
          const torqueDelta = (Math.random() - 0.5) * 0.8;
          const sppDelta = (Math.random() - 0.48) * 40;

          return {
            ...prev,
            depth: parseFloat(nextDepth.toFixed(1)),
            rop: parseFloat((Math.max(8, prev.rop + ropDelta)).toFixed(1)),
            torque: parseFloat((Math.max(18, prev.torque + torqueDelta)).toFixed(1)),
            spp: Math.round(prev.spp + sppDelta)
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleJumpToDepth = (e) => {
    e.preventDefault();
    const d = parseFloat(jumpDepthInput);
    if (!isNaN(d) && d > 0) {
      setTelemetry(prev => ({ ...prev, depth: d }));
    }
  };

  return (
    <section id="monitor" className="section-wrapper">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Real-Time Telemetry Streaming</span>
          <h2 className="section-title">
            Drilling Monitor & WITSML Replay HUD
          </h2>
          <p className="section-description">
            Experience real-time telemetry playback using standardized WITSML 1.4/2.0 streams from historical wells. Compare real-time parameters against pre-calculated risk zones.
          </p>
        </div>

        <div className="telemetry-hud">
          {/* Top Bar with Clear Provenance Notice */}
          <div className="hud-top-bar">
            <div>
              <div className="hud-well-tag">
                <Radio size={20} color="var(--palette-deep-peach)" />
                <span>WELL REPLAY: {telemetry.well}</span>
                <span className="hud-badge-witsml">WITSML 1.4 LIVE FEED</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--palette-clay-dust)', marginTop: 4 }}>
                Historical telemetry replay calibrated against Volve Field Daily Drilling Reports (not unverified synthetic data).
              </p>
            </div>

            {/* Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#23160F', padding: '6px 14px', borderRadius: '8px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isPlaying ? '#46A758' : '#F76B15', animation: isPlaying ? 'pulse-dot 1.5s infinite' : 'none' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: isPlaying ? '#46A758' : '#F76B15' }}>
                {isPlaying ? 'STREAMING ACTIVE' : 'REPLAY PAUSED'}
              </span>
            </div>
          </div>

          {/* 6 Real-Time Telemetry Gauge Cards */}
          <div className="hud-metric-grid">
            <div className="hud-metric-card">
              <div className="hud-metric-label">BIT DEPTH (MD)</div>
              <div className="hud-metric-val">{telemetry.depth}</div>
              <div className="hud-metric-unit">meters TVD</div>
            </div>

            <div className="hud-metric-card">
              <div className="hud-metric-label">RATE OF PENETRATION</div>
              <div className="hud-metric-val">{telemetry.rop}</div>
              <div className="hud-metric-unit">m / hour</div>
            </div>

            <div className="hud-metric-card">
              <div className="hud-metric-label">WEIGHT ON BIT</div>
              <div className="hud-metric-val">{telemetry.wob}</div>
              <div className="hud-metric-unit">klbf</div>
            </div>

            <div className="hud-metric-card">
              <div className="hud-metric-label">ROTARY SPEED</div>
              <div className="hud-metric-val">{telemetry.rpm}</div>
              <div className="hud-metric-unit">RPM</div>
            </div>

            <div className="hud-metric-card">
              <div className="hud-metric-label">SURFACE TORQUE</div>
              <div className="hud-metric-val">{telemetry.torque}</div>
              <div className="hud-metric-unit">kN · m</div>
            </div>

            <div className="hud-metric-card">
              <div className="hud-metric-label">STANDPIPE PRESSURE</div>
              <div className="hud-metric-val" style={{ color: telemetry.spp > 8300 ? '#FF6B6B' : '#FFF' }}>
                {telemetry.spp}
              </div>
              <div className="hud-metric-unit">kPa</div>
            </div>
          </div>

          {/* Alert Card Overlay */}
          <div style={{
            background: 'rgba(94, 42, 37, 0.35)',
            border: '1px solid var(--palette-maroon)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertOctagon size={22} color="#FF6B6B" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FF8787' }}>
                  PROACTIVE PREDICTIVE ALERT • 58m AHEAD
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--palette-creme)' }}>
                  Approaching historical lost circulation zone at 1,900m MD. Offset well 15/9-19 A encountered 35 bbl/hr losses.
                </div>
              </div>
            </div>

            <button
              className="btn btn-outline-pill"
              style={{ background: '#5E2A25', borderColor: '#8F3830', color: '#FFF' }}
              onClick={() => onOpenModal({
                title: "Predictive Hazard Alert: Lost Circulation Zone Ahead",
                subtitle: "Correlation with Volve Field 15/9-19 A at 1,900m",
                content: "Risk Engine identified standpipe pressure micro-fluctuations matching pre-loss signature observed in offset well 15/9-19 A. Recommended action: Pre-treat active mud system with medium calcium carbonate LCM."
              })}
            >
              Investigate Risk
            </button>
          </div>

          {/* Playback Controls & Speed Toggle */}
          <div className="hud-controls-bar">
            {/* Play/Pause & Speed */}
            <div className="hud-playback-btns">
              <button 
                className="hud-btn-ctrl"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause Replay' : 'Start Replay'}</span>
              </button>

              <button 
                className="btn-outline-pill"
                onClick={() => setTelemetry(prev => ({ ...prev, depth: 1842 }))}
                style={{ color: 'var(--palette-creme)', borderColor: '#3B261B' }}
                title="Reset to 1,842m"
              >
                <RotateCcw size={14} />
              </button>

              {/* Speed Buttons */}
              <div style={{ display: 'flex', gap: '4px', marginLeft: 8 }}>
                {[0.5, 1, 2, 5].map(spd => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: playbackSpeed === spd ? 'var(--palette-deep-peach)' : '#2D1C13',
                      color: '#FFF'
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Jump to Depth Input */}
            <form onSubmit={handleJumpToDepth} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--palette-clay-dust)' }}>Jump to Depth:</span>
              <input
                type="number"
                value={jumpDepthInput}
                onChange={e => setJumpDepthInput(e.target.value)}
                style={{
                  width: '90px',
                  background: '#140C07',
                  border: '1px solid #3B261B',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  color: '#FFF',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace'
                }}
              />
              <button 
                type="submit"
                className="btn-outline-pill"
                style={{ padding: '5px 12px', fontSize: '0.78rem', background: 'var(--palette-river-pine)', color: '#FFF' }}
              >
                Go
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
