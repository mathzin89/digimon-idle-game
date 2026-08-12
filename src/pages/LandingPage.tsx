// src/pages/LandingPage.tsx
import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { SideMenu } from '../components/layout/SideMenu';
import { HeroSection } from '../components/sections/HeroSection';
import { BrowserFeature } from '../components/sections/BrowserFeature';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { StarterSelection } from '../components/sections/StarterSelection';
import { SystemsSection } from '../components/sections/SystemsSection';
import { Footer } from '../components/layout/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen relative selection:bg-digi-cyan selection:text-digi-darker overflow-hidden">
      <Navbar />
      <SideMenu />
      <main>
        <HeroSection />
        <BrowserFeature />
        <FeaturesSection />
        <StarterSelection />
        <SystemsSection />
      </main>
      <Footer />
    </div>
  );
}