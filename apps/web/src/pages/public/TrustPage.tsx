import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PageMeta } from '../../components/PageMeta';
import { TRUST_STATS, TRUST_VERIFICATION } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function MktWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1150px] px-[22px] sm:px-[34px] ${className}`}>{children}</div>
  );
}

export function TrustPage() {
  return (
    <>
      <PageMeta title={PAGE_SEO.trust.title} description={PAGE_SEO.trust.description} />
      <MktWrap className="mkt-page-hd max-w-[860px]">
        <div className="mkt-eyebrow">Trust & verification</div>
        <h1 className="mt-4">Verification is the hard part now</h1>
        <p className="mkt-lead mt-[26px]">
          The difficult question in remote hiring is no longer &ldquo;can they code?&rdquo; It&apos;s
          &ldquo;is this the person who took the test?&rdquo;
        </p>
        <p className="mkt-lead mt-4">
          That got substantially harder in 2025 and 2026 — and it applies to every remote hire,
          everywhere, including domestic ones.
        </p>
      </MktWrap>

      <section className="mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>What changed</h2>
          <ul className="mkt-tk mt-6">
            {TRUST_STATS.map((stat) => (
              <li key={stat}>{stat}</li>
            ))}
          </ul>
          <p className="mkt-micro mt-6">
            We cite these because they explain our design decisions. Figures are as published by the
            named sources on the dates given.
          </p>
        </MktWrap>
      </section>

      <section className="mkt-band mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>What we verify</h2>
          <div className="mkt-stack mt-[30px]">
            {TRUST_VERIFICATION.map((item) => (
              <div
                key={item.title}
                className={'highlight' in item && item.highlight ? 'mkt-card mkt-card-teal' : 'mkt-card'}
              >
                <h4>{item.title}</h4>
                <p className="mt-2">{item.body}</p>
                {'fact' in item && item.fact && (
                  <div className="mkt-fact mt-3">{item.fact}</div>
                )}
              </div>
            ))}
          </div>
        </MktWrap>
      </section>

      <section className="mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>What we show you, and what we don&apos;t</h2>
          <p className="mkt-big mt-[18px]">
            <strong className="text-[var(--mkt-ink)]">On the profile:</strong> verification status
            only — a badge and a date.
          </p>
          <p className="mkt-big mt-[14px]">
            <strong className="text-[var(--mkt-ink)]">Never on the profile:</strong> identity
            documents, ID numbers, certificates, employment letters or addresses.
          </p>
          <p className="mkt-big mt-[14px]">
            Those exist in access-controlled storage, reachable only by the specific BesTal roles
            that need them, with every access logged. Exposing a verified engineer&apos;s personal
            documents to prove they&apos;re verified would be a poor trade for everyone.
          </p>

          <h2 className="mt-[58px]">Protecting your IP and your systems</h2>
          <div className="mkt-stack mt-[26px]">
            <div className="mkt-card">
              <h4>IP assignment</h4>
              <p className="mt-2">
                Work product is assigned to you at the point of creation — including everything
                produced during the free 20 hours.
              </p>
              <div className="mkt-fact mt-3">[FACT: contractual construction]</div>
            </div>
            <div className="mkt-card">
              <h4>Access</h4>
              <p className="mt-2">
                Engineers get only the access you grant, in your systems, under your controls. BesTal
                does not require or request standing access to your environment.
              </p>
            </div>
            <div className="mkt-card">
              <h4>Offboarding</h4>
              <p className="mt-2">At the end of an engagement,</p>
              <div className="mkt-fact mt-3">[FACT: offboarding protocol]</div>
            </div>
          </div>
        </MktWrap>
      </section>

      <section className="mkt-dark-k mkt-section">
        <MktWrap className="max-w-[860px]">
          <h2>What we do not claim</h2>
          <p className="mt-[22px] text-lg">
            BesTal is a new company. We hold no security certifications yet, and we will not imply
            otherwise.
          </p>
          <p className="mt-[18px] text-lg">
            This page describes practices we actually operate. When we obtain a formal certification
            we&apos;ll name it, date it, and tell you who audited us. Until then, treat any
            vendor&apos;s unaudited security claim — including ours — as a description, not a
            guarantee.
          </p>
          <div className="mt-[34px] flex flex-wrap gap-3">
            <Link to="/contact" className="mkt-btn mkt-btn-white mkt-btn-lg">
              Download the security pack
            </Link>
            <Link to="/contact" className="mkt-btn mkt-btn-amber mkt-btn-lg">
              Talk to us about a security review
            </Link>
          </div>
        </MktWrap>
      </section>
    </>
  );
}
