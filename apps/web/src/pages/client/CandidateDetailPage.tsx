import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClientCandidateProfileView } from '../../components/client/ClientCandidateProfileView';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useCandidate } from '../../hooks/api/useCandidates';
import { useClientTrialRequests } from '../../hooks/useClientEngagementRequests';
import { mapCandidateDtoToClientProfile } from '../../lib/client-candidate-profile';
import { useDemoToast } from '../../lib/use-demo-toast';

export function CandidateDetailPage() {
  const { id } = useParams();
  const candidateId = Number(id);
  const { user } = useAuth();
  const { data: candidate, isLoading, isError } = useCandidate(candidateId);
  const { addRequest: addTrialRequest } = useClientTrialRequests();
  const { show } = useDemoToast();
  const [trialOpen, setTrialOpen] = useState(false);
  const canRequestTrial = user?.clientId != null;

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
        canRequestTrial={canRequestTrial}
        onTrial={() => setTrialOpen(true)}
      />

      <RequestTrialDialog
        open={trialOpen}
        onClose={() => setTrialOpen(false)}
        candidateName={profile.fullName}
        onSubmit={async (values) => {
          await addTrialRequest(candidateId, profile.fullName, values);
          show(`Trial requested — ${profile.fullName}`);
        }}
      />
    </>
  );
}
