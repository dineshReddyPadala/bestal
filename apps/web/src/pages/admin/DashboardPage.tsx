import { formatDate } from '@bestal/shared-utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  StatCard,
  StatusBadge,
} from '@bestal/ui';
import {
  Brain,
  ClipboardCheck,
  FlaskConical,
  Rocket,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { useClientsList } from '../../hooks/api/useClients';
import { useDeploymentsList } from '../../hooks/api/useDeployments';
import { useBackgroundChecksList, useEvaluationsList } from '../../hooks/api/useEvaluations';
import { useTrialsList } from '../../hooks/api/useTrials';

export function DashboardPage() {
  const candidates = useCandidatesList({ limit: 100, sort: '-updatedAt' });
  const clients = useClientsList({ limit: 100 });
  const deployments = useDeploymentsList({ limit: 100 });
  const trials = useTrialsList({ limit: 100 });
  const evaluations = useEvaluationsList({ limit: 100 });
  const bgv = useBackgroundChecksList({ limit: 100 });

  const candidateRows = candidates.data?.data ?? [];
  const clientRows = clients.data?.data ?? [];
  const deploymentRows = deployments.data?.data ?? [];
  const trialRows = trials.data?.data ?? [];
  const evaluationRows = evaluations.data?.data ?? [];
  const bgvRows = bgv.data?.data ?? [];

  const pendingApprovals = candidateRows.filter(
    (c) =>
      c.approvalStatus === 'PENDING' &&
      Boolean(c.submittedForApprovalAt) &&
      c.profileStatus === 'PENDING_APPROVAL',
  ).length;
  const published = candidateRows.filter((c) => c.visibility === 'CLIENT_VISIBLE').length;
  const aiScreeningPending = candidateRows.filter((c) => {
    const status = (c.profileStatus ?? '').toUpperCase();
    return status.includes('AI') || status === 'DRAFT' || status === 'SCREENING';
  }).length;
  const pendingEvals = evaluationRows.filter((e) => !e.recommendation).length;
  const pendingBgv = bgvRows.filter((b) =>
    !['APPROVED', 'CLEARED', 'COMPLETED', 'REJECTED'].includes(
      String(b.status ?? '').toUpperCase(),
    ),
  ).length;
  const trialsRequested = trialRows.filter((t) => t.status === 'REQUESTED').length;
  const trialsApproved = trialRows.filter((t) => t.status === 'APPROVED').length;
  const trialsInProgress = trialRows.filter((t) => t.status === 'IN_PROGRESS').length;
  const trialsCompleted = trialRows.filter((t) => t.status === 'COMPLETED').length;
  const openTrials = trialsRequested + trialsApproved + trialsInProgress;
  const activeDeployments = deploymentRows.filter((d) => d.status === 'ACTIVE').length;

  const isLoading =
    candidates.isLoading ||
    clients.isLoading ||
    deployments.isLoading ||
    trials.isLoading ||
    evaluations.isLoading ||
    bgv.isLoading;

  return (
    <div className="min-h-full bg-white">
      <PageHeader title="Admin Dashboard" />

      <div className="space-y-8 p-4 sm:p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading live metrics…</p>
        ) : (
          <>
            <div>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Operations monitors</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Link to="/admin/candidates">
                  <StatCard
                    label="AI screening queue"
                    value={aiScreeningPending}
                    icon={<Brain className="h-5 w-5" />}
                  />
                </Link>
                <Link to="/admin/candidate-approvals">
                  <StatCard
                    label="Pending approvals"
                    value={pendingApprovals}
                    icon={<ClipboardCheck className="h-5 w-5" />}
                  />
                </Link>
                <Link to="/admin/background-checks">
                  <StatCard
                    label="BGV in progress"
                    value={pendingBgv}
                    icon={<ShieldCheck className="h-5 w-5" />}
                  />
                </Link>
                <Link to="/admin/evaluations">
                  <StatCard
                    label="Evaluations pending"
                    value={pendingEvals}
                    icon={<ClipboardCheck className="h-5 w-5" />}
                  />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Candidates"
                value={candidateRows.length}
                icon={<Users className="h-5 w-5" />}
              />
              <StatCard
                label="Published talent"
                value={published}
                icon={<UserCheck className="h-5 w-5" />}
              />
              <StatCard
                label="Active clients"
                value={clientRows.filter((c) => c.status === 'ACTIVE').length}
                icon={<Users className="h-5 w-5" />}
              />
              <StatCard
                label="Open trials"
                value={openTrials}
                icon={<FlaskConical className="h-5 w-5" />}
              />
              <StatCard
                label="Active deployments"
                value={activeDeployments}
                icon={<Rocket className="h-5 w-5" />}
              />
            </div>
            <div className="mt-4">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Trial analytics</h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Requested" value={trialsRequested} />
                <StatCard label="Approved" value={trialsApproved} />
                <StatCard label="In progress" value={trialsInProgress} />
                <StatCard label="Completed" value={trialsCompleted} />
              </div>
            </div>
          </>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent candidates</CardTitle>
              <Link to="/admin/candidates" className="text-sm font-medium text-brand hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidateRows.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  to={`/admin/candidates/${c.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                  <StatusBadge status={c.approvalStatus} />
                </Link>
              ))}
              {candidateRows.length === 0 && (
                <p className="text-sm text-muted-foreground">No candidates yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Open trials</CardTitle>
              <Link to="/admin/trials" className="text-sm font-medium text-brand hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {trialRows
                .filter((t) =>
                  ['REQUESTED', 'APPROVED', 'IN_PROGRESS'].includes(t.status),
                )
                .slice(0, 6)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{t.candidateName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.clientName}
                        {t.createdAt ? ` · ${formatDate(t.createdAt)}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              {openTrials === 0 && (
                <p className="text-sm text-muted-foreground">No open trials.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
