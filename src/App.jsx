import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StreamlinedFeatures from './components/StreamlinedFeatures';
import ActionModal from './components/ActionModal';
import Footer from './components/Footer';

export default function App() {
  // Modal state for interactive clickable buttons
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const handleOpenModal = (data) => {
    setModalData(data);
  };

  const handleCloseModal = () => {
    setModalData(null);
  };

  return (
    <div className="app-wrapper">
      {/* Top Navbar */}
      <Navbar onOpenModal={handleOpenModal} />

      {/* Hero Section: Unobstructed, buttons and video have 100% clarity */}
      <Hero onOpenModal={handleOpenModal} />

      {/* Dedicated Scroll Transition: Only fades as you scroll down past the video */}
      <div className="hero-scroll-fade-transition" />

      {/* Streamlined, High-Impact Platform Capabilities */}
      <StreamlinedFeatures onOpenModal={handleOpenModal} />

      {/* Clean, Minimal Footer */}
      <Footer onOpenModal={handleOpenModal} />

      {/* Action Modal for Clickable Buttons */}
      <ActionModal 
        data={modalData} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}
