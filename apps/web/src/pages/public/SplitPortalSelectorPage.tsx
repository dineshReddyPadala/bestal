import { PageMeta } from '../../components/PageMeta';
import { MarketingPortalOptionList } from '../../components/marketing/MarketingPortalOptionList';
import { SplitLoginLayout } from '../../components/marketing/SplitLoginLayout';
import { SplitLoginPanel } from '../../components/marketing/SplitLoginPanel';
import { TOP_LEVEL_PORTALS } from '../../lib/login-portals';

/** Split-screen top-level portal picker (Image 2 — Dashboard Overview + Login). */
export function SplitPortalSelectorPage() {
  return (
    <>
      <PageMeta title="Sign In | BesTal" description="Select your BesTal portal." noIndex />
      <SplitLoginLayout>
        <SplitLoginPanel wide>
          <MarketingPortalOptionList portals={TOP_LEVEL_PORTALS} />
        </SplitLoginPanel>
      </SplitLoginLayout>
    </>
  );
}
