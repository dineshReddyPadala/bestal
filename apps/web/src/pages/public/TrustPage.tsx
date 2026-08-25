// import { Link } from 'react-router-dom';
import { PageMeta } from '../../components/PageMeta';
import { MktShell } from '../../components/marketing/MktShell';
// import { TRUST_STATS, TRUST_VERIFICATION } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

export function TrustPage() {
  return (
    <div className="mkt-trust-page">
      <PageMeta title={PAGE_SEO.trust.title} description={PAGE_SEO.trust.description} />

      <div className="mkt-trust-hero-band">
        <MktShell className="mkt-trust-hero">
          <div className="mkt-trust-label">Verification</div>
          <h1>
          The BesTal Verification <br /> Advantage.
          </h1>
          <p className="mkt-lead howitworks-body-style">
          At <span className="font-bold">BesTal</span>, we understand that hiring decisions are only as good as the information behind them. Unlike traditional recruitment partners who forward resumes, BesTal goes a step further by conducting a thorough background verification (BCV) before presenting candidates to clients.
          </p>
          {/* <p className="mkt-lead mkt-trust-sub">
            That got substantially harder in 2025 and 2026 — and it applies to every remote hire,
            everywhere, including domestic ones.
          </p> */}
        </MktShell>
      </div>

      {/* <section className="mkt-section mkt-trust-changed">
        <MktShell className="mkt-trust-split">
          <h2>What changed</h2>
          <div className="mkt-trust-cite">
            <ul className="mkt-tk">
              {TRUST_STATS.map((stat) => (
                <li key={stat}>{stat}</li>
              ))}
            </ul>
            <p className="mkt-trust-cite-note">
              We cite these because they explain our design decisions. Figures are as published by
              the named sources on the dates given.
            </p>
          </div>
        </MktShell>
      </section> */}

      <section className="mkt-section mkt-trust-verify">
        <MktShell>
          <h2>Why Clients Choose BesTal Verified Profiles</h2>
          {/* <div className="mkt-trust-cards">
            {TRUST_VERIFICATION.map((item) => (
              <article
                key={item.title}
                className={
                  'highlight' in item && item.highlight
                    ? 'mkt-trust-card mkt-trust-card-hl'
                    : 'mkt-trust-card'
                }
              >
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                {'fact' in item && item.fact && <div className="mkt-fact">{item.fact}</div>}
              </article>
            ))}
          </div> */}
          <p className="mkt-rates-quote trust-body-quote">
          Our verification process includes validation of key candidate credentials such as employment history, legal checks & identity. By providing pre-verified profiles, we help clients:
          </p>
            
          <ul className="mkt-trust-list list-disc list-inside pt-4 pl-6">
          <li className="mkt-trust-list-item pt-2">Reduced hiring risk</li>
            <li className="mkt-trust-list-item pt-2">Faster decision-making</li>
            <li className="mkt-trust-list-item pt-2">Enhanced candidate credibility</li>
            <li className="mkt-trust-list-item pt-2">Accelerate recruitment cycles</li>
            <li className="mkt-trust-list-item pt-2">Greater confidence in every hire</li>
          </ul>
          <p className='pt-4'>
          This proactive approach ensures that only credible and qualified professionals are recommended. With <span className="font-bold">BesTal</span>, you don't just receive resumes, you receive verified talent you can trust.
          </p>
        </MktShell>
      </section>

      <section className="mkt-section mkt-trust-verify bg-white">
        <MktShell>
          <h2>Our Commitment</h2>
         
          <p className="mkt-rates-quote trust-body-quote pt-4">
          Our commitment is simple: <span className="mkt-trust-quote-em">Quality, Transparency, and Trust.</span>
          </p>
            
       
          <p className="pt-4">
          Every profile we share is more than a resume. It&apos;s a candidate whose credentials have been verified, enabling you to hire with confidence and focus on what matters most —{' '}
          <span className="mkt-trust-quote-em">Finding the Right Talent.</span>
          </p>
        </MktShell>
      </section>

      <div className="mkt-trust-hero-band bg-cream-light">
        <MktShell className="mkt-trust-hero">
          <div className="mkt-trust-label">Trust</div>
          <h1>
Trust at the Core of Every Engagement          </h1>
          <p className="mkt-lead">
          At BesTal, trust is not just a value. It is the foundation of how we operate. From candidate verification to client engagement, we follow structured processes designed to ensure accuracy, transparency, and confidentiality.          </p>
          
          <p className="mkt-lead">We are committed to protecting candidate and client information through responsible data handling practices, controlled access mechanisms, and continuous process improvement.</p>
<p className="mkt-lead pt-2">Every recommendation we make is backed by diligence, integrity, and a commitment to helping our clients make informed hiring decisions.</p>
        </MktShell>
      </div>

      <section className="mkt-section mkt-trust-verify bg-white">
        <MktShell>
        <p className="mkt-rates-quote trust-body-quote mt-0 pt-0 margintop0">As part of our continued investment in operational excellence, <span className="mkt-trust-quote-em">we are strengthening our security and compliance framework to align with globally recognized standards,</span> ensuring BesTal remains a trusted partner for growing organizations worldwide.</p>

        </MktShell>
      </section>


      {/* <section className="mkt-section mkt-trust-show">
        <MktShell>
          <h2>What we show you</h2>
          <p>
            <strong>On the profile:</strong> verification status only — a badge and a date.
          </p>
          <p>
            <strong>Never on the profile:</strong> identity documents, ID numbers, certificates,
            employment letters or addresses.
          </p>
          <p>
            Those exist in access-controlled storage, reachable only by the specific BesTal roles
            that need them, with every access logged. Exposing a verified engineer&apos;s personal
            documents to prove they&apos;re verified would be a poor trade for everyone.
          </p>
        </MktShell>
      </section>

      <section className="mkt-section mkt-trust-ip">
        <MktShell>
          <h2>Protecting your IP and your systems</h2>
          <div className="mkt-trust-cards">
            <article className="mkt-trust-card">
              <h3>IP assignment</h3>
              <p>
                Work product is assigned to you at the point of creation — including everything
                produced during the free {formatFreeTrialHours(freeTrialHours)}.
              </p>
              <div className="mkt-fact">[FACT: contractual construction]</div>
            </article>
            <article className="mkt-trust-card">
              <h3>Access</h3>
              <p>
                Engineers get only the access you grant, in your systems, under your controls. BesTal
                does not require or request standing access to your environment.
              </p>
            </article>
            <article className="mkt-trust-card">
              <h3>Offboarding</h3>
              <p>At the end of an engagement,</p>
              <div className="mkt-fact">[FACT: offboarding protocol]</div>
            </article>
          </div>
        </MktShell>
      </section> */}

      {/* <section className="mkt-section mkt-trust-claim">
        <MktShell>
          <h2>What we do not claim</h2>
          <p>
            BesTal is a new company. We hold no security certifications yet, and we will not imply
            otherwise.
          </p>
          <p>
            This page describes practices we actually operate. When we obtain a formal certification
            we&apos;ll name it, date it, and tell you who audited us. Until then, treat any
            vendor&apos;s unaudited security claim — including ours — as a description, not a
            guarantee.
          </p>
          <div className="mkt-actions">
            <Link to="/contact" className="mkt-btn mkt-btn-white mkt-btn-lg">
              Download the security pack
            </Link>
            <Link to="/contact" className="mkt-btn mkt-btn-amber mkt-btn-lg">
              Talk to us about a security review
            </Link>
          </div>
        </MktShell>
      </section> */}
    </div>
  );
}
