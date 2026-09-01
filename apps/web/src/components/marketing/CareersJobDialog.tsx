import { X } from 'lucide-react';
import { useEffect } from 'react';
import type { PublicJob } from '@bestal/mock-data';
import { getCareersJobDescription } from '../../lib/careers-job-descriptions';
import { openCareersEmail } from '../../lib/careers-copy';

type CareersJobDialogProps = {
  job: PublicJob | null;
  onClose: () => void;
};

export function CareersJobDialog({ job, onClose }: CareersJobDialogProps) {
  useEffect(() => {
    if (!job) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [job, onClose]);

  if (!job) return null;

  const description = getCareersJobDescription(job);

  function handleApply() {
    openCareersEmail();
    onClose();
  }

  return (
    <div
      className="mkt-careers-jd-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="careers-jd-title"
      onClick={onClose}
    >
      <div className="mkt-careers-jd-card" onClick={(event) => event.stopPropagation()}>
        <div className="mkt-careers-jd-hd">
          <div>
            <p className="mkt-careers-jd-eyebrow">Job Description</p>
            <h2 id="careers-jd-title">{description.title}</h2>
          </div>
          <button type="button" className="mkt-careers-jd-close" aria-label="Close" onClick={onClose}>
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>

        <div className="mkt-careers-jd-body">
          <section className="mkt-careers-jd-section">
            <h3>Who are we?</h3>
            <p>{description.whoWeAre}</p>
          </section>

          <dl className="mkt-careers-jd-meta">
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
            <h3>About the Role</h3>
            <p>{description.aboutRole}</p>
          </section>

          <section className="mkt-careers-jd-section">
            <h3>Your Key Responsibilities</h3>
            <ul>
              {description.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="mkt-careers-jd-section">
            <h3>What To Bring</h3>
            <ul>
              {description.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mkt-careers-jd-foot">
          <button type="button" className="mkt-careers-jd-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="mkt-careers-jd-apply" onClick={handleApply}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
