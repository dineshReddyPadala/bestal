import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { DemoEngineerCard } from '../../components/marketing/DemoEngineerCard';
import { PageMeta } from '../../components/PageMeta';
import { DEMO_ENGINEERS } from '../../lib/demo-engineers';
import { PAGE_SEO } from '../../lib/marketing-seo';

function MktWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1150px] px-[22px] sm:px-[34px] ${className}`}>{children}</div>
  );
}

export function SampleTalentPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.sampleTalent.title} description={PAGE_SEO.sampleTalent.description} />
      <MktWrap className="mkt-page-hd max-w-[860px]">
        <div className="mkt-eyebrow">Available engineers</div>
        <h1 className="mt-4">See the evidence yourself</h1>
        <p className="mkt-lead mt-[26px]">
          Complete profiles in the real format — test results, verification status, rate, start date
          and assigned time zone, exactly as they appear in the platform.
        </p>
        <p className="mkt-lead mt-4">
          The engineers below are fictional. They show the structure and depth of the evidence, not
          current capacity.
        </p>
        <div className="mkt-actions mt-[30px]">
          <Link to="/login" className="mkt-btn mkt-btn-primary mkt-btn-lg">
            Create a company account
          </Link>
          <Link to="/communities" className="mkt-btn mkt-btn-secondary mkt-btn-lg">
            Browse by discipline
          </Link>
        </div>
      </MktWrap>

      <section className="mkt-section">
        <MktWrap>
          <div className="mkt-g2t gap-6">
            {DEMO_ENGINEERS.map((engineer) => (
              <DemoEngineerCard key={engineer.initials} engineer={engineer} />
            ))}
          </div>
        </MktWrap>
      </section>
    </>
  );
}
