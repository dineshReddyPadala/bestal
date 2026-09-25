import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ROUTES } from '@/constants/routes';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const ConsultingPage = lazy(() => import('@/pages/ConsultingPage').then((m) => ({ default: m.ConsultingPage })));
const DeliveryPage = lazy(() => import('@/pages/DeliveryPage').then((m) => ({ default: m.DeliveryPage })));
const TalentPage = lazy(() => import('@/pages/TalentPage').then((m) => ({ default: m.TalentPage })));
const CommunitiesPage = lazy(() => import('@/pages/CommunitiesPage').then((m) => ({ default: m.CommunitiesPage })));
const TrustPage = lazy(() => import('@/pages/TrustPage').then((m) => ({ default: m.TrustPage })));
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const HelpPage = lazy(() => import('@/pages/HelpPage').then((m) => ({ default: m.HelpPage })));
const CandidatePage = lazy(() => import('@/pages/CandidatePage').then((m) => ({ default: m.CandidatePage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const WorkspacePage = lazy(() => import('@/pages/WorkspacePage').then((m) => ({ default: m.WorkspacePage })));
const PrivacyPage = lazy(() => import('@/pages/LegalPages').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('@/pages/LegalPages').then((m) => ({ default: m.TermsPage })));
const CookiesPage = lazy(() => import('@/pages/LegalPages').then((m) => ({ default: m.CookiesPage })));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.consulting} element={<ConsultingPage />} />
        <Route path={ROUTES.delivery} element={<DeliveryPage />} />
        <Route path={ROUTES.talent} element={<TalentPage />} />
        <Route path={ROUTES.communities} element={<CommunitiesPage />} />
        <Route path={ROUTES.trust} element={<TrustPage />} />
        <Route path={ROUTES.about} element={<AboutPage />} />
        <Route path={ROUTES.help} element={<HelpPage />} />
        <Route path={ROUTES.candidate} element={<CandidatePage />} />
        <Route path={ROUTES.contact} element={<ContactPage />} />
        <Route path={ROUTES.workspace} element={<WorkspacePage />} />
        <Route path={ROUTES.privacy} element={<PrivacyPage />} />
        <Route path={ROUTES.terms} element={<TermsPage />} />
        <Route path={ROUTES.cookies} element={<CookiesPage />} />
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Route>
    </Routes>
  );
}
