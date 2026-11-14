import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Moon,
  Activity,
  Smile,
  Flame,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const WellnessPage: React.FC = () => {
  const sleepStages = [
    { name: 'Deep Sleep (Stage 3)', hours: 2.1, color: '#36C9E8' },
    { name: 'REM Sleep', hours: 1.9, color: '#FFFFFF' },
    { name: 'Light Non-REM', hours: 3.4, color: '#737373' },
  ];

  const exerciseBreakdown = [
    { exercise: 'ARED Squat / Deadlift', completed: '75 min', target: '75 min', status: '100% Met' },
    { exercise: 'T2 Aerobic Treadmill', completed: '45 min', target: '45 min', status: '100% Met' },
    { exercise: 'Cycle Ergometer (CEVIS)', completed: '30 min', target: '30 min', status: '100% Met' },
    { exercise: 'Core & Joint Mobility', completed: '15 min', target: '15 min', status: 'Completed' },
  ];

  const weeklyExerciseHistory = [
    { day: 'Mon', minutes: 150 },
    { day: 'Tue', minutes: 165 },
    { day: 'Wed', minutes: 150 },
    { day: 'Thu', minutes: 170 },
    { day: 'Fri', minutes: 155 },
    { day: 'Sat', minutes: 160 },
    { day: 'Sun', minutes: 150 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#111111] border border-[#252525]">
        <div>
          <div className="flex items-center gap-2 text-xs font-orbitron tracking-widest text-[#36C9E8] uppercase mb-1">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>DAILY CIRCADIAN &amp; PHYSIOLOGICAL TRACKER</span>
          </div>
          <h1 className="font-orbitron text-xl sm:text-2xl font-bold text-white tracking-wide">
            DAILY WELLNESS &amp; COUNTERMEASURES
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            Tracking sleep architecture, physical exercise countermeasures, and neuro-cognitive crew morale.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DAILY TARGET: 100% ACHIEVED</span>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-4 rounded-xl bg-[#111111] border border-[#252525]">
          <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2">
            <span className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-[#36C9E8]" />
              <span>Sleep Duration</span>
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">92% Efficiency</span>
          </div>
          <div className="font-orbitron text-3xl font-extrabold text-white">7.4 <span className="text-xs text-[#A3A3A3] font-mono">HRS</span></div>
          <div className="w-full h-1.5 rounded-full bg-[#161616] overflow-hidden mt-3">
            <div className="h-full bg-[#36C9E8] rounded-full" style={{ width: '92%' }} />
          </div>
          <div className="mt-2 text-[10px] text-[#A3A3A3] flex justify-between">
            <span>Target: 8.0 Hrs</span>
            <span>Latency: 12 min</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-[#252525]">
          <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exercise Loading</span>
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">Goal Met</span>
          </div>
          <div className="font-orbitron text-3xl font-extrabold text-white">2.5 <span className="text-xs text-[#A3A3A3] font-mono">HRS</span></div>
          <div className="w-full h-1.5 rounded-full bg-[#161616] overflow-hidden mt-3">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
          </div>
          <div className="mt-2 text-[10px] text-[#A3A3A3] flex justify-between">
            <span>ARED + T2 Treadmill</span>
            <span>Target: 150 min</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-[#252525]">
          <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2">
            <span className="flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-cyan-300" />
              <span>Crew Morale Index</span>
            </span>
            <span className="text-[#36C9E8] font-mono text-[11px]">High</span>
          </div>
          <div className="font-orbitron text-3xl font-extrabold text-white">8.8 <span className="text-xs text-[#A3A3A3] font-mono">/ 10</span></div>
          <div className="w-full h-1.5 rounded-full bg-[#161616] overflow-hidden mt-3">
            <div className="h-full bg-[#36C9E8] rounded-full" style={{ width: '88%' }} />
          </div>
          <div className="mt-2 text-[10px] text-[#A3A3A3] flex justify-between">
            <span>Cognitive Stress: Low</span>
            <span>Team Synergy: 9.2</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-[#252525]">
          <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Caloric Expenditure</span>
            </span>
            <span className="text-amber-400 font-mono text-[11px]">Active</span>
          </div>
          <div className="font-orbitron text-3xl font-extrabold text-white">2,450 <span className="text-xs text-[#A3A3A3] font-mono">KCAL</span></div>
          <div className="w-full h-1.5 rounded-full bg-[#161616] overflow-hidden mt-3">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: '94%' }} />
          </div>
          <div className="mt-2 text-[10px] text-[#A3A3A3] flex justify-between">
            <span>Intake: 2,600 kcal</span>
            <span>Balance: +150 kcal</span>
          </div>
        </div>

      </div>

      {/* Two Column Section: Sleep Architecture & Exercise Countermeasures */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Left: Sleep Architecture (5 COLS) */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-[#111111] border border-[#252525] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#252525] mb-4">
              <h3 className="font-orbitron text-xs font-bold tracking-wider text-white uppercase">
                Sleep Stage Distribution
              </h3>
              <span className="text-[10px] font-mono text-[#36C9E8]">EEG POLYSOMNOGRAPHY</span>
            </div>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sleepStages}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="hours"
                  >
                    {sleepStages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      borderColor: '#252525',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2">
              {sleepStages.map(stage => (
                <div key={stage.name} className="p-2.5 rounded bg-[#161616] border border-[#252525] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-slate-300">{stage.name}</span>
                  </div>
                  <span className="font-orbitron font-bold text-white">{stage.hours} hrs</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#252525] text-[11px] text-[#A3A3A3] flex justify-between">
            <span>Circadian Entrainment:</span>
            <span className="text-emerald-400 font-mono">Synchronized with Habitat Sol 42</span>
          </div>
        </div>

        {/* Right: Countermeasure Adherence Details (7 COLS) */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-[#111111] border border-[#252525] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#252525] mb-4">
              <h3 className="font-orbitron text-xs font-bold tracking-wider text-white uppercase">
                Prescribed Microgravity Exercises
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">100% PROTOCOL ADHERENCE</span>
            </div>

            <div className="space-y-3">
              {exerciseBreakdown.map(item => (
                <div
                  key={item.exercise}
                  className="p-3.5 rounded-lg bg-[#161616] border border-[#252525] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">{item.exercise}</div>
                    <div className="text-[11px] text-[#A3A3A3] mt-0.5">
                      Completed: <span className="text-white font-mono">{item.completed}</span> / Target: {item.target}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Bar Trend */}
          <div className="mt-5 pt-4 border-t border-[#252525]">
            <div className="text-xs text-[#A3A3A3] mb-2 flex justify-between">
              <span>Weekly Workout Consistency (Minutes / Day)</span>
              <span className="text-white font-mono">Average: 157 min/day</span>
            </div>
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyExerciseHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                  <XAxis dataKey="day" stroke="#737373" fontSize={10} tickLine={false} />
                  <YAxis stroke="#737373" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      borderColor: '#252525',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="minutes" fill="#36C9E8" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

