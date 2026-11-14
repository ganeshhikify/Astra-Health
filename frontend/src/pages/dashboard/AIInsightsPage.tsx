import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Heart,
  Droplets,
  Thermometer,
  Moon,
  PhoneCall,
  Clock,
  ShieldCheck,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

type HealthScenario = 'normal' | 'attention' | 'urgent' | 'multiple' | 'insufficient';

export const AIInsightsPage: React.FC = () => {
  // Scenario switcher for demonstration testing
  const [currentScenario, setCurrentScenario] = useState<HealthScenario>('normal');
  const [showTrendHistory, setShowTrendHistory] = useState<boolean>(false);
  const [activeHistoryMetric, setActiveHistoryMetric] = useState<'hr' | 'o2' | 'sleep' | 'temp'>('hr');

  // Simple, validated historical trends for the expandable section
  const trendHistoryData = {
    hr: [
      { sol: 'Sol 37', value: 71, unit: 'BPM' },
      { sol: 'Sol 38', value: 72, unit: 'BPM' },
      { sol: 'Sol 39', value: 73, unit: 'BPM' },
      { sol: 'Sol 40', value: 77, unit: 'BPM' },
      { sol: 'Sol 41', value: 79, unit: 'BPM' },
      { sol: 'Sol 42', value: 78, unit: 'BPM' }
    ],
    o2: [
      { sol: 'Sol 37', value: 98, unit: '%' },
      { sol: 'Sol 38', value: 98, unit: '%' },
      { sol: 'Sol 39', value: 97, unit: '%' },
      { sol: 'Sol 40', value: 98, unit: '%' },
      { sol: 'Sol 41', value: 97, unit: '%' },
      { sol: 'Sol 42', value: 98, unit: '%' }
    ],
    sleep: [
      { sol: 'Sol 37', value: 7.2, unit: 'hrs' },
      { sol: 'Sol 38', value: 7.0, unit: 'hrs' },
      { sol: 'Sol 39', value: 6.8, unit: 'hrs' },
      { sol: 'Sol 40', value: 6.4, unit: 'hrs' },
      { sol: 'Sol 41', value: 6.2, unit: 'hrs' },
      { sol: 'Sol 42', value: 6.1, unit: 'hrs' }
    ],
    temp: [
      { sol: 'Sol 37', value: 36.7, unit: '°C' },
      { sol: 'Sol 38', value: 36.8, unit: '°C' },
      { sol: 'Sol 39', value: 36.8, unit: '°C' },
      { sol: 'Sol 40', value: 36.7, unit: '°C' },
      { sol: 'Sol 41', value: 36.8, unit: '°C' },
      { sol: 'Sol 42', value: 36.8, unit: '°C' }
    ]
  };

  // Structured Event: Attention State
  const attentionEvent = {
    id: 'attn-hr-1',
    type: 'attention',
    category: 'Heart Rate',
    icon: Heart,
    title: 'Your resting heart rate has been higher than usual over the last few days.',
    measurement: 'Resting Heart Rate: 78 BPM (Usual baseline: 70–72 BPM)',
    period: 'Observed over the past 3 days (Sol 40 – Sol 42)',
    whatHappened:
      'Your resting heart rate averaged 78 beats per minute over the last three days. This is about 6 beats per minute higher than your usual personal baseline.',
    whyItMatters:
      'In space, mild heart rate changes can happen for many everyday reasons, such as demanding physical exercise sessions, changes in sleep, or natural fluid adjustment. It is worth keeping an eye on so we understand how your body is pacing itself.',
    whatCanYouDo: [
      'Compare your recent workout intensity with your sleep hours over the past few nights.',
      'Check whether you have been drinking your scheduled electrolyte fluids during shift changes.',
      'If your resting heart rate stays elevated for another 48 hours or you feel unusual fatigue, discuss it with the mission flight surgeon.'
    ]
  };

  // Structured Event: Urgent State (strict safety rules applied)
  const urgentEvent = {
    id: 'urg-o2-1',
    type: 'urgent',
    category: 'Blood Oxygen',
    icon: Droplets,
    title: 'Urgent health alert: Blood oxygen reading below validated flight safety threshold.',
    measurement: 'Current Reading: 88% SpO2 (Validated Mission Threshold: < 90% SpO2)',
    thresholdDetails: 'Protocol Threshold: Immediate Clinical Review Required (NASA JSC Flight Rule Med-B)',
    whatHappened:
      'Your blood oxygen sensor recorded a sustained reading of 88% SpO2 during the last assessment interval, which is below your validated flight threshold of 90%.',
    whyItMatters:
      'Sustained lower oxygen levels require immediate confirmation to rule out cabin air mixture shifts, sensor misplacement, or respiratory fatigue.',
    whatCanYouDo: [
      'Contact the mission medical team immediately via the direct medical audio channel.',
      'Switch to the primary habitat secondary oxygen supply mask per the mission emergency medical protocol.',
      'Remain seated and avoid physical exertion until cleared by the flight surgeon on duty.'
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#111111] border border-[#252525]">
        <div>
          <div className="flex items-center gap-2 text-xs font-orbitron tracking-widest text-[#36C9E8] uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EVENT-BASED HEALTH ASSISTANT</span>
          </div>
          <h1 className="font-orbitron text-xl sm:text-2xl font-bold text-white tracking-wide">
            AI HEALTH INSIGHTS
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1 font-space">
            Understand important changes in your health.
          </p>
        </div>

        {/* Interactive Scenario Switcher for Verification & Review */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#161616] border border-[#252525] text-xs font-space self-start sm:self-auto">
          <span className="text-[10px] text-[#737373] px-2 font-mono uppercase">Scenario:</span>
          {(
            [
              { id: 'normal', label: '1. Normal' },
              { id: 'attention', label: '2. Attention' },
              { id: 'urgent', label: '3. Urgent' },
              { id: 'multiple', label: 'Multiple' },
              { id: 'insufficient', label: 'Insufficient' }
            ] as const
          ).map(scenario => (
            <button
              key={scenario.id}
              onClick={() => setCurrentScenario(scenario.id)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${currentScenario === scenario.id
                  ? 'bg-[#111111] text-[#36C9E8] font-bold border border-[#36C9E8]/40 shadow-sm'
                  : 'text-[#A3A3A3] hover:text-white'
                }`}
            >
              {scenario.label}
            </button>
          ))}
        </div>
      </div>

      {/* SIMULATED DATA & SAFETY DISCLAIMER BANNER */}
      <div className="p-3.5 rounded-xl bg-[#111111] border border-[#252525] flex items-center justify-between text-xs text-[#A3A3A3] font-space">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#36C9E8] shrink-0" />
          <span>
            <strong className="text-white font-medium">Demonstration Health Assistant:</strong> Notifications reflect event-based detection logic. Demonstrations do not diagnose medical conditions.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#161616] text-[#36C9E8] border border-[#252525] font-mono text-[10px] shrink-0 hidden sm:inline">
          SIMULATED EVENTS
        </span>
      </div>

      {/* 2. MAIN AI STATUS AREA & EVENT DETAILS */}

      {/* STATE 1: NORMAL (Clean, quiet, reassuring) */}
      {currentScenario === 'normal' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 sm:p-12 rounded-2xl bg-[#111111] border border-[#252525] text-center space-y-4"
        >
          {/* Small, subtle green success indicator */}
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-orbitron">
              No important changes detected.
            </h2>
            <p className="text-sm text-[#A3A3A3] font-space leading-relaxed">
              Your available health readings are following their expected patterns.
            </p>
          </div>

          <div className="pt-4 border-t border-[#1C1C1C] max-w-md mx-auto flex items-center justify-between text-xs text-[#737373] font-space">
            <span>Last evaluation: Today, 08:30 UTC</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Quiet Monitoring Active</span>
            </span>
          </div>
        </motion.div>
      )}

      {/* STATE 2: ATTENTION (Measurement-specific alert) */}
      {currentScenario === 'attention' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl bg-[#111111] border border-amber-500/40 space-y-6"
        >
          {/* Header of Attention Alert */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#252525]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    ATTENTION ALERT
                  </span>
                  <span className="text-xs text-[#A3A3A3] font-space">
                    {attentionEvent.category}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mt-1 font-orbitron">
                  {attentionEvent.title}
                </h2>
              </div>
            </div>

            <span className="text-xs text-[#A3A3A3] font-space shrink-0">
              {attentionEvent.period}
            </span>
          </div>

          {/* Measured Change Highlight */}
          <div className="p-4 rounded-xl bg-[#161616] border border-[#252525] flex items-center justify-between gap-4 font-space">
            <div>
              <div className="text-[11px] text-[#A3A3A3]">Observed Measurement:</div>
              <div className="text-sm sm:text-base font-bold text-white mt-0.5">
                {attentionEvent.measurement}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-mono text-xs font-semibold shrink-0">
              Mild Persistent Shift
            </span>
          </div>

          {/* 3 Structured Questions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-space">
            {/* WHAT HAPPENED? */}
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] space-y-2">
              <div className="text-[11px] font-bold text-[#36C9E8] uppercase tracking-wider font-orbitron">
                1. WHAT HAPPENED?
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {attentionEvent.whatHappened}
              </p>
            </div>

            {/* WHY IT MATTERS? */}
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] space-y-2">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-orbitron">
                2. WHY IT MATTERS?
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {attentionEvent.whyItMatters}
              </p>
            </div>

            {/* WHAT YOU CAN DO? */}
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] space-y-2">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-orbitron">
                3. WHAT YOU CAN DO?
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                {attentionEvent.whatCanYouDo.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#36C9E8] font-bold">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* STATE 3: URGENT (Validated threshold alert) */}
      {currentScenario === 'urgent' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-2xl bg-[#111111] border-2 border-rose-500/70 space-y-6"
        >
          {/* Urgent Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-500/20">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  URGENT HEALTH ALERT
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mt-1 font-orbitron">
                  {urgentEvent.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto font-space text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-rose-500 text-black font-bold flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Contact Medical Team</span>
              </span>
            </div>
          </div>

          {/* Validated Threshold Details */}
          <div className="p-4 rounded-xl bg-[#161616] border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-space">
            <div>
              <div className="text-[11px] text-rose-300 font-semibold">Validated Medical Threshold Event:</div>
              <div className="text-base font-bold text-white mt-0.5">
                {urgentEvent.measurement}
              </div>
              <div className="text-xs text-[#A3A3A3] mt-0.5">
                {urgentEvent.thresholdDetails}
              </div>
            </div>
            <div className="text-[11px] text-slate-300 sm:text-right shrink-0">
              Protocol: <span className="text-white font-semibold">Immediate Action Required</span>
            </div>
          </div>

          {/* 3 Structured Questions for Urgent */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-space">
            {/* WHAT HAPPENED? */}
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] space-y-2">
              <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider font-orbitron">
                1. WHAT HAPPENED?
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {urgentEvent.whatHappened}
              </p>
            </div>

            {/* WHY IT MATTERS? */}
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] space-y-2">
              <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider font-orbitron">
                2. WHY IT MATTERS?
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {urgentEvent.whyItMatters}
              </p>
            </div>

            {/* WHAT YOU CAN DO? */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
              <div className="text-[11px] font-bold text-white uppercase tracking-wider font-orbitron">
                3. IMMEDIATE PROTOCOL
              </div>
              <ul className="space-y-1.5 text-xs text-white leading-relaxed font-semibold">
                {urgentEvent.whatCanYouDo.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Medical Safety Rule Note */}
          <div className="p-3 rounded-lg bg-[#141414] border border-[#202020] text-[11px] text-[#A3A3A3] font-space flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Threshold validation confirmed against NASA JSC Flight Medicine Standards. Sensor telemetry triggers triage instructions only; clinical diagnosis is conducted by the Flight Surgeon.
            </span>
          </div>
        </motion.div>
      )}

      {/* MULTIPLE SIMULTANEOUS EVENTS (Urgent prioritized first, then Attention) */}
      {currentScenario === 'multiple' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-[#A3A3A3] font-space px-1">
            <span className="text-white font-semibold">2 Active Health Events (Prioritized by Clinical Urgency)</span>
            <span className="font-mono text-[#36C9E8]">Priority: Urgent → Attention</span>
          </div>

          {/* 1. URGENT EVENT (Prioritized First) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-[#111111] border-2 border-rose-500/60 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-3">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300">
                    PRIORITY 1: URGENT HEALTH ALERT
                  </span>
                  <h3 className="text-base font-bold text-white font-orbitron mt-0.5">
                    {urgentEvent.title}
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-rose-500 text-black font-space text-xs font-bold shrink-0 hidden sm:inline">
                Action Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-space text-xs">
              <div className="p-3 rounded-xl bg-[#141414] border border-[#202020]">
                <div className="text-[10px] text-rose-400 font-bold mb-1">WHAT HAPPENED?</div>
                <p className="text-slate-300">{urgentEvent.whatHappened}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141414] border border-[#202020]">
                <div className="text-[10px] text-rose-300 font-bold mb-1">WHY IT MATTERS?</div>
                <p className="text-slate-300">{urgentEvent.whyItMatters}</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-[10px] text-white font-bold mb-1">WHAT CAN YOU DO?</div>
                <p className="text-slate-100 font-semibold">{urgentEvent.whatCanYouDo[0]}</p>
              </div>
            </div>
          </motion.div>

          {/* 2. ATTENTION EVENT (Displayed below urgent) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-[#111111] border border-amber-500/40 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400">
                    PRIORITY 2: ATTENTION NOTICE
                  </span>
                  <h3 className="text-base font-bold text-white font-orbitron mt-0.5">
                    {attentionEvent.title}
                  </h3>
                </div>
              </div>
              <span className="text-xs text-[#A3A3A3] font-space shrink-0 hidden sm:inline">
                {attentionEvent.period}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-space text-xs">
              <div className="p-3 rounded-xl bg-[#141414] border border-[#202020]">
                <div className="text-[10px] text-[#36C9E8] font-bold mb-1">WHAT HAPPENED?</div>
                <p className="text-slate-300">{attentionEvent.whatHappened}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141414] border border-[#202020]">
                <div className="text-[10px] text-amber-400 font-bold mb-1">WHY IT MATTERS?</div>
                <p className="text-slate-300">{attentionEvent.whyItMatters}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#141414] border border-[#202020]">
                <div className="text-[10px] text-emerald-400 font-bold mb-1">WHAT CAN YOU DO?</div>
                <p className="text-slate-300">{attentionEvent.whatCanYouDo[0]}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* INSUFFICIENT DATA STATE */}
      {currentScenario === 'insufficient' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 sm:p-12 rounded-2xl bg-[#111111] border border-[#252525] text-center space-y-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#161616] border border-[#252525] flex items-center justify-center text-[#A3A3A3] mx-auto">
            <Clock className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-orbitron">
              Insufficient data for trend detection.
            </h2>
            <p className="text-sm text-[#A3A3A3] font-space leading-relaxed">
              Continuous sensors are calibrating. The assistant will notify you only once a reliable baseline pattern is established.
            </p>
          </div>

          <div className="pt-4 border-t border-[#1C1C1C] max-w-md mx-auto text-xs text-[#737373] font-space">
            Sensors Calibrating: Heart Rate, SpO2, Core Temp • Minimum baseline requirement: 24 hours.
          </div>
        </motion.div>
      )}

      {/* 3. HEALTH TREND HISTORY (Secondary, Expandable Section per Requirement 4) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111111] border border-[#252525] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-orbitron text-xs sm:text-sm font-bold tracking-wider text-white uppercase">
              HEALTH TREND HISTORY
            </h3>
            <p className="text-xs text-[#A3A3A3] font-space mt-0.5">
              Review changes over time when you want to explore historical measurements.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTrendHistory(!showTrendHistory)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#252525] text-xs font-semibold text-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>{showTrendHistory ? 'Hide Trend History' : 'View Health Trend History'}</span>
            {showTrendHistory ? (
              <ChevronUp className="w-4 h-4 text-[#36C9E8]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#36C9E8]" />
            )}
          </button>
        </div>

        {/* Collapsible Trend Chart Area */}
        <AnimatePresence>
          {showTrendHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-[#252525] space-y-4 overflow-hidden"
            >
              {/* Metric Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-2 font-space text-xs">
                {(
                  [
                    { id: 'hr', label: 'Heart Rate (BPM)', icon: Heart },
                    { id: 'o2', label: 'Blood Oxygen (%)', icon: Droplets },
                    { id: 'sleep', label: 'Sleep (Hours)', icon: Moon },
                    { id: 'temp', label: 'Temperature (°C)', icon: Thermometer }
                  ] as const
                ).map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeHistoryMetric === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveHistoryMetric(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${isActive
                          ? 'bg-[#161616] border-[#36C9E8] text-[#36C9E8] font-bold shadow-sm'
                          : 'bg-[#0E0E0E] border-[#222222] text-[#A3A3A3] hover:text-white'
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Simple Readable Trend Chart */}
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendHistoryData[activeHistoryMetric]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="eventHistoryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#36C9E8" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#36C9E8" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                    <XAxis dataKey="sol" stroke="#737373" fontSize={11} tickLine={false} />
                    <YAxis stroke="#737373" fontSize={11} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111111',
                        borderColor: '#252525',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#36C9E8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#eventHistoryGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#A3A3A3] font-space pt-2 border-t border-[#1C1C1C]">
                <span>
                  Date Range: <strong className="text-white">Sol 37 to Sol 42</strong> • Values recorded during daily resting calibration.
                </span>
                <span className="font-mono text-[#36C9E8] mt-1 sm:mt-0">
                  Current: {trendHistoryData[activeHistoryMetric][trendHistoryData[activeHistoryMetric].length - 1].value}{' '}
                  {trendHistoryData[activeHistoryMetric][0].unit}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AIInsightsPage;
