import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export default function HistoricalExplorer({ onOpenModal }) {
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');
  const [wellFilter, setWellFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const historicalEvents = [
    {
      id: 'evt-1',
      type: 'STUCK PIPE',
      typeCode: 'stuck_pipe',
      badgeColor: '#EF4444',
      well: '15/9-19 A',
      depth: '2,162 m',
      formation: 'Forties Sandstone',
      date: '2008-04-12',
      operator: 'Equinor (Volve Field)',
      sourceDoc: 'Daily Drilling Report (DDR) #43',
      provenance: 'Direct OCR Report (Ground Truth)',
      excerpt: 'While drilling 12-1/4" hole at 2,162m MD, sudden torque spike from 5.1 to 9.2 kN·m observed. Drillstring unable to rotate or reciprocate. Overpull peaked at 75 klbf. Jarred down with 40 bbl oil-based freeing pill for 4.5 hours to recover string.',
      mitigation: 'Increased mud weight to 1.28 SG and added lubricant beads before resuming drillout.'
    },
    {
      id: 'evt-2',
      type: 'STUCK PIPE',
      typeCode: 'stuck_pipe',
      badgeColor: '#EF4444',
      well: '15/9-F-11',
      depth: '2,198 m',
      formation: 'Forties Sandstone',
      date: '2013-09-18',
      operator: 'Equinor (Volve Field)',
      sourceDoc: 'Daily Drilling Report (DDR) #62',
      provenance: 'Direct OCR Report (Ground Truth)',
      excerpt: 'Mechanical sticking observed immediately after making connection at 2,198m. Significant shale cavings over shakers. Hole packed off. Pumped high-viscosity pill and back-reamed with maximum rotary torque.',
      mitigation: 'Increased flow rate by 150 L/min to improve annular hole cleaning.'
    },
    {
      id: 'evt-3',
      type: 'MUD LOSS',
      typeCode: 'mud_loss',
      badgeColor: '#F59E0B',
      well: '15/9-19 B',
      depth: '2,850 m',
      formation: 'Horda Formation',
      date: '2008-05-02',
      operator: 'Equinor (Volve Field)',
      sourceDoc: 'Daily Drilling Report (DDR) #51',
      provenance: 'Direct OCR Report (Ground Truth)',
      excerpt: 'Sudden loss of returns (35 bbl/hr) upon penetrating micro-fractured limestone horizon at 2,850m. Standpipe pressure dropped 380 psi. Mixed and pumped 50 bbl high-viscosity calcium carbonate LCM pill.',
      mitigation: 'Regained full returns after 2.5 hours; reduced flow rate to 950 L/min.'
    },
    {
      id: 'evt-4',
      type: 'WELLBORE KICK',
      typeCode: 'kick',
      badgeColor: '#8B5CF6',
      well: '15/9-F-4',
      depth: '1,840 m',
      formation: 'Forties Sandstone',
      date: '2013-02-14',
      operator: 'Equinor (Volve Field)',
      sourceDoc: 'Daily Drilling Report (DDR) #29',
      provenance: 'Direct OCR Report (Ground Truth)',
      excerpt: 'Gas influx detected while drilling at 1,840m MD. Active pit volume gained 12 bbl over 6 minutes. Shut in well using annular BOP. Recorded SIDPP: 320 psi, SICP: 410 psi.',
      mitigation: 'Circulated out kick volume via Driller\'s Method using 1.32 SG kill mud.'
    },
    {
      id: 'evt-5',
      type: 'PACK-OFF',
      typeCode: 'pack_off',
      badgeColor: '#EC4899',
      well: '15/9-19 A',
      depth: '2,120 m',
      formation: 'Forties Sandstone',
      date: '2008-04-09',
      operator: 'Equinor (Volve Field)',
      sourceDoc: 'Daily Drilling Report (DDR) #40',
      provenance: 'Direct OCR Report (Ground Truth)',
      excerpt: 'Standpipe pressure rapidly escalated by 600 psi during high ROP run. Annular cuttings bed collapsed around BHA. Reduced pump strokes and reamed interval 3 times.',
      mitigation: 'Circulated bottoms up until shale shaker returns cleared.'
    }
  ];

  const filteredEvents = historicalEvents.filter(evt => {
    const matchesType = eventTypeFilter === 'ALL' || evt.typeCode === eventTypeFilter.toLowerCase().replace(' ', '_');
    const matchesWell = wellFilter === 'ALL' || evt.well === wellFilter;
    const matchesSearch = !searchQuery || 
      evt.well.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.formation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesWell && matchesSearch;
  });

  return (
    <div className="historical-explorer-layout">
      {/* 1. Header Bar */}
      <div className="hist-header-block">
        <div>
          <span className="hist-tag">AUDITABLE DRILLING MEMORY</span>
          <h2 className="hist-title">Historical Event Explorer</h2>
          <p className="hist-sub">
            Search physical Daily Drilling Reports (DDR), wellbore incident dossiers, and sensor records from analogous offsets.
          </p>
        </div>
        <div className="hist-stats-chip">
          <FileText size={15} color="#8F7C3A" />
          <span>Database: 1,420 Verified DDRs</span>
        </div>
      </div>

      {/* 2. Filter Bar (Well | Formation | Depth | Event Type) */}
      <div className="hist-filters-bar">
        {/* Search Input */}
        <div className="hist-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="hist-search-input"
            placeholder="Search keywords, formation, or incident details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Event Type Filter */}
        <div className="filter-select-group">
          <label className="f-label">EVENT TYPE:</label>
          <select 
            className="hist-select"
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
          >
            <option value="ALL">All Event Types</option>
            <option value="stuck_pipe">Stuck Pipe</option>
            <option value="mud_loss">Lost Circulation / Mud Loss</option>
            <option value="kick">Wellbore Kick</option>
            <option value="pack_off">Hole Pack-off</option>
          </select>
        </div>

        {/* Well Filter */}
        <div className="filter-select-group">
          <label className="f-label">WELL:</label>
          <select 
            className="hist-select"
            value={wellFilter}
            onChange={(e) => setWellFilter(e.target.value)}
          >
            <option value="ALL">All Offset Wells</option>
            <option value="15/9-19 A">15/9-19 A</option>
            <option value="15/9-19 B">15/9-19 B</option>
            <option value="15/9-F-11">15/9-F-11</option>
            <option value="15/9-F-4">15/9-F-4</option>
          </select>
        </div>
      </div>

      {/* 3. Event Cards Grid / List */}
      <div className="hist-events-list">
        {filteredEvents.length === 0 ? (
          <div className="no-events-box">
            <AlertTriangle size={24} color="#8F7C3A" />
            <p>No historical events match the current filter criteria.</p>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div key={evt.id} className="hist-event-card">
              {/* Event Card Header */}
              <div className="hec-head">
                <div className="hec-title-col">
                  <span 
                    className="hec-event-pill" 
                    style={{ borderColor: evt.badgeColor, color: evt.badgeColor }}
                  >
                    ● {evt.type}
                  </span>
                  <h3 className="hec-well-id">{evt.well}</h3>
                  <span className="hec-formation">{evt.formation}</span>
                </div>

                <div className="hec-meta-col">
                  <div className="meta-item">
                    <span className="m-lbl">INCIDENT DEPTH</span>
                    <span className="m-val highlight">{evt.depth}</span>
                  </div>
                  <div className="meta-item">
                    <span className="m-lbl">DATE</span>
                    <span className="m-val">{evt.date}</span>
                  </div>
                </div>
              </div>

              {/* Verbatim Shift Excerpt */}
              <div className="hec-excerpt-box">
                <div className="excerpt-source-line">
                  <FileText size={13} color="#8F7C3A" />
                  <strong>Source:</strong> {evt.sourceDoc} &bull; <em>{evt.provenance}</em>
                </div>
                <blockquote className="excerpt-quote">
                  "{evt.excerpt}"
                </blockquote>
                <div className="excerpt-mitigation">
                  <strong>Engineering Mitigation:</strong> {evt.mitigation}
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="hec-footer">
                <span className="hec-operator">{evt.operator}</span>
                <button 
                  className="btn btn-secondary btn-view-source"
                  onClick={() => onOpenModal({
                    title: `${evt.sourceDoc} — ${evt.well}`,
                    subtitle: `Incident: ${evt.type} at ${evt.depth} (${evt.formation})`,
                    content: `Date: ${evt.date}\nOperator: ${evt.operator}\n\nFull Tour Excerpt:\n"${evt.excerpt}"\n\nCorrective Action Executed:\n${evt.mitigation}\n\nSensor Trace Summary:\nStandpipe pressure trace, rotary torque spike telemetry, and Mud Engineer rheology log verified.`
                  })}
                >
                  <ExternalLink size={14} />
                  <span>View Source Document</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
