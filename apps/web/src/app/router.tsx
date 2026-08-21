import { publicNav } from '@bestal/mock-data';
import { MarketingLayout } from '@bestal/ui';
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useNavigate } from 'react-router-dom';
import { AdminShell } from '../layouts/AdminShell';
import { ClientShell } from '../layouts/ClientShell';
import { RecruiterShell } from '../layouts/RecruiterShell';
import { BESTAL_LOGO_SRC } from '../lib/brand';
import { BackgroundChecksPage as AdminBackgroundChecksPage } from '../pages/admin/BackgroundChecksPage';
import { CandidateCsvImportPage as AdminCandidateCsvImportPage } from '../pages/admin/CandidateCsvImportPage';
import { CandidateApprovalsPage } from '../pages/admin/CandidateApprovalsPage';
import { CandidateDetailPage as AdminCandidateDetailPage } from '../pages/admin/CandidateDetailPage';
import { CandidatesPage as AdminCandidatesPage } from '../pages/admin/CandidatesPage';
import { ClientDetailPage as AdminClientDetailPage } from '../pages/admin/ClientDetailPage';
import { ClientsPage as AdminClientsPage } from '../pages/admin/ClientsPage';
import { DashboardPage as AdminDashboardPage } from '../pages/admin/DashboardPage';
import { DeploymentsPage as AdminDeploymentsPage } from '../pages/admin/DeploymentsPage';
import { EvaluationsPage as AdminEvaluationsPage } from '../pages/admin/EvaluationsPage';
import { LoginPage as AdminLoginPage } from '../pages/admin/LoginPage';
import { ForgotPasswordPage as AdminForgotPasswordPage } from '../pages/admin/ForgotPasswordPage';
import { ResetPasswordPage as AdminResetPasswordPage } from '../pages/admin/ResetPasswordPage';
import { TrialsPage } from '../pages/admin/TrialsPage';
import { CandidateDetailPage as ClientCandidateDetailPage } from '../pages/client/CandidateDetailPage';
import { CandidateSearchPage } from '../pages/client/CandidateSearchPage';
import { DashboardPage as ClientDashboardPage } from '../pages/client/DashboardPage';
import { TrialRequestsPage } from '../pages/client/TrialRequestsPage';
import { DeploymentsPage as ClientDeploymentsPage } from '../pages/client/DeploymentsPage';
import { AboutPage } from '../pages/public/AboutPage';
import { FaqPage } from '../pages/public/FaqPage';
import { CommunitiesPage } from '../pages/public/CommunitiesPage';
import { ContactPage } from '../pages/public/ContactPage';
import { EnterprisePage } from '../pages/public/EnterprisePage';
import { EvaluationStandardPage } from '../pages/public/EvaluationStandardPage';
import { ForEngineersPage } from '../pages/public/ForEngineersPage';
import { HomePage } from '../pages/public/HomePage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { JobDetailPage } from '../pages/public/JobDetailPage';
import { JobsPage } from '../pages/public/JobsPage';
import { ClientSignupPage, ClientSignupSuccessPage } from '../pages/public/ClientSignupPage';
import { MarketingLoginPage } from '../pages/public/MarketingLoginPage';
import { StaffPortalLoginPage } from '../pages/public/StaffPortalLoginPage';
import { RatesPage } from '../pages/public/RatesPage';
import { SampleTalentPage } from '../pages/public/SampleTalentPage';
import { TalentPage } from '../pages/public/TalentPage';
import { TrustPage } from '../pages/public/TrustPage';
import { TryForAWeekPage } from '../pages/public/TryForAWeekPage';
import { AddCandidatePage } from '../pages/recruiter/AddCandidatePage';
import { BackgroundChecksPage } from '../pages/recruiter/BackgroundChecksPage';
import { CandidateCsvImportPage as RecruiterCandidateCsvImportPage } from '../pages/recruiter/CandidateCsvImportPage';
import { CandidateDetailPage } from '../pages/recruiter/CandidateDetailPage';
import { CandidatesPage as RecruiterCandidatesPage } from '../pages/recruiter/CandidatesPage';
import { ClientsPage as RecruiterClientsPage } from '../pages/recruiter/ClientsPage';
import { DashboardPage as RecruiterDashboardPage } from '../pages/recruiter/DashboardPage';
import { DeploymentsPage as RecruiterDeploymentsPage } from '../pages/recruiter/DeploymentsPage';
import { TrialsPage as RecruiterTrialsPage } from '../pages/recruiter/TrialsPage';
import { EvaluationsPage } from '../pages/recruiter/EvaluationsPage';
import { LoginPage as RecruiterLoginPage } from '../pages/recruiter/LoginPage';
import { SalesShell } from '../layouts/SalesShell';
import { SalesCandidatesPage } from '../pages/sales/CandidatesPage';
import { ClientDetailPage as SalesClientDetailPage } from '../pages/sales/ClientDetailPage';
import { ClientsPage as SalesClientsPage } from '../pages/sales/ClientsPage';
import { DashboardPage as SalesDashboardPage } from '../pages/sales/DashboardPage';
import { DeploymentsPage as SalesDeploymentsPage } from '../pages/sales/DeploymentsPage';
import { LoginPage as SalesLoginPage } from '../pages/sales/LoginPage';
import { MarginReportPage as SalesMarginReportPage } from '../pages/sales/MarginReportPage';
import { TrialsPage as SalesTrialsPage } from '../pages/sales/TrialsPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PermissionGate } from '../components/auth/PermissionGate';
import { PortalAuthShell } from '../components/auth/PortalAuthShell';
import { ScrollToTop } from '../components/ScrollToTop';
import { PORTAL_AUTH_CONFIG } from '../lib/auth-portal-config';
import { PortalForgotPasswordPage } from '../pages/shared/PortalForgotPasswordPage';
import { PortalResetPasswordPage } from '../pages/shared/PortalResetPasswordPage';
import { SuperAdminShell } from '../layouts/SuperAdminShell';
import { SuperAdminDashboardPage } from '../pages/super-admin/DashboardPage';
import { SuperAdminUsersPage } from '../pages/super-admin/UsersPage';
import { SuperAdminUserFormPage } from '../pages/super-admin/UserFormPage';
import { SuperAdminIconsPage } from '../pages/super-admin/IconsPage';
import { SuperAdminRolesPage } from '../pages/super-admin/RolesPage';
import { SuperAdminRoleDetailPage } from '../pages/super-admin/RoleDetailPage';
import { SuperAdminClientsPage } from '../pages/super-admin/ClientsPage';
import { SuperAdminClientEnquiriesPage } from '../pages/super-admin/ClientEnquiriesPage';
import { SuperAdminClientEnquiryDetailPage } from '../pages/super-admin/ClientEnquiryDetailPage';
import { SuperAdminClientFormPage } from '../pages/super-admin/ClientFormPage';
import {
  SuperAdminCandidatesPage,
  SuperAdminPendingCandidatesPage,
} from '../pages/super-admin/CandidatesPage';
import { SuperAdminCandidateDetailPage } from '../pages/super-admin/CandidateDetailPage';
import { SuperAdminCandidateCsvImportPage } from '../pages/super-admin/CandidateCsvImportPage';
import { SuperAdminEvaluationsPage } from '../pages/super-admin/EvaluationsPage';
import { SuperAdminBackgroundChecksPage } from '../pages/super-admin/BackgroundChecksPage';
import { SuperAdminTrialsPage } from '../pages/super-admin/TrialsPage';
import { SuperAdminDeploymentsPage } from '../pages/super-admin/DeploymentsPage';
import { SuperAdminDataImportPage } from '../pages/super-admin/OorwinSyncPage';
import { SuperAdminReportsPage } from '../pages/super-admin/ReportsPage';
import { SuperAdminAuditLogsPage } from '../pages/super-admin/AuditLogsPage';
import { SuperAdminSettingsPage } from '../pages/super-admin/SettingsPage';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { CLIENT_LOGIN_PATH, LOGIN_PORTAL_CHOOSER_PATH } from '../lib/login-portals';

function ClientEnquiriesRoute({ redirectTo }: { redirectTo: string }) {
  return (
    <PermissionGate permission="job-requests:read" redirectTo={redirectTo}>
      <SuperAdminClientEnquiriesPage />
    </PermissionGate>
  );
}

function ClientEnquiryDetailRoute({ redirectTo }: { redirectTo: string }) {
  return (
    <PermissionGate permission="job-requests:read" redirectTo={redirectTo}>
      <SuperAdminClientEnquiryDetailPage />
    </PermissionGate>
  );
}

function ProtectedAdminShell() {
  return (
    <ProtectedRoute portal="ADMIN">
      <AdminShell />
    </ProtectedRoute>
  );
}

function ProtectedSuperAdminShell() {
  const { user, isLoading } = useAuth();
  const { isPlatformAdmin } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const allowed = user?.role === 'SUPER_ADMIN' || isPlatformAdmin;
  if (!allowed) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <ProtectedRoute portal="ADMIN">
      <SuperAdminShell />
    </ProtectedRoute>
  );
}

function ProtectedRecruiterShell() {
  return (
    <ProtectedRoute portal="RECRUITER">
      <RecruiterShell />
    </ProtectedRoute>
  );
}

function ProtectedClientShell() {
  return (
    <ProtectedRoute portal="CLIENT">
      <ClientShell />
    </ProtectedRoute>
  );
}

function ProtectedSalesShell() {
  return (
    <ProtectedRoute portal="SALES">
      <SalesShell />
    </ProtectedRoute>
  );
}

const marketingNav = publicNav.map(({ label, href }) => ({ label, href }));

function useMarketingAuthLayoutProps() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate(LOGIN_PORTAL_CHOOSER_PATH, { replace: true });
    }
  }

  return {
    isAuthenticated,
    loginHref: CLIENT_LOGIN_PATH,
    onLogout: handleLogout,
  };
}

function MarketingShell() {
  const authLayoutProps = useMarketingAuthLayoutProps();

  return (
    <div data-prerender-ready="">
      <ScrollToTop />
      <MarketingLayout
        navItems={[...marketingNav]}
        ctaLabel="Reach out to us"
        ctaHref="/contact"
        brandLogoSrc={BESTAL_LOGO_SRC}
        {...authLayoutProps}
      >
        <Outlet />
      </MarketingLayout>
    </div>
  );
}

function PortalLoginShell() {
  return (
    <div className="marketing-site mkt-split-login-site" data-prerender-ready="">
      <ScrollToTop />
      <Outlet />
    </div>
  );
}

function LoginRoutesLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

function StaffAuthShell() {
  return (
    <div className="marketing-site mkt-split-login-site" data-prerender-ready="">
      <ScrollToTop />
      <Outlet />
    </div>
  );
}

function ClientAuthShell() {
  return <PortalAuthShell config={PORTAL_AUTH_CONFIG.CLIENT} />;
}

const router = createBrowserRouter([
  {
    element: <MarketingShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'sample-talent', element: <SampleTalentPage /> },
      { path: 'talent', element: <TalentPage /> },
      { path: 'evaluation-standard', element: <EvaluationStandardPage /> },
      { path: 'trust', element: <TrustPage /> },
      { path: 'rates', element: <RatesPage /> },
      { path: 'try-for-a-week', element: <TryForAWeekPage /> },
      { path: 'jobs', element: <JobsPage /> },
      { path: 'jobs/:slug', element: <JobDetailPage /> },
      { path: 'communities', element: <CommunitiesPage /> },
      { path: 'enterprise', element: <EnterprisePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'for-engineers', element: <ForEngineersPage /> },
      { path: 'contact', element: <ContactPage /> },
    ],
  },
  {
    path: 'login',
    element: <LoginRoutesLayout />,
    children: [
      {
        element: <PortalLoginShell />,
        children: [
          { index: true, element: <Navigate to="/login/portal" replace /> },
          { path: 'portals', element: <Navigate to="/login/portal" replace /> },
          { path: 'portals/admin', element: <Navigate to="/login/portal" replace /> },
          { path: 'portals/team', element: <Navigate to="/login/portal" replace /> },
          { path: 'portal', element: <StaffPortalLoginPage /> },
          { path: 'engineers', element: <Navigate to="/login/client" replace /> },
          { path: 'client', element: <MarketingLoginPage variant="client" /> },
          { path: 'client/signup', element: <ClientSignupPage /> },
          { path: 'client/signup/success', element: <ClientSignupSuccessPage /> },
        ],
      },
    ],
  },
  {
    path: 'admin',
    children: [
      {
        element: <StaffAuthShell />,
        children: [
          { path: 'login', element: <AdminLoginPage /> },
          { path: 'forgot-password', element: <AdminForgotPasswordPage /> },
          { path: 'reset-password', element: <AdminResetPasswordPage /> },
        ],
      },
      {
        element: <ProtectedAdminShell />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'candidates', element: <AdminCandidatesPage /> },
          { path: 'candidates/import', element: <AdminCandidateCsvImportPage /> },
          { path: 'candidates/new', element: <Navigate to="/admin/candidates/import" replace /> },
          { path: 'candidates/:id/edit', element: <AddCandidatePage /> },
          { path: 'candidates/:id', element: <AdminCandidateDetailPage /> },
          { path: 'candidate-approvals', element: <CandidateApprovalsPage /> },
          { path: 'clients', element: <AdminClientsPage /> },
          { path: 'clients/:id', element: <AdminClientDetailPage /> },
          {
            path: 'client-enquiries',
            element: <ClientEnquiriesRoute redirectTo="/admin" />,
          },
          {
            path: 'client-enquiries/:id',
            element: <ClientEnquiryDetailRoute redirectTo="/admin" />,
          },
          { path: 'deployments', element: <AdminDeploymentsPage /> },
          { path: 'trials', element: <TrialsPage /> },
          { path: 'evaluations', element: <AdminEvaluationsPage /> },
          { path: 'background-checks', element: <AdminBackgroundChecksPage /> },
          // Extras moved to Super Admin; Organizations removed for MVP
          { path: 'margin', element: <Navigate to="/super-admin/reports?tab=margin" replace /> },
          { path: 'users', element: <Navigate to="/super-admin/users" replace /> },
          { path: 'organizations', element: <Navigate to="/admin" replace /> },
          {
            path: 'skill-communities',
            element: <Navigate to="/super-admin/platform-settings?tab=communities" replace />,
          },
          { path: 'audit-logs', element: <Navigate to="/super-admin/audit-logs" replace /> },
          {
            path: 'settings',
            element: <Navigate to="/super-admin/platform-settings" replace />,
          },
        ],
      },
    ],
  },
  {
    path: 'super-admin',
    element: <ProtectedSuperAdminShell />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <SuperAdminDashboardPage /> },
      { path: 'users', element: <SuperAdminUsersPage /> },
      { path: 'users/new', element: <SuperAdminUserFormPage /> },
      { path: 'users/:id', element: <SuperAdminUserFormPage /> },
      {
        path: 'roles',
        children: [
          { index: true, element: <SuperAdminRolesPage /> },
          { path: 'permission-matrix', element: <Navigate to="/super-admin/roles" replace /> },
          { path: ':role', element: <SuperAdminRoleDetailPage /> },
        ],
      },
      { path: 'clients', element: <SuperAdminClientsPage /> },
      { path: 'clients/new', element: <SuperAdminClientFormPage /> },
      { path: 'clients/:id/edit', element: <SuperAdminClientFormPage /> },
      { path: 'clients/:id', element: <SuperAdminClientFormPage /> },
      { path: 'client-enquiries', element: <ClientEnquiriesRoute redirectTo="/super-admin/dashboard" /> },
      { path: 'client-enquiries/:id', element: <ClientEnquiryDetailRoute redirectTo="/super-admin/dashboard" /> },
      { path: 'candidates', element: <SuperAdminCandidatesPage /> },
      { path: 'candidates/pending', element: <SuperAdminPendingCandidatesPage /> },
      { path: 'candidates/import', element: <SuperAdminCandidateCsvImportPage /> },
      { path: 'candidates/new', element: <AddCandidatePage /> },
      { path: 'candidates/:id/edit', element: <AddCandidatePage /> },
      { path: 'candidates/:id', element: <SuperAdminCandidateDetailPage /> },
      { path: 'evaluations', element: <SuperAdminEvaluationsPage /> },
      { path: 'background-checks', element: <SuperAdminBackgroundChecksPage /> },
      {
        path: 'skill-communities',
        element: <Navigate to="/super-admin/platform-settings?tab=communities" replace />,
      },
      { path: 'trials', element: <SuperAdminTrialsPage /> },
      { path: 'deployments', element: <SuperAdminDeploymentsPage /> },
      { path: 'data-import', element: <SuperAdminDataImportPage /> },
      { path: 'oorwin-sync', element: <Navigate to="/super-admin/data-import" replace /> },
      { path: 'reports', element: <SuperAdminReportsPage /> },
      { path: 'margin', element: <Navigate to="/super-admin/reports?tab=margin" replace /> },
      { path: 'audit-logs', element: <SuperAdminAuditLogsPage /> },
      { path: 'icons', element: <SuperAdminIconsPage /> },
      { path: 'platform-settings', element: <SuperAdminSettingsPage /> },
      { path: 'settings', element: <Navigate to="/super-admin/platform-settings" replace /> },
    ],
  },
  {
    path: 'recruiter',
    children: [
      {
        element: <StaffAuthShell />,
        children: [
          { path: 'login', element: <RecruiterLoginPage /> },
          { path: 'forgot-password', element: <PortalForgotPasswordPage portal="RECRUITER" /> },
          { path: 'reset-password', element: <PortalResetPasswordPage portal="RECRUITER" /> },
        ],
      },
      {
        element: <ProtectedRecruiterShell />,
        children: [
          { index: true, element: <RecruiterDashboardPage /> },
          { path: 'candidates', element: <RecruiterCandidatesPage /> },
          { path: 'candidates/import', element: <RecruiterCandidateCsvImportPage /> },
          { path: 'candidates/new', element: <Navigate to="/recruiter/candidates/import" replace /> },
          { path: 'candidates/:id/edit', element: <AddCandidatePage /> },
          { path: 'candidates/:id', element: <CandidateDetailPage /> },
          { path: 'evaluations', element: <EvaluationsPage /> },
          { path: 'background-checks', element: <BackgroundChecksPage /> },
          { path: 'clients', element: <RecruiterClientsPage /> },
          { path: 'trials', element: <RecruiterTrialsPage /> },
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
        children: [
          { path: 'login', element: <Navigate to="/login/client" replace /> },
          { path: 'forgot-password', element: <PortalForgotPasswordPage portal="CLIENT" /> },
          { path: 'reset-password', element: <PortalResetPasswordPage portal="CLIENT" /> },
        ],
      },
      {
        element: <ProtectedClientShell />,
        children: [
          { index: true, element: <ClientDashboardPage /> },
          { path: 'search', element: <CandidateSearchPage /> },
          { path: 'candidates/:id', element: <ClientCandidateDetailPage /> },
          { path: 'trials', element: <TrialRequestsPage /> },
          { path: 'deployments', element: <ClientDeploymentsPage /> },
        ],
      },
    ],
  },
  {
    path: 'sales',
    children: [
      {
        element: <StaffAuthShell />,
        children: [
          { path: 'login', element: <SalesLoginPage /> },
          { path: 'forgot-password', element: <PortalForgotPasswordPage portal="SALES" /> },
          { path: 'reset-password', element: <PortalResetPasswordPage portal="SALES" /> },
        ],
      },
      {
        element: <ProtectedSalesShell />,
        children: [
          { index: true, element: <SalesDashboardPage /> },
          { path: 'clients', element: <SalesClientsPage /> },
          { path: 'candidates', element: <SalesCandidatesPage /> },
          {
            path: 'client-enquiries',
            element: <ClientEnquiriesRoute redirectTo="/sales" />,
          },
          {
            path: 'client-enquiries/:id',
            element: <ClientEnquiryDetailRoute redirectTo="/sales" />,
          },
          { path: 'clients/:id', element: <SalesClientDetailPage /> },
          { path: 'trials', element: <SalesTrialsPage /> },
          { path: 'deployments', element: <SalesDeploymentsPage /> },
          { path: 'margin', element: <SalesMarginReportPage /> },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
