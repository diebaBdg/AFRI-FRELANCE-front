import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Landing from '@/pages/Landing';
import HowItWorks from '@/pages/HowItWorks';
import Business from '@/pages/Business';
import Freelancers from '@/pages/Freelancers';
import FreelancerProfile from '@/pages/FreelancerProfile';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import PostProject from '@/pages/PostProject';
import DashboardFreelancer from '@/pages/DashboardFreelancer';
import DashboardClient from '@/pages/DashboardClient';
import Messages from '@/pages/Messages';
import Contracts from '@/pages/Contracts';
import Wallet from '@/pages/Wallet';
import Admin from '@/pages/Admin';
import Notifications from '@/pages/Notifications';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
// Add page imports here
import Profile from '@/pages/Profile';
import Settings from '@/pages/settings/Settings';
import AccountProfile from '@/pages/settings/AccountProfile';
import ProfessionalProfiles from '@/pages/settings/ProfessionalProfiles';
import FreelancerEditor from '@/pages/settings/FreelancerEditor';
import ClientEditor from '@/pages/settings/ClientEditor';
import CompanyPage from '@/pages/settings/CompanyPage';
import SecurityPage from '@/pages/settings/Security';
import NotificationsPage from '@/pages/settings/NotificationsPage';
import PreferencesPage from '@/pages/settings/PreferencesPage';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<Layout />}>
        {/* Routes publiques (exploration sans compte) */}
        <Route path="/" element={<Landing />} />
        <Route path="/freelancers" element={<Freelancers />} />
        <Route path="/freelancers/:id" element={<FreelancerProfile />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/business" element={<Business />} />

        {/* Routes réservées aux utilisateurs connectés */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/post-project" element={<PostProject />} />
          <Route path="/dashboard/freelancer" element={<DashboardFreelancer />} />
          <Route path="/dashboard/client" element={<DashboardClient />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/contracts" element={<Contracts />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />}>
            <Route index element={<Navigate to="/settings/profile" replace />} />
            <Route path="profile" element={<AccountProfile />} />
            <Route path="professional" element={<ProfessionalProfiles />} />
            <Route path="freelancer" element={<FreelancerEditor />} />
            <Route path="client" element={<ClientEditor />} />
            <Route path="company" element={<CompanyPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="preferences" element={<PreferencesPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App