import {
  backgroundChecks,
  candidates,
  deployments,
  evaluations,
  trials,
} from '@bestal/mock-data';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import {
  Avatar,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  PageHeader,
  SkillBadge,
  StatusBadge,
  Tabs,
} from '@bestal/ui';
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export function CandidateDetailPage() {
  const { id } = useParams();
  const candidate = candidates.find((c) => c.id === Number(id));

  if (!candidate) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Link
          to="/admin/candidates"
          className="mt-4 inline-flex text-sm font-medium text-brand hover:underline"
        >
          Back to candidates
        </Link>
      </div>
    );
  }

  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const candidateEvals = evaluations.filter((e) => e.candidateId === candidate.id);
  const candidateBgvs = backgroundChecks.filter((b) => b.candidateId === candidate.id);
  const candidateTrials = trials.filter((t) => t.candidateId === candidate.id);
  const candidateDeployments = deployments.filter((d) => d.candidateId === candidate.id);

  return (
    <div>
      <PageHeader
        title={fullName}
        description={candidate.headline}
        breadcrumbs={
          <Link
            to="/admin/candidates"
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to candidates
          </Link>
        }
        actions={
          <div className="flex gap-2">
            <StatusBadge status={candidate.visibility} />
            <StatusBadge status={candidate.approvalStatus} />
            <StatusBadge status={candidate.status} />
          </div>
        }
      />

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{candidate.summary}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills & Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <SkillBadge
                    key={skill.skillCommunityId}
                    name={skill.skillCommunityName}
                    proficiency={skill.proficiencyLevel}
                    isPrimary={skill.isPrimary}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                tabs={[
                  {
                    id: 'evaluations',
                    label: `Evaluations (${candidateEvals.length})`,
                    content: (
                      <DataTable>
                        <DataTableHeader>
                          <DataTableRow>
                            <DataTableHead>Community</DataTableHead>
                            <DataTableHead>Evaluator</DataTableHead>
                            <DataTableHead>Score</DataTableHead>
                            <DataTableHead>Status</DataTableHead>
                          </DataTableRow>
                        </DataTableHeader>
                        <DataTableBody>
                          {candidateEvals.length === 0 ? (
                            <DataTableRow>
                              <DataTableCell colSpan={4} className="text-muted-foreground">
                                No evaluations yet.
                              </DataTableCell>
                            </DataTableRow>
                          ) : (
                            candidateEvals.map((ev) => (
                              <DataTableRow key={ev.id}>
                                <DataTableCell>{ev.skillCommunity}</DataTableCell>
                                <DataTableCell>{ev.evaluatorName}</DataTableCell>
                                <DataTableCell>
                                  {ev.overallScore !== null ? `${ev.overallScore}/100` : '—'}
                                </DataTableCell>
                                <DataTableCell>
                                  <StatusBadge status={ev.status} />
                                </DataTableCell>
                              </DataTableRow>
                            ))
                          )}
                        </DataTableBody>
                      </DataTable>
                    ),
                  },
                  {
                    id: 'bgv',
                    label: `BGV (${candidateBgvs.length})`,
                    content: (
                      <DataTable>
                        <DataTableHeader>
                          <DataTableRow>
                            <DataTableHead>Type</DataTableHead>
                            <DataTableHead>Provider</DataTableHead>
                            <DataTableHead>Requested</DataTableHead>
                            <DataTableHead>Status</DataTableHead>
                          </DataTableRow>
                        </DataTableHeader>
                        <DataTableBody>
                          {candidateBgvs.length === 0 ? (
                            <DataTableRow>
                              <DataTableCell colSpan={4} className="text-muted-foreground">
                                No background checks yet.
                              </DataTableCell>
                            </DataTableRow>
                          ) : (
                            candidateBgvs.map((bgv) => (
                              <DataTableRow key={bgv.id}>
                                <DataTableCell>{bgv.type}</DataTableCell>
                                <DataTableCell>{bgv.provider}</DataTableCell>
                                <DataTableCell>{formatDate(bgv.requestedAt)}</DataTableCell>
                                <DataTableCell>
                                  <StatusBadge status={bgv.status} />
                                </DataTableCell>
                              </DataTableRow>
                            ))
                          )}
                        </DataTableBody>
                      </DataTable>
                    ),
                  },
                  {
                    id: 'trials',
                    label: `Trials (${candidateTrials.length})`,
                    content: (
                      <DataTable>
                        <DataTableHeader>
                          <DataTableRow>
                            <DataTableHead>Client</DataTableHead>
                            <DataTableHead>Title</DataTableHead>
                            <DataTableHead>Period</DataTableHead>
                            <DataTableHead>Status</DataTableHead>
                          </DataTableRow>
                        </DataTableHeader>
                        <DataTableBody>
                          {candidateTrials.length === 0 ? (
                            <DataTableRow>
                              <DataTableCell colSpan={4} className="text-muted-foreground">
                                No trials yet.
                              </DataTableCell>
                            </DataTableRow>
                          ) : (
                            candidateTrials.map((trial) => (
                              <DataTableRow key={trial.id}>
                                <DataTableCell>{trial.clientName}</DataTableCell>
                                <DataTableCell className="font-medium">{trial.title}</DataTableCell>
                                <DataTableCell className="text-muted-foreground">
                                  {formatDate(trial.startDate)} – {formatDate(trial.endDate)}
                                </DataTableCell>
                                <DataTableCell>
                                  <StatusBadge status={trial.status} />
                                </DataTableCell>
                              </DataTableRow>
                            ))
                          )}
                        </DataTableBody>
                      </DataTable>
                    ),
                  },
                  {
                    id: 'deployments',
                    label: `Deployments (${candidateDeployments.length})`,
                    content: (
                      <DataTable>
                        <DataTableHeader>
                          <DataTableRow>
                            <DataTableHead>Client</DataTableHead>
                            <DataTableHead>Title</DataTableHead>
                            <DataTableHead>Rate</DataTableHead>
                            <DataTableHead>Status</DataTableHead>
                          </DataTableRow>
                        </DataTableHeader>
                        <DataTableBody>
                          {candidateDeployments.length === 0 ? (
                            <DataTableRow>
                              <DataTableCell colSpan={4} className="text-muted-foreground">
                                No deployments yet.
                              </DataTableCell>
                            </DataTableRow>
                          ) : (
                            candidateDeployments.map((dep) => (
                              <DataTableRow key={dep.id}>
                                <DataTableCell>{dep.clientName}</DataTableCell>
                                <DataTableCell className="font-medium">{dep.title}</DataTableCell>
                                <DataTableCell>
                                  {formatCurrency(dep.rate, dep.currency)}/hr
                                </DataTableCell>
                                <DataTableCell>
                                  <StatusBadge status={dep.status} />
                                </DataTableCell>
                              </DataTableRow>
                            ))
                          )}
                        </DataTableBody>
                      </DataTable>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar name={fullName} src={candidate.photoUrl} size="lg" className="h-24 w-24" />
                <h2 className="mt-4 text-xl font-semibold">{fullName}</h2>
                <p className="text-sm text-muted-foreground">{candidate.email}</p>
              </div>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="inline-flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    {candidate.location}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Experience</dt>
                  <dd className="font-medium">{candidate.yearsExperience} years</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Expected rate</dt>
                  <dd className="font-medium">
                    {formatCurrency(candidate.expectedRate, candidate.currency)}/hr
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Available from</dt>
                  <dd className="font-medium">{formatDate(candidate.availableFrom)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Source</dt>
                  <dd>
                    <Badge variant="outline">{candidate.source}</Badge>
                  </dd>
                </div>
              </dl>

              {candidate.linkedinUrl && (
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 rounded-md border border-border py-2 text-sm font-medium hover:bg-muted/50"
                >
                  <ExternalLink className="h-4 w-4" />
                  LinkedIn Profile
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
