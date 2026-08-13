import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PageMeta } from '../../components/PageMeta';
import { FOR_ENGINEERS_ASK, FOR_ENGINEERS_GET } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function MktWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1150px] px-[22px] sm:px-[34px] ${className}`}>{children}</div>
  );
}

export function ForEngineersPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.forEngineers.title} description={PAGE_SEO.forEngineers.description} />
      <MktWrap className="mkt-page-hd max-w-[860px]">
        <div className="mkt-eyebrow">For engineers</div>
        <h1 className="mt-4">
          Get tested once. Be seen by companies that already trust the result.
        </h1>
        <p className="mkt-lead mt-[26px]">
          Most platforms make you re-prove yourself for every client. Screening call, take-home,
          technical round, culture round — repeated for each opportunity, most of which go nowhere.
        </p>
        <p className="mkt-lead mt-4">
          BesTal tests you once, by an outside specialist in your field. The result goes on your
          profile with your rate, your start date and the US hours you&apos;ve committed to. Clients
          read it before they contact you.
        </p>
      </MktWrap>

      <section className="mkt-section">
        <MktWrap className="mkt-g2t">
          <div>
            <h2>What we ask</h2>
            <div className="mkt-stack mt-[26px]">
              {FOR_ENGINEERS_ASK.map((item) => (
                <div key={item.title} className="mkt-card">
                  <h4>{item.title}</h4>
                  <p className="mt-[7px] text-[15px]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2>What you get</h2>
            <div className="mkt-stack mt-[26px]">
              {FOR_ENGINEERS_GET.map((item) => (
                <div key={item.title} className="mkt-card mkt-card-teal">
                  <h4>{item.title}</h4>
                  <p className="mt-[7px] text-[15px]">{item.body}</p>
                  {'fact' in item && item.fact && (
                    <div className="mkt-fact mt-3">{item.fact}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </MktWrap>
      </section>

      <section className="mkt-band mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>What we don&apos;t do</h2>
          <p className="mkt-big mt-[18px]">
            We don&apos;t spam your profile to every client. We don&apos;t send you to roles that
            don&apos;t match your tested skills. We don&apos;t ask you to accept a rate you
            haven&apos;t agreed to.
          </p>
          <p className="mkt-big mt-4">
            And we don&apos;t promise volume. BesTal is new. What we promise is that when a client
            starts a trial with you, they&apos;ve read your results and chose <em>you</em>.
          </p>
          <Link to="/contact" className="mkt-btn mkt-btn-primary mkt-btn-lg mt-8">
            Apply to be tested
          </Link>
        </MktWrap>
      </section>
    </>
  );
}
