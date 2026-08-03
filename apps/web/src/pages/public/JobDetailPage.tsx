import { publicJobs } from '@bestal/mock-data';
import { Button } from '@bestal/ui';
import { Container } from '../../components/Container';
import { formatCurrency, formatDate } from '@bestal/shared-utils';
import { ArrowLeft, Briefcase, CheckCircle2, Clock, MapPin, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

function formatRate(job: (typeof publicJobs)[number]) {
  if (job.engagementType === 'PERMANENT') {
    return `${formatCurrency(job.rateMin, job.currency)} – ${formatCurrency(job.rateMax, job.currency)} /yr`;
  }
  return `${formatCurrency(job.rateMin, job.currency)} – ${formatCurrency(job.rateMax, job.currency)}/hr`;
}

export function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const job = publicJobs.find((j) => j.slug === slug);

  if (!job) {
    return (
      <Container className="py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Job not found</h1>
        <Link to="/jobs" className="mt-4 inline-block text-brand hover:underline">
          Back to open roles
        </Link>
      </Container>
    );
  }

  return (
    <>
      <section className="border-b border-border bg-muted/30 py-8">
        <Container size="narrow">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to open roles
          </Link>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container size="narrow">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <div className="flex-1">
              <p className="text-sm font-medium text-brand">{job.skillCommunity}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {job.title}
              </h1>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                  {job.remote && ' · Remote OK'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  {job.engagementType}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Posted {formatDate(job.postedAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {job.applicants} applicants
                </span>
              </div>

              <div className="mt-10">
                <h2 className="text-lg font-semibold text-foreground">About this role</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{job.description}</p>
              </div>

              <div className="mt-10">
                <h2 className="text-lg font-semibold text-foreground">Requirements</h2>
                <ul className="mt-4 space-y-3">
                  {job.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-3 text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="lg:w-80">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-elevated">
                <p className="text-sm text-muted-foreground">Compensation</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{formatRate(job)}</p>
                <Button to="/contact" size="lg" className="mt-6 w-full">
                  Apply Now
                </Button>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Applications reviewed within 48 hours
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
