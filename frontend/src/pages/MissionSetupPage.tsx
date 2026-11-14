import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Orbit, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Activity, 
  Calendar, 
  Clock, 
  Compass, 
  User, 
  Globe2,
  FileCheck,
  Eye,
  X
} from 'lucide-react';

interface MissionSetupPageProps {
  onBackToLanding: () => void;
  onProceedToAssessment?: (formData: MissionFormData) => void;
  onProceedToDashboard?: () => void;
}

export interface MissionFormData {
  astronautName: string;
  crewId: string;
  astronautRole: string;
  missionName: string;
  destination: 'ISS' | 'MOON' | 'MARS';
  missionDuration: string;
  launchDate: string;
  missionEnvironment: string;
}

const DESTINATION_DETAILS = {
  ISS: {
    id: 'ISS',
    name: 'ISS – International Space Station',
    badge: 'Low Earth Orbit (LEO)',
    image: '/destinations/iss.jpg',
    altitude: '408 km',
    gravity: '0.00g (Microgravity)',
    radiation: 'Moderate • SAA Shielded',
    commDelay: '< 0.5 sec',
    defaultEnv: 'Microgravity • Pressurized Habitat • 90-min Orbital Cycles'
  },
  MOON: {
    id: 'MOON',
    name: 'MOON – Lunar Mission',
    badge: 'Artemis Basecamp / Cis-Lunar',
    image: '/destinations/moon.jpg',
    altitude: '384,400 km',
    gravity: '0.166g (1/6th Earth Gravity)',
    radiation: 'High • Solar Particle Risk',
    commDelay: '1.3 sec',
    defaultEnv: 'Low Gravity • Lunar Regolith • Extreme Thermal Fluctuations'
  },
  MARS: {
    id: 'MARS',
    name: 'MARS – Mars Exploration',
    badge: 'Ares Colony Prime / Deep Space',
    image: '/destinations/mars.jpg',
    altitude: '225,000,000 km',
    gravity: '0.38g (Martian Surface)',
    radiation: 'Extreme • GCR & Galactic Cosmic Rays',
    commDelay: '4 to 24 min',
    defaultEnv: 'Hypogravity • Martian Atmosphere • High Cosmic Radiation'
  }
};

const INITIAL_FORM: MissionFormData = {
  astronautName: 'Cmdr. Sarah Vance',
  crewId: 'AST-7824',
  astronautRole: 'Mission Commander',
  missionName: 'Astra Artemis VII',
  destination: 'MOON',
  missionDuration: '180 Days',
  launchDate: '2027-04-12',
  missionEnvironment: 'Low Gravity • Lunar Regolith • Extreme Thermal Fluctuations'
};

export const MissionSetupPage: React.FC<MissionSetupPageProps> = ({ 
  onBackToLanding,
  onProceedToAssessment,
  onProceedToDashboard
}) => {
  // Load draft from localStorage if available
  const [formData, setFormData] = useState<MissionFormData>(() => {
    try {
      const saved = localStorage.getItem('astra_mission_setup_draft');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback to initial
    }
    return INITIAL_FORM;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MissionFormData, string>>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Auto-clear toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreviewOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewOpen) {
        setIsPreviewOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewOpen]);

  const handleChange = (field: keyof MissionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // clear error on change
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDestinationSelect = (dest: 'ISS' | 'MOON' | 'MARS') => {
    setFormData(prev => ({
      ...prev,
      destination: dest,
      missionEnvironment: DESTINATION_DETAILS[dest].defaultEnv
    }));
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('astra_mission_setup_draft', JSON.stringify(formData));
      setToastMessage('Draft Saved Successfully • Local Configuration Cached');
    } catch {
      setToastMessage('Error saving draft to local storage');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MissionFormData, string>> = {};

    if (!formData.astronautName.trim()) {
      newErrors.astronautName = 'Astronaut Name is required.';
    }
    if (!formData.crewId.trim()) {
      newErrors.crewId = 'Crew ID is required.';
    }
    if (!formData.missionName.trim()) {
      newErrors.missionName = 'Mission Name is required.';
    }
    if (!formData.missionDuration.trim()) {
      newErrors.missionDuration = 'Mission Duration is required.';
    }
    if (!formData.launchDate.trim()) {
      newErrors.launchDate = 'Launch Date is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      handleSaveDraft();
      if (onProceedToAssessment) {
        onProceedToAssessment(formData);
      } else {
        setShowAssessmentModal(true);
      }
    } else {
      setToastMessage('Please complete all required fields.');
    }
  };

  const activeDestInfo = DESTINATION_DETAILS[formData.destination];

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-lg bg-[#0F172A] border border-cyan-500/40 text-cyan-300 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-xs md:text-sm font-space tracking-wide"
          >
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER & NAVIGATION BAR */}
      <header className="border-b border-[#252525] bg-[#070A12]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Top Left: ASTRA HEALTH Branding */}
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-3 text-left group focus:outline-none"
              title="Return to Landing Page"
            >
              <div className="relative flex items-center justify-center w-7 h-7 rounded-full border border-cyan-400/40 bg-cyan-950/40 group-hover:border-cyan-400 transition-colors">
                <Orbit className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '30s' }} />
                <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300" />
              </div>
              <span className="font-orbitron font-bold text-sm tracking-[0.2em] text-white">
                ASTRA<span className="text-[#36C9E8]">HEALTH</span>
              </span>
            </button>

            {/* Back link on mobile */}
            <button
              onClick={onBackToLanding}
              className="md:hidden flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-space transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing</span>
            </button>
          </div>

          {/* Center: Progress Stepper */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-space overflow-x-auto py-1 scrollbar-none">
            {/* Step 1: Active */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-semibold whitespace-nowrap shadow-[0_0_15px_rgba(54,201,232,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>01 MISSION SETUP</span>
            </div>

            <span className="text-slate-600 font-bold select-none">→</span>

            {/* Step 2: Inactive */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.06] text-slate-500 whitespace-nowrap">
              <span>02 HEALTH ASSESSMENT</span>
            </div>

            <span className="text-slate-600 font-bold select-none">→</span>

            {/* Step 3: Inactive */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.06] text-slate-500 whitespace-nowrap">
              <span>03 HEALTH DASHBOARD</span>
            </div>
          </div>

          {/* Top Right: Mission Preview Action & Home Link */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-950/60 hover:border-cyan-400 text-cyan-300 font-space text-xs font-semibold tracking-wider uppercase transition-all shadow-[0_0_12px_rgba(54,201,232,0.15)]"
            >
              <Eye className="w-3.5 h-3.5 text-[#36C9E8]" />
              <span>Mission Preview</span>
            </button>

            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 font-space transition-colors px-3 py-1.5 rounded border border-white/[0.06] hover:border-cyan-500/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {/* Main Heading & Subtitle with Quick Preview Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10 pb-6 border-b border-[#252525]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#36C9E8] tracking-widest uppercase font-space mb-2">
              <span className="w-2 h-0.5 bg-[#36C9E8]" />
              <span>Pre-Flight Telemetry Configuration</span>
            </div>
            <h1 className="font-orbitron text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-white uppercase">
              MISSION CONFIGURATION
            </h1>
            <p className="font-space text-slate-400 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Configure your mission profile to begin astronaut health monitoring.
            </p>
          </div>

          {/* Main "Mission Preview" button */}
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg border border-cyan-400/50 bg-[#0E1526] hover:bg-[#132038] hover:border-cyan-400 text-cyan-300 font-space text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-200 shadow-[0_0_20px_rgba(54,201,232,0.18)] hover:shadow-[0_0_25px_rgba(54,201,232,0.35)] shrink-0 self-start sm:self-auto"
          >
            <Eye className="w-4 h-4 text-[#36C9E8]" />
            <span>Mission Preview</span>
          </button>
        </div>

        {/* CONFIGURATION FORM: SECTION A & SECTION B (FULL WIDTH / SPACIOUS) */}
        <div className="space-y-8">
          <form onSubmit={handleContinue} className="space-y-8">
            
            {/* SECTION A: ASTRONAUT PROFILE */}
            <div className="p-6 md:p-8 rounded-xl bg-[#111111] border border-[#252525] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#252525]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#161616] border border-[#252525]">
                    <User className="w-4 h-4 text-[#36C9E8]" />
                  </div>
                  <div>
                    <h2 className="font-orbitron text-base md:text-lg font-bold tracking-wider text-white uppercase">
                      Section A • Astronaut Profile
                    </h2>
                    <p className="text-xs font-space text-slate-400">Primary operative credentials and mission role</p>
                  </div>
                </div>

                <span className="hidden sm:inline-block text-[11px] font-space text-cyan-400/80 bg-cyan-950/30 px-2.5 py-1 rounded border border-cyan-500/20">
                  Required Fields *
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                
                {/* Astronaut Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-space font-medium text-slate-300 uppercase tracking-wider mb-2">
                    Astronaut Name <span className="text-[#36C9E8]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.astronautName}
                    onChange={e => handleChange('astronautName', e.target.value)}
                    placeholder="e.g. Cmdr. Sarah Vance"
                    className={`w-full px-4 py-3 rounded-lg bg-[#161616] border ${
                      errors.astronautName ? 'border-rose-500' : 'border-[#252525]'
                    } text-white placeholder-slate-600 font-space text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors`}
                  />
                  {errors.astronautName && (
                    <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1 font-space">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.astronautName}</span>
                    </p>
                  )}
                </div>

                {/* Crew ID */}
                <div>
                  <label className="block text-xs font-space font-medium text-slate-300 uppercase tracking-wider mb-2">
                    Crew ID <span className="text-[#36C9E8]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.crewId}
                    onChange={e => handleChange('crewId', e.target.value)}
                    placeholder="e.g. AST-7824"
                    className={`w-full px-4 py-3 rounded-lg bg-[#161616] border ${
                      errors.crewId ? 'border-rose-500' : 'border-[#252525]'
                    } text-white placeholder-slate-600 font-space text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors uppercase`}
                  />
                  {errors.crewId && (
                    <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1 font-space">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.crewId}</span>
                    </p>
                  )}
                </div>

                {/* Astronaut Role */}
                <div>
                  <label className="block text-xs font-space font-medium text-slate-300 uppercase tracking-wider mb-2">
                    Astronaut Role
                  </label>
                  <select
                    value={formData.astronautRole}
                    onChange={e => handleChange('astronautRole', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#161616] border border-[#252525] text-white font-space text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors"
                  >
                    <option value="Mission Commander">Mission Commander</option>
                    <option value="Flight Surgeon / Medical Officer">Flight Surgeon / Medical Officer</option>
                    <option value="Lead Payload Specialist">Lead Payload Specialist</option>
                    <option value="Systems & EVA Engineer">Systems & EVA Engineer</option>
                    <option value="Biomedical Research Scientist">Biomedical Research Scientist</option>
                    <option value="Pilot / Navigation Officer">Pilot / Navigation Officer</option>
                  </select>
                </div>

              </div>
            </div>

            {/* SECTION B: MISSION DETAILS */}
            <div className="p-6 md:p-8 rounded-xl bg-[#111111] border border-[#252525] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#252525]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#161616] border border-[#252525]">
                    <Compass className="w-4 h-4 text-[#36C9E8]" />
                  </div>
                  <div>
                    <h2 className="font-orbitron text-base md:text-lg font-bold tracking-wider text-white uppercase">
                      Section B • Mission Configuration
                    </h2>
                    <p className="text-xs font-space text-slate-400">Target orbital coordinates, timeline, and environmental parameters</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="text-xs font-space text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview State</span>
                </button>
              </div>

              {/* Mission Name */}
              <div className="mb-6">
                <label className="block text-xs font-space font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Mission Name <span className="text-[#36C9E8]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.missionName}
                  onChange={e => handleChange('missionName', e.target.value)}
                  placeholder="e.g. Astra Artemis VII"
                  className={`w-full px-4 py-3 rounded-lg bg-[#161616] border ${
                    errors.missionName ? 'border-rose-500' : 'border-[#252525]'
                  } text-white placeholder-slate-600 font-space text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors`}
                />
                {errors.missionName && (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1 font-space">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.missionName}</span>
                  </p>
                )}
              </div>

              {/* Destination Selection Cards */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-space font-medium text-slate-300 uppercase tracking-wider">
                    Select Destination <span className="text-[#36C9E8]">*</span>
                  </label>
                  <span className="text-[11px] text-cyan-400 font-space">
                    Selected Vector: {formData.destination}
                  </span>
                </div>

                {/* 3 Selectable Destination Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* 1. ISS Card */}
                  <div
                    onClick={() => handleDestinationSelect('ISS')}
                    className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                      formData.destination === 'ISS'
                        ? 'border-cyan-400 bg-[#0E1B33] shadow-[0_0_20px_rgba(54,201,232,0.25)]'
                        : 'border-[#252525] bg-[#161616] hover:border-white/20 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {/* Destination Visual */}
                    <div className="relative w-full h-28 rounded-lg overflow-hidden mb-3 bg-black">
                      <img 
                        src="/destinations/iss.jpg" 
                        alt="ISS Orbit" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-[10px] font-space tracking-wider uppercase text-cyan-300 font-semibold">
                        408 KM ALT
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron font-bold text-sm text-white">ISS</span>
                        {formData.destination === 'ISS' && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-space mt-1 leading-snug">
                        International Space Station
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/[0.06] text-[10px] font-space text-slate-500">
                      Low Earth Orbit • 0.00g
                    </div>
                  </div>

                  {/* 2. MOON Card */}
                  <div
                    onClick={() => handleDestinationSelect('MOON')}
                    className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                      formData.destination === 'MOON'
                        ? 'border-cyan-400 bg-[#0E1B33] shadow-[0_0_20px_rgba(54,201,232,0.25)]'
                        : 'border-[#252525] bg-[#161616] hover:border-white/20 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {/* Destination Visual */}
                    <div className="relative w-full h-28 rounded-lg overflow-hidden mb-3 bg-black">
                      <img 
                        src="/destinations/moon.jpg" 
                        alt="Moon Lunar Orbit" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-[10px] font-space tracking-wider uppercase text-cyan-300 font-semibold">
                        384,400 KM
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron font-bold text-sm text-white">MOON</span>
                        {formData.destination === 'MOON' && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-space mt-1 leading-snug">
                        Lunar Mission Base
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/[0.06] text-[10px] font-space text-slate-500">
                      Lunar Regolith • 0.166g
                    </div>
                  </div>

                  {/* 3. MARS Card */}
                  <div
                    onClick={() => handleDestinationSelect('MARS')}
                    className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                      formData.destination === 'MARS'
                        ? 'border-cyan-400 bg-[#0E1B33] shadow-[0_0_20px_rgba(54,201,232,0.25)]'
                        : 'border-[#252525] bg-[#161616] hover:border-white/20 hover:bg-[#1a1a1a]'
                    }`}
                  >
                    {/* Destination Visual */}
                    <div className="relative w-full h-28 rounded-lg overflow-hidden mb-3 bg-black">
                      <img 
                        src="/destinations/mars.jpg" 
                        alt="Mars Exploration" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-[10px] font-space tracking-wider uppercase text-rose-300 font-semibold">
                        225M KM
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron font-bold text-sm text-white">MARS</span>
                        {formData.destination === 'MARS' && (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-space mt-1 leading-snug">
                        Mars Exploration
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-white/[0.06] text-[10px] font-space text-slate-500">
                      Deep Space • 0.38g
                    </div>
                  </div>

                </div>
              </div>

              {/* Duration & Launch Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                
                {/* Mission Duration */}
                <div>
                  <label className="block text-xs font-space font-medium text-slate-300 uppercase tracking-wider mb-2">
                    Mission Duration <span className="text-[#36C9E8]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.missionDuration}
                      onChange={e => handleChange('missionDuration', e.target.value)}
                      placeholder="e.g. 180 Days"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[#161616] border ${
                        errors.missionDuration ? 'border-rose-500' : 'border-[#252525]'
                      } text-white placeholder-slate-600 font-space text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors`}
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                  {errors.missionDuration && (
                    <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1 font-space">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.missionDuration}</span>
                    </p>
                  )}
                </div>

                {/* Launch Date */}
                <div>
                  <label className="block text-xs font-space font-medium text-slate-300 uppercase tracking-wider mb-2">
                    Launch Date <span className="text-[#36C9E8]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.launchDate}
                      onChange={e => handleChange('launchDate', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-[#161616] border ${
                        errors.launchDate ? 'border-rose-500' : 'border-[#252525]'
                      } text-white placeholder-slate-600 font-space text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors`}
                    />
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                  {errors.launchDate && (
                    <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1 font-space">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.launchDate}</span>
                    </p>
                  )}
                </div>

              </div>

              {/* Mission Environment */}
              <div>
                <label className="block text-xs font-space font-medium text-slate-300 uppercase tracking-wider mb-2">
                  Mission Environment Classification
                </label>
                <input
                  type="text"
                  value={formData.missionEnvironment}
                  onChange={e => handleChange('missionEnvironment', e.target.value)}
                  placeholder="e.g. Microgravity, Deep Space Radiation"
                  className="w-full px-4 py-3 rounded-lg bg-[#161616] border border-[#252525] text-white placeholder-slate-600 font-space text-sm focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition-colors"
                />
                <p className="text-[11px] text-slate-500 font-space mt-1.5">
                  Environmental baseline calibrates vital biometrics thresholds and astronaut physiological tolerance models.
                </p>
              </div>

            </div>

            {/* BOTTOM ACTION BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              
              {/* Mission Preview Trigger Button */}
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-cyan-500/40 bg-[#0E1526] hover:bg-[#132038] hover:border-cyan-400 text-cyan-300 font-space text-sm font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm"
              >
                <Eye className="w-4 h-4 text-[#36C9E8]" />
                <span>MISSION PREVIEW</span>
              </button>

              {/* Save Draft Button */}
              <button
                type="button"
                onClick={handleSaveDraft}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg border border-[#252525] bg-[#161616] hover:bg-[#202020] hover:border-slate-400 text-slate-200 font-space text-sm font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm"
              >
                <Save className="w-4 h-4 text-slate-400" />
                <span>SAVE DRAFT</span>
              </button>

              {/* Continue to Health Assessment */}
              <button
                type="submit"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-lg bg-[#0080ff] hover:bg-[#0094ff] text-white font-space font-semibold text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(0,128,255,0.4)] hover:shadow-[0_0_30px_rgba(0,160,255,0.65)] transition-all duration-200"
              >
                <span>CONTINUE TO HEALTH ASSESSMENT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </form>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER: MISSION PREVIEW (RIGHT SIDE)                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div 
            className="fixed inset-0 z-50 overflow-hidden" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="mission-preview-title"
          >
            {/* Dark overlay backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsPreviewOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
            />

            {/* Slide-over panel container */}
            <div className="fixed inset-y-0 right-0 max-w-full flex">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="w-screen max-w-md sm:max-w-lg lg:max-w-xl bg-[#090D18] border-l border-[#252525] shadow-[-10px_0_40px_rgba(0,0,0,0.8)] flex flex-col h-full text-slate-100 overflow-hidden"
              >
                
                {/* Drawer Header */}
                <div className="px-6 py-5 border-b border-[#252525] bg-[#0A0F1D] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30">
                      <Activity className="w-4 h-4 text-[#36C9E8]" />
                    </div>
                    <div>
                      <h3 id="mission-preview-title" className="font-orbitron text-sm sm:text-base font-bold tracking-widest text-white uppercase">
                        MISSION PREVIEW
                      </h3>
                      <p className="text-[11px] font-space text-slate-400">Live Dynamic Telemetry & Mission Synopsis</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-space text-emerald-400 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>LIVE SYNC</span>
                    </div>

                    {/* Close button in top-right corner */}
                    <button
                      type="button"
                      onClick={() => setIsPreviewOpen(false)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      aria-label="Close Mission Preview"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                  
                  {/* Destination Visual Hero */}
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#252525] bg-black group shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
                    <img
                      src={activeDestInfo.image}
                      alt={activeDestInfo.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090D18] via-transparent to-black/30" />
                    
                    {/* Destination Category Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-space text-[#36C9E8] font-medium tracking-wide">
                      {activeDestInfo.badge}
                    </div>

                    {/* Overlay Specs at Bottom */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] font-space text-slate-400 uppercase tracking-widest">
                          TARGET VECTOR
                        </div>
                        <div className="font-orbitron font-bold text-lg text-white">
                          {formData.destination}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-space text-slate-400 uppercase tracking-widest">
                          GRAVITY FIELD
                        </div>
                        <div className="font-space text-xs text-[#36C9E8] font-semibold">
                          {activeDestInfo.gravity}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Astronaut Profile Section */}
                  <div className="p-4 rounded-xl bg-[#111111] border border-[#252525]">
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-space">
                      <User className="w-3.5 h-3.5 text-[#36C9E8]" />
                      <span>Astronaut Operative</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white text-base font-space">
                          {formData.astronautName || <span className="text-slate-600 italic">Unassigned Name</span>}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-space">
                          {formData.astronautRole}
                        </div>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-[#161616] border border-[#252525] text-xs font-mono text-[#36C9E8] font-semibold">
                        {formData.crewId || 'ID: PENDING'}
                      </div>
                    </div>
                  </div>

                  {/* Mission Identity & Vector */}
                  <div className="grid grid-cols-2 gap-3.5 font-space">
                    <div className="p-3.5 rounded-xl bg-[#111111] border border-[#252525]">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-[#36C9E8]" />
                        <span>Mission Name</span>
                      </div>
                      <div className="text-xs font-semibold text-white truncate" title={formData.missionName}>
                        {formData.missionName || <span className="text-slate-600 italic">Unnamed</span>}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#111111] border border-[#252525]">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Globe2 className="w-3.5 h-3.5 text-[#36C9E8]" />
                        <span>Destination</span>
                      </div>
                      <div className="text-xs font-semibold text-[#36C9E8]">
                        {formData.destination}
                      </div>
                    </div>
                  </div>

                  {/* Mission Duration & Launch Date */}
                  <div className="grid grid-cols-2 gap-3.5 font-space">
                    <div className="p-3.5 rounded-xl bg-[#111111] border border-[#252525]">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#36C9E8]" />
                        <span>Duration</span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {formData.missionDuration || <span className="text-slate-600 italic">TBD</span>}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#111111] border border-[#252525]">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#36C9E8]" />
                        <span>Launch Date</span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {formData.launchDate || <span className="text-slate-600 italic">TBD</span>}
                      </div>
                    </div>
                  </div>

                  {/* Environment & Radiation Risk */}
                  <div className="p-4 rounded-xl bg-[#111111] border border-[#252525] font-space space-y-3">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#36C9E8]" />
                        <span>Environment Baseline</span>
                      </div>
                      <div className="text-xs text-slate-200 leading-relaxed">
                        {formData.missionEnvironment || <span className="text-slate-600 italic">Standard Environment</span>}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#252525] grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Radiation Risk:</span>
                        <span className="text-slate-300 font-medium">{activeDestInfo.radiation}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Comm Delay:</span>
                        <span className="text-slate-300 font-medium">{activeDestInfo.commDelay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Biomedical Telemetry Readiness */}
                  <div className="p-4 rounded-xl bg-[#111111] border border-[#252525] flex items-center justify-between text-xs font-space">
                    <span className="flex items-center gap-2 text-slate-300">
                      <FileCheck className="w-4 h-4 text-[#36C9E8]" />
                      <span>Bio-Telemetry Baseline:</span>
                    </span>
                    <span className="text-[#36C9E8] font-semibold tracking-wide">
                      CONFIGURED & READY
                    </span>
                  </div>

                  {/* Advisory Notice */}
                  <div className="p-3.5 rounded-lg border border-[#252525] bg-white/[0.02] text-xs font-space text-slate-400 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#36C9E8] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Changes in Section A and Section B immediately calibrate physiological baseline models for this astronaut profile.
                    </p>
                  </div>

                </div>

                {/* Drawer Footer Actions */}
                <div className="px-6 py-4 border-t border-[#252525] bg-[#0A0F1D] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-4 py-2.5 rounded-lg border border-[#252525] bg-[#161616] hover:bg-[#202020] text-xs font-space font-medium text-slate-300 transition-colors uppercase tracking-wider"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      setIsPreviewOpen(false);
                      handleContinue(e);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0080ff] hover:bg-[#0094ff] text-white font-space text-xs font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(0,128,255,0.4)] transition-all"
                  >
                    <span>Continue to Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: HEALTH ASSESSMENT TRANSITION (Boundary Placeholder per instructions) */}
      <AnimatePresence>
        {showAssessmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg p-7 rounded-2xl bg-[#0B0F1C] border border-cyan-500/40 shadow-[0_0_50px_rgba(0,163,255,0.25)] text-white"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-space text-xs tracking-widest text-emerald-400 uppercase">
                  Validation Successful
                </span>
              </div>

              <h3 className="font-orbitron text-xl font-bold text-white mb-2">
                MISSION PROFILE CONFIGURED
              </h3>

              <p className="font-space text-slate-300 text-sm leading-relaxed mb-6">
                Profile for <span className="text-white font-semibold">{formData.astronautName}</span> ({formData.crewId}) bound for <span className="text-[#36C9E8] font-semibold">{formData.destination}</span> has been validated and cached.
              </p>

              <div className="p-4 rounded-lg bg-black/50 border border-white/[0.08] mb-6 space-y-2 text-xs font-space text-slate-400">
                <div className="flex justify-between">
                  <span>Current Module:</span>
                  <span className="text-white font-medium">01 Mission Setup (Complete)</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Sequence:</span>
                  <span className="text-cyan-400 font-medium">02 Health Assessment</span>
                </div>
                <div className="flex justify-between">
                  <span>Development State:</span>
                  <span className="text-slate-300">Ready to proceed</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssessmentModal(false)}
                  className="flex-1 py-3 rounded-lg border border-white/[0.15] bg-[#0E1322] hover:bg-[#161D32] text-slate-300 font-space text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  RETURN TO MISSION SETUP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssessmentModal(false);
                    if (onProceedToDashboard) onProceedToDashboard();
                  }}
                  className="flex-1 py-3 rounded-lg bg-[#0080ff] hover:bg-[#0094ff] text-white font-space text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,128,255,0.4)]"
                >
                  <span>ENTER HEALTH DASHBOARD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
