import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map, {
  Marker,
  Popup,
  NavigationControl,
} from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { nearbyWells, candidateLocations } from '../data/wellData';
import { searchWells } from '../data/wellData';
import { searchLocation } from '../data/geocode';

const INITIAL_VIEW = {
  longitude: 95.32,
  latitude: 27.29,
  zoom: 11.5,
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

export default function WellMap({
  selectedWellId,
  onWellSelect,
  selectedCandidateIds,
  onCandidateToggle,
  referencePoint,
  onReferenceChange,
  isDark = false,
}) {
  const mapRef = useRef(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hoveredWell, setHoveredWell] = useState(null);
  const [popupPos, setPopupPos] = useState(null);
  const debounce = useRef(null);

  const flyToWell = useCallback((well) => {
    mapRef.current?.flyTo({
      center: [well.lng, well.lat],
      zoom: 13.5,
      duration: 900,
      essential: true,
    });
    onWellSelect(well.id);
    onReferenceChange({ lat: well.lat, lng: well.lng, name: well.name });
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
      const wells = searchWells(q.trim());
      const places = await searchLocation(q.trim());
      setResults([...wells, ...places]);
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

      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapStyle={OSM_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {nearbyWells
          .filter((w) => w.risk !== 'low')
          .map((w) => {
            const isHigh = w.risk === 'high';
            const color = isHigh ? '#ff4d4d' : '#fbbf24';
            return (
              <Marker key={`halo-${w.id}`} longitude={w.lng} latitude={w.lat} anchor="center">
                <div
                  style={{
                    width: isHigh ? 50 : 36,
                    height: isHigh ? 50 : 36,
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

        {nearbyWells.map((w) => {
          const cat = wellCategory(w);
          const color = wellColor(cat, isDark);
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
                  onWellSelect(w.id);
                  setHoveredWell(w);
                  setPopupPos({ lat: w.lat, lng: w.lng });
                }}
                onMouseEnter={() => {
                  setHoveredWell(w);
                  setPopupPos({ lat: w.lat, lng: w.lng });
                }}
                onMouseLeave={() => {
                  setHoveredWell(null);
                  setPopupPos(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && onWellSelect(w.id)}
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

        {candidateLocations.map((c) => {
          const isOn = selectedCandidateIds.includes(c.id);
          const pinColor = pal.candidate;
          return (
            <Marker key={c.id} longitude={c.lng} latitude={c.lat} anchor="bottom">
              <div
                role="button"
                tabIndex={0}
                title={c.name}
                aria-label={`Candidate ${c.id}`}
                onClick={() => onCandidateToggle(c.id)}
                onKeyDown={(e) => e.key === 'Enter' && onCandidateToggle(c.id)}
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
                    {c.id.replace('CL-', '')}
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
                  {c.name.replace('Candidate ', '')}
                </span>
              </div>
            </Marker>
          );
        })}

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

        {hoveredWell && popupPos && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
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
              <div style={{ fontSize: 11, color: pal.muted, marginBottom: 8 }}>
                {hoveredWell.name}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 10px', fontSize: 11 }}>
                <span style={{ color: pal.muted }}>Status</span>
                <span style={{ fontWeight: 600, color: statusBadgeColor(hoveredWell.status), textTransform: 'capitalize' }}>
                  {hoveredWell.status}
                </span>
                <span style={{ color: pal.muted }}>Risk</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize', color: wellColor(wellCategory(hoveredWell), isDark) }}>
                  {hoveredWell.risk}
                </span>
                <span style={{ color: pal.muted }}>Depth</span>
                <span style={{ fontWeight: 600 }}>{hoveredWell.depth.toLocaleString()} m</span>
                <span style={{ color: pal.muted }}>Formation</span>
                <span style={{ fontWeight: 600 }}>{hoveredWell.formation}</span>
                <span style={{ color: pal.muted }}>Stuck&nbsp;Risk</span>
                <span style={{ fontWeight: 600 }}>{hoveredWell.stuckPipeRisk}%</span>
                <span style={{ color: pal.muted }}>Mud Loss</span>
                <span style={{ fontWeight: 600 }}>{hoveredWell.mudLossRisk}%</span>
              </div>
            </div>
          </Popup>
        )}

        <NavigationControl position="bottom-right" visualizePitch={false} />
      </Map>

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
                  Recommended Areas (Has Data)
                </div>
                {[
                  { name: 'Naharkatia Field, Assam', lat: 27.283, lng: 95.333 },
                  { name: 'Moran Field, Assam', lat: 27.185, lng: 94.931 },
                  { name: 'Digboi Field, Assam', lat: 27.382, lng: 95.63 },
                ].map((p, i) => (
                  <button
                    key={`rec-${i}`}
                    onMouseDown={() => {
                      onReferenceChange({ lat: p.lat, lng: p.lng, name: p.name });
                      mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: 12, duration: 900 });
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
                        onReferenceChange({ lat: p.lat, lng: p.lng, name: p.name });
                        mapRef.current?.flyTo({ center: [p.lng, p.lat], zoom: 12, duration: 900 });
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
        LIVE · OSM
      </div>

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
          <LegendRow icon={<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill={isDark ? '#22c55e' : '#16a34a'} stroke="white" strokeWidth="1.5" /></svg>} label="Active Well" color={pal.text} />
          <LegendRow icon={<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill={isDark ? '#ef4444' : '#dc2626'} stroke="white" strokeWidth="1.5" /><circle cx="8" cy="8" r="2.5" fill="white" /></svg>} label="High-Risk Well" color={pal.text} />
          <LegendRow icon={<svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke={isDark ? '#94a3b8' : '#6b7280'} strokeWidth="1.8" /><line x1="4.5" y1="4.5" x2="11.5" y2="11.5" stroke={isDark ? '#94a3b8' : '#6b7280'} strokeWidth="1.8" strokeLinecap="round" /><line x1="11.5" y1="4.5" x2="4.5" y2="11.5" stroke={isDark ? '#94a3b8' : '#6b7280'} strokeWidth="1.8" strokeLinecap="round" /></svg>} label="Inactive Well" color={pal.text} />
          <LegendRow icon={<svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5" /></svg>} label="Risk Zone Halo" color={pal.text} />
          <LegendRow icon={<svg width="14" height="20" viewBox="0 0 14 20"><circle cx="7" cy="7" r="6" fill={pal.candidate} /><path d="M 3 12 Q 7 20 7 20 Q 7 20 11 12 Z" fill={pal.candidate} /><text x="7" y="10" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="white" fontFamily="system-ui">CL</text></svg>} label="Candidate Site" color={pal.text} />
        </div>
        <div style={{ marginTop: 10, fontSize: 9, color: pal.pale }}>
          © OpenStreetMap contributors
        </div>
      </div>

      {selectedWellId && (() => {
        const w = nearbyWells.find((x) => x.id === selectedWellId);
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
            <span style={{ color }}>{w.risk.toUpperCase()} RISK</span>
            {' · '}{w.depth.toLocaleString()} m · {w.formation}
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