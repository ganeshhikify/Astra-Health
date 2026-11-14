import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Orbit } from 'lucide-react';
import { Starfield } from '../components/Starfield';
import astronautV2 from '../assets/astronaut_v2.png';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden flex items-center justify-center p-3 sm:p-5 md:p-8 lg:p-10 select-none">
      {/* 1. Deep Space Starfield Background */}
      <Starfield />

      {/* 2. Thin Subtle Border Around Main Hero Section (Matching Reference Frame) */}
      <div className="relative z-10 w-full h-[calc(100vh-1.5rem)] sm:h-[calc(100vh-2.5rem)] md:h-[calc(100vh-4rem)] max-w-[1560px] border border-white/[0.12] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden bg-black/40 backdrop-blur-[1px] flex flex-col justify-between shadow-[0_0_90px_rgba(0,0,0,0.95)]">
        
        {/* Subtle Sci-Fi Corner Bracket Accents */}
        <div className="absolute top-0 left-0 w-3 sm:w-4 h-3 sm:h-4 border-t border-l border-white/40 pointer-events-none z-30" />
        <div className="absolute top-0 right-0 w-3 sm:w-4 h-3 sm:h-4 border-t border-r border-white/40 pointer-events-none z-30" />
        <div className="absolute bottom-0 left-0 w-3 sm:w-4 h-3 sm:h-4 border-b border-l border-white/40 pointer-events-none z-30" />
        <div className="absolute bottom-0 right-0 w-3 sm:w-4 h-3 sm:h-4 border-b border-r border-white/40 pointer-events-none z-30" />

        {/* TOP BRANDING BAR (Strict: Only ASTRA HEALTH branding, NO navigation) */}
        <header className="relative z-30 w-full px-6 sm:px-10 md:px-14 pt-6 sm:pt-8 flex items-center justify-between pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-2.5 pointer-events-auto"
          >
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-cyan-400/40 bg-cyan-950/40">
              <Orbit className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '28s' }} />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#00e5ff]" />
            </div>
            <span className="font-orbitron font-bold text-sm sm:text-base tracking-[0.22em] text-white">
              ASTRA<span className="text-cyan-400">HEALTH</span>
            </span>
          </motion.div>
        </header>

        {/* HERO MAIN BODY */}
        <main className="relative z-20 flex-1 flex flex-col lg:flex-row items-start lg:items-center px-6 sm:px-10 md:px-14 py-4 md:py-6 justify-center lg:justify-between">
          
          {/* LEFT SIDE CONTENT */}
          <div className="w-full lg:w-[52%] xl:w-[48%] flex flex-col justify-center items-start z-30 py-4 sm:py-6">
            
            {/* Tagline: YOUR HEALTH. BEYOND EARTH. (styled with reference line & dot) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="flex items-center gap-3 mb-3 sm:mb-6"
            >
              <span className="inline-block w-6 sm:w-8 h-[1px] bg-slate-500" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
              <span className="font-space font-medium text-[11px] sm:text-sm tracking-[0.25em] text-slate-300 uppercase">
                YOUR HEALTH. BEYOND EARTH.
              </span>
            </motion.div>

            {/* Main Heading: ASTRA HEALTH */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4 sm:mb-7"
            >
              <h1 className="font-orbitron font-extrabold text-4xl sm:text-6xl md:text-7xl xl:text-[5.25rem] text-white tracking-wider leading-[1.04] uppercase">
                <div>ASTRA</div>
                <div className="flex items-center gap-3 sm:gap-4 mt-1 sm:mt-2">
                  <span>HEALTH</span>
                  {/* Subtle cosmic horizon capsule echoing reference visual motif */}
                  <div 
                    aria-hidden="true" 
                    className="inline-flex items-center justify-center w-12 sm:w-16 md:w-20 xl:w-24 h-5 sm:h-7 md:h-8 rounded-full border border-cyan-400/50 bg-gradient-to-r from-cyan-950/80 via-blue-600/40 to-cyan-400/30 shadow-[0_0_20px_rgba(0,163,255,0.4)] overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,210,255,0.85)_0%,transparent_70%)] animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] z-10" />
                  </div>
                </div>
              </h1>
            </motion.div>

            {/* Short Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-space text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-md xl:max-w-lg mb-6 sm:mb-10 font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              Intelligent health monitoring for astronauts on long-duration space missions.
            </motion.p>

            {/* Primary CTA: GET STARTED → */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="relative z-40"
            >
              <motion.button
                onClick={onGetStarted}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-lg bg-[#0080ff] hover:bg-[#0094ff] text-white font-space font-semibold text-sm sm:text-base tracking-wider uppercase shadow-[0_0_25px_rgba(0,128,255,0.6)] hover:shadow-[0_0_40px_rgba(0,170,255,0.85)] transition-all duration-300 pointer-events-auto cursor-pointer"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </motion.button>
            </motion.div>

          </div>

          {/* RIGHT SIDE: LARGE PHOTOREALISTIC ASTRONAUT & CRESCENT MOON */}
          <div className="absolute right-0 bottom-0 top-auto lg:top-0 w-full lg:w-[58%] xl:w-[55%] pointer-events-none flex items-end justify-end overflow-hidden z-10 h-[50vh] sm:h-[65vh] lg:h-full">
            
            {/* Ambient Visor & Nebula Cyan Backlight Glow */}
            <div className="absolute right-8 sm:right-28 top-[50%] lg:top-[40%] -translate-y-1/2 w-60 sm:w-[420px] h-60 sm:h-[420px] rounded-full bg-cyan-500/15 blur-[90px] pointer-events-none" />

            {/* Microgravity floating astronaut and crescent moon */}
            <motion.div
              animate={{
                y: [-6, 6, -6],
                rotate: [-0.3, 0.3, -0.3],
              }}
              transition={{
                duration: 9,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full h-full flex items-end justify-end pr-0 pb-0"
            >
              <img
                src={astronautV2}
                alt="Astra Health Astronaut in deep space with galaxy visor reflection and crescent moon"
                className="h-full w-auto max-w-none object-contain object-right-bottom drop-shadow-[0_15px_45px_rgba(0,0,0,0.9)] select-none opacity-40 sm:opacity-75 lg:opacity-100 transition-opacity"
                loading="eager"
              />
            </motion.div>
          </div>

        </main>

        {/* BOTTOM SUBTLE STATUS BAR */}
        <footer className="relative z-30 w-full px-6 sm:px-10 md:px-14 pb-5 sm:pb-7 flex items-center justify-between text-xs font-space text-slate-500 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="tracking-widest uppercase text-[11px] text-slate-400">TELEMETRY SYSTEM ONLINE</span>
          </div>
          <div className="hidden sm:block tracking-widest text-[11px] text-slate-600 uppercase">
            ORBITAL HEALTH MONITORING PLATFORM
          </div>
        </footer>

      </div>
    </div>
  );
};
