import { publicJobs } from '@bestal/mock-data';
import { Container } from '../../components/Container';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import { Briefcase, Clock, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatRate(job: (typeof publicJobs)[number]) {
  if (job.engagementType === 'PERMANENT') {
    return `${formatCurrency(job.rateMin, job.currency)} – ${formatCurrency(job.rateMax, job.currency)} /yr`;
  }
  return `${formatCurrency(job.rateMin, job.currency)} – ${formatCurrency(job.rateMax, job.currency)}/hr`;
}

export function JobsPage() {
  return (
    <>
      <section className="bg-navy py-16 text-white lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Open Roles</h1>
            <p className="mt-4 text-lg text-white/75">
              Explore opportunities with BesTal&apos;s enterprise clients — remote-friendly, competitive rates.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container size="narrow">
          <div className="space-y-4">
            {publicJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.slug}`}
                className="group block rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-elevated"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground group-hover:text-brand">
                      {job.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{job.skillCommunity}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                        {job.remote && ' · Remote'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" />
                        {job.engagementType}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {job.applicants} applicants
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Posted {formatDate(job.postedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-semibold text-foreground">{formatRate(job)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
