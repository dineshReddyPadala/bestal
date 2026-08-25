import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
import { useFreeTrialHours } from '../../hooks/api/useTrialPolicy';
import { RATE_FACTORS } from '../../lib/marketing-copy';
import { formatFreeTrialHours } from '../../lib/trial-policy';
import { PAGE_SEO } from '../../lib/marketing-seo';

const PRICE_BANDS = ['Under $25', '$25–$35', '$35–$50', '$50–$75', '$75+'] as const;

export function RatesPage() {
  const freeTrialHours = useFreeTrialHours();

  return (
    <div className="mkt-rates-page">
      <PageMeta title={PAGE_SEO.rates.title} description={PAGE_SEO.rates.description} />

      <div className="mkt-white">
        <MktShell className="mkt-rates-hero">
          <div className="mkt-rates-label">Pricing</div>
          <h1>
            See the price before
            <br />
            you shortlist
          </h1>
          <p className="mkt-lead howitworks-body-style">
            Every profile shows one number: the hourly price you&apos;d pay. It&apos;s on the profile,
            it&apos;s filterable.
          </p>
          <p className="mkt-lead mkt-rates-sub howitworks-body-style">
            That&apos;s unusual here- pricing discovery is normally a phone call, and the phone number.
          </p>
        </MktShell>
      </div>

      <section className="mkt-section mkt-rates-factors">
        <MktShell>
          <h2>What sets a price</h2>
          <div className="mkt-rates-grid">
            {RATE_FACTORS.map((item) => (
              <article key={item.num} className="mkt-rates-card">
                <div className="mkt-rates-num">{item.num}</div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </MktShell>
      </section>

      <section className="mkt-section mkt-rates-includes">
        <MktShell>
          <h2>What the price includes</h2>
          <p>
            The published price is the all-in hourly price for engaged time. The first{' '}
            {formatFreeTrialHours(freeTrialHours)} are not billed at all.
          </p>
          {/* <div className="mkt-fact">[FACT: precise inclusions and exclusions]</div>
          <p>
            What we don&apos;t publish: what the engineer is paid, and what BesTal keeps. Every
            platform here has a spread; ours funds sourcing, independent testing, verification, the
            free trial hours, replacement and support. We&apos;re telling you it exists rather than
            implying it doesn&apos;t.
          </p> */}
        </MktShell>
      </section>

      <section className="mkt-section mkt-rates-cost">
        <MktShell>
          <h2>On cost</h2>
          <p>
            BesTal exists partly because global engineering economics are genuinely favourable.
            We&apos;re direct about that.
          </p>
          <p>
            But we don&apos;t compete on being cheap, and we&apos;d rather lose a deal than win it
            that way. If the lowest hourly number is the criterion, someone will always be lower -
            with no test, no verification, no time-zone commitment and no replacement path. 
          </p>
          <p className="mkt-rates-quote">
            What we compete on is transparent pricing, verifiable evidence, and a risk-free way to evaluate our value.
          </p>
        </MktShell>
      </section>

      <section className="mkt-section mkt-rates-bands">
        <MktShell>
          <h2>Price bands</h2>
          {/* <div className="mkt-fact">[FACT: published price bands per discipline]</div> */}
          <div className="mkt-rates-pills">
            {PRICE_BANDS.map((band) => (
              <span key={band}>{band}</span>
            ))}
          </div>
        </MktShell>
      </section>
    </div>
  );
}
