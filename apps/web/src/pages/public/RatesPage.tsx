import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PageMeta } from '../../components/PageMeta';
import { RATE_FACTORS } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function MktWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1150px] px-[22px] sm:px-[34px] ${className}`}>{children}</div>
  );
}

export function RatesPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.rates.title} description={PAGE_SEO.rates.description} />
      <MktWrap className="mkt-page-hd max-w-[860px]">
        <div className="mkt-eyebrow">Pricing</div>
        <h1 className="mt-4">See the rate before you shortlist</h1>
        <p className="mkt-lead mt-[26px]">
          Every profile shows one number: the hourly rate you&apos;d pay. It&apos;s on the profile,
          it&apos;s filterable, and it doesn&apos;t change between the profile and the contract.
        </p>
        <p className="mkt-lead mt-4">
          That&apos;s unusual here. Rate discovery is normally a phone call, and the number normally
          moves.
        </p>
      </MktWrap>

      <section className="mkt-section">
        <MktWrap>
          <h2 className="max-w-[860px]">What sets a rate</h2>
          <div className="mkt-g3 mt-9">
            {RATE_FACTORS.map((item) => (
              <div key={item.num} className="mkt-card">
                <div className="mkt-ev-n mb-[14px]">{item.num}</div>
                <h4>{item.title}</h4>
                <p className="mt-2 text-[15px]">{item.body}</p>
              </div>
            ))}
          </div>
        </MktWrap>
      </section>

      <section className="mkt-band mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>What the rate includes</h2>
          <p className="mkt-big mt-[18px]">
            The published rate is the all-in hourly rate for engaged time. The first 20 hours are not
            billed at all.
          </p>
          <div className="mkt-fact mt-4">[FACT: precise inclusions and exclusions]</div>
          <p className="mkt-big mt-5">
            What we don&apos;t publish: what the engineer is paid, and what BesTal keeps. Every
            platform here has a spread; ours funds sourcing, independent testing, verification, the
            free trial hours, replacement and support. We&apos;re telling you it exists rather than
            implying it doesn&apos;t.
          </p>
        </MktWrap>
      </section>

      <section className="mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>On cost</h2>
          <p className="mkt-big mt-[18px]">
            BesTal exists partly because global engineering economics are genuinely favourable.
            We&apos;re direct about that.
          </p>
          <p className="mkt-big mt-4">
            But we don&apos;t compete on being cheap, and we&apos;d rather lose a deal than win it
            that way. If the lowest hourly number is the criterion, someone will always be lower —
            with no test, no verification, no time-zone commitment and no replacement path. That
            trade surfaces about six weeks in.
          </p>
          <p className="mkt-pull mt-8">
            What we compete on is a rate you can see, evidence you can check, and 20 hours of proof
            that costs you nothing.
          </p>
          <h2 className="mt-[58px]">Rate bands</h2>
          <div className="mkt-fact mt-4">[FACT: published rate bands per discipline]</div>
          <div className="mkt-chips mt-[22px]">
            {['Under $25', '$25–$35', '$35–$50', '$50–$75', '$75+'].map((band) => (
              <span key={band} className="mkt-chip">
                {band}
              </span>
            ))}
          </div>
          <div className="mkt-actions mt-9">
            <Link to="/sample-talent" className="mkt-btn mkt-btn-primary">
              Browse talent by rate
            </Link>
            <Link to="/contact" className="mkt-btn mkt-btn-secondary">
              Create a requirement with a budget ceiling
            </Link>
          </div>
        </MktWrap>
      </section>
    </>
  );
}
