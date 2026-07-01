import { publicNav } from '@bestal/mock-data';
import { AuthLayout, MarketingLayout } from '@bestal/ui';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { AdminShell } from '../layouts/AdminShell';
import { ClientShell } from '../layouts/ClientShell';
import { RecruiterShell } from '../layouts/RecruiterShell';
import { BackgroundChecksPage as AdminBackgroundChecksPage } from '../pages/admin/BackgroundChecksPage';
import { CandidateDetailPage as AdminCandidateDetailPage } from '../pages/admin/CandidateDetailPage';
import { CandidatesPage as AdminCandidatesPage } from '../pages/admin/CandidatesPage';
import { ClientsPage as AdminClientsPage } from '../pages/admin/ClientsPage';
import { DashboardPage as AdminDashboardPage } from '../pages/admin/DashboardPage';
import { DeploymentsPage as AdminDeploymentsPage } from '../pages/admin/DeploymentsPage';
import { EvaluationsPage as AdminEvaluationsPage } from '../pages/admin/EvaluationsPage';
import { LoginPage as AdminLoginPage } from '../pages/admin/LoginPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { TrialsPage } from '../pages/admin/TrialsPage';
import { CandidateDetailPage as ClientCandidateDetailPage } from '../pages/client/CandidateDetailPage';
import { CandidateSearchPage } from '../pages/client/CandidateSearchPage';
import { DashboardPage as ClientDashboardPage } from '../pages/client/DashboardPage';
import { InterviewRequestsPage } from '../pages/client/InterviewRequestsPage';
import { LoginPage as ClientLoginPage } from '../pages/client/LoginPage';
import { ShortlistedCandidatesPage } from '../pages/client/ShortlistedCandidatesPage';
import { TrialRequestsPage } from '../pages/client/TrialRequestsPage';
import { AboutPage } from '../pages/public/AboutPage';
import { CommunitiesPage } from '../pages/public/CommunitiesPage';
import { ContactPage } from '../pages/public/ContactPage';
import { EnterprisePage } from '../pages/public/EnterprisePage';
import { HomePage } from '../pages/public/HomePage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { JobDetailPage } from '../pages/public/JobDetailPage';
import { JobsPage } from '../pages/public/JobsPage';
import { PortalLoginPage } from '../pages/public/LoginPage';
import { TalentPage } from '../pages/public/TalentPage';
import { BackgroundChecksPage } from '../pages/recruiter/BackgroundChecksPage';
import { CandidateDetailPage } from '../pages/recruiter/CandidateDetailPage';
import { CandidatesPage as RecruiterCandidatesPage } from '../pages/recruiter/CandidatesPage';
import { ClientsPage as RecruiterClientsPage } from '../pages/recruiter/ClientsPage';
import { DashboardPage as RecruiterDashboardPage } from '../pages/recruiter/DashboardPage';
import { DeploymentsPage as RecruiterDeploymentsPage } from '../pages/recruiter/DeploymentsPage';
import { EvaluationsPage } from '../pages/recruiter/EvaluationsPage';
import { InterviewsPage as RecruiterInterviewsPage } from '../pages/recruiter/InterviewsPage';
import { LoginPage as RecruiterLoginPage } from '../pages/recruiter/LoginPage';
import { ShortlistsPage as RecruiterShortlistsPage } from '../pages/recruiter/ShortlistsPage';

const marketingNav = publicNav.map(({ label, href }) => ({ label, href }));

function MarketingShell() {
  return (
    <MarketingLayout navItems={[...marketingNav]} ctaLabel="Hire Talent" ctaHref="/contact">
      <Outlet />
    </MarketingLayout>
  );
}

function PortalSelectorShell() {
  return (
    <AuthLayout title="Welcome to BesTal" subtitle="Select your portal to continue">
      <Outlet />
    </AuthLayout>
  );
}

function AdminAuthShell() {
  return (
    <AuthLayout title="Admin Portal" subtitle="Sign in to manage the BesTal platform">
      <Outlet />
    </AuthLayout>
  );
}

function RecruiterAuthShell() {
  return (
    <AuthLayout title="Recruiter Portal" subtitle="Sign in to manage your talent pipeline">
      <Outlet />
    </AuthLayout>
  );
}

function ClientAuthShell() {
  return (
    <AuthLayout
      title="Client Portal"
      subtitle="Sign in to review talent and manage your hiring pipeline"
    >
      <Outlet />
    </AuthLayout>
  );
}

const router = createBrowserRouter([
  {
    element: <MarketingShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'talent', element: <TalentPage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'jobs/:slug', element: <JobDetailPage /> },
      { path: 'communities', element: <CommunitiesPage /> },
      { path: 'enterprise', element: <EnterprisePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
    ],
  },
  {
    element: <PortalSelectorShell />,
    children: [{ path: 'login', element: <PortalLoginPage /> }],
  },
  {
    path: 'admin',
    children: [
      {
        element: <AdminAuthShell />,
        children: [{ path: 'login', element: <AdminLoginPage /> }],
      },
      {
        element: <AdminShell />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'candidates', element: <AdminCandidatesPage /> },
          { path: 'candidates/:id', element: <AdminCandidateDetailPage /> },
          { path: 'clients', element: <AdminClientsPage /> },
          { path: 'deployments', element: <AdminDeploymentsPage /> },
          { path: 'trials', element: <TrialsPage /> },
          { path: 'evaluations', element: <AdminEvaluationsPage /> },
          { path: 'background-checks', element: <AdminBackgroundChecksPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: 'recruiter',
    children: [
      {
        element: <RecruiterAuthShell />,
        children: [{ path: 'login', element: <RecruiterLoginPage /> }],
      },
      {
        element: <RecruiterShell />,
        children: [
          { index: true, element: <RecruiterDashboardPage /> },
          { path: 'candidates', element: <RecruiterCandidatesPage /> },
          { path: 'candidates/:id', element: <CandidateDetailPage /> },
          { path: 'evaluations', element: <EvaluationsPage /> },
          { path: 'shortlists', element: <RecruiterShortlistsPage /> },
          { path: 'interviews', element: <RecruiterInterviewsPage /> },
          { path: 'background-checks', element: <BackgroundChecksPage /> },
          { path: 'clients', element: <RecruiterClientsPage /> },
          { path: 'deployments', element: <RecruiterDeploymentsPage /> },
        ],
      },
    ],
  },
  {
    path: 'client',
    children: [
      {
        element: <ClientAuthShell />,
        children: [{ path: 'login', element: <ClientLoginPage /> }],
      },
      {
        element: <ClientShell />,
        children: [
          { index: true, element: <ClientDashboardPage /> },
          { path: 'search', element: <CandidateSearchPage /> },
          { path: 'candidates/:id', element: <ClientCandidateDetailPage /> },
          { path: 'shortlisted', element: <ShortlistedCandidatesPage /> },
          { path: 'interviews', element: <InterviewRequestsPage /> },
          { path: 'trials', element: <TrialRequestsPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
