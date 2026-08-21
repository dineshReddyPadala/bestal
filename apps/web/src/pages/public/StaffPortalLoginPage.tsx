import { PageMeta } from '../../components/PageMeta';
import { MarketingPortalOptionList } from '../../components/marketing/MarketingPortalOptionList';
import { SplitLoginLayout } from '../../components/marketing/SplitLoginLayout';
import { SplitLoginPanel } from '../../components/marketing/SplitLoginPanel';
import { useAuth } from '../../contexts/AuthContext';
import { getStaffTeamPortals } from '../../lib/login-portals';

/** Staff portal picker at /login/portal — Admin, Sales, Recruiter. */
export function StaffPortalLoginPage() {
  const { user } = useAuth();

  const adminHref =
    user && (user.portal === 'ADMIN' || user.role === 'SUPER_ADMIN') ? '/admin' : '/admin/login';

  const portals = getStaffTeamPortals({ adminHref });

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
