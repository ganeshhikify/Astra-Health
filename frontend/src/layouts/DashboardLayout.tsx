import React, { useState } from 'react';
import {
  Orbit,
  LayoutDashboard,
  Layers,
  Sparkles,
  LineChart as LineChartIcon,
  CalendarCheck,
  FileText,
  Bell,
  Search,
  Clock,
  ChevronRight,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { DashboardStarfield } from '../components/DashboardStarfield';

export type DashboardRoute =
  | 'overview'
  | 'body-explorer'
  | 'ai-insights'
  | 'analytics'
  | 'wellness'
  | 'reports';

interface DashboardLayoutProps {
  currentRoute: DashboardRoute;
  onRouteChange: (route: DashboardRoute) => void;
  onBackToLanding: () => void;
  onNavigateToSetup: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentRoute,
  onRouteChange,
  onBackToLanding,
  onNavigateToSetup,
  children
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load Mission Setup profile from localStorage (fallback to defaults)
  const profile = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('astra_mission_setup_draft');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      astronautName: 'Cmdr. Sarah Vance',
      crewId: 'AST-7824',
      astronautRole: 'Mission Commander',
      missionName: 'Astra Artemis VII',
      destination: 'MOON',
      missionDuration: '180 Days'
    };
  }, []);

  const navItems: { id: DashboardRoute; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'body-explorer', label: '3D Body Explorer', icon: Layers },
    { id: 'ai-insights', label: 'AI Health Insights', icon: Sparkles },
    { id: 'analytics', label: 'Health Analytics', icon: LineChartIcon },
    { id: 'wellness', label: 'Daily Wellness', icon: CalendarCheck },
    { id: 'reports', label: 'Health Reports', icon: FileText }
  ];

  const handleNavClick = (id: DashboardRoute) => {
    onRouteChange(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] antialiased selection:bg-[#36C9E8] selection:text-black relative overflow-x-hidden font-space">
      
      {/* Background Dim Stars */}
      <DashboardStarfield />

      {/* Mobile Top Navbar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-[#252525] relative z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
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
          <span className="text-[10px] font-mono text-[#36C9E8] px-2 py-0.5 rounded bg-[#161616] border border-[#252525]">
            {profile.destination}
          </span>
        </div>
      </div>

      <div className="flex min-h-screen relative z-10">
        
        {/* ========================================================================= */}
        {/* PERMANENT FIXED LEFT SIDEBAR                                              */}
        {/* ========================================================================= */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#0A0A0A] border-r border-[#252525] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
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
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-1 text-[#A3A3A3] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Astronaut Profile Badge */}
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
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Bio-Sync Active
                </span>
              </div>
            </div>

            {/* Navigation Section */}
            <nav className="px-3 py-2 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-orbitron font-semibold tracking-wider text-[#A3A3A3] uppercase">
                Navigation
              </div>

              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#161616] text-[#36C9E8] border border-[#36C9E8]/40 shadow-sm'
                        : 'text-[#A3A3A3] hover:bg-[#111111] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#36C9E8]" />
                    )}
                  </button>
                );
              })}
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
        {/* MAIN BODY AREA (TOP HEADER + DYNAMIC PAGE CONTENT)                        */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-md border-b border-[#252525] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            
            {/* Breadcrumb Navigation */}
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
              
              {/* Search Box */}
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
              <div className="relative p-2 rounded-lg bg-[#111111] border border-[#252525] text-[#A3A3A3]">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#36C9E8]" />
              </div>

              {/* Astronaut Avatar */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#252525]">
                <div className="w-8 h-8 rounded-full bg-[#161616] border border-[#252525] flex items-center justify-center text-xs font-bold text-white">
                  {profile.astronautName?.slice(0, 1) || 'A'}
                </div>
              </div>

            </div>

          </header>

          {/* DYNAMIC PAGE CONTENT CONTAINER */}
          <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
            {children}
          </main>

        </div>

      </div>

    </div>
  );
};
