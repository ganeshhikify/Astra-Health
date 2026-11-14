import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Heart,
  Droplets,
  CalendarCheck,
  Zap,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

type Timeframe = '24H' | '7D' | '30D';
type MetricTab = 'heartRate' | 'spo2' | 'sleep' | 'activity';

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [activeMetricTab, setActiveMetricTab] = useState<MetricTab>('heartRate');

  const chartData = useMemo(() => {
    if (timeframe === '24H') {
      return [
        { time: '00:00', heartRate: 59, spo2: 98, sleep: 8.0, activity: 0, baseline: 70 },
        { time: '02:00', heartRate: 58, spo2: 99, sleep: 8.0, activity: 0, baseline: 70 },
        { time: '04:00', heartRate: 60, spo2: 98, sleep: 7.5, activity: 0, baseline: 70 },
        { time: '06:00', heartRate: 64, spo2: 98, sleep: 7.0, activity: 15, baseline: 70 },
        { time: '08:00', heartRate: 72, spo2: 98, sleep: 0, activity: 35, baseline: 70 },
        { time: '10:00', heartRate: 78, spo2: 99, sleep: 0, activity: 60, baseline: 70 },
        { time: '12:00', heartRate: 71, spo2: 98, sleep: 0, activity: 40, baseline: 70 },
        { time: '14:00', heartRate: 122, spo2: 97, sleep: 0, activity: 120, baseline: 70 },
        { time: '16:00', heartRate: 85, spo2: 98, sleep: 0, activity: 50, baseline: 70 },
        { time: '18:00', heartRate: 74, spo2: 98, sleep: 0, activity: 25, baseline: 70 },
        { time: '20:00', heartRate: 69, spo2: 99, sleep: 0, activity: 10, baseline: 70 },
        { time: '22:00', heartRate: 63, spo2: 98, sleep: 4.0, activity: 0, baseline: 70 },
      ];
    } else if (timeframe === '7D') {
      return [
        { time: 'Sol 36', heartRate: 71, spo2: 98.2, sleep: 7.2, activity: 140, baseline: 70 },
        { time: 'Sol 37', heartRate: 73, spo2: 98.0, sleep: 7.6, activity: 155, baseline: 70 },
        { time: 'Sol 38', heartRate: 69, spo2: 98.4, sleep: 8.1, activity: 130, baseline: 70 },
        { time: 'Sol 39', heartRate: 74, spo2: 97.9, sleep: 6.9, activity: 160, baseline: 70 },
        { time: 'Sol 40', heartRate: 70, spo2: 98.5, sleep: 7.5, activity: 145, baseline: 70 },
        { time: 'Sol 41', heartRate: 72, spo2: 98.2, sleep: 7.8, activity: 150, baseline: 70 },
        { time: 'Sol 42', heartRate: 72, spo2: 98.1, sleep: 7.4, activity: 150, baseline: 70 },
      ];
    } else {
      return [
        { time: 'Wk 1', heartRate: 74, spo2: 97.8, sleep: 7.0, activity: 130, baseline: 70 },
        { time: 'Wk 2', heartRate: 73, spo2: 98.0, sleep: 7.3, activity: 145, baseline: 70 },
        { time: 'Wk 3', heartRate: 71, spo2: 98.3, sleep: 7.5, activity: 150, baseline: 70 },
        { time: 'Wk 4', heartRate: 72, spo2: 98.1, sleep: 7.6, activity: 155, baseline: 70 },
        { time: 'Wk 5', heartRate: 70, spo2: 98.4, sleep: 7.4, activity: 148, baseline: 70 },
        { time: 'Wk 6', heartRate: 72, spo2: 98.2, sleep: 7.4, activity: 150, baseline: 70 },
      ];
    }
  }, [timeframe]);

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
            <TrendingUp className="w-3.5 h-3.5" />
            <span>BIO-TELEMETRY ANALYTICS ENGINE</span>
          </div>
          <h1 className="font-orbitron text-xl sm:text-2xl font-bold text-white tracking-wide">
            HEALTH ANALYTICS &amp; TRENDS
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            Multi-parameter biomedical time-series analysis and physiological adaptation curves.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] border border-[#252525] text-xs text-[#A3A3A3] hover:text-white transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="p-6 rounded-xl bg-[#111111] border border-[#252525]">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#252525]">
          
          {/* Metric Selector */}
          <div className="flex flex-wrap items-center p-1 rounded-lg bg-[#161616] border border-[#252525] text-xs">
            <button
              onClick={() => setActiveMetricTab('heartRate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMetricTab === 'heartRate'
                  ? 'bg-[#111111] text-[#36C9E8] border border-[#252525]'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Heart Rate (BPM)</span>
            </button>
            <button
              onClick={() => setActiveMetricTab('spo2')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMetricTab === 'spo2'
                  ? 'bg-[#111111] text-[#36C9E8] border border-[#252525]'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>SpO2 (%)</span>
            </button>
            <button
              onClick={() => setActiveMetricTab('sleep')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMetricTab === 'sleep'
                  ? 'bg-[#111111] text-[#36C9E8] border border-[#252525]'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Sleep (Hrs)</span>
            </button>
            <button
              onClick={() => setActiveMetricTab('activity')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMetricTab === 'activity'
                  ? 'bg-[#111111] text-[#36C9E8] border border-[#252525]'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Activity (Min)</span>
            </button>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center p-1 rounded-lg bg-[#161616] border border-[#252525] text-xs font-mono">
            {(['24H', '7D', '30D'] as Timeframe[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded transition-colors ${
                  timeframe === tf
                    ? 'bg-[#36C9E8] text-black font-bold'
                    : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

        </div>

        {/* Chart View */}
        <div className="h-80 w-full pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsCyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#36C9E8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#36C9E8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
              <XAxis dataKey="time" stroke="#737373" fontSize={11} tickLine={false} />
              <YAxis stroke="#737373" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
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
                dataKey={activeMetricTab}
                stroke="#36C9E8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#analyticsCyanGrad)"
              />
              <Line
                type="monotone"
                dataKey="baseline"
                stroke="#525252"
                strokeDasharray="4 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-[#A3A3A3] pt-4 border-t border-[#252525] mt-4">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-0.5 bg-[#36C9E8]" />
            <span>Continuous Telemetry Stream</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-0.5 bg-[#525252] border-b border-dashed" />
            <span>Pre-Flight Normal Ground Baseline (70 BPM)</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            Within 95% Confidence Band
          </span>
        </div>

      </div>

      {/* Secondary Metrics Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-4 rounded-xl bg-[#111111] border border-[#252525]">
          <div className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-1">Mean 24H Heart Rate</div>
          <div className="font-orbitron text-2xl font-bold text-white">71.4 BPM</div>
          <p className="text-[11px] text-[#A3A3A3] mt-2">
            Resting variance ±4 BPM. Excellent autonomic recovery post-workout.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-[#252525]">
          <div className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-1">Mean SpO2 Saturation</div>
          <div className="font-orbitron text-2xl font-bold text-cyan-300">98.2%</div>
          <p className="text-[11px] text-[#A3A3A3] mt-2">
            Alveolar gas exchange remains optimal under 14.7 psi habitat pressure.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-[#252525]">
          <div className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-1">Cardiac Workload Index</div>
          <div className="font-orbitron text-2xl font-bold text-emerald-400">0.88 / 1.0</div>
          <p className="text-[11px] text-[#A3A3A3] mt-2">
            Minimal fluid shift cardiac strain. Blood volume adaptation stabilized.
          </p>
        </div>
      </div>

    </motion.div>
  );
};
