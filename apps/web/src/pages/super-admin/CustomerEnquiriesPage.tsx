import { cn } from '@bestal/shared-utils';
import { useDashboardHeaderLeading } from '@bestal/ui';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SuperAdminClientEnquiriesPage } from './ClientEnquiriesPage';
import { SuperAdminContactMessagesPage } from './ContactMessagesPage';

const TAB_CLIENT = 'client-enquiry';
const TAB_CONTACT = 'contact-us';

const TABS = [
  { id: TAB_CLIENT, label: 'Client Enquiry' },
  { id: TAB_CONTACT, label: 'Contact Us' },
] as const;

export function CustomerEnquiriesPage() {
  const [params, setParams] = useSearchParams();
  const activeTab = params.get('tab') === TAB_CONTACT ? TAB_CONTACT : TAB_CLIENT;

  const headerLeading = useMemo(
    () => (
      <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
        Customer Enquiries
      </h1>
    ),
    [],
  );
  useDashboardHeaderLeading(headerLeading);

  function setActiveTab(tabId: string) {
    setParams(tabId === TAB_CLIENT ? {} : { tab: tabId }, { replace: true });
  }

  return (
    <div className="flex h-[calc(100svh-var(--shell-header-h))] min-h-0 min-w-0 flex-col overflow-hidden bg-white">
      <div className="shrink-0 px-5 pt-4 sm:px-6">
        <div className="inline-flex h-auto min-h-9 max-w-full flex-wrap items-center gap-1 rounded-lg bg-muted p-1 text-muted-foreground">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-sm'
                  : 'hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-4 pt-3 sm:px-6">
        {activeTab === TAB_CLIENT ? (
          <SuperAdminClientEnquiriesPage embedded />
        ) : (
          <SuperAdminContactMessagesPage embedded />
        )}
      </div>
    </div>
  );
}
