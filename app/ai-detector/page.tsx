'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DetectorWorkspace from '@/components/detector/DetectorWorkspace';

export default function DetectorPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF9FF] overflow-x-hidden selection:bg-[#EBE8FF] selection:text-[#5542E5]">
      {/* Subtle Atmospheric Lighting & Textures */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-[12%] left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[#6654F5]/08 via-[#8A7CFF]/04 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-[35%] -left-[140px] w-[500px] h-[500px] bg-gradient-to-tr from-[#78B9FF]/06 via-[#6654F5]/03 to-transparent rounded-full blur-[110px]" />
        <div className="absolute top-[60%] -right-[120px] w-[550px] h-[550px] bg-gradient-to-bl from-[#8A7CFF]/06 via-[#78B9FF]/03 to-transparent rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-dot-pattern opacity-25 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      {/* Dedicated AI Detector Header */}
      <Header variant="detector" />

      {/* Main Detector Workspace Content */}
      <main className="relative z-10 flex-1 w-full pb-12">
        <DetectorWorkspace />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
