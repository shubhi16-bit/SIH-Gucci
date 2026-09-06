import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, HelpCircle, Activity, Compass, Layers } from 'lucide-react';

export default function VideoPlayer({ onShowVideoGuide }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  // Video source path in public/
  const videoSrc = "/drilling-demo.mp4";

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn("Video playback requires user interaction or fallback:", err);
        setHasError(true);
      });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="hero-video-wrapper">
      <div className="video-frame-outer">
        <div className="video-card">
          {/* HTML5 Video Element */}
          {!hasError ? (
            <video
              ref={videoRef}
              src={videoSrc}
              className="native-video-elem"
              playsInline
              muted={isMuted}
              loop
              onTimeUpdate={handleTimeUpdate}
              onError={() => {
                // If drilling-demo.mp4 isn't in public/ yet, gracefully fallback to interactive radar
                setHasError(true);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : null}

          {/* High-Tech Animated Radar Simulation (Fallback / Poster) */}
          {hasError && (
            <div className="video-radar-canvas">
              {/* Radar circular sweeps */}
              <div className="radar-sweep">
                <div style={{ width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(168,85,48,0.3)' }} />
              </div>
              
              {/* Wellbore Trajectory Simulation Graphic */}
              <svg width="280" height="150" viewBox="0 0 280 150" fill="none" style={{ zIndex: 2 }}>
                {/* Surface line */}
                <line x1="20" y1="30" x2="260" y2="30" stroke="#C0AA8A" strokeWidth="2" strokeDasharray="4 4" />
                <text x="24" y="24" fill="#C0AA8A" fontSize="10" fontFamily="monospace">SURFACE ELEVATION: 0m</text>
                
                {/* Rig icon */}
                <path d="M 60 30 L 70 8 L 80 30 Z" fill="#8F7C3A" />
                <rect x="68" y="2" width="4" height="6" fill="#A85530" />

                {/* Trajectory path */}
                <path 
                  d="M 70 30 Q 75 70 110 95 T 190 125" 
                  stroke="#A85530" 
                  strokeWidth="3.5" 
                  fill="none" 
                  strokeLinecap="round" 
                />
                
                {/* Historical Wells */}
                <circle cx="160" cy="85" r="4" fill="#534831" stroke="#E1D3A9" strokeWidth="1.5" />
                <text x="170" y="88" fill="#E1D3A9" fontSize="9" fontFamily="monospace">15/9-19 A (Offset)</text>

                {/* Target Zone */}
                <rect x="180" y="115" width="70" height="24" rx="4" fill="rgba(143, 124, 58, 0.3)" stroke="#8F7C3A" strokeWidth="1.5" strokeDasharray="3 2" />
                <text x="185" y="131" fill="#E1D3A9" fontSize="9" fontWeight="bold">FORTIES SAND</text>

                {/* Drill bit beacon */}
                <circle cx="110" cy="95" r="5" fill="#E5484D">
                  <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </svg>

              {/* Target Location Tag */}
              <div className="radar-target">
                <Compass size={13} />
                <span>VOLVE FIELD • 15/9-F-1 REPLAY</span>
              </div>

              {/* Instruction pill */}
              <button 
                className="video-instruction-pill"
                onClick={onShowVideoGuide}
              >
                <HelpCircle size={14} color="#A85530" />
                <span>Attach your <strong>drilling-demo.mp4</strong> here (Click for guide)</span>
              </button>
            </div>
          )}

          {/* Overlay Controls */}
          <div className={`video-overlay ${!isPlaying ? 'is-paused' : ''}`}>
            {/* Top Bar */}
            <div className="video-top-bar">
              <div className="video-badge">
                <div className="video-badge-rec" />
                <span>NWIS Telemetry Stream</span>
              </div>
              <button 
                className="btn-outline-pill"
                style={{ background: 'rgba(26, 17, 11, 0.7)', color: '#FAF7F2' }}
                onClick={onShowVideoGuide}
              >
                <Layers size={13} style={{ marginRight: 4 }} />
                Video Guide
              </button>
            </div>

            {/* Center Play/Pause Button */}
            <button className="video-center-play" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
            </button>

            {/* Bottom Bar Controls */}
            <div className="video-bottom-bar">
              <span className="video-meta-text">
                {formatTime(currentTime)} / {formatTime(duration || 90)}
              </span>

              <div className="video-ctrl-btns">
                <button className="video-ctrl-btn" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button className="video-ctrl-btn" onClick={toggleFullscreen} title="Fullscreen">
                  <Maximize size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
