import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClientCandidateProfileView } from '../../components/client/ClientCandidateProfileView';
import { RequestDeploymentDialog } from '../../components/client/RequestDeploymentDialog';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useCandidate } from '../../hooks/api/useCandidates';
import { useDeploymentMutations } from '../../hooks/api/useDeployments';
import { usePermissions } from '../../hooks/usePermissions';
import { useClientTrialRequests } from '../../hooks/useClientEngagementRequests';
import { getApiErrorMessage } from '../../lib/api/errors';
import { mapCandidateDtoToClientProfile } from '../../lib/client-candidate-profile';
import { useDemoToast } from '../../lib/use-demo-toast';

export function CandidateDetailPage() {
  const { id } = useParams();
  const candidateId = Number(id);
  const { user } = useAuth();
  const { has } = usePermissions();
  const { data: candidate, isLoading, isError } = useCandidate(candidateId);
  const { addRequest: addTrialRequest } = useClientTrialRequests();
  const deploymentMutations = useDeploymentMutations();
  const { show, showError } = useDemoToast();
  const [trialOpen, setTrialOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);

  const clientLinked = user?.clientId != null;
  const canRequestTrial = clientLinked;
  const canRequestDeployment = clientLinked && has('deployments:request');

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
        canRequestDeployment={canRequestDeployment}
        onTrial={() => setTrialOpen(true)}
        onRequestDeployment={() => setDeployOpen(true)}
      />

      <RequestTrialDialog
        open={trialOpen}
        onClose={() => setTrialOpen(false)}
        candidateName={profile.fullName}
        onSubmit={async (values) => {
          try {
            await addTrialRequest(candidateId, profile.fullName, values);
            show(`Free trial requested — ${profile.fullName}`);
          } catch (err) {
            showError(getApiErrorMessage(err, 'Free trial request failed'));
            throw err;
          }
        }}
      />

      <RequestDeploymentDialog
        open={deployOpen}
        onClose={() => setDeployOpen(false)}
        candidateName={profile.fullName}
        onSubmit={async (values) => {
          try {
            await deploymentMutations.request.mutateAsync({
              candidateId,
              roleTitle: values.roleTitle.trim(),
              placementType: values.placementType,
              startDate: values.startDate || undefined,
              endDate: values.endDate || undefined,
              workLocation: values.workLocation || undefined,
              expectedHoursPerWeek: values.expectedHoursPerWeek
                ? Number(values.expectedHoursPerWeek)
                : undefined,
              timezone: values.timezone || undefined,
              reportingManagerName: values.reportingManagerName || undefined,
              reportingManagerEmail: values.reportingManagerEmail || undefined,
            });
            show(`Deployment requested — ${profile.fullName}`);
          } catch (err) {
            showError(getApiErrorMessage(err, 'Deployment request failed'));
            throw err;
          }
        }}
      />
    </>
  );
}
