import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Shield, Cpu } from 'lucide-react';

interface MissionSetupPlaceholderProps {
  onBack: () => void;
}

export const MissionSetupPlaceholder: React.FC<MissionSetupPlaceholderProps> = ({ onBack }) => {
  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center p-6 overflow-hidden">
      {/* Subtle deep space background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,163,255,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Futuristic viewframe */}
      <div className="relative z-10 w-full max-w-2xl border border-white/10 rounded-2xl bg-black/60 backdrop-blur-xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Corner HUD accents */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-space text-xs tracking-widest text-cyan-400 uppercase">
            Phase 1 • Route Placeholder
          </span>
        </div>

        {/* Title */}
        <h1 className="font-orbitron text-2xl md:text-4xl font-bold tracking-wide text-white mb-4">
          MISSION SETUP
        </h1>

        <p className="font-space text-slate-400 text-sm md:text-base leading-relaxed mb-8">
          This is the designated route entry point for the upcoming <span className="text-white font-medium">Mission Setup</span> configuration sequence. 
          As instructed, the full application workflow (Health Assessment, Main Dashboard, 3D Body Explorer, and AI Insights) will be constructed upon landing page approval.
        </p>

        {/* Placeholder Module Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
            <Compass className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-xs font-semibold text-slate-300">Trajectory</div>
            <div className="text-[11px] text-slate-500 mt-1">Pending Sync</div>
          </div>
          <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
            <Shield className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-xs font-semibold text-slate-300">Biometrics</div>
            <div className="text-[11px] text-slate-500 mt-1">Telemetry Ready</div>
          </div>
          <div className="p-4 rounded-lg border border-white/5 bg-white/[0.02]">
            <Cpu className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-xs font-semibold text-slate-300">AI Core</div>
            <div className="text-[11px] text-slate-500 mt-1">Astra v1.0</div>
          </div>
        </div>

        {/* Back Button */}
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02, x: -3 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-cyan-500/40 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-900/30 hover:border-cyan-400 transition-all font-space text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO LANDING PAGE</span>
        </motion.button>
      </div>
    </div>
  );
};
