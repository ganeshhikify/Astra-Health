import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRight,
  Bell,
  TrendingUp,
  Heart,
  Droplets,
  Thermometer,
  Clock,
  Info,
  Database
} from 'lucide-react';
import { DashboardRoute } from '../../layouts/DashboardLayout';
import { measurementsApi } from '../../api/measurementsApi';
import { astronautsApi } from '../../api/astronautsApi';
import { HealthMeasurementResponse } from '../../api/types';

interface OverviewPageProps {
  onNavigate: (route: DashboardRoute) => void;
  onOpenAssessment?: () => void;
  astronautId?: string | null;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigate,
  astronautId: propAstronautId
}) => {
  const [profile, setProfile] = React.useState({
    astronautName: 'Cmdr. Sarah Vance',
    crewId: 'AST-7824',
    astronautRole: 'Mission Commander',
    missionName: 'Astra Artemis VII',
    destination: 'MOON',
    missionDuration: '180 Days'
  });
  const [latestTelemetry, setLatestTelemetry] = React.useState<HealthMeasurementResponse | null>(null);
  const [_isLoadingTelemetry, setIsLoadingTelemetry] = React.useState<boolean>(true);

  React.useEffect(() => {
    let isMounted = true;
    try {
      const saved = localStorage.getItem('astra_mission_setup_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(prev => ({ ...prev, ...parsed }));
      }
    } catch {
      // fallback
    }

    const loadLatestTelemetry = async () => {
      try {
        let targetAstroId = propAstronautId;
        if (!targetAstroId) {
          try {
            const activeRefsStr = localStorage.getItem('astra_active_refs');
            if (activeRefsStr) {
              const parsed = JSON.parse(activeRefsStr);
              if (parsed.astronautId) targetAstroId = parsed.astronautId;
            }
          } catch {
            // ignore
          }
        }

        const astroList = await astronautsApi.list();
        const activeAstro = astroList.find(a => a.id === targetAstroId) || astroList[0];
        if (activeAstro && isMounted) {
          setProfile(prev => ({
            ...prev,
            astronautName: activeAstro.name,
            crewId: activeAstro.crew_id,
            astronautRole: activeAstro.role || prev.astronautRole
          }));

          const measurements = await measurementsApi.getByAstronaut(activeAstro.id, 0, 1);
          if (measurements && measurements.length > 0 && isMounted) {
            setLatestTelemetry(measurements[0]);
          }
        }
      } catch (err) {
        console.warn('Could not load latest telemetry:', err);
      } finally {
        if (isMounted) setIsLoadingTelemetry(false);
      }
    };

    loadLatestTelemetry();

    return () => {
      isMounted = false;
    };
  }, [propAstronautId]);

  // Demonstration Data (Strictly labelled as simulated measurements)
  const healthData = {
    heartRate: {
      value: 72,
      unit: 'BPM',
      lastMeasuredTime: '2 min ago (08:32 UTC)',
      trend: '-0.5% vs baseline',
      trendDirection: 'down',
      isNormal: true,
      min: 64,
      max: 128
    },
    bloodOxygen: {
      value: 98,
      unit: '%',
      lastMeasuredTime: '2 min ago (08:32 UTC)',
      trend: '+0.2% vs baseline',
      trendDirection: 'up',
      partialPressure: '14.5 psia',
      target: '> 95%'
    },
    bodyTemperature: {
      value: 36.8,
      unit: '°C',
      fahrenheit: '98.2°F',
      lastMeasuredTime: '5 min ago (08:29 UTC)',
      trend: 'Nominal baseline',
      baseline: '36.5°C'
    },
    bloodPressure: {
      systolic: 120,
      diastolic: 80,
      unit: 'mmHg',
      lastMeasuredTime: '8 min ago (08:26 UTC)',
      trend: 'Stable',
      classification: 'Normal'
    },
    alerts: [
      {
        id: 'ALT-CO2',
        title: 'Elevated Ambient Habitat CO2',
        severity: 'Advisory',
        explanation: 'Habitat scrubbers cycled during workout. Levels returned to nominal 3.2 mmHg.',
        suggestedAction: 'Verify habitat air circulation vents.',
        time: '12:45 UTC'
      },
      {
        id: 'ALT-HYD',
        title: 'Electrolyte Hydration Checkpoint',
        severity: 'Notice',
        explanation: 'Pre-EVA scheduled hydration intake window for upcoming operations.',
        suggestedAction: 'Log 500ml oral electrolyte intake.',
        time: '10:15 UTC'
      },
      {
        id: 'ALT-SYNC',
        title: 'Biometrics Synchronization Nominal',
        severity: 'Nominal',
        explanation: 'Continuous 1 Hz telemetry stream verified with ground station network.',
        suggestedAction: 'No action required; flight archive updated.',
        time: '08:30 UTC'
      }
    ]
  };

  // Operational Telemetry vs Simulated Demonstration Data
  const isLive = !!latestTelemetry;
  const hrVal = latestTelemetry?.heart_rate_bpm ?? healthData.heartRate.value;
  const hrTime = latestTelemetry
    ? new Date(latestTelemetry.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC'
    : healthData.heartRate.lastMeasuredTime;

  const o2Val = latestTelemetry?.blood_oxygen_pct ?? healthData.bloodOxygen.value;
  const o2Time = latestTelemetry
    ? new Date(latestTelemetry.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC'
    : healthData.bloodOxygen.lastMeasuredTime;

  const tempVal = latestTelemetry?.body_temperature_celsius ?? healthData.bodyTemperature.value;
  const tempFahr = latestTelemetry?.body_temperature_celsius
    ? `${((latestTelemetry.body_temperature_celsius * 9) / 5 + 32).toFixed(1)}°F`
    : healthData.bodyTemperature.fahrenheit;
  const tempTime = latestTelemetry
    ? new Date(latestTelemetry.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC'
    : healthData.bodyTemperature.lastMeasuredTime;

  const bpSys = latestTelemetry?.systolic_bp_mmhg ?? healthData.bloodPressure.systolic;
  const bpDia = latestTelemetry?.diastolic_bp_mmhg ?? healthData.bloodPressure.diastolic;
  const bpTime = latestTelemetry
    ? new Date(latestTelemetry.measured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC'
    : healthData.bloodPressure.lastMeasuredTime;

  const sourceBadge = isLive ? `Operational (${latestTelemetry?.source || 'telemetry'})` : 'Simulated';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* 1. WELCOME & MISSION STRIP */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#111111] border border-[#252525] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-orbitron tracking-widest text-[#36C9E8] uppercase mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>MISSION HEALTH OVERVIEW</span>
          </div>
          <h1 className="font-orbitron text-xl sm:text-2xl font-bold text-white tracking-wide">
            Welcome, {profile.astronautName}
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1 font-space">
            Monitor your health and wellbeing throughout your space mission. Continuous bio-telemetry stream active.
          </p>
        </div>

        {/* Compact Mission Info Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 font-space">
          <div className="px-3 py-1.5 rounded-lg bg-[#161616] border border-[#252525] text-xs">
            <span className="text-[#A3A3A3] block text-[10px]">CREW ID</span>
            <span className="font-mono font-semibold text-white">{profile.crewId}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#161616] border border-[#252525] text-xs">
            <span className="text-[#A3A3A3] block text-[10px]">TARGET</span>
            <span className="font-semibold text-[#36C9E8]">{profile.destination}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#161616] border border-[#252525] text-xs">
            <span className="text-[#A3A3A3] block text-[10px]">MISSION</span>
            <span className="font-semibold text-white">{profile.missionName}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#161616] border border-[#252525] text-xs">
            <span className="text-[#A3A3A3] block text-[10px]">DURATION</span>
            <span className="font-semibold text-white">{profile.missionDuration}</span>
          </div>
        </div>
      </div>

      {/* DISCLAIMER / TELEMETRY SOURCE BANNER */}
      <div className="p-3.5 rounded-xl bg-[#111111] border border-[#252525] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#A3A3A3] font-space">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#36C9E8] shrink-0" />
          <span>
            {isLive ? (
              <>
                <strong className="text-white font-medium">Operational Telemetry Ingested:</strong> Displaying latest verified telemetry record for {profile.astronautName} (Source: <span className="text-[#36C9E8] font-mono capitalize">{latestTelemetry?.source}</span>). Ingested telemetry supports operational readiness; does not constitute automated clinical diagnosis.
              </>
            ) : (
              <>
                <strong className="text-white font-medium">Demonstration Health Telemetry:</strong> All vital signs and telemetry metrics below are demonstration simulated data for aerospace prototype evaluation.
              </>
            )}
          </span>
        </div>
        <span
          className={`px-2.5 py-1 rounded bg-[#161616] border font-mono text-[10px] font-semibold tracking-wider self-start sm:self-auto shrink-0 ${
            isLive ? 'border-emerald-500/40 text-emerald-400' : 'border-[#252525] text-[#36C9E8]'
          }`}
        >
          {isLive ? `OPERATIONAL (${(latestTelemetry?.source || 'telemetry').toUpperCase()})` : 'SIMULATED MEASUREMENTS'}
        </span>
      </div>

      {/* 2. HEALTH MONITORING: ONLY THE FOUR MAIN METRIC CARDS (desktop 4-card layout, responsive) */}
      <div>
        <div className="flex items-center justify-between mb-3.5 font-space">
          <div className="flex items-center gap-2">
            <h2 className="font-orbitron text-xs font-bold tracking-wider text-white uppercase">
              Vital Signs Telemetry
            </h2>
            <span
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold ${
                isLive
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border border-white/10 text-cyan-300'
              }`}
            >
              {isLive ? 'LIVE OPERATIONAL FEED' : 'SIMULATED DATA'}
            </span>
          </div>
          <span className="text-[11px] text-[#A3A3A3] font-mono hidden sm:inline">
            {isLive ? `Latest Record: ${hrTime}` : 'Telemetry Feed: 1 Hz Synchronized'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CARD 1 – HEART RATE */}
          <div className="p-4 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/40 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2 font-space">
                <span className="font-semibold flex items-center gap-1.5 text-white">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-orbitron tracking-wider">HEART RATE</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Nominal
                </span>
              </div>

              {/* Visually prominent heart rate value */}
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-orbitron text-3xl font-extrabold text-white">
                    {hrVal}
                  </span>
                  <span className="text-xs text-[#A3A3A3] font-mono">
                    {healthData.heartRate.unit}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-0.5">
                  <ArrowDownRight className="w-3 h-3" />
                  {healthData.heartRate.trend}
                </span>
              </div>

              {/* ECG Sparkline Waveform */}
              <div className="h-10 w-full pt-1">
                <svg className="w-full h-full text-[#36C9E8]" viewBox="0 0 200 40" fill="none">
                  <path
                    d="M0,20 L40,20 L50,18 L55,20 L65,20 L75,8 L85,34 L95,12 L105,24 L110,20 L150,20 L160,18 L170,20 L200,20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1C1C1C] mt-2 flex items-center justify-between text-[10px] text-[#A3A3A3] font-space">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#737373]" />
                <span>{hrTime}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#161616] text-slate-400 font-mono text-[9px] capitalize">
                {sourceBadge}
              </span>
            </div>
          </div>

          {/* CARD 2 – BLOOD OXYGEN (SpO2) */}
          <div className="p-4 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/40 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2 font-space">
                <span className="font-semibold flex items-center gap-1.5 text-white">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-orbitron tracking-wider">BLOOD OXYGEN (SpO2)</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">Optimal</span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-orbitron text-3xl font-extrabold text-white">
                    {o2Val}
                  </span>
                  <span className="text-xs text-[#A3A3A3] font-mono">
                    {healthData.bloodOxygen.unit}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {healthData.bloodOxygen.trend}
                </span>
              </div>

              {/* Horizontal percentage indicator */}
              <div className="w-full h-2 rounded-full bg-[#161616] overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-[#36C9E8] rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, o2Val))}%` }}
                />
              </div>
              <div className="mt-3 text-[10px] text-[#A3A3A3] flex justify-between font-space">
                <span>Target: {healthData.bloodOxygen.target}</span>
                <span>Partial O2: {healthData.bloodOxygen.partialPressure}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1C1C1C] mt-2 flex items-center justify-between text-[10px] text-[#A3A3A3] font-space">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#737373]" />
                <span>{o2Time}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#161616] text-slate-400 font-mono text-[9px] capitalize">
                {sourceBadge}
              </span>
            </div>
          </div>

          {/* CARD 3 – BODY TEMPERATURE */}
          <div className="p-4 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/40 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2 font-space">
                <span className="font-semibold flex items-center gap-1.5 text-white">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-orbitron tracking-wider">BODY TEMPERATURE</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">Normal</span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-orbitron text-3xl font-extrabold text-white">
                    {tempVal}
                  </span>
                  <span className="text-xs text-[#A3A3A3] font-mono">
                    {healthData.bodyTemperature.unit}
                  </span>
                </div>
                <span className="text-[11px] text-[#A3A3A3] font-mono">
                  {tempFahr}
                </span>
              </div>

              {/* Subtle temperature visualization with baseline marker */}
              <div className="w-full h-2 rounded-full bg-[#161616] relative overflow-hidden mt-3">
                <div className="absolute left-[30%] right-[30%] h-full bg-[#36C9E8]/30" />
                <div className="h-full bg-[#36C9E8] rounded-full" style={{ width: '68%' }} />
              </div>
              <div className="mt-3 text-[10px] text-[#A3A3A3] flex justify-between font-space">
                <span>Core Baseline: {healthData.bodyTemperature.baseline}</span>
                <span>{healthData.bodyTemperature.trend}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1C1C1C] mt-2 flex items-center justify-between text-[10px] text-[#A3A3A3] font-space">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#737373]" />
                <span>{tempTime}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#161616] text-slate-400 font-mono text-[9px] capitalize">
                {sourceBadge}
              </span>
            </div>
          </div>

          {/* CARD 4 – BLOOD PRESSURE */}
          <div className="p-4 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/40 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2 font-space">
                <span className="font-semibold flex items-center gap-1.5 text-white">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-orbitron tracking-wider">BLOOD PRESSURE</span>
                </span>
                <span className="text-emerald-400 font-mono text-[11px]">{healthData.bloodPressure.trend}</span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-orbitron text-3xl font-extrabold text-white">
                    {bpSys}/{bpDia}
                  </span>
                  <span className="text-xs text-[#A3A3A3] font-mono">
                    {healthData.bloodPressure.unit}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {healthData.bloodPressure.classification}
                </span>
              </div>

              {/* Clearly distinguish systolic and diastolic readings */}
              <div className="space-y-1.5 mt-2 font-space">
                <div className="flex items-center gap-2 text-[10px] text-[#A3A3A3]">
                  <span className="w-8 font-semibold text-slate-300">SYS</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[#161616] overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '60%' }} />
                  </div>
                  <span className="font-mono text-white">{bpSys}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#A3A3A3]">
                  <span className="w-8 font-semibold text-slate-300">DIA</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[#161616] overflow-hidden">
                    <div className="h-full bg-[#36C9E8] rounded-full" style={{ width: '40%' }} />
                  </div>
                  <span className="font-mono text-white">{bpDia}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1C1C1C] mt-2 flex items-center justify-between text-[10px] text-[#A3A3A3] font-space">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#737373]" />
                <span>{bpTime}</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#161616] text-slate-400 font-mono text-[9px] capitalize">
                {sourceBadge}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. HEALTH ALERTS & TELEMETRY SIGNALS (Preserved per instructions) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111111] border border-[#252525] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-white" />
            <h3 className="font-orbitron text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
              Health Alerts &amp; Telemetry Notifications
            </h3>
          </div>
          <span className="text-[10px] text-[#A3A3A3] font-mono">
            {healthData.alerts.length} Active Signals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {healthData.alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border-l-2 bg-[#161616] border-t border-r border-b border-[#252525] flex flex-col justify-between ${
                alert.severity === 'Advisory'
                  ? 'border-l-amber-400'
                  : alert.severity === 'Notice'
                  ? 'border-l-[#36C9E8]'
                  : 'border-l-emerald-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-space">
                  <span className="font-semibold text-white">{alert.title}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      alert.severity === 'Advisory'
                        ? 'bg-amber-400/10 text-amber-400'
                        : alert.severity === 'Notice'
                        ? 'bg-cyan-400/10 text-[#36C9E8]'
                        : 'bg-emerald-400/10 text-emerald-400'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[11px] text-[#A3A3A3] leading-snug font-space">
                  {alert.explanation}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#202020] text-[10px] text-slate-300 font-space flex items-center justify-between">
                <span>
                  <strong className="text-white">Action: </strong>
                  {alert.suggestedAction}
                </span>
                <span className="text-[#737373] font-mono text-[9px] shrink-0 ml-2">
                  {alert.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. QUICK JUMP PANELS: ANALYTICS, WELLNESS, AI INSIGHTS, RESEARCH (Preserved & Extended) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Analytics Card */}
        <div 
          onClick={() => onNavigate('analytics')}
          className="p-5 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-5 h-5 text-[#36C9E8]" />
              <span className="text-[10px] font-mono text-[#A3A3A3]">24H / 7D / 30D</span>
            </div>
            <h4 className="font-orbitron text-sm font-bold text-white group-hover:text-[#36C9E8] transition-colors">
              Health Analytics
            </h4>
            <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed font-space">
              Explore longitudinal multi-parameter charts for heart rate, SpO2, sleep architecture, and metabolic work.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#252525] flex items-center justify-between text-xs text-[#36C9E8] font-space">
            <span>View Interactive Charts</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Wellness Card */}
        <div 
          onClick={() => onNavigate('wellness')}
          className="p-5 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-400">2.5H GOAL MET</span>
            </div>
            <h4 className="font-orbitron text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              Daily Wellness &amp; Sleep
            </h4>
            <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed font-space">
              Review ARED resistive training, T2 treadmill aerobic loading, sleep latency, and cognitive morale metrics.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#252525] flex items-center justify-between text-xs text-emerald-400 font-space">
            <span>View Wellness Schedule</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* AI Insights Card */}
        <div 
          onClick={() => onNavigate('ai-insights')}
          className="p-5 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-5 h-5 text-[#36C9E8]" />
              <span className="text-[10px] font-mono text-[#36C9E8]">AI ENGINE v2.4</span>
            </div>
            <h4 className="font-orbitron text-sm font-bold text-white group-hover:text-[#36C9E8] transition-colors">
              AI Health Insights
            </h4>
            <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed font-space">
              Simple everyday AI explanations for your vital signs, sleep, and physical adaptation.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#252525] flex items-center justify-between text-xs text-[#36C9E8] font-space">
            <span>Explore AI Findings</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Scientific Research Datasets Card */}
        <div
          onClick={() => onNavigate('analytics')}
          className="p-5 rounded-xl bg-[#111111] border border-[#252525] hover:border-cyan-400/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <Database className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] font-mono text-cyan-400">4 STUDIES • 1,212 COHORT</span>
            </div>
            <h4 className="font-orbitron text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
              Scientific Research
            </h4>
            <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed font-space">
              PhysioNet ICU oxygenation, NASA Inspiration4 spaceflight omics, FitBit countermeasures, and autonomic aging benchmarks.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#252525] flex items-center justify-between text-xs text-cyan-400 font-space">
            <span>Explore Research Data</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default OverviewPage;
