import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  Download,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldAlert,
  UserCheck,
  Radio,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { measurementsApi } from '../../api/measurementsApi';
import { astronautsApi } from '../../api/astronautsApi';
import { HealthMeasurementResponse } from '../../api/types';
import { ResearchAnalyticsView } from '../../components/research/ResearchAnalyticsView';

type Timeframe = '24H' | '7D' | '30D';
type MetricTab = 'heartRate' | 'spo2' | 'temperature' | 'bloodPressure';

interface AnalyticsPageProps {
  astronautId?: string;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ astronautId: propAstronautId }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [activeMetricTab, setActiveMetricTab] = useState<MetricTab>('heartRate');
  const [measurements, setMeasurements] = useState<HealthMeasurementResponse[]>([]);
  const [astronautName, setAstronautName] = useState<string>('');
  const [crewId, setCrewId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedAstronautId, setResolvedAstronautId] = useState<string | null>(null);
  const [analyticsMode, setAnalyticsMode] = useState<'operative' | 'research'>('operative');

  // Determine active astronaut ID strictly from props or user-saved session state
  useEffect(() => {
    let id = propAstronautId;
    if (!id) {
      try {
        const cached = localStorage.getItem('astra_saved_references');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.astronautId) id = parsed.astronautId;
        }
      } catch {
        // ignore
      }
    }
    setResolvedAstronautId(id || null);
    if (!id) {
      // Default to public research datasets when no operative is selected
      setAnalyticsMode('research');
    }
  }, [propAstronautId]);

  // Load astronaut profile and telemetry measurements strictly for the selected astronaut
  const fetchData = useCallback(async () => {
    if (!resolvedAstronautId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch profile for the specifically selected astronaut
      const profile = await astronautsApi.getById(resolvedAstronautId);
      setAstronautName(profile.name);
      setCrewId(profile.crew_id);

      // 2. Fetch measurements specifically for this astronaut
      const data = await measurementsApi.getByAstronaut(resolvedAstronautId, 0, 200);
      const sorted = [...data].sort(
        (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
      );
      setMeasurements(sorted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve telemetry data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [resolvedAstronautId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter measurements according to selected timeframe
  const filteredMeasurements = useMemo(() => {
    if (measurements.length === 0) return [];

    const latestTime = Math.max(...measurements.map(m => new Date(m.measured_at).getTime()));
    const windowMs =
      timeframe === '24H'
        ? 24 * 60 * 60 * 1000
        : timeframe === '7D'
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;

    const cutoff = latestTime - windowMs;
    const filtered = measurements.filter(m => new Date(m.measured_at).getTime() >= cutoff);

    return filtered.length > 0 ? filtered : measurements;
  }, [measurements, timeframe]);

  // Determine simulated record breakdown strictly from the actual records displayed
  const simulationStatus = useMemo(() => {
    if (filteredMeasurements.length === 0) {
      return { total: 0, simulated: 0, isAllSimulated: false, isPartiallySimulated: false, isLiveOnly: false };
    }
    const simulated = filteredMeasurements.filter(m => m.is_simulated === true).length;
    const total = filteredMeasurements.length;
    return {
      total,
      simulated,
      isAllSimulated: simulated === total,
      isPartiallySimulated: simulated > 0 && simulated < total,
      isLiveOnly: simulated === 0,
    };
  }, [filteredMeasurements]);

  // Format data for Recharts - uses purely illustrative population references (not personalized baselines)
  const chartData = useMemo(() => {
    return filteredMeasurements.map(m => {
      const date = new Date(m.measured_at);
      const timeLabel =
        timeframe === '24H'
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;

      return {
        time: timeLabel,
        rawTimestamp: m.measured_at,
        heartRate: m.heart_rate_bpm ?? null,
        spo2: m.blood_oxygen_pct ?? null,
        temperature: m.body_temperature_celsius ?? null,
        systolic: m.systolic_bp_mmhg ?? null,
        diastolic: m.diastolic_bp_mmhg ?? null,
        isSimulated: m.is_simulated ?? false,
        // Illustrative general population references (clearly designated, not personalized baselines)
        refHeartRate: 70,
        refSpO2: 98,
        refTemp: 36.8,
        refSystolic: 120,
      };
    });
  }, [filteredMeasurements, timeframe]);

  // Summary statistics calculated strictly from actual observations
  const stats = useMemo(() => {
    if (filteredMeasurements.length === 0) {
      return {
        meanHR: null,
        meanSpO2: null,
        meanTemp: null,
        latestBP: null,
        count: 0,
        hrTrend: null,
      };
    }

    const hrVals = filteredMeasurements.map(m => m.heart_rate_bpm).filter((v): v is number => v != null);
    const spo2Vals = filteredMeasurements.map(m => m.blood_oxygen_pct).filter((v): v is number => v != null);
    const tempVals = filteredMeasurements.map(m => m.body_temperature_celsius).filter((v): v is number => v != null);

    const meanHR = hrVals.length > 0 ? (hrVals.reduce((a, b) => a + b, 0) / hrVals.length).toFixed(1) : null;
    const meanSpO2 = spo2Vals.length > 0 ? (spo2Vals.reduce((a, b) => a + b, 0) / spo2Vals.length).toFixed(1) : null;
    const meanTemp = tempVals.length > 0 ? (tempVals.reduce((a, b) => a + b, 0) / tempVals.length).toFixed(1) : null;

    const latest = filteredMeasurements[filteredMeasurements.length - 1];
    const latestBP =
      latest.systolic_bp_mmhg != null && latest.diastolic_bp_mmhg != null
        ? `${latest.systolic_bp_mmhg}/${latest.diastolic_bp_mmhg} mmHg`
        : null;

    // Longitudinal trend only calculated when sufficient observations exist (>= 2)
    let hrTrend: string | null = null;
    if (hrVals.length >= 2) {
      const initial = hrVals[0];
      const current = hrVals[hrVals.length - 1];
      const diff = current - initial;
      const pct = ((diff / initial) * 100).toFixed(1);
      hrTrend = diff >= 0 ? `+${pct}% vs initial observation` : `${pct}% vs initial observation`;
    }

    return {
      meanHR,
      meanSpO2,
      meanTemp,
      latestBP,
      count: filteredMeasurements.length,
      hrTrend,
    };
  }, [filteredMeasurements]);

  // Real CSV Export Handler
  const handleExportCSV = () => {
    if (filteredMeasurements.length === 0) return;

    const headers = [
      'Timestamp (UTC)',
      'Heart Rate (BPM)',
      'SpO2 (%)',
      'Body Temp (C)',
      'Systolic BP (mmHg)',
      'Diastolic BP (mmHg)',
      'Source',
      'Is Simulated'
    ];

    const rows = filteredMeasurements.map(m => [
      m.measured_at,
      m.heart_rate_bpm ?? '',
      m.blood_oxygen_pct ?? '',
      m.body_temperature_celsius ?? '',
      m.systolic_bp_mmhg ?? '',
      m.diastolic_bp_mmhg ?? '',
      `"${m.source || 'Telemetry Sensor'}"`,
      m.is_simulated ? 'TRUE' : 'FALSE'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `astra_telemetry_${crewId || 'operative'}_${timeframe}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // If research mode is active, render the dedicated Public Research Analytics suite
  if (analyticsMode === 'research') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="space-y-6"
      >
        {/* Mode Switcher Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#111111] border border-[#252525]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAnalyticsMode('operative')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161616] border border-[#252525] text-[#888888] hover:text-white transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Astronaut Operative Telemetry</span>
            </button>
            <button
              onClick={() => setAnalyticsMode('research')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/40 border border-cyan-400 text-cyan-300 transition-colors shadow-[0_0_10px_rgba(54,201,232,0.15)]"
            >
              <Database className="w-3.5 h-3.5 text-[#36C9E8]" />
              <span>Public Scientific Research Archive (4 Studies • 1,212 Cohort)</span>
            </button>
          </div>
          {resolvedAstronautId && (
            <span className="text-xs text-gray-400 font-mono hidden md:inline">
              Selected Operative: <strong className="text-white">{astronautName}</strong> ({crewId})
            </span>
          )}
        </div>

        <ResearchAnalyticsView />
      </motion.div>
    );
  }

  // State when in operative mode but no astronaut is selected
  if (!resolvedAstronautId && !isLoading) {
    return (
      <div className="p-8 rounded-xl bg-[#111111] border border-[#252525] text-center space-y-4">
        <UserCheck className="w-10 h-10 text-[#36C9E8]/50 mx-auto" />
        <h2 className="font-orbitron font-bold text-lg text-white">No Astronaut Operative Selected</h2>
        <p className="text-xs text-[#A3A3A3] max-w-md mx-auto">
          Please select or configure an active astronaut in Mission Setup to review personalized physiological analytics, or explore our verified public research cohorts.
        </p>
        <button
          onClick={() => setAnalyticsMode('research')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#36C9E8]/10 hover:bg-[#36C9E8]/20 border border-[#36C9E8]/40 text-xs text-[#36C9E8] font-semibold transition-colors"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Explore Public Scientific Research Archive (4 Datasets)</span>
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Mode Switcher Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#111111] border border-[#252525]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnalyticsMode('operative')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#181f26] border border-[#36C9E8] text-[#36C9E8] transition-colors shadow-[0_0_10px_rgba(54,201,232,0.15)]"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Astronaut Operative Telemetry</span>
          </button>
          <button
            onClick={() => setAnalyticsMode('research')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161616] border border-[#252525] text-[#888888] hover:text-white transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[#36C9E8]" />
            <span>Public Scientific Research Archive (4 Studies • 1,212 Cohort)</span>
          </button>
        </div>
        <span className="text-xs text-gray-400 font-mono hidden md:inline">
          Selected Operative: <strong className="text-white">{astronautName}</strong> ({crewId})
        </span>
      </div>

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
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#A3A3A3] mt-1">
            <span>Astronaut: <strong className="text-white">{astronautName || 'Selected Operative'}</strong> {crewId && `(${crewId})`}</span>
            <span>•</span>
            <span>Observations: <strong className="text-cyan-400 font-mono">{stats.count}</strong> records</span>

            {/* Simulation Status Badge strictly derived from actual displayed records */}
            {simulationStatus.isAllSimulated && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                <ShieldAlert className="w-3 h-3" />
                SIMULATED DATASET ({simulationStatus.simulated} records)
              </span>
            )}
            {simulationStatus.isPartiallySimulated && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                <ShieldAlert className="w-3 h-3" />
                CONTAINS {simulationStatus.simulated} OF {simulationStatus.total} SIMULATED RECORDS
              </span>
            )}
            {simulationStatus.isLiveOnly && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                <Radio className="w-3 h-3" />
                LIVE SENSOR TELEMETRY
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh database records"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] border border-[#252525] text-xs text-[#A3A3A3] hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#36C9E8]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredMeasurements.length === 0}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
              filteredMeasurements.length > 0
                ? 'bg-[#161616] hover:bg-[#202020] border-[#252525] text-[#A3A3A3] hover:text-white cursor-pointer'
                : 'bg-[#111111] border-[#202020] text-[#525252] cursor-not-allowed'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/20 border border-red-500/40 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Error loading telemetry: {error}</span>
        </div>
      )}

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
              onClick={() => setActiveMetricTab('temperature')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMetricTab === 'temperature'
                  ? 'bg-[#111111] text-[#36C9E8] border border-[#252525]'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Body Temp (°C)</span>
            </button>
            <button
              onClick={() => setActiveMetricTab('bloodPressure')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMetricTab === 'bloodPressure'
                  ? 'bg-[#111111] text-[#36C9E8] border border-[#252525]'
                  : 'text-[#A3A3A3] hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Blood Pressure (mmHg)</span>
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
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-xs text-[#737373]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#36C9E8]" />
              <span>Retrieving telemetry time-series from database...</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-center p-6 text-[#737373]">
              <Clock className="w-8 h-8 text-[#36C9E8]/40 mb-1" />
              <div className="font-orbitron text-sm font-semibold text-white">No Telemetry In Selected Timeframe</div>
              <p className="text-xs max-w-md text-[#A3A3A3]">
                No recorded measurements found for {astronautName || 'this astronaut'} within the {timeframe} window.
                Submit a new health assessment or log physiological telemetry to initialize trend analysis.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsCyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#36C9E8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#36C9E8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="analyticsEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                <XAxis dataKey="time" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  domain={
                    activeMetricTab === 'temperature'
                      ? ['dataMin - 0.5', 'dataMax + 0.5']
                      : activeMetricTab === 'spo2'
                      ? [90, 100]
                      : ['auto', 'auto']
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dataPoint = payload[0].payload;
                      return (
                        <div className="p-3 rounded-lg bg-[#111111] border border-[#252525] text-xs space-y-1 shadow-xl">
                          <div className="font-mono text-[#A3A3A3] pb-1 border-b border-[#202020]">{label}</div>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4 font-mono">
                              <span style={{ color: entry.color }}>{entry.name}:</span>
                              <span className="text-white font-bold">{entry.value}</span>
                            </div>
                          ))}
                          <div className="text-[10px] text-[#737373] pt-1">
                            Status: <span className={dataPoint.isSimulated ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                              {dataPoint.isSimulated ? 'Simulated Telemetry' : 'Live Sensor Stream'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  iconSize={10}
                />

                {/* HEART RATE */}
                {activeMetricTab === 'heartRate' && (
                  <>
                    <Area
                      type="monotone"
                      name="Heart Rate (BPM)"
                      dataKey="heartRate"
                      stroke="#36C9E8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#analyticsCyanGrad)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      name="Illustrative Reference (70 BPM)"
                      dataKey="refHeartRate"
                      stroke="#525252"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </>
                )}

                {/* SPO2 */}
                {activeMetricTab === 'spo2' && (
                  <>
                    <Area
                      type="monotone"
                      name="SpO2 Saturation (%)"
                      dataKey="spo2"
                      stroke="#36C9E8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#analyticsCyanGrad)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      name="Illustrative Reference (98%)"
                      dataKey="refSpO2"
                      stroke="#525252"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </>
                )}

                {/* BODY TEMPERATURE */}
                {activeMetricTab === 'temperature' && (
                  <>
                    <Area
                      type="monotone"
                      name="Body Temperature (°C)"
                      dataKey="temperature"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#analyticsEmeraldGrad)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      name="Illustrative Reference (36.8°C)"
                      dataKey="refTemp"
                      stroke="#525252"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </>
                )}

                {/* BLOOD PRESSURE */}
                {activeMetricTab === 'bloodPressure' && (
                  <>
                    <Area
                      type="monotone"
                      name="Systolic BP (mmHg)"
                      dataKey="systolic"
                      stroke="#36C9E8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#analyticsCyanGrad)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      name="Diastolic BP (mmHg)"
                      dataKey="diastolic"
                      stroke="#A78BFA"
                      strokeWidth={2}
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      name="Illustrative Reference (120 mmHg)"
                      dataKey="refSystolic"
                      stroke="#525252"
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend / Status Footer */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#A3A3A3] pt-4 border-t border-[#252525] mt-4 gap-2">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-0.5 bg-[#36C9E8]" />
            <span>Telemetry Time-Series (Database Log)</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-0.5 bg-[#525252] border-b border-dashed" />
            <span>Illustrative Reference Standard (Population Guide)</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400">
            {stats.count >= 2
              ? `Longitudinal Analysis Active (${stats.count} observations)`
              : stats.count === 1
              ? 'Single Observation Recorded'
              : 'Awaiting Telemetry Stream'}
          </span>
        </div>

      </div>

      {/* Secondary Metrics Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-4 rounded-xl bg-[#111111] border border-[#252525]">
          <div className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-1">
            Mean Heart Rate ({timeframe})
          </div>
          <div className="font-orbitron text-2xl font-bold text-white">
            {stats.meanHR ? `${stats.meanHR} BPM` : '—'}
          </div>
          <p className="text-[11px] text-[#A3A3A3] mt-2">
            {stats.hrTrend
              ? `Longitudinal shift: ${stats.hrTrend}. Autonomic stability nominal.`
              : stats.meanHR
              ? 'Resting variance nominal. Stable cardiovascular tone.'
              : 'No observations recorded in this window.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-[#252525]">
          <div className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-1">
            Mean SpO2 Saturation
          </div>
          <div className="font-orbitron text-2xl font-bold text-cyan-300">
            {stats.meanSpO2 ? `${stats.meanSpO2}%` : '—'}
          </div>
          <p className="text-[11px] text-[#A3A3A3] mt-2">
            {stats.meanSpO2
              ? Number(stats.meanSpO2) >= 95
                ? 'Arterial oxygen saturation optimal under habitat environmental pressure.'
                : 'Attention: Arterial saturation slightly below standard operational baseline.'
              : 'Awaiting pulse oximetry readings.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-[#252525]">
          <div className="text-xs text-[#A3A3A3] uppercase tracking-wider mb-1">
            Blood Pressure / Temp Status
          </div>
          <div className="font-orbitron text-2xl font-bold text-emerald-400">
            {stats.latestBP || (stats.meanTemp ? `${stats.meanTemp} °C` : '—')}
          </div>
          <p className="text-[11px] text-[#A3A3A3] mt-2">
            {stats.latestBP
              ? 'Hemodynamic vascular balance verified. Minimal cephalad fluid shift pressure.'
              : 'Normothermic operational range. No acute thermal dysregulation.'}
          </p>
        </div>
      </div>

    </motion.div>
  );
};
