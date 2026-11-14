import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { MissionSetupPage } from './pages/MissionSetupPage';
import { DashboardLayout, DashboardRoute } from './layouts/DashboardLayout';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { BodyExplorerPage } from './pages/dashboard/BodyExplorerPage';
import { AIInsightsPage } from './pages/dashboard/AIInsightsPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { WellnessPage } from './pages/dashboard/WellnessPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { HealthAssessmentPage } from './pages/HealthAssessmentPage';

export const App: React.FC = () => {
  // Determine top-level screen or dashboard sub-route
  const [topScreen, setTopScreen] = useState<'landing' | 'mission-setup' | 'assessment' | 'app'>(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;

    if (hash.includes('mission-setup') || path.includes('mission-setup')) {
      return 'mission-setup';
    }
    if (hash.includes('assessment') || path.includes('assessment')) {
      return 'assessment';
    }
    if (
      hash.includes('dashboard') ||
      hash.includes('body-explorer') ||
      hash.includes('ai-insights') ||
      hash.includes('analytics') ||
      hash.includes('wellness') ||
      hash.includes('reports') ||
      path.includes('dashboard') ||
      path.includes('body-explorer') ||
      path.includes('ai-insights') ||
      path.includes('analytics') ||
      path.includes('wellness') ||
      path.includes('reports')
    ) {
      return 'app';
    }
    return 'landing';
  });

  const [dashboardRoute, setDashboardRoute] = useState<DashboardRoute>(() => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    if (hash.includes('body-explorer') || path.includes('body-explorer')) return 'body-explorer';
    if (hash.includes('ai-insights') || path.includes('ai-insights')) return 'ai-insights';
    if (hash.includes('analytics') || path.includes('analytics')) return 'analytics';
    if (hash.includes('wellness') || path.includes('wellness')) return 'wellness';
    if (hash.includes('reports') || path.includes('reports')) return 'reports';
    return 'overview';
  });

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (hash.includes('mission-setup') || path.includes('mission-setup')) {
        setTopScreen('mission-setup');
      } else if (hash.includes('assessment') || path.includes('assessment')) {
        setTopScreen('assessment');
      } else if (
        hash.includes('dashboard') ||
        hash.includes('body-explorer') ||
        hash.includes('ai-insights') ||
        hash.includes('analytics') ||
        hash.includes('wellness') ||
        hash.includes('reports') ||
        path.includes('dashboard') ||
        path.includes('body-explorer') ||
        path.includes('ai-insights') ||
        path.includes('analytics') ||
        path.includes('wellness') ||
        path.includes('reports')
      ) {
        setTopScreen('app');
        if (hash.includes('body-explorer') || path.includes('body-explorer')) setDashboardRoute('body-explorer');
        else if (hash.includes('ai-insights') || path.includes('ai-insights')) setDashboardRoute('ai-insights');
        else if (hash.includes('analytics') || path.includes('analytics')) setDashboardRoute('analytics');
        else if (hash.includes('wellness') || path.includes('wellness')) setDashboardRoute('wellness');
        else if (hash.includes('reports') || path.includes('reports')) setDashboardRoute('reports');
        else setDashboardRoute('overview');
      } else {
        setTopScreen('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToMissionSetup = () => {
    setTopScreen('mission-setup');
    window.history.pushState(null, '', '#mission-setup');
  };

  const navigateToLanding = () => {
    setTopScreen('landing');
    window.history.pushState(null, '', '/');
  };

  const navigateToDashboard = (route: DashboardRoute = 'overview') => {
    setTopScreen('app');
    setDashboardRoute(route);
    window.history.pushState(null, '', `#${route === 'overview' ? 'dashboard' : route}`);
  };

  const navigateToAssessment = () => {
    setTopScreen('assessment');
    window.history.pushState(null, '', '#assessment');
  };

  const handleDashboardRouteChange = (route: DashboardRoute) => {
    setDashboardRoute(route);
    window.history.pushState(null, '', `#${route === 'overview' ? 'dashboard' : route}`);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#36C9E8] selection:text-black">
      {topScreen === 'landing' && (
        <LandingPage onGetStarted={navigateToMissionSetup} />
      )}

      {topScreen === 'mission-setup' && (
        <MissionSetupPage
          onBackToLanding={navigateToLanding}
          onProceedToDashboard={() => navigateToDashboard('overview')}
        />
      )}

      {topScreen === 'assessment' && (
        <HealthAssessmentPage
          onBackToDashboard={() => navigateToDashboard('overview')}
        />
      )}

      {topScreen === 'app' && (
        <DashboardLayout
          currentRoute={dashboardRoute}
          onRouteChange={handleDashboardRouteChange}
          onBackToLanding={navigateToLanding}
          onNavigateToSetup={navigateToMissionSetup}
        >
          {dashboardRoute === 'overview' && (
            <OverviewPage
              onNavigate={handleDashboardRouteChange}
              onOpenAssessment={navigateToAssessment}
            />
          )}
          {dashboardRoute === 'body-explorer' && <BodyExplorerPage />}
          {dashboardRoute === 'ai-insights' && <AIInsightsPage />}
          {dashboardRoute === 'analytics' && <AnalyticsPage />}
          {dashboardRoute === 'wellness' && <WellnessPage />}
          {dashboardRoute === 'reports' && <ReportsPage />}
        </DashboardLayout>
      )}
    </div>
  );
};

export default App;
