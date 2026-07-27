import { useState } from 'react';
import { CandidateListingView } from '../../components/candidates/CandidateListingView';
import { SalesAddToShortlistDialog } from '../../components/sales/SalesAddToShortlistDialog';
import type { CandidateListItem } from '../../lib/api/types';
import { useDemoToast } from '../../lib/use-demo-toast';

export function SalesCandidatesPage() {
  const { message, show } = useDemoToast();
  const [shortlistCandidate, setShortlistCandidate] = useState<CandidateListItem | null>(null);

  return (
  <>
    {message && (
      <div className="mx-6 mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {message}
      </div>
    )}
    <CandidateListingView
      title="Candidate Search"
      basePath="/sales/candidates"
      readOnly
      onAddToShortlist={(candidate) => setShortlistCandidate(candidate)}
    />
    <SalesAddToShortlistDialog
      open={shortlistCandidate != null}
      candidate={shortlistCandidate}
      onClose={() => setShortlistCandidate(null)}
      onSuccess={(msg) => show(msg)}
    />
  </>
  );
}
