import { PageMeta } from '../../components/PageMeta';
import { MarketingPortalOptionList } from '../../components/marketing/MarketingPortalOptionList';
import { SplitLoginLayout } from '../../components/marketing/SplitLoginLayout';
import { SplitLoginPanel } from '../../components/marketing/SplitLoginPanel';
import { useAuth } from '../../contexts/AuthContext';
import { getTeamPortals } from '../../lib/login-portals';

/** Split-screen team portal picker (Image 1 — Admin, Sales, Recruiter, Client). */
export function SplitTeamPortalsPage() {
  const { user } = useAuth();

  const adminHref =
    user && (user.portal === 'ADMIN' || user.role === 'SUPER_ADMIN') ? '/admin' : '/admin/login';

  const clientHref = user && user.portal === 'CLIENT' ? '/client' : '/client/login';

  const portals = getTeamPortals({ adminHref, clientHref });

  return (
    <>
      <PageMeta title="Sign In | BesTal" description="Select your BesTal portal." noIndex />
      <SplitLoginLayout>
        <SplitLoginPanel wide>
          <MarketingPortalOptionList portals={portals} />
        </SplitLoginPanel>
      </SplitLoginLayout>
    </>
  );
}
