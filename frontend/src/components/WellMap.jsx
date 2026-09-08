import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MapGL, {
  Marker,
  Popup,
  NavigationControl,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { nearbyWells } from '../data/wellData';
import { searchWells } from '../data/wellData';
import { searchLocation } from '../data/geocode';

const INITIAL_VIEW = {
  longitude: 1.8875,
  latitude: 58.4416,
  zoom: 9.5,
};

const OSM_STYLE = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster',
      source: 'osm',
      paint: { 'raster-opacity': 1 },
    },
  ],
};

function wellCategory(w) {
  if (w.risk === 'high') return 'problem';
  if (w.status === 'completed' || w.status === 'drilling') return 'success';
  return 'historical';
}

function wellColor(cat, dark) {
  if (cat === 'problem') return dark ? '#ff4d4d' : '#dc2626';
  if (cat === 'success') return dark ? '#4ade80' : '#16a34a';
  return dark ? '#94a3b8' : '#6b7280';
}

function statusBadgeColor(status) {
  switch (status) {
    case 'drilling': return '#3b82f6';
    case 'planning': return '#a855f7';
    case 'completed': return '#22c55e';
    case 'suspended': return '#f59e0b';
    default: return '#6b7280';
  }
}

function groupWellsByCluster(wellsList) {
  const clustersMap = new Map();
  for (const w of (wellsList || [])) {
    const key = `${Number(w.lat).toFixed(5)},${Number(w.lng).toFixed(5)}`;
    if (!clustersMap.has(key)) {
      clustersMap.set(key, {
        key,
        lat: w.lat,
        lng: w.lng,
        wells: [],
        hasHighRisk: false,
        hasMedRisk: false,
        maxEvents: 0,
      });
    }
    const c = clustersMap.get(key);
    c.wells.push(w);
    if (w.risk === 'high') c.hasHighRisk = true;
    if (w.risk === 'medium') c.hasMedRisk = true;
    if ((w.eventsCount || 0) > c.maxEvents) c.maxEvents = w.eventsCount;
  }
  return Array.from(clustersMap.values());
}

export default function WellMap({
  selectedWellId,
  onWellSelect,
  selectedCandidateIds = [],
  onCandidateToggle,
  referencePoint,
  onReferenceChange,
  candidates = [],
  wells = nearbyWells,
  isDark = true,
}) {
  const mapRef = useRef(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hoveredWell, setHoveredWell] = useState(null);
  const [popupPos, setPopupPos] = useState(null);
  const [activeCluster, setActiveCluster] = useState(null);
  const debounce = useRef(null);

  const clusters = useMemo(() => groupWellsByCluster(wells), [wells]);

  const flyToWell = useCallback((well) => {
    mapRef.current?.flyTo({
      center: [well.lng, well.lat],
      zoom: 12.0,
      duration: 900,
      essential: true,
    });
    onWellSelect?.(well.id);
    onReferenceChange?.({ lat: well.lat, lng: well.lng, name: well.name });
  }, [onWellSelect, onReferenceChange]);

  const onSearchChange = (e) => {
    const q = e.target.value;
    setSearch(q);
    if (debounce.current) clearTimeout(debounce.current);
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounce.current = setTimeout(async () => {
      const foundWells = searchWells(q.trim());
      const places = await searchLocation(q.trim());
      setResults([...foundWells, ...places]);
      setOpen(true);
      setSearching(false);
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  const pal = {
    panelBg: isDark ? 'rgba(10,10,10,0.92)' : 'rgba(255,255,255,0.94)',
    panelBorder: isDark ? '#262626' : '#e2ddd0',
    text: isDark ? '#f0f0f0' : '#1f2217',
    muted: isDark ? '#a3a3a3' : '#6f7352',
    pale: isDark ? '#d4d4d4' : '#8f9671',
    accent: isDark ? '#aabe53' : '#8c9e3a',
    accentSoft: isDark ? 'rgba(170,190,83,0.14)' : 'rgba(140,158,58,0.12)',
    candidate: isDark ? '#3b82f6' : '#2563eb',
  };

  return (
    <div className={`wellmap-root ${isDark ? 'dark-osm' : ''}`}>
      <style>{`
        .wellmap-root, .wellmap-root * { box-sizing: border-box; }
        .wellmap-root { position: relative; height: 100%; width: 100%; overflow: hidden; }
        .dark-osm .maplibregl-canvas {
          filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(110%);
        }
        .wellmap-root .maplibregl-popup-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .wellmap-root .maplibregl-popup-tip { display: none !important; }
        .wellmap-root .maplibregl-ctrl-attrib { display: none !important; }
        .wellmap-root .maplibregl-ctrl-group button {
          background: ${pal.panelBg} !important;
          color: ${pal.text} !important;
        }
        .wellmap-root .maplibregl-ctrl-group {
          border: 1px solid ${pal.panelBorder} !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
          backdrop-filter: blur(8px) !important;
        }
        .wellmap-root .maplibregl-ctrl-group button:hover {
          background: ${pal.accentSoft} !important;
        }
        .wellmap-root .maplibregl-ctrl-group button + button {
          border-top: 1px solid ${pal.panelBorder} !important;
        }
        .wellmap-root .maplibregl-ctrl-icon {
          filter: ${isDark ? 'invert(1)' : 'none'};
        }
      `}</style>

      <MapGL
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapStyle={OSM_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Halos for clusters containing high-risk / >= 20 DDR event wells */}
        {clusters
          .filter((c) => c.hasHighRisk || c.maxEvents >= 20)
          .map((c) => {
            const isHigh = c.hasHighRisk;
            const color = isHigh ? '#ff4d4d' : '#fbbf24';
            return (
              <Marker key={`halo-${c.key}`} longitude={c.lng} latitude={c.lat} anchor="center">
                <div
                  style={{
                    width: isHigh ? 54 : 40,
                    height: isHigh ? 54 : 40,
                    borderRadius: '50%',
                    backgroundColor: color,
                    opacity: isHigh ? 0.22 : 0.15,
                    border: `1.5px solid ${color}`,
                    pointerEvents: 'none',
                  }}
                />
              </Marker>
            );
          })}

        {/* Platform Cluster / Well Markers */}
        {clusters.map((c) => {
          const isMulti = c.wells.length > 1;
          const isSelectedCluster = c.wells.some((w) => w.id === selectedWellId);
          const topWell = isSelectedCluster
            ? c.wells.find((w) => w.id === selectedWellId)
            : c.wells[0];

          let cat = 'historical';
          if (c.hasHighRisk) {
            cat = 'problem';
          } else if (c.wells.some((w) => w.status === 'completed' || w.status === 'drilling')) {
            cat = 'success';
          }
          const color = wellColor(cat, isDark);

          if (isMulti) {
            // Stacked Multi-well Platform Cluster Marker
            const baseSize = 24;
            const size = isSelectedCluster ? baseSize * 1.3 : baseSize;
            const glow = isDark
              ? isSelectedCluster
                ? `0 0 0 4px ${color}55, 0 0 16px ${color}aa, 0 0 24px ${color}55`
                : `0 0 8px ${color}66, 0 2px 6px rgba(0,0,0,0.7)`
              : isSelectedCluster
                ? `0 0 0 4px ${color}44, 0 2px 8px ${color}55`
                : `0 1px 4px rgba(0,0,0,0.3)`;

            return (
              <Marker key={`cluster-${c.key}`} longitude={c.lng} latitude={c.lat} anchor="center">
                <div
                  role="button"
                  tabIndex={0}
                  title={`Platform Slot Cluster: ${c.wells.length} wellbores (${c.wells.map(x => x.id).join(', ')})`}
                  aria-label={`Cluster with ${c.wells.length} wells`}
                  onClick={() => {
                    setActiveCluster(c);
                    setHoveredWell(null);
                    setPopupPos(null);
                    if (!isSelectedCluster) {
                      onWellSelect?.(c.wells[0].id);
                      onReferenceChange?.({ lat: c.lat, lng: c.lng, name: c.wells[0].name });
                    }
                  }}
                  onMouseEnter={() => {
                    if (!activeCluster) {
                      setHoveredWell(topWell);
                      setPopupPos({ lat: c.lat, lng: c.lng, clusterCount: c.wells.length });
                    }
                  }}
                  onMouseLeave={() => {
                    if (!activeCluster) {
                      setHoveredWell(null);
                      setPopupPos(null);
                    }
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveCluster(c)}
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: size + 6,
                    height: size + 6,
                  }}
                >
                  {/* Stacked background disk for depth */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 1,
                      left: 1,
                      width: size,
                      height: size,
                      borderRadius: '50%',
                      backgroundColor: isDark ? '#18181b' : '#e4e4e7',
                      border: `1.5px solid ${color}66`,
                      zIndex: 1,
                    }}
                  />
                  {/* Main cluster circle */}
                  <div
                    style={{
                      width: size,
                      height: size,
                      borderRadius: '50%',
                      backgroundColor: isDark ? '#09090b' : '#ffffff',
                      border: `${isSelectedCluster ? 3 : 2}px solid ${color}`,
                      boxShadow: glow,
                      position: 'relative',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.15s, box-shadow 0.2s',
                    }}
                  >
                    <span
                      style={{
                        fontSize: isSelectedCluster ? 11 : 9.5,
                        fontWeight: 900,
                        color: color,
                        fontFamily: 'monospace',
                        lineHeight: 1,
                      }}
                    >
                      {c.wells.length}
                    </span>
                  </div>
                </div>
              </Marker>
            );
          }

          // Single well marker
          const w = c.wells[0];
          const isSelected = w.id === selectedWellId;
          const base = isDark
            ? cat === 'problem' ? 22 : cat === 'success' ? 18 : 14
            : cat === 'problem' ? 20 : cat === 'success' ? 16 : 13;
          const size = isSelected ? base * 1.35 : base;

          const glow = isDark
            ? isSelected
              ? `0 0 0 5px ${color}55, 0 0 16px ${color}99, 0 0 32px ${color}44`
              : `0 0 8px ${color}88, 0 2px 6px rgba(0,0,0,0.6)`
            : isSelected
              ? `0 0 0 4px ${color}44, 0 2px 8px ${color}55`
              : `0 1px 4px rgba(0,0,0,0.25)`;

          return (
            <Marker key={w.id} longitude={w.lng} latitude={w.lat} anchor="center">
              <div
                role="button"
                tabIndex={0}
                title={w.name}
                aria-label={`Well ${w.id}`}
                onClick={() => {
                  setActiveCluster(null);
                  onWellSelect?.(w.id);
                  setHoveredWell(w);
                  setPopupPos({ lat: w.lat, lng: w.lng });
                  onReferenceChange?.({ lat: w.lat, lng: w.lng, name: w.name });
                }}
                onMouseEnter={() => {
                  if (!activeCluster) {
                    setHoveredWell(w);
                    setPopupPos({ lat: w.lat, lng: w.lng });
                  }
                }}
                onMouseLeave={() => {
                  if (!activeCluster) {
                    setHoveredWell(null);
                    setPopupPos(null);
                  }
                }}
                onKeyDown={(e) => e.key === 'Enter' && onWellSelect?.(w.id)}
                style={{
                  width: size,
                  height: size,
                  borderRadius: cat === 'historical' ? 3 : '50%',
                  backgroundColor: cat === 'historical' ? 'transparent' : color,
                  border: `${isSelected ? 3 : 2}px solid ${color}`,
                  boxShadow: glow,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'box-shadow 0.2s, transform 0.15s, width 0.15s, height 0.15s',
                }}
              >
                {cat === 'problem' && (
                  <div
                    style={{
                      width: size * 0.45,
                      height: size * 0.45,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      opacity: 0.9,
                    }}
                  />
                )}
                {cat === 'historical' && (
                  <svg width={size} height={size} viewBox="0 0 13 13" style={{ position: 'absolute' }}>
                    <line x1="3" y1="3" x2="10" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
                    <line x1="10" y1="3" x2="3" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </Marker>
          );
        })}

        {/* Dynamic Candidates loaded from PlanningEngine only */}
        {(candidates || []).map((c) => {
          const cId = c.candidate_id || c.id || '';
          const cLat = Number(c.lat || c.latitude || 0);
          const cLng = Number(c.lon || c.lng || c.longitude || 0);
          const cName = c.name || `Candidate ${cId}`;
          const cDisplay = (c.candidate_id ? c.candidate_id.replace('CAND-', '').slice(0, 4) : cId.replace('CL-', '').replace('CAND-', ''));
          const isOn = (selectedCandidateIds || []).includes(cId);
          const pinColor = pal.candidate;
          return (
            <Marker key={cId} longitude={cLng} latitude={cLat} anchor="bottom">
              <div
                role="button"
                tabIndex={0}
                title={cName}
                aria-label={`Candidate ${cId}`}
                onClick={() => onCandidateToggle && onCandidateToggle(cId)}
                onKeyDown={(e) => e.key === 'Enter' && onCandidateToggle && onCandidateToggle(cId)}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <svg
                  width="28"
                  height="38"
                  viewBox="0 0 28 38"
                  style={{
                    filter: isOn
                      ? `drop-shadow(0 2px 8px ${pinColor}88)`
                      : 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
                    transform: isOn ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.2s, filter 0.2s',
                  }}
                >
                  {isOn && (
                    <circle cx="14" cy="13" r="13" fill={pinColor} opacity="0.18" />
                  )}
                  <circle
                    cx="14"
                    cy="13"
                    r="11"
                    fill={isOn ? pinColor : isDark ? '#1e3a8a' : '#eff6ff'}
                    stroke={pinColor}
                    strokeWidth={isOn ? 0 : 2}
                  />
                  <path
                    d="M 9 21 Q 14 38 14 38 Q 14 38 19 21 Z"
                    fill={pinColor}
                    opacity={isOn ? 1 : 0.6}
                  />
                  <text
                    x="14"
                    y="17"
                    textAnchor="middle"
                    fontSize="7"
                    fontWeight="700"
                    fill={isOn ? '#fff' : pinColor}
                    fontFamily="system-ui, sans-serif"
                  >
                    {cDisplay || 'C'}
                  </text>
                </svg>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: pinColor,
                    background: isDark ? 'rgba(12,16,28,0.8)' : 'rgba(255,255,255,0.85)',
                    borderRadius: 4,
                    padding: '1px 4px',
                    marginTop: 1,
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cName.replace('Candidate ', '')}
                </span>
              </div>
            </Marker>
          );
        })}

        {/* Reference Anchor Marker */}
        {referencePoint && (
          <Marker longitude={referencePoint.lng} latitude={referencePoint.lat} anchor="center">
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: isDark ? '#fbbf24' : '#b45309',
                border: '3px solid white',
                boxShadow: `0 0 0 3px ${isDark ? '#fbbf2488' : '#b4530966'}, 0 2px 8px rgba(0,0,0,0.4)`,
              }}
            />
          </Marker>
        )}

        {/* Interactive Platform Slot Cluster Popup */}
        {activeCluster && (
          <Popup
            longitude={activeCluster.lng}
            latitude={activeCluster.lat}
            anchor="bottom"
            offset={16}
            closeButton={true}
            onClose={() => setActiveCluster(null)}
            style={{ zIndex: 60 }}
            className="well-popup"
          >
            <div
              style={{
                background: pal.panelBg,
                border: `1px solid ${pal.panelBorder}`,
                borderRadius: 12,
                padding: '12px 14px',
                minWidth: 260,
                maxWidth: 320,
                fontFamily: 'system-ui, sans-serif',
                color: pal.text,
                boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      backgroundColor: activeCluster.hasHighRisk ? '#ef4444' : '#22c55e',
                    }}
                  />
                  <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: '0.5px' }}>
                    PLATFORM SLOT CLUSTER
                  </span>
                </div>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: pal.muted, background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4 }}>
                  {activeCluster.wells.length} Wellbores
                </span>
              </div>

              <div style={{ fontSize: 10, color: pal.muted, marginBottom: 8, fontFamily: 'monospace' }}>
                {activeCluster.lat.toFixed(5)}°N, {activeCluster.lng.toFixed(5)}°E
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
                {activeCluster.wells.map((w) => {
                  const isCurrent = w.id === selectedWellId;
                  const cat = wellCategory(w);
                  const color = wellColor(cat, isDark);
                  return (
                    <div
                      key={w.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        onWellSelect?.(w.id);
                        onReferenceChange?.({ lat: w.lat, lng: w.lng, name: w.name });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onWellSelect?.(w.id);
                          onReferenceChange?.({ lat: w.lat, lng: w.lng, name: w.name });
                        }
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        background: isCurrent ? (isDark ? 'rgba(170,190,83,0.18)' : 'rgba(140,158,58,0.15)') : 'rgba(255,255,255,0.03)',
                        border: isCurrent ? `1px solid ${pal.accent}` : `1px solid ${pal.panelBorder}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'background 0.15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: cat === 'historical' ? 1 : '50%',
                            backgroundColor: color,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: isCurrent ? 800 : 700, fontSize: 11, color: isCurrent ? pal.accent : pal.text }}>
                            {w.id}
                          </div>
                          <div style={{ fontSize: 9, color: pal.muted }}>
                            {w.wellType} &bull; {w.depth ? `${w.depth.toLocaleString()}m` : '—'}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: 4,
                          background: w.risk === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.15)',
                          color: w.risk === 'high' ? '#ef4444' : '#22c55e',
                        }}
                      >
                        {w.risk === 'high' ? 'Hazard' : w.risk === 'medium' ? 'Moderate' : 'Normal'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Popup>
        )}

        {/* Hovered Single Well Tooltip */}
        {hoveredWell && popupPos && !activeCluster && (
          <Popup
            longitude={popupPos.lng}
            latitude={popupPos.lat}
            anchor="bottom"
            offset={12}
            closeButton={false}
            closeOnClick={false}
            style={{ zIndex: 50 }}
            className="well-popup"
          >
            <div
              style={{
                background: pal.panelBg,
                border: `1px solid ${pal.panelBorder}`,
                borderRadius: 12,
                padding: '10px 13px',
                minWidth: 180,
                fontFamily: 'system-ui, sans-serif',
                color: pal.text,
                boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 7, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: wellColor(wellCategory(hoveredWell), isDark),
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.3px' }}>
                    {hoveredWell.id}
                  </span>
                </div>
                {popupPos.clusterCount > 1 && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: pal.accent, background: pal.accentSoft, padding: '1px 5px', borderRadius: 4 }}>
                    {popupPos.clusterCount} wells on slot
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: pal.muted, marginBottom: 8 }}>
                {hoveredWell.name}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 10px', fontSize: 11 }}>
                <span style={{ color: pal.muted }}>Status</span>
                <span style={{ fontWeight: 600, color: statusBadgeColor(hoveredWell.status), textTransform: 'capitalize' }}>
                  {hoveredWell.status}
                </span>
                <span style={{ color: pal.muted }}>Hazard</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize', color: wellColor(wellCategory(hoveredWell), isDark) }}>
                  {hoveredWell.risk === 'high' ? 'Hazard Offset' : hoveredWell.risk === 'medium' ? 'Moderate' : 'Normal'}
                </span>
                <span style={{ color: pal.muted }}>Depth</span>
                <span style={{ fontWeight: 600 }}>{hoveredWell.depth ? hoveredWell.depth.toLocaleString() : '—'} m</span>
                <span style={{ color: pal.muted }}>Formation</span>
                <span style={{ fontWeight: 600 }}>{hoveredWell.formation || 'Formation info where available'}</span>
                <span style={{ color: pal.muted }}>DDR Events</span>
                <span style={{ fontWeight: 600 }}>{hoveredWell.eventsCount || 0} indexed</span>
                {hoveredWell.topEvent && (
                  <>
                    <span style={{ color: pal.muted }}>Top Event</span>
                    <span style={{ fontWeight: 600, fontSize: 10, color: pal.text }}>{hoveredWell.topEvent}</span>
                  </>
                )}
              </div>
            </div>
          </Popup>
        )}

        <NavigationControl position="bottom-right" visualizePitch={false} />
      </MapGL>

      {/* Search Bar */}
      <div className="wellmap-search" style={{ position: 'absolute', left: 16, top: 16, zIndex: 20, width: 288 }}>
        <div
          className="wellmap-search-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 12,
            padding: '8px 12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            background: pal.panelBg,
            border: `1px solid ${pal.panelBorder}`,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={pal.accent} strokeWidth="2.4">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={search}
            onChange={onSearchChange}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search well or locality…"
            style={{ width: '100%', background: 'transparent', color: pal.text, border: 'none', outline: 'none', fontSize: 14 }}
          />
          {searching && (
            <span
              style={{
                height: 12,
                width: 12,
                borderRadius: '50%',
                border: `2px solid ${pal.accent}`,
                borderBottomColor: 'transparent',
                animation: 'wellmap-spin 0.8s linear infinite',
                flexShrink: 0,
              }}
            />
          )}
        </div>

        {open && (
          <div
            className="wellmap-results wellmap-scroll"
            style={{
              marginTop: 6,
              maxHeight: 256,
              overflowY: 'auto',
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              background: pal.panelBg,
              border: `1px solid ${pal.panelBorder}`,
            }}
          >
            {!search.trim() ? (
              <div style={{ padding: '8px 0' }}>
                <div style={{ padding: '4px 12px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: pal.muted }}>
                  Recommended Volve Sectors
                </div>
                {[
                  { name: 'Volve Field Center (15/9-F Platform)', lat: 58.4416, lng: 1.8875 },
                  { name: '15/9-19 Exploration & Appraisal Sector', lat: 58.4359, lng: 1.9297 },
                  { name: '15/9-F-10 ERD Well Zone', lat: 58.44158, lng: 1.88752 },
                ].map((p, i) => (
                  <button
                    key={`rec-${i}`}
                    onMouseDown={() => {
                      onReferenceChange?.({ lat: p.lat, lng: p.lng, name: p.name });
                      mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: 10.5, duration: 900 });
                      setSearch('');
                      setOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 12px',
                      textAlign: 'left',
                      fontSize: 14,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: pal.text,
                    }}
                  >
                    <span style={{ color: pal.accent, fontSize: 12 }}>📍</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                  </button>
                ))}
              </div>
            ) : results.length > 0 ? (
              results.map((r, i) => {
                const isWell = typeof r.depth === 'number';
                const w = isWell ? r : null;
                const p = isWell ? null : r;
                return (
                  <button
                    key={isWell ? `w-${r.id}` : `p-${i}`}
                    onMouseDown={() => {
                      if (w) {
                        flyToWell(w);
                      } else if (p) {
                        onReferenceChange?.({ lat: p.lat, lng: p.lng, name: p.name });
                        mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: 10.5, duration: 900 });
                      }
                      setSearch('');
                      setOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      padding: '8px 12px',
                      textAlign: 'left',
                      fontSize: 14,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: pal.text,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        flexShrink: 0,
                        backgroundColor: w ? wellColor(wellCategory(w), isDark) : '#3b82f6',
                      }}
                    />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {w ? w.name : p.name}
                    </span>
                    {w && (
                      <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'monospace', flexShrink: 0, color: pal.muted }}>
                        {w.status}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div style={{ padding: '12px', fontSize: 12, color: pal.muted }}>No wells or areas found.</div>
            )}
          </div>
        )}
      </div>

      {/* Top Right Status Indicator */}
      <div
        className="wellmap-live"
        style={{
          position: 'absolute',
          right: 16,
          top: 16,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderRadius: 12,
          padding: '6px 12px',
          fontSize: 11,
          letterSpacing: 2,
          fontFamily: 'monospace',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(8px)',
          background: pal.panelBg,
          border: `1px solid ${pal.panelBorder}`,
          color: pal.muted,
        }}
      >
        <span style={{ position: 'relative', display: 'flex', height: 8, width: 8 }}>
          <span style={{ position: 'absolute', height: '100%', width: '100%', borderRadius: '50%', opacity: 0.6, backgroundColor: pal.accent, animation: 'wellmap-ping 1.2s cubic-bezier(0,0,0.2,1) infinite' }} />
          <span style={{ position: 'relative', height: 8, width: 8, borderRadius: '50%', backgroundColor: pal.accent }} />
        </span>
        MAP · OSM
      </div>

      {/* Floating Map Legend */}
      <div
        className="wellmap-legend"
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 20,
          borderRadius: 12,
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          backdropFilter: 'blur(8px)',
          background: pal.panelBg,
          border: `1px solid ${pal.panelBorder}`,
        }}
      >
        <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: pal.pale }}>
          Map Legend
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <LegendRow icon={<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#09090b" stroke={isDark ? '#22c55e' : '#16a34a'} strokeWidth="2" /><text x="8" y="11" textAnchor="middle" fontSize="8" fontWeight="800" fill={isDark ? '#22c55e' : '#16a34a'} fontFamily="monospace">4</text></svg>} label="Platform Slot Cluster (Stacked Wells)" color={pal.text} />
          <LegendRow icon={<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill={isDark ? '#22c55e' : '#16a34a'} stroke="white" strokeWidth="1.5" /></svg>} label="Development Well (Single)" color={pal.text} />
          <LegendRow icon={<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill={isDark ? '#ef4444' : '#dc2626'} stroke="white" strokeWidth="1.5" /><circle cx="8" cy="8" r="2.5" fill="white" /></svg>} label="Hazard Offset Well (DDR Events)" color={pal.text} />
          <LegendRow icon={<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke={isDark ? '#94a3b8' : '#6b7280'} strokeWidth="1.8" /><line x1="4.5" y1="4.5" x2="11.5" y2="11.5" stroke={isDark ? '#94a3b8' : '#6b7280'} strokeWidth="1.8" strokeLinecap="round" /><line x1="11.5" y1="4.5" x2="4.5" y2="11.5" stroke={isDark ? '#94a3b8' : '#6b7280'} strokeWidth="1.8" strokeLinecap="round" /></svg>} label="Exploration / Appraisal Well" color={pal.text} />
          <LegendRow icon={<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" /></svg>} label="Historical DDR Risk Zone Halo" color={pal.text} />
          <LegendRow icon={<svg width="14" height="20" viewBox="0 0 14 20"><circle cx="7" cy="7" r="6" fill={pal.candidate} /><path d="M 3 12 Q 7 20 7 20 Q 7 20 11 12 Z" fill={pal.candidate} /><text x="7" y="10" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="white" fontFamily="system-ui">CL</text></svg>} label="Candidate Planning Site" color={pal.text} />
        </div>
        <div style={{ marginTop: 10, fontSize: 9, color: pal.pale }}>
          © OpenStreetMap contributors
        </div>
      </div>

      {/* Bottom Status Bar for Selected Well */}
      {selectedWellId && (() => {
        const w = wells.find((x) => x.id === selectedWellId) || nearbyWells.find((x) => x.id === selectedWellId);
        if (!w) return null;
        const cat = wellCategory(w);
        const color = wellColor(cat, isDark);
        return (
          <div
            className="wellmap-statusbar"
            style={{
              pointerEvents: 'none',
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              borderRadius: 12,
              padding: '6px 16px',
              fontSize: 11,
              letterSpacing: 1,
              fontFamily: 'monospace',
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
              background: pal.panelBg,
              border: `1px solid ${pal.panelBorder}`,
              color: pal.muted,
            }}
          >
            <span style={{ color, fontWeight: 700 }}>{w.id}</span>
            {' · '}{w.status.toUpperCase()}{' · '}
            <span style={{ color }}>{w.risk === 'high' ? 'HAZARD OFFSET' : w.risk === 'medium' ? 'MODERATE' : 'NORMAL'}</span>
            {' · '}{w.depth ? w.depth.toLocaleString() : '—'} m · {w.formation || 'Formation info where available'}
          </div>
        );
      })()}

      <style>{`
        @keyframes wellmap-spin { to { transform: rotate(360deg); } }
        @keyframes wellmap-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .wellmap-scroll::-webkit-scrollbar { width: 6px; }
        .wellmap-scroll::-webkit-scrollbar-thumb {
          background: ${pal.panelBorder};
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

function LegendRow({ icon, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 16 }}>{icon}</span>
      <span style={{ fontSize: 11, color }}>{label}</span>
    </div>
  );
}