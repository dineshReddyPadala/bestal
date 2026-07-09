import { formatDate } from '@bestal/shared-utils';
import { PageHeader, SearchInput, StatusBadge } from '@bestal/ui';
import {
  Calendar,
  FlaskConical,
  Heart,
  Rocket,
  Sparkles,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PremiumStatCard } from '../../components/admin/PremiumStatCard';
import { useCandidatesList } from '../../hooks/api/useCandidates';
import { useDeploymentsList } from '../../hooks/api/useDeployments';
import { useInterviewsList } from '../../hooks/api/useInterviews';
import { useTrialsList } from '../../hooks/api/useTrials';
import { useDashboardUser } from '../../hooks/useDashboardUser';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, authUser } = useDashboardUser();
  const [searchQuery, setSearchQuery] = useState('');

  const candidates = useCandidatesList({ limit: 20, sort: '-createdAt' });
  const interviews = useInterviewsList({ limit: 20, sort: '-createdAt' });
  const trials = useTrialsList({ limit: 20 });
  const deployments = useDeploymentsList({ limit: 20 });

  const candidateRows = candidates.data?.data ?? [];
  const interviewRows = interviews.data?.data ?? [];
  const trialRows = trials.data?.data ?? [];
  const deploymentRows = deployments.data?.data ?? [];

  function handleQuickSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/client/search?q=${encodeURIComponent(q)}` : '/client/search');
  }

  const firstName = user.name.split(' ')[0] || 'there';

  return (
    <div className="min-h-full bg-muted/10">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description={
          authUser?.clientName
            ? `${authUser.clientName} — your talent engagement hub`
            : 'Your talent engagement hub'
        }
      />

      <div className="space-y-8 p-4 sm:p-6">
        <section>
          <form onSubmit={handleQuickSearch} className="mb-6 max-w-xl">
            <SearchInput
              placeholder="Search published talent…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </form>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <PremiumStatCard
              label="Available talent"
              value={candidateRows.length}
              icon={<Sparkles className="h-5 w-5" />}
              accent="violet"
            />
            <PremiumStatCard
              label="Interviews"
              value={interviewRows.length}
              icon={<Calendar className="h-5 w-5" />}
              accent="sky"
            />
            <PremiumStatCard
              label="Trials"
              value={trialRows.length}
              icon={<FlaskConical className="h-5 w-5" />}
              accent="amber"
            />
            <PremiumStatCard
              label="Deployments"
              value={deploymentRows.length}
              icon={<Rocket className="h-5 w-5" />}
              accent="emerald"
            />
            <PremiumStatCard
              label="Shortlisted"
              value="—"
              icon={<Heart className="h-5 w-5" />}
              accent="rose"
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent talent</h2>
              <Link to="/client/search" className="text-sm font-medium text-brand hover:underline">
                Browse all
              </Link>
            </div>
            <div className="space-y-3">
              {candidateRows.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  to={`/client/candidates/${c.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.headline || c.primarySkillCommunityName || c.email}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={c.visibility} />
                </Link>
              ))}
              {candidateRows.length === 0 && (
                <p className="text-sm text-muted-foreground">No published candidates yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-background p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your interviews</h2>
              <Link
                to="/client/interviews"
                className="text-sm font-medium text-brand hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {interviewRows.slice(0, 6).map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{i.candidateName}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.scheduledAt ? formatDate(i.scheduledAt) : 'Unscheduled'}
                    </p>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
              ))}
              {interviewRows.length === 0 && (
                <p className="text-sm text-muted-foreground">No interview requests yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
