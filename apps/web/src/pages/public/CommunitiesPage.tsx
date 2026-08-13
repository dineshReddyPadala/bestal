import type { ReactNode } from 'react';
import { PageMeta } from '../../components/PageMeta';
import { COMMUNITY_DETAILS } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function MktWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1150px] px-[22px] sm:px-[34px] ${className}`}>{children}</div>
  );
}

export function CommunitiesPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.communities.title} description={PAGE_SEO.communities.description} />
      <MktWrap className="mkt-page-hd max-w-[860px]">
        <div className="mkt-eyebrow">Engineering communities</div>
        <h1 className="mt-4">
          Engineers, organised by discipline
        </h1>
        <p className="mkt-lead mt-[26px]">
          Not a general résumé database. Every engineer belongs to a specialist community with its
          own tests and its own outside testers.
        </p>
      </MktWrap>

      <section className="mkt-section">
        <MktWrap>
          <div className="mkt-g2t gap-[22px]">
            {COMMUNITY_DETAILS.slice(0, 6).map((community) => (
              <div key={community.num} className="mkt-card">
                <div className="mkt-eyebrow">{community.num}</div>
                <h3 className="mt-3">{community.name}</h3>
                <p className="mt-3">{community.body}</p>
              </div>
            ))}
          </div>
          <div className="mkt-card mt-[22px]">
            <div className="mkt-eyebrow">{COMMUNITY_DETAILS[6]?.num}</div>
            <h3 className="mt-3">{COMMUNITY_DETAILS[6]?.name}</h3>
            <p className="mt-3">{COMMUNITY_DETAILS[6]?.body}</p>
          </div>
        </MktWrap>
      </section>
    </>
  );
}
