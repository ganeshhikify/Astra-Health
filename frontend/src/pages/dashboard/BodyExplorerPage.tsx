import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Heart,
  Brain,
  Bone,
  Eye,
  Activity,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import bodyTransparentImg from '../../assets/body_transparent.png';

type BodySystem = 'cardio' | 'neuro' | 'skeletal' | 'ocular' | 'muscular';
type ViewAngle = 'anterior' | 'posterior' | 'sagittal';

export const BodyExplorerPage: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<BodySystem>('cardio');
  const [viewAngle, setViewAngle] = useState<ViewAngle>('anterior');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationY, setRotationY] = useState<number>(0);
  const [rotationX, setRotationX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const viewerRef = useRef<HTMLDivElement>(null);

  // Subsystem Detailed Clinical & Telemetry Data
  const systemDetails = {
    cardio: {
      id: 'cardio',
      name: 'Cardiovascular & Vascular System',
      icon: Heart,
      status: 'Stabilized Hypogravity Adaptation',
      rating: 'Nominal',
      metrics: [
        { label: 'Stroke Volume', val: '82 mL/beat', status: 'Normal' },
        { label: 'Cardiac Output', val: '5.9 L/min', status: 'Optimal' },
        { label: 'Cephalic Fluid Shift', val: '+12% (Compensated)', status: 'Monitored' },
        { label: 'Arterial Compliance', val: 'Normal Elasticity', status: 'Optimal' }
      ],
      description:
        'In microgravity, ~1.5 to 2 liters of bodily fluids redistribute upward toward the thoracic and cranial cavities. Telemetry confirms baroreceptor resetting and venous volume stabilization without orthostatic distress.',
      countermeasure: 'Daily 45-minute aerobic T2 treadmill running with negative-pressure lower body loading.'
    },
    neuro: {
      id: 'neuro',
      name: 'Neuro-Vestibular & Sensory System',
      icon: Brain,
      status: 'Space Adaptation Syndrome: Resolved',
      rating: 'Clear',
      metrics: [
        { label: 'Vestibular Conflict Index', val: '0.04 (Low)', status: 'Optimal' },
        { label: 'Cognitive Reaction Latency', val: '210 ms', status: 'Normal' },
        { label: 'Sleep-Wake Circadian Sync', val: '98% Alignment', status: 'Optimal' },
        { label: 'Pupillary Light Reflex', val: 'Symmetric & Prompt', status: 'Normal' }
      ],
      description:
        'The vestibular system (otolith organs) has fully adapted to the absence of gravitational downward cues. Spatial orientation, gaze stabilization, and hand-eye target coordination match pre-flight baseline testing.',
      countermeasure: 'Standardized 460nm circadian phase lighting protocol and cognitive tracking drills.'
    },
    skeletal: {
      id: 'skeletal',
      name: 'Skeletal & Bone Mineral Density',
      icon: Bone,
      status: 'Active Resistive Loading Protection',
      rating: 'Protected',
      metrics: [
        { label: 'Lumbar Spine T-Score', val: '-0.2 (Baseline)', status: 'Protected' },
        { label: 'Femoral Neck BMD Rate', val: '-0.1% / Month', status: 'Mitigated' },
        { label: 'Serum Calcium Ion Index', val: '2.32 mmol/L', status: 'Optimal' },
        { label: 'ARED Load Cumulative', val: '12,400 kg/wk', status: 'Target Met' }
      ],
      description:
        'Without gravity loading, astronauts can lose up to 1% bone mineral density per month. Daily ARED (Advanced Resistive Exercise Device) axial loading protocol of 12,400 kg/week has successfully preserved bone architecture.',
      countermeasure: 'High-load eccentric axial squats and deadlifts combined with Vitamin D3 supplementation.'
    },
    ocular: {
      id: 'ocular',
      name: 'Ocular & SANS Screening',
      icon: Eye,
      status: 'Spaceflight-Associated Neuro-Ocular (SANS)',
      rating: 'Stable',
      metrics: [
        { label: 'Optic Nerve Sheath Diam', val: '5.2 mm', status: 'Normal' },
        { label: 'Intraocular Pressure (IOP)', val: '15.4 mmHg', status: 'Normal' },
        { label: 'Choroidal Folds Index', val: 'Zero Detected', status: 'Clear' },
        { label: 'Visual Acuity (Near/Far)', val: '20/20 Equivalent', status: 'Clear' }
      ],
      description:
        'Regular ultrasound and optical coherence tomography (OCT) tracking shows no optic disc edema or posterior globe flattening. SANS score remains within Category 0 (No Findings).',
      countermeasure: 'Daily chorioretinal ultrasound tracking and periodic funduscopic imaging.'
    },
    muscular: {
      id: 'muscular',
      name: 'Musculoskeletal & Muscle Volume',
      icon: Activity,
      status: 'Postural Tone Maintained',
      rating: 'Optimal',
      metrics: [
        { label: 'Soleus / Calf Mass', val: '97% Pre-Flight', status: 'Optimal' },
        { label: 'Peak Isometric Torque', val: '240 Nm', status: 'Strong' },
        { label: 'Electromyography Sync', val: 'Symmetric Fire', status: 'Normal' },
        { label: 'Daily Resistive Time', val: '75 min / Day', status: '100% Goal' }
      ],
      description:
        'Postural anti-gravity muscles (calves, quadriceps, deep back extensors) are protected through high-intensity eccentric-concentric mechanical training routines on the ARED system.',
      countermeasure: 'Targeted heel raises, leg press progressions, and core rotational stabilization exercises.'
    }
  };

  const active = systemDetails[selectedSystem];

  // Camera preset buttons
  const handleAngleSelect = (angle: ViewAngle) => {
    setViewAngle(angle);
    if (angle === 'anterior') {
      setRotationY(0);
      setRotationX(0);
    } else if (angle === 'posterior') {
      setRotationY(180);
      setRotationX(0);
    } else if (angle === 'sagittal') {
      setRotationY(45);
      setRotationX(5);
    }
  };

  const handleResetCamera = () => {
    setViewAngle('anterior');
    setRotationY(0);
    setRotationX(0);
    setZoomLevel(1);
  };

  // Mouse drag rotation controls for smooth 3D experience
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotationY(prev => (prev + deltaX * 0.5) % 360);
    setRotationX(prev => Math.max(-25, Math.min(25, prev - deltaY * 0.3)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Subsystem Hotspot pins positioned accurately on the anatomical human figure
  const hotspots = [
    {
      id: 'neuro' as BodySystem,
      label: 'Brain & Vestibular',
      top: '9%',
      left: '50%',
      icon: Brain,
      summary: 'SAS Conflict Low'
    },
    {
      id: 'ocular' as BodySystem,
      label: 'Ocular (SANS)',
      top: '12%',
      left: '53%',
      icon: Eye,
      summary: 'IOP 15.4 mmHg'
    },
    {
      id: 'cardio' as BodySystem,
      label: 'Heart & Vascular',
      top: '26%',
      left: '51%',
      icon: Heart,
      summary: 'Stroke Vol 82 mL'
    },
    {
      id: 'skeletal' as BodySystem,
      label: 'Spine & BMD',
      top: '42%',
      left: '50%',
      icon: Bone,
      summary: 'T-Score -0.2'
    },
    {
      id: 'muscular' as BodySystem,
      label: 'Muscular Tone',
      top: '68%',
      left: '42%',
      icon: Activity,
      summary: 'Soleus 97%'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* 1. Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#111111] border border-[#252525]">
        <div>
          <div className="flex items-center gap-2 text-xs font-orbitron tracking-widest text-[#36C9E8] uppercase mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>3D ANATOMICAL TELEMETRY MODEL</span>
          </div>
          <h1 className="font-orbitron text-xl sm:text-2xl font-bold text-white tracking-wide">
            3D BODY EXPLORER
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1 font-space">
            Interactive anatomical physiological subsystem scanner and cardiovascular mapping.
          </p>
        </div>

        {/* Camera Projection Selector */}
        <div className="flex items-center gap-2 font-space text-xs">
          {(['anterior', 'posterior', 'sagittal'] as const).map(angle => (
            <button
              key={angle}
              onClick={() => handleAngleSelect(angle)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase transition-colors cursor-pointer ${
                viewAngle === angle
                  ? 'bg-[#36C9E8] text-black font-bold shadow-[0_0_15px_rgba(54,201,232,0.4)]'
                  : 'bg-[#161616] text-[#A3A3A3] hover:text-white border border-[#252525]'
              }`}
            >
              {angle}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Two-Column Body Explorer View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: 3D Holographic Viewer Viewport (7 COLS) */}
        <div
          ref={viewerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="lg:col-span-7 p-6 rounded-2xl bg-[#111111] border border-[#252525] flex flex-col justify-between relative overflow-hidden min-h-[580px] select-none cursor-grab active:cursor-grabbing"
        >
          {/* Subtle Ambient Depth Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(54,201,232,0.12)_0%,transparent_70%)] pointer-events-none" />

          {/* Top Viewport Telemetry Bar */}
          <div className="flex items-center justify-between relative z-20 text-xs font-mono text-[#A3A3A3]">
            <span className="flex items-center gap-1.5 text-[#36C9E8]">
              <span className="w-2 h-2 rounded-full bg-[#36C9E8] animate-pulse" />
              <span>3D SCANNER V3.2 • ACTIVE</span>
            </span>
            <span className="bg-[#161616] px-2.5 py-1 rounded border border-[#252525] text-slate-300">
              ROTATION: {Math.round(rotationY)}° • PITCH: {Math.round(rotationX)}°
            </span>
          </div>

          {/* Central 3D Human Body Model Viewport with Depth */}
          <div className="relative my-4 flex items-center justify-center flex-1 min-h-[460px]">
            {/* Concentric Scanner Depth Rings */}
            <div
              className="absolute w-80 h-80 rounded-full border border-[#36C9E8]/15 animate-spin pointer-events-none"
              style={{ animationDuration: '45s' }}
            />
            <div className="absolute w-64 h-64 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute bottom-2 w-56 h-12 rounded-full bg-[#36C9E8]/10 blur-xl pointer-events-none" />

            {/* 3D Transform Container (Zoom + Rotation + Perspective) */}
            <div
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
              className="relative z-10 flex items-center justify-center w-full h-full"
            >
              <div
                style={{
                  transform: `scale(${zoomLevel}) rotateY(${rotationY}deg) rotateX(${rotationX}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  transformStyle: 'preserve-3d'
                }}
                className="relative max-w-[340px] max-h-[500px] flex items-center justify-center"
              >
                {/* The Uploaded Human Body Reference Model with 100% Transparent Background */}
                <img
                  src={bodyTransparentImg}
                  alt="ASTRA HEALTH 3D Human Body Anatomy Reference Model"
                  className="w-full h-auto max-h-[480px] object-contain drop-shadow-[0_0_30px_rgba(54,201,232,0.35)] select-none pointer-events-none"
                  draggable={false}
                />

                {/* Subsystem Interactive Hotspot Pins with 3D Depth */}
                {hotspots.map(pin => {
                  const isSelected = selectedSystem === pin.id;
                  const Icon = pin.icon;
                  return (
                    <div
                      key={pin.id}
                      style={{
                        top: pin.top,
                        left: pin.left,
                        transform: 'translate(-50%, -50%) translateZ(25px)'
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedSystem(pin.id);
                      }}
                      className="absolute z-30 group cursor-pointer"
                    >
                      {/* Pulsing Target Ring */}
                      <div className="relative flex items-center justify-center">
                        <span
                          className={`absolute w-6 h-6 rounded-full animate-ping pointer-events-none ${
                            isSelected ? 'bg-[#36C9E8]/60' : 'bg-white/20 group-hover:bg-[#36C9E8]/40'
                          }`}
                        />
                        <button
                          type="button"
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#36C9E8] border-white text-black shadow-[0_0_15px_rgba(54,201,232,0.8)] scale-110'
                              : 'bg-[#111111]/90 border-[#36C9E8]/70 text-[#36C9E8] group-hover:scale-110 group-hover:bg-[#36C9E8] group-hover:text-black'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                        </button>

                        {/* Hover Tooltip Label */}
                        <div className="absolute left-8 px-2 py-1 rounded bg-[#161616]/95 border border-[#252525] text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-sm z-40 text-white shadow-xl">
                          <span className="font-bold text-[#36C9E8]">{pin.label}</span>
                          <span className="text-[#A3A3A3] block text-[9px]">{pin.summary}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Zoom & Reset Overlay Controls */}
            <div className="absolute right-4 bottom-4 flex flex-col gap-1.5 z-20">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(1.6, prev + 0.15))}
                title="Zoom In"
                className="w-8 h-8 rounded-lg bg-[#161616]/90 hover:bg-[#202020] border border-[#252525] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
                title="Zoom Out"
                className="w-8 h-8 rounded-lg bg-[#161616]/90 hover:bg-[#202020] border border-[#252525] text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetCamera}
                title="Reset Camera"
                className="w-8 h-8 rounded-lg bg-[#161616]/90 hover:bg-[#202020] border border-[#252525] text-[#36C9E8] flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View Guidance Hint */}
            <div className="absolute left-4 bottom-4 text-[10px] font-space text-[#737373] pointer-events-none hidden sm:block">
              Click &amp; drag body to rotate in 3D • Click pins to inspect systems
            </div>
          </div>

          {/* Subsystem Selection Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 relative z-20 pt-4 border-t border-[#252525] font-space">
            {Object.values(systemDetails).map(sys => {
              const isSelected = selectedSystem === sys.id;
              const Icon = sys.icon;
              return (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => setSelectedSystem(sys.id as BodySystem)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#36C9E8] text-black font-bold shadow-[0_0_15px_rgba(54,201,232,0.3)]'
                      : 'bg-[#161616] text-[#A3A3A3] hover:text-white border border-[#252525]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sys.name.split('&')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Subsystem Detailed Health Information Panel (5 COLS) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#111111] border border-[#252525] flex flex-col justify-between font-space space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Subsystem Title & Rating */}
              <div className="pb-3 border-b border-[#252525]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-orbitron font-semibold text-[#36C9E8] uppercase tracking-wider flex items-center gap-1.5">
                    <active.icon className="w-4 h-4 text-[#36C9E8]" />
                    <span>PHYSIOLOGICAL SYSTEM</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {active.rating}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white font-orbitron mt-1">
                  {active.name}
                </h2>
                <div className="text-xs text-slate-300 mt-1 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{active.status}</span>
                </div>
              </div>

              {/* 4 Quantitative Telemetry Metric Readouts */}
              <div className="grid grid-cols-2 gap-3">
                {active.metrics.map(m => (
                  <div
                    key={m.label}
                    className="p-3 rounded-xl bg-[#161616] border border-[#252525] space-y-1"
                  >
                    <div className="text-[10px] text-[#A3A3A3] truncate">{m.label}</div>
                    <div className="text-sm font-bold text-white font-mono">{m.val}</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{m.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Aerospace Physiological Description */}
              <div className="space-y-1.5">
                <div className="text-xs font-orbitron font-semibold text-[#A3A3A3] uppercase tracking-wider">
                  Microgravity Adaptation Dynamics
                </div>
                <p className="text-xs text-slate-300 leading-relaxed p-3.5 rounded-xl bg-[#161616] border border-[#252525]">
                  {active.description}
                </p>
              </div>

              {/* Prescribed Countermeasure Routine */}
              <div className="space-y-1.5">
                <div className="text-xs font-orbitron font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Prescribed Flight Countermeasure</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  {active.countermeasure}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Card Summary Footnote */}
          <div className="pt-4 border-t border-[#252525] flex items-center justify-between text-xs text-[#737373]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#36C9E8]" />
              <span>Calibrated via Bio-Sync Stream</span>
            </span>
            <span className="font-mono text-[10px] text-white">Sol 42 Telemetry</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default BodyExplorerPage;
