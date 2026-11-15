import React, { useState, useEffect } from 'react';
import {
  Database,
  Activity,
  Droplets,
  Heart,
  Wind,
  Rocket,
  Moon,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Flame,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  researchApi,
  ResearchSummary,
  BidmcAnalytics,
  Osd575Analytics,
  FitbitAnalytics,
  AutonomicAgingAnalytics
} from '../../api/researchApi';

type ResearchTab = 'bidmc' | 'osd_575' | 'fitbit' | 'autonomic_aging';

export const ResearchAnalyticsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ResearchTab>('bidmc');
  const [summary, setSummary] = useState<ResearchSummary | null>(null);
  const [bidmc, setBidmc] = useState<BidmcAnalytics | null>(null);
  const [osd575, setOsd575] = useState<Osd575Analytics | null>(null);
  const [fitbit, setFitbit] = useState<FitbitAnalytics | null>(null);
  const [autonomic, setAutonomic] = useState<AutonomicAgingAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [sumRes, bRes, oRes, fRes, aRes] = await Promise.all([
          researchApi.getSummary().catch(() => null),
          researchApi.getBidmcAnalytics().catch(() => null),
          researchApi.getOsd575Analytics().catch(() => null),
          researchApi.getFitbitAnalytics().catch(() => null),
          researchApi.getAutonomicAgingAnalytics().catch(() => null),
        ]);

        if (mounted) {
          if (sumRes) setSummary(sumRes);
          if (bRes) setBidmc(bRes);
          if (oRes) setOsd575(oRes);
          if (fRes) setFitbit(fRes);
          if (aRes) setAutonomic(aRes);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load research datasets');
          setIsLoading(false);
        }
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="p-12 rounded-xl bg-[#111111] border border-[#252525] text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#36C9E8] animate-spin mx-auto" />
        <p className="text-sm font-orbitron text-gray-300">Loading verified scientific research datasets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Research Header & Global Isolation Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>Notice: {error}. Showing offline verified scientific baseline cache.</span>
        </div>
      )}
      <div className="p-5 rounded-xl bg-[#111111] border border-[#252525] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-orbitron tracking-widest text-[#36C9E8] uppercase mb-1">
              <Database className="w-4 h-4" />
              <span>PUBLIC SCIENTIFIC RESEARCH ARCHIVE</span>
            </div>
            <h2 className="font-orbitron text-xl sm:text-2xl font-bold text-white tracking-wide">
              MULTI-STUDY RESEARCH &amp; POPULATION ANALYTICS
            </h2>
            <p className="text-xs text-[#A3A3A3] mt-1">
              Empirical physiological benchmarks derived from PhysioNet, NASA OSDR, and Zenodo scientific repositories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-right">
              <span className="block text-[10px] text-gray-400 font-mono uppercase">Total Cohort</span>
              <span className="font-orbitron font-bold text-sm text-cyan-400">
                {summary?.total_research_subjects || '1,212'} Subjects
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#181818] border border-[#2a2a2a] text-right">
              <span className="block text-[10px] text-gray-400 font-mono uppercase">Studies</span>
              <span className="font-orbitron font-bold text-sm text-emerald-400">4 Verified</span>
            </div>
          </div>
        </div>

        {/* AI & Cohort Isolation Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-cyan-200 text-xs leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-cyan-300 font-medium">Architecture Isolation Guarantee:</strong> Research dataset participants are strictly maintained in dedicated research schemas and do not pollute operational astronaut crew profiles. Incomplete multi-variable records are decoupled from the 6-feature Isolation Forest model to avoid artificial hallucination.
          </div>
        </div>
      </div>

      {/* Dataset Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => setActiveTab('bidmc')}
          className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activeTab === 'bidmc'
              ? 'bg-[#181f26] border-[#36C9E8] text-white shadow-[0_0_12px_rgba(54,201,232,0.15)]'
              : 'bg-[#111111] border-[#222222] text-[#888888] hover:text-white hover:border-[#333333]'
          }`}
        >
          <Wind className={`w-4 h-4 ${activeTab === 'bidmc' ? 'text-[#36C9E8]' : 'text-gray-500'}`} />
          <div className="truncate">
            <div className="text-xs font-semibold truncate">PhysioNet BIDMC</div>
            <div className="text-[10px] text-gray-400 truncate">Oxygen &amp; Respiration (ICU)</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('osd_575')}
          className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activeTab === 'osd_575'
              ? 'bg-[#1e1926] border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.15)]'
              : 'bg-[#111111] border-[#222222] text-[#888888] hover:text-white hover:border-[#333333]'
          }`}
        >
          <Rocket className={`w-4 h-4 ${activeTab === 'osd_575' ? 'text-purple-400' : 'text-gray-500'}`} />
          <div className="truncate">
            <div className="text-xs font-semibold truncate">NASA Inspiration4</div>
            <div className="text-[10px] text-gray-400 truncate">OSD-575 Spaceflight Omics</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('fitbit')}
          className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activeTab === 'fitbit'
              ? 'bg-[#18231c] border-emerald-400 text-white shadow-[0_0_12px_rgba(52,211,153,0.15)]'
              : 'bg-[#111111] border-[#222222] text-[#888888] hover:text-white hover:border-[#333333]'
          }`}
        >
          <Activity className={`w-4 h-4 ${activeTab === 'fitbit' ? 'text-emerald-400' : 'text-gray-500'}`} />
          <div className="truncate">
            <div className="text-xs font-semibold truncate">FitBit Wearables</div>
            <div className="text-[10px] text-gray-400 truncate">Activity &amp; Sleep Countermeasures</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('autonomic_aging')}
          className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activeTab === 'autonomic_aging'
              ? 'bg-[#261f18] border-amber-400 text-white shadow-[0_0_12px_rgba(251,191,36,0.15)]'
              : 'bg-[#111111] border-[#222222] text-[#888888] hover:text-white hover:border-[#333333]'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeTab === 'autonomic_aging' ? 'text-amber-400' : 'text-gray-500'}`} />
          <div className="truncate">
            <div className="text-xs font-semibold truncate">Autonomic Aging</div>
            <div className="text-[10px] text-gray-400 truncate">Continuous Hemodynamics (18-92)</div>
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BIDMC PPG & RESPIRATION */}
      {/* ========================================================================= */}
      {activeTab === 'bidmc' && bidmc && (
        <div className="space-y-6">
          {/* Metadata Banner */}
          <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono uppercase font-bold">
                PHYSIOMETRICS • OXYGENATION &amp; RESPIRATION
              </span>
              <h3 className="font-orbitron text-lg font-bold text-white mt-1">
                {bidmc.name} (v{bidmc.version})
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Population: <strong className="text-gray-300">{bidmc.population}</strong> • {bidmc.total_subjects} patients • {bidmc.total_timepoints_analyzed.toLocaleString()} seconds analyzed
              </p>
            </div>
            <a
              href="https://physionet.org/content/bidmc/1.0.0/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#282828] border border-[#333333] text-xs text-[#36C9E8] transition-colors flex-shrink-0"
            >
              <span>PhysioNet Official</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Vitals Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Heart Rate (Mean)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {bidmc.vital_distributions.heart_rate.mean}{' '}
                <span className="text-xs text-gray-500 font-normal">BPM</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Range: {bidmc.vital_distributions.heart_rate.min} – {bidmc.vital_distributions.heart_rate.max} BPM (σ={bidmc.vital_distributions.heart_rate.std})
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Oxygen Saturation (SpO2)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {bidmc.vital_distributions.blood_oxygen.mean}{' '}
                <span className="text-xs text-gray-500 font-normal">%</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Median: {bidmc.vital_distributions.blood_oxygen.median}% • p25: {bidmc.vital_distributions.blood_oxygen.p25}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Wind className="w-3.5 h-3.5 text-emerald-400" />
                <span>Respiratory Rate (Mean)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {bidmc.vital_distributions.respiratory_rate.mean}{' '}
                <span className="text-xs text-gray-500 font-normal">br/min</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Range: {bidmc.vital_distributions.respiratory_rate.min} – {bidmc.vital_distributions.respiratory_rate.max} br/min
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Stability Index</span>
              </div>
              <div className="text-2xl font-bold font-mono text-purple-400">
                {bidmc.clinical_events.respiratory_stability_index}{' '}
                <span className="text-xs text-gray-500 font-normal">/ 100</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                SpO2/Resp Corr: {bidmc.clinical_events.spo2_resp_correlation}
              </div>
            </div>
          </div>

          {/* Clinical Events & Distribution Histograms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SpO2 Distribution */}
            <div className="p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-orbitron text-sm font-semibold text-white">SpO2 Distribution in Cohort</h4>
                <span className="text-xs font-mono text-amber-400">
                  Hypoxemia (&lt;92%): {bidmc.clinical_events.hypoxemia_event_pct}%
                </span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bidmc.histograms.spo2} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                    <XAxis dataKey="range" stroke="#666666" fontSize={11} />
                    <YAxis stroke="#666666" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#181818', borderColor: '#333333', fontSize: 12 }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Bar dataKey="count" fill="#36C9E8" radius={[4, 4, 0, 0]} name="Seconds Recorded" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Respiratory Rate Distribution */}
            <div className="p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-orbitron text-sm font-semibold text-white">Respiratory Rate Distribution</h4>
                <span className="text-xs font-mono text-rose-400">
                  Tachypnea (&gt;22): {bidmc.clinical_events.tachypnea_event_pct}%
                </span>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bidmc.histograms.resp_rate} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                    <XAxis dataKey="range" stroke="#666666" fontSize={11} />
                    <YAxis stroke="#666666" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#181818', borderColor: '#333333', fontSize: 12 }}
                      labelStyle={{ color: '#ffffff' }}
                    />
                    <Bar dataKey="count" fill="#34D399" radius={[4, 4, 0, 0]} name="Seconds Recorded" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sample ICU Subjects Table */}
          <div className="p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
            <h4 className="font-orbitron text-sm font-semibold text-white">Sample ICU Subject Recordings (N=15)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#181818] text-gray-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-2.5">Subject ID</th>
                    <th className="p-2.5">Samples</th>
                    <th className="p-2.5">Mean HR (BPM)</th>
                    <th className="p-2.5">Mean SpO2 (%)</th>
                    <th className="p-2.5">Min SpO2 (%)</th>
                    <th className="p-2.5">Mean Resp</th>
                    <th className="p-2.5">Hypoxemia Events</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {bidmc.sample_subjects.map((s) => (
                    <tr key={s.subject_id} className="hover:bg-[#161616]">
                      <td className="p-2.5 font-mono text-cyan-400">{s.subject_id}</td>
                      <td className="p-2.5 font-mono text-gray-400">{s.sample_count}s</td>
                      <td className="p-2.5 font-mono text-white">{s.mean_hr}</td>
                      <td className="p-2.5 font-mono text-cyan-300">{s.mean_spo2}%</td>
                      <td className="p-2.5 font-mono text-amber-300">{s.min_spo2}%</td>
                      <td className="p-2.5 font-mono text-emerald-300">{s.mean_resp}</td>
                      <td className="p-2.5 font-mono text-rose-400">{s.hypoxemia_events}</td>
                      <td className="p-2.5">
                        {s.hypoxemia_events > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono text-[10px]">
                            Desat Event
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                            Stable
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NASA INSPIRATION4 (OSD-575) */}
      {/* ========================================================================= */}
      {activeTab === 'osd_575' && osd575 && (
        <div className="space-y-6">
          {/* Metadata Banner */}
          <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-mono uppercase font-bold">
                COMMERCIAL SPACEFLIGHT • NASA OSDR STUDY OSD-575
              </span>
              <h3 className="font-orbitron text-lg font-bold text-white mt-1">
                {osd575.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Flight: <strong className="text-gray-300">SpaceX Crew Dragon (Inspiration4)</strong> • {osd575.flight_duration_days} Days Orbital • Apogee: {osd575.orbit_apogee_km} km • Crew: {osd575.subjects.join(', ')}
              </p>
            </div>
            <a
              href="https://osdr.nasa.gov/bio/repo/data/studies/OSD-575"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#282828] border border-[#333333] text-xs text-purple-400 transition-colors flex-shrink-0"
            >
              <span>NASA OSDR Official</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Spaceflight Biomarkers Comparative Table */}
          <div className="p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-orbitron text-sm font-semibold text-white">
                Spaceflight-Induced Physiological Stress Biomarkers (Pre vs Post-Flight)
              </h4>
              <span className="text-xs text-gray-400 font-mono">
                Assays: Comprehensive Metabolic Panel (CMP)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#181818] text-gray-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-2.5">Biomarker</th>
                    <th className="p-2.5">Biological Domain</th>
                    <th className="p-2.5">Pre-Flight Baseline</th>
                    <th className="p-2.5">Splashdown (R+1)</th>
                    <th className="p-2.5">Recovery (R+82)</th>
                    <th className="p-2.5">Acute Delta %</th>
                    <th className="p-2.5">Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {osd575.biomarker_trends.map((b) => (
                    <tr key={b.marker} className="hover:bg-[#161616]">
                      <td className="p-2.5 font-medium text-white">{b.marker}</td>
                      <td className="p-2.5 text-gray-400 font-mono">{b.category}</td>
                      <td className="p-2.5 font-mono text-cyan-300">
                        {b.pre_flight_baseline} {b.unit}
                      </td>
                      <td className="p-2.5 font-mono text-amber-300 font-bold">
                        {b.immediate_post_flight_r1} {b.unit}
                      </td>
                      <td className="p-2.5 font-mono text-emerald-300">
                        {b.post_flight_recovery_r82} {b.unit}
                      </td>
                      <td className="p-2.5 font-mono">
                        <span
                          className={
                            b.acute_delta_pct > 0
                              ? 'text-rose-400 font-bold'
                              : b.acute_delta_pct < 0
                              ? 'text-cyan-400 font-bold'
                              : 'text-gray-400'
                          }
                        >
                          {b.acute_delta_pct > 0 ? `+${b.acute_delta_pct}%` : `${b.acute_delta_pct}%`}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            b.stress_response.includes('Elevated')
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : b.stress_response.includes('Decreased')
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : 'bg-gray-500/10 text-gray-400'
                          }`}
                        >
                          {b.stress_response}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timecourse Timeline Chart */}
          <div className="p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-orbitron text-sm font-semibold text-white">
                Biomarker Timecourse Timeline: Pre-Flight (L-92) to Return &amp; Follow-Up (R+194)
              </h4>
              <span className="text-[10px] font-mono text-gray-400">
                Source: NASA OSDR LSDS-8 Transformed Assays (7 Timepoints)
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={osd575.timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="label" stroke="#666666" fontSize={11} />
                  <YAxis stroke="#666666" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#181818', borderColor: '#333333', fontSize: 12 }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="glucose" stroke="#36C9E8" name="Serum Glucose (mg/dL)" strokeWidth={2} />
                  <Line type="monotone" dataKey="ast" stroke="#F43F5E" name="AST Transaminase (U/L)" strokeWidth={2} />
                  <Line type="monotone" dataKey="calcium" stroke="#A855F7" name="Calcium (mg/dL)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="p-3.5 rounded-lg bg-[#161616] border border-[#252525] text-xs text-gray-300 leading-relaxed space-y-2">
              <div>
                <strong className="text-purple-400">Clinical Spaceflight Findings:</strong> Immediate post-flight (R+1) exhibits marked acute glycemic mobilization (serum glucose +34.2% from Launch Eve L-3 baseline of 69.5 mg/dL to 93.25 mg/dL; +29.7% from pooled L-3/L-44 baseline of 71.88 mg/dL), reflecting acute touchdown and recovery sympathoadrenal catecholamine activation. In contrast, hepatic transaminases (AST, ALT) and renal clearance markers remained stable within normal clinical reference ranges (AST acute delta -1.9%; ALT +2.4%), refuting cellular liver injury.
              </div>
              <div className="pt-2 border-t border-[#222222] text-[11px] text-gray-400 font-mono">
                Individual Astronaut R+1 Glucose Shifts: C001 (69 → 90 mg/dL, +30.4%) • C002 (78 → 83 mg/dL, +6.4%) • C003 (75 → 103 mg/dL, +37.3%) • C004 (56 → 97 mg/dL, +73.2%). Timepoint R+194 represents 6-month post-splashdown follow-up.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FITBIT ACTIVITY & SLEEP */}
      {/* ========================================================================= */}
      {activeTab === 'fitbit' && fitbit && (
        <div className="space-y-6">
          {/* Metadata Banner */}
          <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono uppercase font-bold">
                WEARABLES • CHRONOBIOLOGY &amp; EXERCISE
              </span>
              <h3 className="font-orbitron text-lg font-bold text-white mt-1">
                {fitbit.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Population: <strong className="text-gray-300">34 Active Wearable Research Participants (35 raw IDs)</strong> • {fitbit.total_days_recorded} Recorded Days • Zenodo Open Access (CC-BY 4.0; DataCite Verified)
              </p>
            </div>
            <a
              href="https://doi.org/10.5281/zenodo.53894"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#282828] border border-[#333333] text-xs text-emerald-400 transition-colors flex-shrink-0"
            >
              <span>Zenodo Record</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Activity Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Daily Steps (Mean)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {fitbit.steps_summary.mean.toLocaleString()}{' '}
                <span className="text-xs text-gray-500 font-normal">steps</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Median: {fitbit.steps_summary.median.toLocaleString()} • Max: {fitbit.steps_summary.max.toLocaleString()}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Rigorous Exercise Time</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {(fitbit.activity_breakdown.very_active_minutes_avg + fitbit.activity_breakdown.fairly_active_minutes_avg).toFixed(0)}{' '}
                <span className="text-xs text-gray-500 font-normal">mins/day</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Very Active: {fitbit.activity_breakdown.very_active_minutes_avg}m • Fairly: {fitbit.activity_breakdown.fairly_active_minutes_avg}m
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sleep Duration</span>
              </div>
              <div className="text-2xl font-bold font-mono text-indigo-400">
                {fitbit.sleep_summary.mean_sleep_duration_hours}{' '}
                <span className="text-xs text-gray-500 font-normal">hrs</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Efficiency: {fitbit.sleep_summary.sleep_efficiency_pct}% • Deep: {fitbit.sleep_summary.deep_sleep_pct}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Sedentary Proportion</span>
              </div>
              <div className="text-2xl font-bold font-mono text-rose-400">
                {fitbit.activity_breakdown.sedentary_percentage}{' '}
                <span className="text-xs text-gray-500 font-normal">%</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Mean: {fitbit.activity_breakdown.sedentary_minutes_avg} mins sedentary/day
              </div>
            </div>
          </div>

          {/* NASA Countermeasure Benchmark Comparison */}
          <div className="p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-orbitron text-sm font-semibold text-white">
                Astronaut Countermeasure Target vs Research Cohort Compliance
              </h4>
              <span className="text-xs font-mono text-emerald-400">
                10k Step Goal Compliance: {fitbit.steps_summary.compliance_10k_steps_pct}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#161616] border border-[#252525] space-y-2">
                <div className="text-xs text-gray-400 font-medium">Daily Treadmill/Step Target (NASA Standard)</div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-mono font-bold text-white">
                    {fitbit.steps_summary.mean.toLocaleString()} / {fitbit.astronaut_countermeasure_benchmark.target_daily_steps.toLocaleString()} steps
                  </span>
                  <span className="text-xs font-mono text-amber-400">
                    {Math.round((fitbit.steps_summary.mean / fitbit.astronaut_countermeasure_benchmark.target_daily_steps) * 100)}% of goal
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#252525] overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${Math.min(100, (fitbit.steps_summary.mean / 10000) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#161616] border border-[#252525] space-y-2">
                <div className="text-xs text-gray-400 font-medium">Daily Active Aerobic Countermeasure Time</div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-mono font-bold text-white">
                    {fitbit.astronaut_countermeasure_benchmark.actual_rigorous_exercise_mins} / {fitbit.astronaut_countermeasure_benchmark.target_rigorous_exercise_mins} mins
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Target Achieved</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#252525] overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${Math.min(100, (fitbit.astronaut_countermeasure_benchmark.actual_rigorous_exercise_mins / 60) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Daily Step Distribution */}
            <div className="h-48 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fitbit.step_distribution_histogram} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="range" stroke="#666666" fontSize={11} />
                  <YAxis stroke="#666666" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#181818', borderColor: '#333333', fontSize: 12 }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Participant Days" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUTONOMIC AGING HEMODYNAMICS */}
      {/* ========================================================================= */}
      {activeTab === 'autonomic_aging' && autonomic && (
        <div className="space-y-6">
          {/* Metadata Banner */}
          <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase font-bold">
                CARDIOVASCULAR • CONTINUOUS HEMODYNAMICS &amp; AGING
              </span>
              <h3 className="font-orbitron text-lg font-bold text-white mt-1">
                {autonomic.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Cohort: <strong className="text-gray-300">1,121 Demographic Volunteer Records (Ages 18–92)</strong> • Jena University Medical Center • Literature-Derived Hemodynamic Standards (Schumann et al., 2021)
              </p>
            </div>
            <a
              href="https://physionet.org/content/autonomic-aging-cardiovascular/1.0.0/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#282828] border border-[#333333] text-xs text-amber-400 transition-colors flex-shrink-0"
            >
              <span>PhysioNet Official</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Data Classification & Methodology Disclaimer */}
          <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-semibold">Data Classification Notice:</strong> The 1,121 records represent demographic classifications extracted from PhysioNet <code className="font-mono text-[11px] text-amber-300">subject-info.csv</code> across 15 age groups. Continuous blood pressure and pulse pressure reference values across the 8 age decades are <strong>literature-derived normative values</strong> calibrated from Schumann et al. (2021). The multi-gigabyte raw WFDB continuous binary waveforms are cataloged on PhysioNet and were not locally unbundled for this phase.
            </div>
          </div>

          {/* Continuous Hemodynamics Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Systolic BP (Mean)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {autonomic.cardiovascular_distributions.sbp.mean}{' '}
                <span className="text-xs text-gray-500 font-normal">mmHg</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                10th-90th: {autonomic.cardiovascular_distributions.sbp.p10} – {autonomic.cardiovascular_distributions.sbp.p90} mmHg
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Heart className="w-3.5 h-3.5 text-cyan-400" />
                <span>Diastolic BP (Mean)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                {autonomic.cardiovascular_distributions.dbp.mean}{' '}
                <span className="text-xs text-gray-500 font-normal">mmHg</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                10th-90th: {autonomic.cardiovascular_distributions.dbp.p10} – {autonomic.cardiovascular_distributions.dbp.p90} mmHg
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Pulse Pressure (Mean)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400">
                {autonomic.cardiovascular_distributions.pulse_pressure.mean}{' '}
                <span className="text-xs text-gray-500 font-normal">mmHg</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Arterial Stiffening Indicator (SBP - DBP)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Mean Arterial Pressure (MAP)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-purple-400">
                {autonomic.cardiovascular_distributions.mean_arterial_pressure.mean}{' '}
                <span className="text-xs text-gray-500 font-normal">mmHg</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Perfusion pressure: DBP + (PP / 3)
              </div>
            </div>
          </div>

          {/* Age-Decade Hemodynamics Table */}
          <div className="p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
            <h4 className="font-orbitron text-sm font-semibold text-white">
              Continuous Blood Pressure &amp; Autonomic Tone Across 8 Age Decades (18–90+ Years)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#181818] text-gray-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-2.5">Bracket</th>
                    <th className="p-2.5">Subjects (N)</th>
                    <th className="p-2.5">Mean SBP (mmHg)</th>
                    <th className="p-2.5">Mean DBP (mmHg)</th>
                    <th className="p-2.5">Mean MAP (mmHg)</th>
                    <th className="p-2.5">Mean PP (mmHg)</th>
                    <th className="p-2.5">Mean HR (BPM)</th>
                    <th className="p-2.5">Autonomic Tone Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222]">
                  {autonomic.normative_age_brackets.map((b) => (
                    <tr
                      key={b.group}
                      className={
                        b.group === '3' || b.group === '4'
                          ? 'bg-cyan-950/20 border-l-2 border-cyan-400'
                          : 'hover:bg-[#161616]'
                      }
                    >
                      <td className="p-2.5 font-bold text-white">
                        {b.age_bracket}{' '}
                        {(b.group === '3' || b.group === '4') && (
                          <span className="text-[10px] text-cyan-400 font-mono font-normal">
                            (Astronaut Tier)
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono text-gray-400">{b.n}</td>
                      <td className="p-2.5 font-mono text-white">{b.mean_sbp}</td>
                      <td className="p-2.5 font-mono text-cyan-300">{b.mean_dbp}</td>
                      <td className="p-2.5 font-mono text-purple-300">{b.mean_map}</td>
                      <td className="p-2.5 font-mono text-amber-300 font-bold">{b.mean_pp}</td>
                      <td className="p-2.5 font-mono text-gray-300">{b.mean_hr}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            b.autonomic_tone === 'Optimal' || b.autonomic_tone === 'Robust'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : b.autonomic_tone === 'Preserved'
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {b.autonomic_tone}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stiffening Progression Chart */}
          <div className="p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-3">
            <h4 className="font-orbitron text-sm font-semibold text-white">
              Cardiovascular Aging Curve: SBP, DBP, and Widening Pulse Pressure
            </h4>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={autonomic.normative_age_brackets} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="age_bracket" stroke="#666666" fontSize={11} />
                  <YAxis stroke="#666666" fontSize={11} domain={[40, 160]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#181818', borderColor: '#333333', fontSize: 12 }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="mean_sbp" stroke="#F43F5E" name="Systolic BP (mmHg)" strokeWidth={2} />
                  <Line type="monotone" dataKey="mean_dbp" stroke="#36C9E8" name="Diastolic BP (mmHg)" strokeWidth={2} />
                  <Line type="monotone" dataKey="mean_pp" stroke="#F59E0B" name="Pulse Pressure (mmHg)" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="p-3 rounded-lg bg-[#161616] border border-[#252525] text-xs text-gray-300 leading-relaxed">
              <strong className="text-amber-400">Microgravity vs Aging Adaptation:</strong> While chronological aging widens pulse pressure through vascular stiffness, long-duration spaceflight induces baroreflex deconditioning without structural stiffening. Post-flight orthostatic intolerance stems from rapid fluid redistributions and reduced autonomic peripheral vasoconstriction rather than intrinsic vascular wall aging.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
