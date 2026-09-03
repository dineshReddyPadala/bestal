import { publicJobs } from '@bestal/mock-data';
import { ArrowLeft, Briefcase, Clock, MapPin, Users } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import { openCareersEmail } from '../../lib/careers-copy';
import { getCareersJobDescription } from '../../lib/careers-job-descriptions';
import { formatDate } from '@bestal/shared-utils';

export function CareersJobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const job = publicJobs.find((entry) => entry.slug === slug);

  if (!job) {
    return (
      <div className="mkt-careers-page">
        <PageMeta title="Job Not Found | BesTal" description="This role is no longer available." />
        <MktShell className="mkt-careers-detail-empty">
          <h1>Job not found</h1>
          <Link to="/careers" className="mkt-careers-detail-back-link">
            Back to current openings
          </Link>
        </MktShell>
      </div>
    );
  }

  const description = getCareersJobDescription(job);

  return (
    <div className="mkt-careers-page mkt-careers-detail-page">
      <PageMeta title={`${job.title} | BesTal Careers`} description={description.aboutRole.slice(0, 160)} />

      <section className="mkt-careers-detail-band">
        <MktShell>
          <Link to="/careers" className="mkt-careers-detail-back">
            <ArrowLeft strokeWidth={2} aria-hidden="true" />
            Back to openings
          </Link>

          <article className="mkt-careers-detail-hero">
            <div className="mkt-careers-detail-hero-main">
              <p className="mkt-careers-detail-eyebrow">{job.skillCommunity}</p>
              <h1>{description.title}</h1>
              <p className="mkt-careers-detail-company">BesTal</p>

              <div className="mkt-careers-detail-meta">
                <span>
                  <Briefcase strokeWidth={2} aria-hidden="true" />
                  {description.experience}
                </span>
                <span>
                  <MapPin strokeWidth={2} aria-hidden="true" />
                  {description.location}
                </span>
                <span>
                  <Clock strokeWidth={2} aria-hidden="true" />
                  Posted {formatDate(job.postedAt)}
                </span>
                <span>
                  <Users strokeWidth={2} aria-hidden="true" />
                  {job.applicants}+ applicants
                </span>
              </div>

              <div className="mkt-careers-detail-foot">
                <span>{job.engagementType.replace('_', ' ')}</span>
                <span>Openings: 1</span>
              </div>
            </div>

            <div className="mkt-careers-detail-hero-actions">
              <button type="button" className="mkt-careers-detail-apply" onClick={openCareersEmail}>
                Apply
              </button>
            </div>
          </article>
        </MktShell>
      </section>

      <section className="mkt-careers-detail-body">
        <MktShell className="mkt-careers-detail-layout">
          <div className="mkt-careers-detail-content">
            <section className="mkt-careers-jd-section">
              <h2>Job highlights</h2>
              <ul className="mkt-careers-detail-highlights">
                {description.requirements.slice(0, 4).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mkt-careers-jd-section">
              <h2>Who are we?</h2>
              <p>{description.whoWeAre}</p>
            </section>

            <dl className="mkt-careers-jd-meta mkt-careers-detail-meta-grid">
              <div>
                <dt>Job Level</dt>
                <dd>{description.jobLevel}</dd>
              </div>
              <div>
                <dt>Experience</dt>
                <dd>{description.experience}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{description.location}</dd>
              </div>
            </dl>

            <section className="mkt-careers-jd-section">
              <h2>Job description</h2>
              <p>{description.aboutRole}</p>
            </section>

            <section className="mkt-careers-jd-section">
              <h2>Your key responsibilities</h2>
              <ul>
                {description.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mkt-careers-jd-section">
              <h2>What to bring</h2>
              <ul>
                {description.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="mkt-careers-detail-aside">
            <div className="mkt-careers-detail-aside-card">
              <p className="mkt-careers-detail-aside-label">Ready to apply?</p>
              <button type="button" className="mkt-careers-detail-apply" onClick={openCareersEmail}>
                Apply Now
              </button>
              <p className="mkt-careers-detail-aside-note">
                Applications reviewed within 48 hours.
              </p>
            </div>
          </aside>
        </MktShell>
      </section>
    </div>
  );
}
