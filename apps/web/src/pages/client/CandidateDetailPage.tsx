import { useMemo, useState } from 'react';
import { Home } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useDashboardHeaderLeading } from '@bestal/ui';
import { ClientCandidateProfileView } from '../../components/client/ClientCandidateProfileView';
import { RequestDeploymentDialog } from '../../components/client/RequestDeploymentDialog';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useAuth } from '../../contexts/AuthContext';
import { useCandidate } from '../../hooks/api/useCandidates';
import { useDeploymentMutations, useDeploymentsList } from '../../hooks/api/useDeployments';
import { usePermissions } from '../../hooks/usePermissions';
import { useClientTrialRequests } from '../../hooks/useClientEngagementRequests';
import {
  deploymentRequestBlockMessage,
  getDeploymentRequestBlockReason,
  hasBlockingTrialForCandidate,
  trialRequestBlockMessage,
} from '../../lib/client-engagement-gates';
import { getApiErrorMessage } from '../../lib/api/errors';
import { mapCandidateDtoToClientProfile } from '../../lib/client-candidate-profile';
import { useDemoToast } from '../../lib/use-demo-toast';

export function CandidateDetailPage() {
  const { id } = useParams();
  const candidateId = Number(id);
  const { user } = useAuth();
  const { has } = usePermissions();
  const { data: candidate, isLoading, isError } = useCandidate(candidateId);
  const { addRequest: addTrialRequest, trials } = useClientTrialRequests();
  const deploymentMutations = useDeploymentMutations();
  const { data: deploymentsData } = useDeploymentsList({
    limit: 100,
    ...(user?.clientId ? { clientId: user.clientId } : {}),
  });
  const { show, showError } = useDemoToast();
  const [trialOpen, setTrialOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);

  const clientLinked = user?.clientId != null;
  const canRequestTrial = clientLinked;
  const canRequestDeployment = clientLinked && has('deployments:request');

  useDashboardHeaderLeading(
    useMemo(
      () => (
        <nav className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <Home className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-muted-foreground/60">/</span>
          <Link to="/client/search" className="truncate hover:text-foreground">
            Candidate Search
          </Link>
          <span className="text-muted-foreground/60">/</span>
          <span className="truncate font-semibold text-foreground">Profile Summary</span>
        </nav>
      ),
      [],
    ),
  );

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
  const trialBlocked = hasBlockingTrialForCandidate(candidateId, trials);
  const deploymentBlock = getDeploymentRequestBlockReason(
    candidateId,
    deploymentsData?.data ?? [],
  );

  return (
    <>
      <ClientCandidateProfileView
        profile={profile}
        canRequestTrial={canRequestTrial}
        canRequestDeployment={canRequestDeployment}
        trialBlockReason={trialRequestBlockMessage(trialBlocked)}
        deploymentBlockReason={deploymentRequestBlockMessage(deploymentBlock)}
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
