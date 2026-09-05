import React, { useRef, useState, useEffect } from 'react';

export default function Hero({ onOpenModal, isLoggedIn, onOpenLogin, onOpenProjects }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoFaded, setVideoFaded] = useState(false);

  useEffect(() => {
    // Autoplay video once when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn("Autoplay notice:", err);
      });
    }

    // Pre-paint canvas with poster image so a still image is ready immediately
    const img = new Image();
    img.src = "./assets/drilling-rig-bg.png";
    img.onload = () => {
      if (canvasRef.current && !videoFaded) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const w = img.width || 1280;
        const h = img.height || 720;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        // Clean any watermark artifacts in the bottom corners
        const cornerSize = Math.round(w * 0.14);
        const gradBL = ctx.createRadialGradient(0, h, 0, 0, h, cornerSize);
        gradBL.addColorStop(0, '#000000');
        gradBL.addColorStop(0.7, 'rgba(0, 0, 0, 0.95)');
        gradBL.addColorStop(1, 'transparent');
        ctx.fillStyle = gradBL;
        ctx.fillRect(0, h - cornerSize, cornerSize, cornerSize);

        const gradBR = ctx.createRadialGradient(w, h, 0, w, h, cornerSize);
        gradBR.addColorStop(0, '#000000');
        gradBR.addColorStop(0.7, 'rgba(0, 0, 0, 0.95)');
        gradBR.addColorStop(1, 'transparent');
        ctx.fillStyle = gradBR;
        ctx.fillRect(w - cornerSize, h - cornerSize, cornerSize, cornerSize);
      }
    };
  }, [videoFaded]);

  const handleVideoEnded = () => {
    // Capture the exact final frame of the video onto the underlying canvas
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (video.videoWidth && video.videoHeight) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, w, h);

        // Seamlessly cover any corner watermarks (bottom-left / bottom-right)
        const cornerSize = Math.round(w * 0.14);
        const gradBL = ctx.createRadialGradient(0, h, 0, 0, h, cornerSize);
        gradBL.addColorStop(0, '#000000');
        gradBL.addColorStop(0.7, 'rgba(0, 0, 0, 0.95)');
        gradBL.addColorStop(1, 'transparent');
        ctx.fillStyle = gradBL;
        ctx.fillRect(0, h - cornerSize, cornerSize, cornerSize);

        const gradBR = ctx.createRadialGradient(w, h, 0, w, h, cornerSize);
        gradBR.addColorStop(0, '#000000');
        gradBR.addColorStop(0.7, 'rgba(0, 0, 0, 0.95)');
        gradBR.addColorStop(1, 'transparent');
        ctx.fillStyle = gradBR;
        ctx.fillRect(w - cornerSize, h - cornerSize, cornerSize, cornerSize);
      }
    }
    // Smoothly fade out the video element, leaving the pristine still image on the canvas
    setVideoFaded(true);
  };

  return (
    <section id="overview" className="hero-unified-stage">
      {/* Background Media Layer: Canvas Still Image + Fading Video Overlay */}
      <div className="hero-media-backdrop">
        <canvas ref={canvasRef} className="hero-still-canvas" />
        <video
          ref={videoRef}
          className={`hero-live-video ${videoFaded ? 'is-faded' : ''}`}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnded}
        >
          <source src="./assets/background-video.mp4" type="video/mp4" />
          <source src="./drilling-demo.mp4" type="video/mp4" />
          <source src="./background-video.mp4" type="video/mp4" />
        </video>
        {/* Invisible watermark mask shield for live video playback */}
        <div className="watermark-shield" />
      </div>

      {/* Hero Foreground: Left-Aligned Text sitting seamlessly on the background */}
      <div className="container hero-content-container">
        <div className="hero-text-block">
          <h1 className="hero-heading">
            Turn historical drilling experience into decisions
          </h1>

          <p className="hero-subtext">
            Explore candidate locations, plan wells, and monitor drilling risk in one place.
          </p>

          <div className="hero-actions-row">
            {isLoggedIn ? (
              <button 
                className="btn btn-hero-solid"
                onClick={onOpenProjects}
              >
                Go to Projects
              </button>
            ) : (
              <button 
                className="btn btn-hero-solid"
                onClick={onOpenLogin}
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
