import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { COMMUNITY_DETAILS } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

export function CommunitiesPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.communities.title} description={PAGE_SEO.communities.description} />
      <MktShell className="mkt-page-hd mkt-shell-narrow">
        <div className="mkt-eyebrow">Engineering communities</div>
        <h1 className="mt-4">
          Engineers, organised by discipline
        </h1>
        <p className="mkt-lead mt-[26px]">
          Not a general résumé database. Every engineer belongs to a specialist community with its
          own tests and its own outside testers.
        </p>
      </MktShell>

      <section className="mkt-section">
        <MktShell>
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
        </MktShell>
      </section>
    </>
  );
}
