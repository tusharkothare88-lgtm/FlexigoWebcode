import React from 'react';
import { ReactLenis } from '@studio-freight/react-lenis';

// Import all sections
import Navbar from '../web-components/Navbar';
import HeroSection from '../web-components/HeroSection';
import VideoSection from '../web-components/VideoSection';
import StatsSection from '../web-components/StatsSection';
import HowItWorksSection from '../web-components/HowItWorksSection';
import FeaturesSection from '../web-components/FeaturesSection';
import SavingsCalculatorSection from '../web-components/SavingsCalculatorSection';
import VehicleShowcaseSection from '../web-components/VehicleShowcaseSection';
import MapSection from '../web-components/MapSection';
import TestimonialsSection from '../web-components/TestimonialsSection';
import CtaSection from '../web-components/CtaSection';
import FooterSection from '../web-components/FooterSection';
import FloatingContactButtons from '../web-components/FloatingContactButtons';

const WebHome = () => {
  return (
    <ReactLenis root options={{ lerp: 0.12, duration: 1.2, smoothWheel: true }}>
      <div className="landing-page-theme bg-white min-h-screen font-body text-slate-800 antialiased selection:bg-flexigo-teal selection:text-white">
        <Navbar />
        
        <main>
          <HeroSection />
          <VideoSection />
          <StatsSection />
          <HowItWorksSection />
          <FeaturesSection />
          <SavingsCalculatorSection />
          <VehicleShowcaseSection />
          <MapSection />
          <TestimonialsSection />
          <CtaSection />
        </main>

        <FooterSection />
        <FloatingContactButtons />
      </div>
    </ReactLenis>
  );
};

export default WebHome;
