import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Compass, 
  Database, 
  FileText, 
  ArrowRight, 
  Layers, 
  Activity, 
  Crosshair, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import WellMap from './WellMap';
import { nearbyWells, haversineKm } from '../data/wellData';
import { fetchPlanningCandidates, tryBackend } from '../data/apiClient';
import { useProject } from '../context/ProjectContext';

const FIELD_CENTER = { lat: 58.4416, lng: 1.8875, name: 'Volve Field Center (15/9-F Platform)' };

export default function WellMapExplorer({ 
  project, 
  onNavigateToOffsets, 
  onNavigateToHistory, 
  onNavigateToPlanning, 
  onNavigateToActive,
  onOpenModal 
}) {
  const navigate = useNavigate();
  const { selectedCandidate, selectCandidate } = useProject();

  const [selectedWellId, setSelectedWellId] = useState('15/9-19 A');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState(
    selectedCandidate ? [selectedCandidate.candidate_id || selectedCandidate.id] : ['CAND-1']
  );
  const [filterType, setFilterType] = useState('ALL');
  const [referencePoint, setReferencePoint] = useState(FIELD_CENTER);
  const [backendCandidates, setBackendCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [candidatesError, setCandidatesError] = useState(null);
  const [activeTabSection, setActiveTabSection] = useState('dossier'); // 'dossier' | 'offsets' | 'candidates'

  // 1. Fetch real planning candidates from PlanningEngine on mount or reference change
  const loadCandidates = useCallback(async () => {
    setCandidatesLoading(true);
    setCandidatesError(null);
    const res = await tryBackend(() => fetchPlanningCandidates({
      reference: { lat: referencePoint.lat, lng: referencePoint.lng, name: referencePoint.name },
      target_depth: 3200,
      formation: "HUGIN FM"
    }));
    setCandidatesLoading(false);
    if (res.ok && Array.isArray(res.data?.candidates) && res.data.candidates.length > 0) {
      setBackendCandidates(res.data.candidates);
      setCandidatesError(null);
    } else {
      setBackendCandidates([]);
      setCandidatesError(res.error || "Planning candidates currently unavailable from /api/planning/candidates.");
    }
  }, [referencePoint]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Selected well object
  const selectedWell = nearbyWells.find(w => w.id === selectedWellId) || nearbyWells[0];

  // Filter wells by category
  const filteredWells = useMemo(() => {
    return nearbyWells.filter(w => {
      if (filterType === 'EXPLORATION') return w.wellType === 'EXPLORATION';
      if (filterType === 'DEVELOPMENT') return w.wellType === 'DEVELOPMENT';
      if (filterType === 'HAZARD') return w.risk === 'high';
      return true;
    });
  }, [filterType]);

  // Calculate distance-sorted nearby wells from current reference coordinate
  const sortedNearbyWells = useMemo(() => {
    return [...filteredWells].map(w => ({
      ...w,
      distKm: haversineKm(referencePoint, { lat: w.lat, lng: w.lng })
    })).sort((a, b) => a.distKm - b.distKm);
  }, [filteredWells, referencePoint]);

  // Handlers for navigation
  const handleGoToOffsets = (wellId) => {
    if (onNavigateToOffsets) {
      onNavigateToOffsets(wellId);
    } else {
      navigate('/offsets', { state: { well: wellId } });
    }
  };

  const handleGoToHistory = (wellId) => {
    if (onNavigateToHistory) {
      onNavigateToHistory(wellId);
    } else {
      navigate('/history', { state: { well: wellId } });
    }
  };

  const handleGoToActive = (wellId) => {
    if (onNavigateToActive) {
      onNavigateToActive(wellId);
    } else {
      navigate(`/active/${encodeURIComponent(wellId)}`);
    }
  };

  const handleSelectCandidateAndPlan = (cand) => {
    const candId = cand.candidate_id || cand.id;
    selectCandidate(cand);
    setSelectedCandidateIds([candId]);
    if (onNavigateToPlanning) {
      onNavigateToPlanning();
    } else {
      navigate('/planning');
    }
  };

  const handleWellSelect = (wellId) => {
    setSelectedWellId(wellId);
    const target = nearbyWells.find(w => w.id === wellId);
    if (target) {
      setReferencePoint({ lat: target.lat, lng: target.lng, name: target.name });
    }
  };

  const handleResetToFieldCenter = () => {
    setReferencePoint(FIELD_CENTER);
    setSelectedWellId('15/9-19 A');
  };

  return (
    <div className="map-explorer-layout" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: '650px', gap: '12px', position: 'relative' }}>
      {/* 1. Header Toolbar */}
      <div style={{
        background: '#0B0B0E',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#8F7C3A', letterSpacing: '0.08em' }}>VOLVE 15/9 GEOSPATIAL MAP</span>
            <span style={{ fontSize: '0.72rem', background: 'rgba(143,124,58,0.15)', color: '#C0AA8A', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>28 Volve Wells (12 Surface Slots)</span>
          </div>

          <div style={{ height: '14px', width: '1px', background: 'rgba(255,255,255,0.15)' }} />

          {/* Reference Anchor Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#A1A1AA' }}>
            <Crosshair size={13} color="#D1A937" />
            <span>Anchor:</span>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{referencePoint.name}</span>
            <span style={{ fontFamily: 'monospace', color: '#71717A', fontSize: '0.72rem' }}>
              ({referencePoint.lat.toFixed(4)}°N, {referencePoint.lng.toFixed(4)}°E)
            </span>
          </div>
        </div>

        {/* Filters and Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: '6px' }}>
            {[
              { id: 'ALL', label: 'All (28)' },
              { id: 'EXPLORATION', label: 'Exploration (7)' },
              { id: 'DEVELOPMENT', label: 'Development (21)' },
              { id: 'HAZARD', label: 'Hazard Offsets (7)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: filterType === f.id ? '#8F7C3A' : 'transparent',
                  color: filterType === f.id ? '#FFFFFF' : '#A1A1AA',
                  transition: 'background 0.2s'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetToFieldCenter}
            title="Reset reference anchor to Volve field center"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              background: 'transparent',
              color: '#C0AA8A',
              border: '1px solid rgba(143,124,58,0.3)',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={12} />
            <span>Reset Center</span>
          </button>
        </div>
      </div>

      {/* 2. Main Exploration Canvas (Map Left + Sidebar Right) */}
      <div style={{ display: 'flex', flex: 1, gap: '14px', minHeight: 0 }}>
        {/* Left Interactive Map Container */}
        <div style={{ flex: 1, position: 'relative', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          <WellMap
            wells={filteredWells}
            candidates={backendCandidates.slice(0, 3)}
            selectedWellId={selectedWellId}
            onWellSelect={handleWellSelect}
            selectedCandidateIds={selectedCandidateIds}
            onCandidateToggle={(id) => setSelectedCandidateIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            referencePoint={referencePoint}
            onReferenceChange={(pt) => setReferencePoint({ lat: pt.lat, lng: pt.lng, name: pt.name || 'Custom anchor' })}
            isDark={true}
          />
        </div>

        {/* Right Inspection & Exploration Sidebar */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0, minHeight: 0 }}>
          {/* Section Navigation Tabs */}
          <div style={{
            display: 'flex',
            background: '#0B0B0E',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '4px',
            gap: '4px'
          }}>
            {[
              { id: 'dossier', label: 'Inspected Well' },
              { id: 'offsets', label: `Nearby Offsets (${sortedNearbyWells.length})` },
              { id: 'candidates', label: `Top Candidates (${backendCandidates.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTabSection(tab.id)}
                style={{
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTabSection === tab.id ? '#8F7C3A' : 'transparent',
                  color: activeTabSection === tab.id ? '#FFFFFF' : '#A1A1AA',
                  transition: 'background 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Panel View: 1. Inspected Well Dossier */}
          {activeTabSection === 'dossier' && (
            <div style={{
              background: '#0B0B0E',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flex: 1,
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#71717A', fontWeight: 700, letterSpacing: '0.08em' }}>INSPECTED WELLBORE</span>
                  <h4 style={{ margin: '2px 0 0', fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 800, fontFamily: 'monospace' }}>{selectedWell.id}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>{selectedWell.field} &bull; {selectedWell.wellType} &bull; {selectedWell.status.toUpperCase()}</span>
                </div>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: selectedWell.risk === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                  color: selectedWell.risk === 'high' ? '#EF4444' : '#10B981',
                  border: `1px solid ${selectedWell.risk === 'high' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
                }}>
                  {selectedWell.risk === 'high' ? 'HAZARD OFFSET' : 'NORMAL OFFSET'}
                </span>
              </div>

              {/* Technical Spec Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(0,0,0,0.35)', padding: '10px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#71717A', fontWeight: 700 }}>TOTAL DEPTH</div>
                  <div style={{ fontSize: '0.86rem', color: '#FFFFFF', fontWeight: 700 }}>{selectedWell.depth ? selectedWell.depth.toLocaleString() : '—'} m MD</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#71717A', fontWeight: 700 }}>FINAL TVD</div>
                  <div style={{ fontSize: '0.86rem', color: '#FFFFFF', fontWeight: 700 }}>{selectedWell.tvd ? selectedWell.tvd.toLocaleString() : '—'} m TVD</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#71717A', fontWeight: 700 }}>FORMATION AT TD</div>
                  <div style={{ fontSize: '0.78rem', color: '#C0AA8A', fontWeight: 700 }}>{selectedWell.formation || 'Formation info where available'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: '#71717A', fontWeight: 700 }}>MAX INCLINATION</div>
                  <div style={{ fontSize: '0.86rem', color: '#FFFFFF', fontWeight: 700 }}>{selectedWell.maxInclination ? `${selectedWell.maxInclination}°` : '—'}</div>
                </div>
              </div>

              {/* Surface Platform Slot Info */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '8px', fontSize: '0.74rem' }}>
                <span style={{ color: '#71717A' }}>Surface Slot Coordinates:</span>
                <span style={{ color: '#FFFFFF', fontFamily: 'monospace' }}>
                  {selectedWell.lat ? selectedWell.lat.toFixed(5) : '—'}°N, {selectedWell.lng ? selectedWell.lng.toFixed(5) : '—'}°E
                </span>
              </div>

              {/* Historical DDR Incident Box */}
              <div style={{ background: 'rgba(143,124,58,0.08)', border: '1px solid rgba(143,124,58,0.25)', borderRadius: '8px', padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.68rem', color: '#C0AA8A', fontWeight: 800 }}>HISTORICAL DDR INCIDENT RECORD</span>
                  <span style={{ fontSize: '0.7rem', color: '#A1A1AA', fontWeight: 700 }}>{selectedWell.eventsCount || 0} incidents</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#E4E4E7', fontWeight: 500 }}>
                  {selectedWell.topEvent || 'No major historical hazards documented in Daily Drilling Reports.'}
                </div>
              </div>

              {/* Action Navigation CTAs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
                <button
                  onClick={() => handleGoToOffsets(selectedWell.id)}
                  style={{
                    background: '#8F7C3A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Database size={14} />
                  <span>Run Offset Intelligence for {selectedWell.id}</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  onClick={() => handleGoToHistory(selectedWell.id)}
                  style={{
                    background: 'transparent',
                    color: '#C0AA8A',
                    border: '1px solid rgba(143,124,58,0.4)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <FileText size={14} />
                  <span>View Historical DDR Events</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  onClick={() => handleGoToActive(selectedWell.id)}
                  style={{
                    background: 'transparent',
                    color: '#A1A1AA',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Activity size={14} color="#EF4444" />
                  <span>Telemetry Replay &amp; Parameter Monitor</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Panel View: 2. Distance-Ranked Nearby Offsets */}
          {activeTabSection === 'offsets' && (
            <div style={{
              background: '#0B0B0E',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              flex: 1,
              overflowY: 'auto'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#A1A1AA', marginBottom: '4px' }}>
                Sorted by distance from anchor <b style={{ color: '#FFFFFF' }}>{referencePoint.name.split('(')[0]}</b>:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sortedNearbyWells.map(w => {
                  const isCurrent = w.id === selectedWellId;
                  return (
                    <div
                      key={w.id}
                      onClick={() => handleWellSelect(w.id)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: isCurrent ? 'rgba(143,124,58,0.18)' : 'rgba(255,255,255,0.02)',
                        border: isCurrent ? '1px solid #8F7C3A' : '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.86rem', color: isCurrent ? '#FFFFFF' : '#E4E4E7', fontFamily: 'monospace' }}>
                          {w.name}
                        </span>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: w.risk === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)',
                          color: w.risk === 'high' ? '#EF4444' : '#10B981'
                        }}>
                          {w.distKm !== undefined ? `${w.distKm.toFixed(2)} km` : '—'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#71717A', marginTop: '4px' }}>
                        <span>{w.wellType} &bull; {w.depth.toLocaleString()}m MD</span>
                        <span>{w.formation || 'Formation info where available'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Panel View: 3. Candidate Planning Locations (PlanningEngine) */}
          {activeTabSection === 'candidates' && (
            <div style={{
              background: '#0B0B0E',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              flex: 1,
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#FFFFFF' }}>Planning Candidates (API)</span>
                <span style={{ fontSize: '0.7rem', background: 'rgba(59,130,246,0.15)', color: '#3B82F6', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  {backendCandidates.length > 0 ? `${backendCandidates.length} Feasible Sites` : 'PlanningEngine'}
                </span>
              </div>

              {candidatesLoading ? (
                <div style={{ padding: '24px 12px', textAlign: 'center', color: '#A1A1AA', fontSize: '0.8rem' }}>
                  <div style={{
                    height: 18,
                    width: 18,
                    borderRadius: '50%',
                    border: '2px solid #3B82F6',
                    borderBottomColor: 'transparent',
                    animation: 'wellmap-spin 0.8s linear infinite',
                    margin: '0 auto 8px'
                  }} />
                  Generating feasible candidates from PlanningEngine...
                </div>
              ) : backendCandidates.length === 0 ? (
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '0.78rem',
                  color: '#E4E4E7'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontWeight: 700 }}>
                    <AlertTriangle size={15} />
                    <span>Planning Candidates Currently Unavailable</span>
                  </div>
                  <div style={{ color: '#A1A1AA', fontSize: '0.74rem' }}>
                    {candidatesError || 'Unable to load candidates from PlanningEngine API (POST /api/planning/candidates). Ensure the FastAPI backend is running.'}
                  </div>
                  <button
                    onClick={loadCandidates}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'rgba(239,68,68,0.15)',
                      color: '#EF4444',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Retry Connection
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {backendCandidates.slice(0, 3).map((c) => {
                    const cId = c.candidate_id || c.id;
                    const cScore = c.scores?.overall ?? c.score ?? 100;
                    const cClosest = c.closest_well || '15/9-19 A';
                    const cDist = c.closest_dist ? `${Math.round(c.closest_dist)}m` : (c.distanceKm ? `${c.distanceKm} km` : '220m');
                    const isSelected = selectedCandidateIds.includes(cId);

                    return (
                      <div
                        key={cId}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
                          border: isSelected ? '1px solid #3B82F6' : '1px solid rgba(255,255,255,0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF' }}>
                            📍 {c.name || `Candidate ${cId}`}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#3B82F6', background: 'rgba(59,130,246,0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            Suitability: {cScore}/100
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#A1A1AA' }}>
                          <span>Lat: <b>{Number(c.lat).toFixed(4)}°N</b>, Lon: <b>{Number(c.lon || c.lng).toFixed(4)}°E</b></span>
                          <span>Target: <b>{c.target_depth || 3200}m MD</b></span>
                        </div>

                        <div style={{ fontSize: '0.76rem', color: '#A1A1AA' }}>
                          Nearest offset: <b style={{ color: '#FFFFFF' }}>{cClosest}</b> ({cDist} spacing)
                        </div>

                        {c.risk_profile?.label && (
                          <div style={{ fontSize: '0.72rem', color: '#C0AA8A', background: 'rgba(143,124,58,0.1)', padding: '4px 6px', borderRadius: '4px' }}>
                            {c.risk_profile.label}
                          </div>
                        )}

                        <button
                          onClick={() => handleSelectCandidateAndPlan(c)}
                          style={{
                            marginTop: '4px',
                            background: '#8F7C3A',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '7px 10px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Compass size={13} />
                          <span>Select &amp; Open in Planning Workspace</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}