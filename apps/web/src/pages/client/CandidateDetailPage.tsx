import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClientCandidateProfileView } from '../../components/client/ClientCandidateProfileView';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useCandidate } from '../../hooks/api/useCandidates';
import { useClientTrialRequests } from '../../hooks/useClientEngagementRequests';
import { useClientShortlist } from '../../hooks/useClientShortlist';
import { mapCandidateDtoToClientProfile } from '../../lib/client-candidate-profile';
import { useDemoToast } from '../../lib/use-demo-toast';

export function CandidateDetailPage() {
  const { id } = useParams();
  const candidateId = Number(id);
  const { data: candidate, isLoading, isError } = useCandidate(candidateId);
  const { isShortlisted, toggleShortlist } = useClientShortlist();
  const { addRequest: addTrialRequest } = useClientTrialRequests();
  const { show } = useDemoToast();
  const [trialOpen, setTrialOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading candidate…</p>
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Candidate not found or not visible to clients.</p>
        <Link
          to="/client/search"
          className="mt-4 inline-flex text-sm font-medium text-brand hover:underline"
        >
          Back to search
        </Link>
      </div>
    );
  }

  const profile = mapCandidateDtoToClientProfile(candidate);

  return (
    <>
      <ClientCandidateProfileView
        profile={profile}
        shortlisted={isShortlisted(candidateId)}
        onShortlist={() => {
          void toggleShortlist(candidateId);
        }}
        onPilot={() => setTrialOpen(true)}
      />

      <RequestTrialDialog
        open={trialOpen}
        onClose={() => setTrialOpen(false)}
        candidateName={profile.fullName}
        onSubmit={(values) => {
          addTrialRequest(candidateId, profile.fullName, values);
          show(`Trial requested — ${profile.fullName}`);
          setTrialOpen(false);
        }}
      />
    </>
  );
}
