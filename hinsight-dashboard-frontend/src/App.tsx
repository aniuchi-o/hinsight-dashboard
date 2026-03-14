import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AlertsProvider } from './context/AlertsContext';
import { SettingsContextProvider, useSettingsContext } from './context/SettingsContext';
import ProtectedRoute from './components/guards/ProtectedRoute';
import DashboardShell from './components/layout/DashboardShell';
import LoginPage from './pages/LoginPage';
import OverviewPage from './pages/OverviewPage';
import LifestylePage from './pages/LifestylePage';
import NutritionObesityPage from './pages/NutritionObesityPage';
import FeelingsPage from './pages/FeelingsPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import MFASetupPage from './pages/MFASetupPage';
import MFAVerifyPage from './pages/MFAVerifyPage';
import TenantSignupPage from './pages/TenantSignupPage';
import UserSignupPage from './pages/UserSignupPage';
import PlatformSignupPage from './pages/PlatformSignupPage';
import PlatformPage from './pages/PlatformPage';
import { useAuth } from './context/AuthContext';
import GlossarySection from './components/help/sections/GlossarySection';
import MetricDefinitionsSection from './components/help/sections/MetricDefinitionsSection';
import FAQSection from './components/help/sections/FAQSection';
import RegulatoryNoticesSection from './components/help/sections/RegulatoryNoticesSection';
import KeyboardShortcutsSection from './components/help/sections/KeyboardShortcutsSection';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const VIEW_ROUTE_MAP: Record<string, string> = {
  overview: '/overview',
  lifestyle: '/lifestyle',
  nutrition_obesity: '/nutrition-obesity',
  feelings: '/feelings',
};

// Listens for 403 events emitted by apiClient and navigates to /unauthorized
// Must be rendered inside <BrowserRouter> to access useNavigate
function ForbiddenRedirectHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const handle = () => navigate('/unauthorized', { replace: true });
    window.addEventListener('auth:forbidden', handle);
    return () => window.removeEventListener('auth:forbidden', handle);
  }, [navigate]);
  return null;
}

// Inner component so it can consume SettingsContext
function AppRoutes() {
  const { defaultView } = useSettingsContext();
  const { user } = useAuth();
  const defaultRoute = user?.role === 'platform_admin'
    ? '/platform'
    : (VIEW_ROUTE_MAP[defaultView] ?? '/overview');

  return (
    <BrowserRouter>
      <ForbiddenRedirectHandler />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mfa/verify" element={<MFAVerifyPage />} />
        <Route path="/signup/tenant" element={<TenantSignupPage />} />
        <Route path="/signup/user" element={<UserSignupPage />} />
        <Route path="/signup/platform" element={<PlatformSignupPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardShell />}>
            <Route path="/" element={<Navigate to={defaultRoute} replace />} />
            <Route path="/mfa/setup" element={<MFASetupPage />} />

            <Route element={<ProtectedRoute requiredPermission="view:overview" />}>
              <Route path="/overview" element={<OverviewPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view:lifestyle" />}>
              <Route path="/lifestyle" element={<LifestylePage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view:nutrition_obesity" />}>
              <Route path="/nutrition-obesity" element={<NutritionObesityPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view:feelings" />}>
              <Route path="/feelings" element={<FeelingsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view:alerts" />}>
              <Route path="/alerts" element={<AlertsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view:settings" />}>
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route element={<ProtectedRoute requiredPermission="view:platform" />}>
              <Route path="/platform" element={<PlatformPage />} />
            </Route>

            {/* Help — nested sub-routes (protection on the parent only) */}
            <Route path="/help" element={<HelpPage />}>
              <Route index element={<Navigate to="glossary" replace />} />
              <Route path="glossary" element={<GlossarySection />} />
              <Route path="metric-definitions" element={<MetricDefinitionsSection />} />
              <Route path="faq" element={<FAQSection />} />
              <Route path="regulatory-notices" element={<RegulatoryNoticesSection />} />
              <Route path="keyboard-shortcuts" element={<KeyboardShortcutsSection />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SettingsContextProvider>
          <AuthProvider>
            <AlertsProvider>
              <AppRoutes />
            </AlertsProvider>
          </AuthProvider>
        </SettingsContextProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
