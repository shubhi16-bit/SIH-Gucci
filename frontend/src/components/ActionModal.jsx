import React, { useEffect } from 'react';
import { X, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';

export default function ActionModal({ data, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!data) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Modal Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '12px' }}>
          <Sparkles size={13} />
          <span>NWIS Interactive Preview Mode</span>
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          {data.title || "Feature Preview"}
        </h3>

        {data.subtitle && (
          <div style={{ fontSize: '0.88rem', color: 'var(--brand-accent)', fontWeight: 600, marginBottom: '16px' }}>
            {data.subtitle}
          </div>
        )}

        <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-subtle)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
          {data.content || "This module is configured and ready for full backend database integration."}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => {
              alert("Feature active in SIH 2026 Evaluation Sandbox! You can hook your backend API routes here.");
              onClose();
            }}
          >
            <CheckCircle2 size={16} />
            <span>Confirm Action</span>
          </button>
        </div>
      </div>
    </div>
  );
}
