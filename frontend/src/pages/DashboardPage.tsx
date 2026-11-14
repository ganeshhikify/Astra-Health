import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Orbit,
  LayoutDashboard,
  Cpu,
  LineChart as LineChartIcon,
  Sparkles,
  CalendarCheck,
  FileText,
  Bell,
  Search,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  X,
  Menu,
  ArrowLeft,
  TrendingUp
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DashboardStarfield } from '../components/DashboardStarfield';

interface DashboardPageProps {
  onBackToLanding: () => void;
  onNavigateToSetup: () => void;
}

// Nav items
type NavItem = 'overview' | 'body-explorer' | 'ai-insights' | 'analytics' | 'wellness' | 'reports';

// Timeframe
type Timeframe = '24H' | '7D' | '30D';

// Metric Tab
type MetricTab = 'heartRate' | 'spo2' | 'sleep' | 'activity';

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onBackToLanding,
  onNavigateToSetup
}) => {
  // Navigation state
  const [activeNav, setActiveNav] = useState<NavItem>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Timeframe filter state
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [activeMetricTab, setActiveMetricTab] = useState<MetricTab>('heartRate');

  // Interactive AI Insights Modal
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  // Non-overview placeholder modal
  const [activePlaceholder, setActivePlaceholder] = useState<string | null>(null);

  // Load Mission Setup Profile from localStorage (with realistic fallback)
  const [profile] = useState(() => {
    try {
      const saved = localStorage.getItem('astra_mission_setup_draft');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return {
      astronautName: 'Cmdr. Sarah Vance',
      crewId: 'AST-7824',
      astronautRole: 'Mission Commander',
      missionName: 'Astra Artemis VII',
      destination: 'MOON',
      missionDuration: '180 Days',
      launchDate: '2027-04-12',
      missionEnvironment: 'Low Gravity • Lunar Regolith • Extreme Thermal Fluctuations'
    };
  });

  // Recharts Data generator based on timeframe and metric
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
        { time: '14:00', heartRate: 122, spo2: 97, sleep: 0, activity: 120, baseline: 70 }, // Exercise
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

  // Donut data for daily wellness breakdown
  const wellnessDonut = [
    { name: 'Deep Rest', value: 38.6, color: '#36C9E8' },
    { name: 'Moderate Load', value: 30.8, color: '#A3A3A3' },
    { name: 'Active Exercise', value: 30.6, color: '#FFFFFF' },
  ];

  // Bar chart data for work / exercise distribution
  const activityDistribution = [
    { label: 'EVA Prep', hours: 4.5, fill: '#36C9E8' },
    { label: 'ARED Lift', hours: 1.5, fill: '#FFFFFF' },
    { label: 'T2 Treadmill', hours: 1.0, fill: '#A3A3A3' },
    { label: 'Habitat Ops', hours: 6.0, fill: '#252525' },
    { label: 'Sleep/Rest', hours: 7.4, fill: '#1F2937' },
  ];

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item);
    if (item !== 'overview') {
      const titles: Record<NavItem, string> = {
        overview: 'Overview',
        'body-explorer': '3D Body Explorer',
        'ai-insights': 'AI Health Insights',
        analytics: 'Health Analytics',
        wellness: 'Daily Wellness',
        reports: 'Health Reports'
      };
      setActivePlaceholder(titles[item]);
    } else {
      setActivePlaceholder(null);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] antialiased selection:bg-[#36C9E8] selection:text-black relative overflow-x-hidden font-space">
      
      {/* Subtle Sparse Starfield Background */}
      <DashboardStarfield />

      {/* Top Mobile Navbar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-[#252525] relative z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg border border-[#252525] bg-[#111111] text-[#A3A3A3] hover:text-white"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Orbit className="w-4 h-4 text-[#36C9E8]" />
            <span className="font-orbitron font-bold text-xs tracking-wider">ASTRA HEALTH</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className="relative p-1.5 rounded-lg border border-[#252525] bg-[#111111] text-[#A3A3A3]"
            title="Toggle Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#36C9E8]" />
          </button>
        </div>
      </div>

      <div className="flex min-h-screen relative z-10">
        
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR                                                              */}
        {/* ========================================================================= */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0A0A0A] border-r border-[#252525] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div>
            {/* Sidebar Branding Header */}
            <div className="p-5 border-b border-[#252525] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-7 h-7 rounded-full border border-[#36C9E8]/40 bg-[#111111]">
                  <Orbit className="w-3.5 h-3.5 text-[#36C9E8] animate-spin" style={{ animationDuration: '32s' }} />
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-[#36C9E8]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-orbitron font-bold text-sm tracking-[0.2em] text-white">
                    ASTRA<span className="text-[#36C9E8]">HEALTH</span>
                  </span>
                  <span className="text-[9px] tracking-widest text-[#A3A3A3] uppercase">
                    Orbital Medical Telemetry
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-[#A3A3A3] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Astronaut Quick Profile Card in Sidebar (Matching Reference Top User) */}
            <div className="p-4 mx-3 my-3 rounded-lg bg-[#111111] border border-[#252525]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#161616] border border-[#36C9E8]/30 flex items-center justify-center text-[#36C9E8] font-orbitron font-bold text-xs shrink-0">
                  {profile.astronautName?.slice(0, 2).toUpperCase() || 'SV'}
                </div>
                <div className="overflow-hidden">
                  <div className="font-semibold text-xs text-white truncate" title={profile.astronautName}>
                    {profile.astronautName}
                  </div>
                  <div className="text-[10px] text-[#A3A3A3] truncate">
                    {profile.astronautRole}
                  </div>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#252525] flex items-center justify-between text-[10px]">
                <span className="text-[#A3A3A3]">ID: {profile.crewId}</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Telemetry Active
                </span>
              </div>
            </div>

            {/* Navigation Section */}
            <nav className="px-3 py-2 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-orbitron font-semibold tracking-wider text-[#A3A3A3] uppercase">
                Dashboards
              </div>

              {/* 1. Overview (Active) */}
              <button
                onClick={() => handleNavClick('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'overview'
                    ? 'bg-[#161616] text-[#36C9E8] border border-[#36C9E8]/40 shadow-sm'
                    : 'text-[#A3A3A3] hover:bg-[#111111] hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Overview</span>
                {activeNav === 'overview' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#36C9E8]" />
                )}
              </button>

              {/* 2. 3D Body Explorer */}
              <button
                onClick={() => handleNavClick('body-explorer')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'body-explorer'
                    ? 'bg-[#161616] text-[#36C9E8] border border-[#36C9E8]/40'
                    : 'text-[#A3A3A3] hover:bg-[#111111] hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>3D Body Explorer</span>
              </button>

              {/* 3. AI Health Insights */}
              <button
                onClick={() => handleNavClick('ai-insights')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'ai-insights'
                    ? 'bg-[#161616] text-[#36C9E8] border border-[#36C9E8]/40'
                    : 'text-[#A3A3A3] hover:bg-[#111111] hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>AI Health Insights</span>
              </button>

              <div className="pt-3 px-3 py-1.5 text-[10px] font-orbitron font-semibold tracking-wider text-[#A3A3A3] uppercase">
                Analytics & Care
              </div>

              {/* 4. Health Analytics */}
              <button
                onClick={() => handleNavClick('analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'analytics'
                    ? 'bg-[#161616] text-[#36C9E8] border border-[#36C9E8]/40'
                    : 'text-[#A3A3A3] hover:bg-[#111111] hover:text-white'
                }`}
              >
                <LineChartIcon className="w-4 h-4 shrink-0" />
                <span>Health Analytics</span>
              </button>

              {/* 5. Daily Wellness */}
              <button
                onClick={() => handleNavClick('wellness')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'wellness'
                    ? 'bg-[#161616] text-[#36C9E8] border border-[#36C9E8]/40'
                    : 'text-[#A3A3A3] hover:bg-[#111111] hover:text-white'
                }`}
              >
                <CalendarCheck className="w-4 h-4 shrink-0" />
                <span>Daily Wellness</span>
              </button>

              {/* 6. Health Reports */}
              <button
                onClick={() => handleNavClick('reports')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  activeNav === 'reports'
                    ? 'bg-[#161616] text-[#36C9E8] border border-[#36C9E8]/40'
                    : 'text-[#A3A3A3] hover:bg-[#111111] hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Health Reports</span>
              </button>
            </nav>
          </div>

          {/* Bottom Sidebar Footer */}
          <div className="p-4 border-t border-[#252525] space-y-2">
            <button
              onClick={onNavigateToSetup}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#111111] hover:bg-[#161616] border border-[#252525] text-xs text-[#A3A3A3] hover:text-white transition-colors"
            >
              <span>Edit Mission Setup</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onBackToLanding}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A3A3A3] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Landing</span>
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN DASHBOARD CONTENT AREA                                               */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* TOP HEADER (Matching Reference Top Bar) */}
          <header className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-[#252525] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            
            {/* Breadcrumb Navigation & Mission Destination */}
            <div className="flex items-center gap-2 text-xs overflow-hidden">
              <span className="text-[#A3A3A3] hidden sm:inline">Dashboards</span>
              <span className="text-[#252525] hidden sm:inline">/</span>
              <span className="font-semibold text-white truncate">
                {profile.missionName}
              </span>
              <span className="text-[#252525]">/</span>
              <span className="px-2 py-0.5 rounded bg-[#161616] border border-[#252525] text-[10px] text-[#36C9E8] font-mono shrink-0">
                {profile.destination}
              </span>
            </div>

            {/* Middle/Right Quick Search & Telemetry Bar */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Search Box (Aerospace command style from reference) */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111111] border border-[#252525] text-xs text-[#A3A3A3] w-48 lg:w-64">
                <Search className="w-3.5 h-3.5 text-[#A3A3A3]" />
                <input
                  type="text"
                  placeholder="Search biometrics, logs..."
                  className="bg-transparent border-none text-white text-xs placeholder-[#737373] focus:outline-none w-full"
                />
                <span className="text-[10px] text-[#737373] border border-[#252525] px-1 rounded">⌘K</span>
              </div>

              {/* Mission Day Status Badge */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#111111] border border-[#252525] text-xs font-mono text-[#A3A3A3]">
                <Clock className="w-3.5 h-3.5 text-[#36C9E8]" />
                <span>SOL 42 / 180</span>
              </div>

              {/* Telemetry Status */}
              <div className="flex items-center gap-1.5 text-xs text-[#A3A3A3]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden xl:inline text-[11px] font-mono">LIVE SYNC</span>
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="relative p-2 rounded-lg bg-[#111111] hover:bg-[#161616] border border-[#252525] text-[#A3A3A3] hover:text-white transition-colors"
                title="Toggle Alerts & Activity Panel"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#36C9E8]" />
              </button>

              {/* Astronaut Profile Avatar */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#252525]">
                <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#252525] flex items-center justify-center text-xs font-bold text-white">
                  {profile.astronautName?.slice(0, 1) || 'A'}
                </div>
              </div>

            </div>

          </header>

          {/* MAIN DASHBOARD SCROLLABLE CONTAINER */}
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
            
            {/* =================================================================== */}
            {/* 3. WELCOME & MISSION HEALTH OVERVIEW STRIP                          */}
            {/* =================================================================== */}
            <div className="p-5 sm:p-6 rounded-xl bg-[#111111] border border-[#252525] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-orbitron tracking-widest text-[#36C9E8] uppercase mb-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>MISSION HEALTH OVERVIEW</span>
                </div>
                <h1 className="font-orbitron text-xl sm:text-2xl font-bold text-white tracking-wide">
                  Welcome, {profile.astronautName}
                </h1>
                <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
                  Monitor your health and wellbeing throughout your space mission. Continuous bio-telemetry telemetry stream active.
                </p>
              </div>

              {/* Compact Mission Info Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
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

            {/* =================================================================== */}
            {/* 4. VITAL SIGNS SECTION (4 PREMIUM METRIC CARDS)                     */}
            {/* =================================================================== */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h2 className="font-orbitron text-xs font-bold tracking-wider text-[#A3A3A3] uppercase">
                  Continuous Vital Signs Telemetry
                </h2>
                <span className="text-[11px] text-[#A3A3A3] font-mono">
                  Sample Frequency: 1 Hz • Calibrated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* CARD 1: Heart Rate */}
                <div className="p-4 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/40 transition-all duration-200">
                  <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2">
                    <span className="font-medium">Heart Rate</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Normal
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-orbitron text-3xl font-extrabold text-white">72</span>
                      <span className="text-xs text-[#A3A3A3] font-mono">BPM</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-0.5">
                      <ArrowDownRight className="w-3 h-3" />
                      -0.5%
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
                  <div className="mt-2 text-[10px] text-[#A3A3A3] flex justify-between">
                    <span>Resting: 64 BPM</span>
                    <span>Peak: 128 BPM</span>
                  </div>
                </div>

                {/* CARD 2: Blood Oxygen (SpO2) */}
                <div className="p-4 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/40 transition-all duration-200">
                  <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2">
                    <span className="font-medium">Blood Oxygen (SpO2)</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Optimal</span>
                  </div>

                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-orbitron text-3xl font-extrabold text-white">98</span>
                      <span className="text-xs text-[#A3A3A3] font-mono">%</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      +0.2%
                    </span>
                  </div>

                  {/* Linear Gauge */}
                  <div className="w-full h-2 rounded-full bg-[#161616] overflow-hidden mt-3">
                    <div className="h-full bg-gradient-to-r from-cyan-600 to-[#36C9E8] rounded-full" style={{ width: '98%' }} />
                  </div>
                  <div className="mt-4 text-[10px] text-[#A3A3A3] flex justify-between">
                    <span>Target: &gt; 95%</span>
                    <span>Partial O2: 14.5 psia</span>
                  </div>
                </div>

                {/* CARD 3: Body Temperature */}
                <div className="p-4 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/40 transition-all duration-200">
                  <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2">
                    <span className="font-medium">Body Temperature</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Baseline</span>
                  </div>

                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-orbitron text-3xl font-extrabold text-white">36.8</span>
                      <span className="text-xs text-[#A3A3A3] font-mono">°C</span>
                    </div>
                    <span className="text-[11px] text-[#A3A3A3] font-mono">98.2°F</span>
                  </div>

                  {/* Thermal Range Bar */}
                  <div className="w-full h-2 rounded-full bg-[#161616] relative overflow-hidden mt-3">
                    <div className="absolute left-[30%] right-[30%] h-full bg-[#36C9E8]/30" />
                    <div className="h-full bg-[#36C9E8] rounded-full" style={{ width: '68%' }} />
                  </div>
                  <div className="mt-4 text-[10px] text-[#A3A3A3] flex justify-between">
                    <span>Core Baseline: 36.5°C</span>
                    <span>Circadian Swing: ±0.3°C</span>
                  </div>
                </div>

                {/* CARD 4: Blood Pressure */}
                <div className="p-4 rounded-xl bg-[#111111] border border-[#252525] hover:border-[#36C9E8]/40 transition-all duration-200">
                  <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-2">
                    <span className="font-medium">Blood Pressure</span>
                    <span className="text-emerald-400 font-mono text-[11px]">Stable</span>
                  </div>

                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-orbitron text-3xl font-extrabold text-white">120/80</span>
                      <span className="text-xs text-[#A3A3A3] font-mono">mmHg</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">Nominal</span>
                  </div>

                  {/* Dual Bar Representation */}
                  <div className="space-y-1.5 mt-2">
                    <div className="flex items-center gap-2 text-[10px] text-[#A3A3A3]">
                      <span className="w-7">SYS</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[#161616] overflow-hidden">
                        <div className="h-full bg-white rounded-full" style={{ width: '60%' }} />
                      </div>
                      <span className="font-mono text-white">120</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#A3A3A3]">
                      <span className="w-7">DIA</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[#161616] overflow-hidden">
                        <div className="h-full bg-[#36C9E8] rounded-full" style={{ width: '40%' }} />
                      </div>
                      <span className="font-mono text-white">80</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* =================================================================== */}
            {/* 5. OVERALL HEALTH STATUS & BIOMETRIC STABILITY                      */}
            {/* =================================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Overall Health Status (4 COLS) */}
              <div className="lg:col-span-4 p-6 rounded-xl bg-[#111111] border border-[#252525] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#252525] mb-5">
                    <h3 className="font-orbitron text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#36C9E8]" />
                      <span>Overall Health Status</span>
                    </h3>
                    <span className="text-[10px] font-mono text-[#A3A3A3]">FLIGHT READY</span>
                  </div>

                  {/* Circular Radial Status Ring */}
                  <div className="flex flex-col items-center justify-center my-4">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#1A1A1A"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* Progress ring 94% */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#36C9E8"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 42}
                          strokeDashoffset={2 * Math.PI * 42 * (1 - 0.94)}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="font-orbitron text-3xl font-extrabold text-white">94%</span>
                        <span className="text-[10px] tracking-wider text-[#A3A3A3] uppercase">Bio-Stability</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#A3A3A3] text-center mt-3 max-w-xs leading-relaxed">
                      Pre-Flight &amp; Orbital Biometric Baseline Index. Continuous autonomic nervous system calibration.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#252525] space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#A3A3A3]">
                    <span>Last Assessment:</span>
                    <span className="font-mono text-white">Today, 08:30 UTC</span>
                  </div>
                  <div className="flex justify-between items-center text-[#A3A3A3]">
                    <span>Active Clinical Alerts:</span>
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      1 Advisory
                    </span>
                  </div>
                </div>
              </div>

              {/* Bio-System Subsystems Grid (8 COLS) */}
              <div className="lg:col-span-8 p-6 rounded-xl bg-[#111111] border border-[#252525] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#252525] mb-5">
                    <h3 className="font-orbitron text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#36C9E8]" />
                      <span>Physiological Subsystem Status</span>
                    </h3>
                    <span className="text-[10px] text-[#A3A3A3] font-mono">4 Subsystems Online</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Subsystem 1 */}
                    <div className="p-3.5 rounded-lg bg-[#161616] border border-[#252525]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white">Cardiovascular Function</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                          STABLE
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                        Normal sinus rhythm. Stroke volume and vascular resistance adapted to hypogravity.
                      </p>
                    </div>

                    {/* Subsystem 2 */}
                    <div className="p-3.5 rounded-lg bg-[#161616] border border-[#252525]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white">Respiratory Efficiency</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                          OPTIMAL
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                        14 breaths/min resting rate. Expired CO2 levels within normal metabolic parameters.
                      </p>
                    </div>

                    {/* Subsystem 3 */}
                    <div className="p-3.5 rounded-lg bg-[#161616] border border-[#252525]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white">Neuro-Cognitive Index</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-[#36C9E8] text-[10px] font-mono">
                          BASELINE
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                        Mean reaction latency 210 ms. Circadian phase sync verified with habitat lighting cycles.
                      </p>
                    </div>

                    {/* Subsystem 4 */}
                    <div className="p-3.5 rounded-lg bg-[#161616] border border-[#252525]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-white">Musculoskeletal Profile</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                          PROTECTED
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                        Daily ARED resistive loading adherence 100%. Bone resorption markers suppressed.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#252525] flex items-center justify-between text-xs text-[#A3A3A3]">
                  <span>Telemetry Protocol: Autonomous Real-Time Biosync</span>
                  <span className="text-[#36C9E8] font-mono text-[11px]">NASA Flight Surgeon Link: Synced</span>
                </div>
              </div>

            </div>

            {/* =================================================================== */}
            {/* 6. HEALTH TRENDS (INTERACTIVE RECHARTS)                             */}
            {/* =================================================================== */}
            <div className="p-6 rounded-xl bg-[#111111] border border-[#252525]">
              
              {/* Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#252525]">
                <div>
                  <h3 className="font-orbitron text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#36C9E8]" />
                    <span>HEALTH TELEMETRY TRENDS</span>
                  </h3>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">
                    Historical physiological telemetry trends with longitudinal comparison.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Metric Switcher Tabs */}
                  <div className="flex items-center p-1 rounded-lg bg-[#161616] border border-[#252525] text-xs">
                    <button
                      onClick={() => setActiveMetricTab('heartRate')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        activeMetricTab === 'heartRate'
                          ? 'bg-[#111111] text-[#36C9E8] border border-[#252525]'
                          : 'text-[#A3A3A3] hover:text-white'
                      }`}
                    >
                      Heart Rate
                    </button>
                    <button
                      onClick={() => setActiveMetricTab('spo2')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        activeMetricTab === 'spo2'
                          ? 'bg-[#111111] text-[#36C9E8] border border-[#252525]'
                          : 'text-[#A3A3A3] hover:text-white'
                      }`}
                    >
                      SpO2
                    </button>
                    <button
                      onClick={() => setActiveMetricTab('sleep')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        activeMetricTab === 'sleep'
                          ? 'bg-[#111111] text-[#36C9E8] border border-[#252525]'
                          : 'text-[#A3A3A3] hover:text-white'
                      }`}
                    >
                      Sleep
                    </button>
                    <button
                      onClick={() => setActiveMetricTab('activity')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        activeMetricTab === 'activity'
                          ? 'bg-[#111111] text-[#36C9E8] border border-[#252525]'
                          : 'text-[#A3A3A3] hover:text-white'
                      }`}
                    >
                      Exercise
                    </button>
                  </div>

                  {/* Timeframe Filter (24H, 7D, 30D) */}
                  <div className="flex items-center p-1 rounded-lg bg-[#161616] border border-[#252525] text-xs font-mono">
                    {(['24H', '7D', '30D'] as Timeframe[]).map(tf => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-2.5 py-1 rounded transition-colors ${
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
              </div>

              {/* Main Chart Graphic & Side Resources Info */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
                
                {/* Recharts Area (9 COLS) */}
                <div className="lg:col-span-9 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#36C9E8" stopOpacity={0.3} />
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
                        fill="url(#cyanGradient)"
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
                  <div className="flex items-center justify-between text-[11px] text-[#A3A3A3] pt-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-0.5 bg-[#36C9E8]" />
                      <span>Observed Telemetry</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-0.5 bg-[#525252] border-b border-dashed" />
                      <span>NASA Nominal Flight Baseline</span>
                    </span>
                  </div>
                </div>

                {/* Side Resource & Supply Metrics (3 COLS - from reference design) */}
                <div className="lg:col-span-3 p-4 rounded-lg bg-[#161616] border border-[#252525] space-y-3.5">
                  <div className="text-xs font-orbitron font-semibold text-white uppercase tracking-wider pb-2 border-b border-[#252525]">
                    Consumables &amp; O2
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#A3A3A3]">O2 Reserve:</span>
                      <span className="font-mono text-white">99.2%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#111111] overflow-hidden">
                      <div className="h-full bg-[#36C9E8] rounded-full" style={{ width: '99%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#A3A3A3]">Hydration Index:</span>
                      <span className="font-mono text-white">94%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#111111] overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#A3A3A3]">Caloric Target:</span>
                      <span className="font-mono text-white">2,450 / 2,600 kcal</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#111111] overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#A3A3A3]">Radiation Accumulation:</span>
                      <span className="font-mono text-emerald-400">0.18 mSv</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#111111] overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: '8%' }} />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* =================================================================== */}
            {/* 7. WELLNESS OVERVIEW & ACTIVITY BREAKDOWN                          */}
            {/* =================================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Wellness Donut & Morale (5 COLS - from reference bottom right) */}
              <div className="lg:col-span-5 p-6 rounded-xl bg-[#111111] border border-[#252525] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#252525] mb-4">
                    <h3 className="font-orbitron text-xs font-bold tracking-wider text-white uppercase">
                      Crew Wellness &amp; Morale
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400">INDEX: 8.8 / 10</span>
                  </div>

                  <div className="flex items-center justify-center h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={wellnessDonut}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {wellnessDonut.map((entry, index) => (
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

                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    {wellnessDonut.map(item => (
                      <div key={item.name} className="p-2 rounded bg-[#161616] border border-[#252525]">
                        <div className="text-[10px] text-[#A3A3A3] truncate">{item.name}</div>
                        <div className="font-orbitron text-xs font-bold text-white mt-0.5">{item.value}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#252525] text-[11px] text-[#A3A3A3] flex items-center justify-between">
                  <span>Psychological Consultation:</span>
                  <span className="text-white font-mono">Cleared (Scheduled in 6d)</span>
                </div>
              </div>

              {/* Physical Activity & Work Breakdown (7 COLS - from reference bottom left) */}
              <div className="lg:col-span-7 p-6 rounded-xl bg-[#111111] border border-[#252525] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#252525] mb-4">
                    <h3 className="font-orbitron text-xs font-bold tracking-wider text-white uppercase">
                      Daily Activity &amp; Countermeasures
                    </h3>
                    <span className="text-[10px] font-mono text-[#36C9E8]">2.5 HRS EXERCISE GOAL MET</span>
                  </div>

                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                        <XAxis dataKey="label" stroke="#737373" fontSize={11} tickLine={false} />
                        <YAxis stroke="#737373" fontSize={11} tickLine={false} unit="h" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#111111',
                            borderColor: '#252525',
                            borderRadius: '6px',
                            color: '#FFFFFF',
                            fontSize: '11px'
                          }}
                        />
                        <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                          {activityDistribution.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#252525] flex items-center justify-between text-[11px] text-[#A3A3A3]">
                  <span>Microgravity Countermeasure Protocol: T2 + ARED</span>
                  <span className="text-emerald-400 font-mono">Aerobic Capacity (VO2 Max): 98% Baseline</span>
                </div>
              </div>

            </div>

            {/* =================================================================== */}
            {/* 8 & 9. AI HEALTH INSIGHTS PREVIEW & HEALTH ALERTS                   */}
            {/* =================================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* SECTION 9: AI HEALTH INSIGHTS (7 COLS) */}
              <div className="lg:col-span-7 p-6 rounded-xl bg-[#111111] border border-[#252525] flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-3 border-b border-[#252525] mb-5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#36C9E8]" />
                      <h3 className="font-orbitron text-xs font-bold tracking-wider text-white uppercase">
                        AI HEALTH INSIGHTS
                      </h3>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#36C9E8]/10 text-[#36C9E8] font-mono border border-[#36C9E8]/30">
                      MODEL v2.4 ACTIVE
                    </span>
                  </div>

                  <p className="text-xs text-[#A3A3A3] mb-4">
                    Autonomous biomedical anomaly detection &amp; trend analysis engine. Clearly labeled demonstration data.
                  </p>

                  <div className="space-y-3">
                    {/* Insight Item 1 */}
                    <div className="p-3.5 rounded-lg bg-[#161616] border border-[#252525]">
                      <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                        <span>Cardiovascular Adaptation to Hypogravity</span>
                        <span className="text-emerald-400 text-[10px] font-mono">Trend: Positive</span>
                      </div>
                      <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                        Heart rate variability (HRV) demonstrates steady autonomic stability. Stroke volume recovery following resistive workouts is within expected 95% confidence intervals.
                      </p>
                    </div>

                    {/* Insight Item 2 */}
                    <div className="p-3.5 rounded-lg bg-[#161616] border border-[#252525]">
                      <div className="flex items-center justify-between text-xs font-semibold text-white mb-1">
                        <span>Circadian &amp; Sleep Quality Optimization</span>
                        <span className="text-[#36C9E8] text-[10px] font-mono">Trend: High Consistency</span>
                      </div>
                      <p className="text-[11px] text-[#A3A3A3] leading-relaxed">
                        Slow-wave sleep duration improved by 14% following adjustments in cabin spectrum lighting and ambient temperature schedules.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#252525] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                  <div className="text-[10px] text-[#737373] italic">
                    * Simulated AI Analysis for NASA Space Apps prototype. Not intended as real-world medical advice.
                  </div>
                  <button
                    onClick={() => setShowInsightsModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] border border-[#36C9E8]/40 text-[#36C9E8] text-xs font-semibold tracking-wider uppercase transition-all shadow-sm shrink-0"
                  >
                    <span>EXPLORE AI INSIGHTS</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SECTION 8: HEALTH ALERTS & NOTIFICATIONS (5 COLS) */}
              <div className="lg:col-span-5 p-6 rounded-xl bg-[#111111] border border-[#252525] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#252525] mb-4">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-white" />
                      <h3 className="font-orbitron text-xs font-bold tracking-wider text-white uppercase">
                        Clinical &amp; Telemetry Alerts
                      </h3>
                    </div>
                    <span className="text-[10px] text-[#A3A3A3] font-mono">3 Notifications</span>
                  </div>

                  <div className="space-y-3">
                    
                    {/* Alert 1: Warning (Amber) */}
                    <div className="p-3.5 rounded-lg bg-[#161616] border-l-2 border-amber-400 border-t border-r border-b border-[#252525]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">Elevated Ambient CO2 Notification</span>
                        <span className="text-[10px] text-amber-400 font-mono">12:45 UTC</span>
                      </div>
                      <p className="text-[11px] text-[#A3A3A3] leading-snug">
                        Habitat module scrubbers cycled during exercise period. Ambient levels returned to 3.2 mmHg.
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="font-semibold text-white">Suggested:</span> Verify air circulation vents.
                      </div>
                    </div>

                    {/* Alert 2: Info (Cyan) */}
                    <div className="p-3.5 rounded-lg bg-[#161616] border-l-2 border-[#36C9E8] border-t border-r border-b border-[#252525]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">Electrolyte Hydration Schedule</span>
                        <span className="text-[10px] text-[#36C9E8] font-mono">10:15 UTC</span>
                      </div>
                      <p className="text-[11px] text-[#A3A3A3] leading-snug">
                        Pre-EVA hydration intake checkpoint. Log consumption to sync with water reclamation system.
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                        <span className="font-semibold text-white">Suggested:</span> Log 500ml intake.
                      </div>
                    </div>

                    {/* Alert 3: Normal (Green) */}
                    <div className="p-3.5 rounded-lg bg-[#161616] border-l-2 border-emerald-400 border-t border-r border-b border-[#252525]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white">Morning Biometrics Synchronized</span>
                        <span className="text-[10px] text-emerald-400 font-mono">08:30 UTC</span>
                      </div>
                      <p className="text-[11px] text-[#A3A3A3] leading-snug">
                        Full spectrum ECG, SpO2, and core temp telemetry transmitted to Flight Surgeon Mission Control.
                      </p>
                    </div>

                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#252525] flex items-center justify-between text-xs text-[#A3A3A3]">
                  <span>Telemetry Channel: Secure TLS / S-Band</span>
                  <span className="text-emerald-400 font-mono text-[11px]">Synced</span>
                </div>
              </div>

            </div>

          </main>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: AI HEALTH INSIGHTS DETAILED REPORT                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showInsightsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl p-6 sm:p-7 rounded-2xl bg-[#111111] border border-[#36C9E8]/40 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-white"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#252525]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#36C9E8]" />
                  <h3 className="font-orbitron text-lg font-bold text-white">
                    AI BIOMEDICAL INSIGHTS SUITE
                  </h3>
                </div>
                <button
                  onClick={() => setShowInsightsModal(false)}
                  className="p-1 rounded-lg text-[#A3A3A3] hover:text-white hover:bg-[#161616]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-space">
                <div className="p-3 rounded-lg bg-[#161616] border border-[#252525]">
                  <div className="font-semibold text-white mb-1">Automated Trend Observation</div>
                  <p className="text-[#A3A3A3] leading-relaxed">
                    Cardiovascular adaptation to long-duration spaceflight is progressing normally. Resting heart rate, blood pressure, and oxygen saturation remain well aligned with pre-launch ground baselines.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#161616] border border-[#252525]">
                  <div className="font-semibold text-white mb-1">Countermeasure Adherence Assessment</div>
                  <p className="text-[#A3A3A3] leading-relaxed">
                    Astronaut has completed 100% of prescribed ARED resistive exercises (squat, deadlift, heel raise) and T2 treadmill aerobic sessions over the past 7 days, providing excellent protection against bone mineral density and muscle mass loss.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#161616] border border-[#252525]">
                  <div className="font-semibold text-white mb-1">Recommended Flight Actions</div>
                  <ul className="list-disc pl-5 space-y-1 text-[#A3A3A3]">
                    <li>Maintain current daily 2.5 hour physical exercise schedule.</li>
                    <li>Ensure 500ml pre-EVA fluid and salt tablet protocol is completed 2 hours prior to airlock depressurization.</li>
                    <li>Continue cabin circadian light cycle transitions to support deep slow-wave sleep.</li>
                  </ul>
                </div>

                <div className="p-3 rounded bg-black/60 border border-white/5 text-[11px] text-[#737373]">
                  Disclaimer: This is a demonstration biomedical analytics suite designed for the NASA Space Apps Challenge prototype. All algorithms and suggestions are simulated and not intended for clinical use.
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowInsightsModal(false)}
                  className="px-5 py-2.5 rounded-lg bg-[#161616] hover:bg-[#202020] border border-[#252525] text-white text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Close Insights
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: SUB-PAGE PLACEHOLDER (3D Explorer, Analytics, Wellness, Reports)    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activePlaceholder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md p-6 rounded-2xl bg-[#111111] border border-[#252525] shadow-2xl text-white text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#161616] border border-[#36C9E8]/30 flex items-center justify-center mx-auto mb-4 text-[#36C9E8]">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className="font-orbitron text-lg font-bold text-white mb-2">
                {activePlaceholder}
              </h3>

              <p className="text-xs text-[#A3A3A3] leading-relaxed mb-6">
                This module is designated for development in the upcoming sprint per the development roadmap. All telemetry channels are standing by.
              </p>

              <button
                onClick={() => {
                  setActivePlaceholder(null);
                  setActiveNav('overview');
                }}
                className="w-full py-2.5 rounded-lg bg-[#161616] hover:bg-[#222222] border border-[#252525] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Return to Overview Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
