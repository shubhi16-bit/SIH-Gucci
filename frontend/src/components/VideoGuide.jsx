import React, { useState } from 'react';
import { Video, FileVideo, CheckCircle2, ChevronDown, ChevronUp, Copy, Check, Upload } from 'lucide-react';

export default function VideoGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const codeSnippet = `<video
  src="/drilling-demo.mp4"
  autoPlay
  loop
  muted
  playsInline
  className="native-video-elem"
/>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container" style={{ margin: '16px auto 32px' }}>
      <div className="guide-banner">
        <div className="guide-banner-text">
          <div className="guide-banner-icon">
            <FileVideo size={20} />
          </div>
          <div>
            <div className="guide-banner-title">
              How to attach your custom MP4 video to this landing page
            </div>
            <div className="guide-banner-subtitle">
              Quick 3-step instructions to display your real recorded video in the hero player on the right
            </div>
          </div>
        </div>

        <button 
          className="btn btn-secondary"
          onClick={() => setIsOpen(!isOpen)}
          style={{ padding: '8px 16px', fontSize: '0.86rem' }}
        >
          <span>{isOpen ? 'Hide Instructions' : 'View Instructions'}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isOpen && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)',
          borderRadius: '16px',
          padding: '28px',
          marginTop: '12px',
          boxShadow: 'var(--shadow-md)',
          animation: 'modal-slide-up 0.25s ease-out'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Video Attachment Guide for VS Code
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Step 1 */}
            <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--brand-primary)', fontWeight: 800 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>1</span>
                <span>Copy MP4 to public folder</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                In VS Code, simply drag and drop your video file into the <code>public/</code> folder and name it:
                <br />
                <code style={{ background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '6px', fontWeight: 600, color: 'var(--brand-accent)' }}>
                  public/drilling-demo.mp4
                </code>
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--brand-primary)', fontWeight: 800 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>2</span>
                <span>Pre-configured Video Tag</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your <code>src/components/VideoPlayer.jsx</code> component is already configured with:
                <br />
                <code style={{ background: 'var(--bg-surface)', padding: '3px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '6px', fontWeight: 600 }}>
                  const videoSrc = "/drilling-demo.mp4";
                </code>
                <br />
                It loads automatically as soon as the file exists!
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--brand-primary)', fontWeight: 800 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>3</span>
                <span>Browser Autoplay Note</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Modern browsers (Chrome, Safari, Edge) require videos to have <code>muted</code> set to true to enable autoplay without user clicks. Sound can be unmuted via the video sound icon!
              </p>
            </div>
          </div>

          {/* Code snippet display */}
          <div style={{ background: '#180F0A', borderRadius: '10px', padding: '16px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--palette-clay-dust)' }}>
                React Video Component Implementation
              </span>
              <button 
                onClick={handleCopy}
                style={{ color: '#FAF7F2', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
              >
                {copied ? <Check size={14} color="#8F7C3A" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
              </button>
            </div>
            <pre style={{ color: '#E1D3A9', fontFamily: 'monospace', fontSize: '0.82rem', overflowX: 'auto', margin: 0 }}>
              {codeSnippet}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
