import { candidates, evaluations, getBestalScore } from '@bestal/mock-data';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  SkillBadge,
  StatusBadge,
} from '@bestal/ui';
import { ArrowLeft, Calendar, ExternalLink, Heart, MapPin, Star } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RequestInterviewDialog } from '../../components/client/RequestInterviewDialog';
import { RequestTrialDialog } from '../../components/client/RequestTrialDialog';
import { useClientShortlist } from '../../hooks/useClientShortlist';
import { getPrimaryCommunity, getScoreTier } from '../../lib/client-candidates';

export function CandidateDetailPage() {
  const { id } = useParams();
  const candidate = candidates.find((c) => c.id === Number(id));
  const { isShortlisted, toggleShortlist } = useClientShortlist();
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [trialOpen, setTrialOpen] = useState(false);

  if (!candidate) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Candidate not found.</p>
        <Link
          to="/client/search"
          className="mt-4 inline-flex text-sm font-medium text-brand hover:underline"
        >
          Back to search
        </Link>
      </div>
    );
  }

  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  const score = getBestalScore(candidate.id);
  const tier = getScoreTier(score);
  const community = getPrimaryCommunity(candidate);
  const candidateEvals = evaluations.filter((e) => e.candidateId === candidate.id);
  const shortlisted = isShortlisted(candidate.id);

  return (
    <div>
      <PageHeader
        title={fullName}
        description={candidate.headline}
        breadcrumbs={
          <Link
            to="/client/search"
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to search
          </Link>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant={shortlisted ? 'primary' : 'outline'}
              size="sm"
              onClick={() => toggleShortlist(candidate.id)}
            >
              <Heart className={`mr-1.5 h-4 w-4 ${shortlisted ? 'fill-current' : ''}`} />
              {shortlisted ? 'Shortlisted' : 'Shortlist'}
            </Button>
            <Button size="sm" onClick={() => setInterviewOpen(true)}>
              Request Interview
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTrialOpen(true)}>
              Request Trial
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-3">
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

          {candidateEvals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidateEvals.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{ev.skillCommunity}</p>
                      <p className="text-sm text-muted-foreground">{ev.evaluatorName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {ev.overallScore !== null && (
                        <span className="text-sm font-semibold">{ev.overallScore}/100</span>
                      )}
                      {ev.recommendation && <StatusBadge status={ev.recommendation} />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar name={fullName} src={candidate.photoUrl} size="lg" className="h-24 w-24" />
                <h2 className="mt-4 text-xl font-semibold">{fullName}</h2>
                <p className="text-sm text-muted-foreground">{candidate.email}</p>

                <div
                  className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    tier === 'elite'
                      ? 'bg-amber-50 text-amber-700'
                      : tier === 'strong'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  <Star className="h-4 w-4 fill-current" />
                  BesTal Score: {score}
                </div>
              </div>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Community</dt>
                  <dd className="text-right font-medium">{community}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="inline-flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    {candidate.location}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Experience</dt>
                  <dd className="font-medium">{candidate.yearsExperience} years</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Rate</dt>
                  <dd className="font-medium">
                    {formatCurrency(candidate.expectedRate, candidate.currency)}/hr
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Availability</dt>
                  <dd className="inline-flex items-center gap-1 font-medium">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(candidate.availableFrom)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <StatusBadge status={candidate.status} />
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
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

      <RequestInterviewDialog
        open={interviewOpen}
        onClose={() => setInterviewOpen(false)}
        candidateName={fullName}
      />
      <RequestTrialDialog
        open={trialOpen}
        onClose={() => setTrialOpen(false)}
        candidateName={fullName}
      />
    </div>
  );
}
