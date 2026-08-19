import { Link } from 'react-router-dom';
import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { ForwardArrow } from '../../components/ui/ForwardArrow';
import { HOME_COMMUNITIES } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function disciplinePath(name: string) {
  return `/sample-talent?discipline=${encodeURIComponent(name)}`;
}

export function CommunitiesPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.communities.title} description={PAGE_SEO.communities.description} />
      <div className="mkt-eng-page">
        <section className="mkt-white mkt-section">
          <MktShell>
            <div>
              <div className="max-w-[700px]">
                <div className="mkt-eng-label">Available Engineers</div>
                <h1 className="mt-3 mb-0">Engineers, organised by discipline</h1>
              </div>
              <p className="mkt-big mt-3 mkt-eng-banner-copy howitworks-body-style">
                Not a general résumé database. Every engineer belongs to a specialist community with its
                own tests and its own outside testers.
              </p>
              <p className="mkt-lead mt-4 mkt-eng-banner-copy howitworks-body-style">
                Choose a discipline to browse complete profiles — test results, verification status, rate,
                start date and assigned time zone.
              </p>
            </div>
          </MktShell>
        </section>

        <section className="mkt-cream mkt-section">
          <MktShell>
            <div className="mkt-g3">
              {HOME_COMMUNITIES.map((community) => (
                <Link key={community.name} to={disciplinePath(community.name)} className="mkt-comm">
                  <div className="mkt-comm-hd">
                    <h3>{community.name}</h3>
                    <ForwardArrow className="mkt-comm-arrow" />
                  </div>
                  <p>{community.body}</p>
                </Link>
              ))}
            </div>
          </MktShell>
        </section>
      </div>
    </>
  );
}
