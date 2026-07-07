import { getClientCandidateProfile } from '@bestal/mock-data';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClientCandidateProfileView } from '../../components/client/ClientCandidateProfileView';
import { RequestInterviewDialog } from '../../components/client/RequestInterviewDialog';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useClientInterviewRequests, useClientTrialRequests } from '../../hooks/useClientEngagementRequests';
import { useClientShortlist } from '../../hooks/useClientShortlist';
import { useDemoToast } from '../../lib/use-demo-toast';

export function CandidateDetailPage() {
  const { id } = useParams();
  const candidateId = Number(id);
  const profile = getClientCandidateProfile(candidateId);
  const { isShortlisted, toggleShortlist } = useClientShortlist();
  const { addRequest: addInterviewRequest } = useClientInterviewRequests();
  const { addRequest: addTrialRequest } = useClientTrialRequests();
  const { show } = useDemoToast();
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [trialOpen, setTrialOpen] = useState(false);

  if (!profile) {
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

  return (
    <>
      <ClientCandidateProfileView
        profile={profile}
        shortlisted={isShortlisted(candidateId)}
        onShortlist={() => toggleShortlist(candidateId)}
        onInterview={() => setInterviewOpen(true)}
        onPilot={() => setTrialOpen(true)}
      />

      <RequestInterviewDialog
        open={interviewOpen}
        onClose={() => setInterviewOpen(false)}
        candidateName={profile.fullName}
        onSubmit={(values) => {
          addInterviewRequest(candidateId, profile.fullName, values);
          show(`Interview requested — ${profile.fullName} (demo)`);
          setInterviewOpen(false);
        }}
      />
      <RequestTrialDialog
        open={trialOpen}
        onClose={() => setTrialOpen(false)}
        candidateName={profile.fullName}
        onSubmit={(values) => {
          addTrialRequest(candidateId, profile.fullName, values);
          show(`Trial requested — ${profile.fullName} (demo)`);
          setTrialOpen(false);
        }}
      />
    </>
  );
}
