import { cn } from '@bestal/shared-utils';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MktShell } from '../../components/marketing/MktShell';
import { PageMeta } from '../../components/PageMeta';
import {
  FREE_TRIAL_TERMS_CLOSING,
  FREE_TRIAL_TERMS_INTRO,
  buildFreeTrialTermsItems,
} from '../../lib/free-trial-terms';
import { PAGE_SEO } from '../../lib/marketing-seo';

const DEFAULT_FREE_TRIAL_HOURS = 20;

function freeTrialItemId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function FreeTrialTermsPage() {
  const termsItems = useMemo(
    () => buildFreeTrialTermsItems(DEFAULT_FREE_TRIAL_HOURS),
    [],
  );
  const firstItem = termsItems[0];
  const [openId, setOpenId] = useState(firstItem ? freeTrialItemId(firstItem.title) : '');

  return (
    <div className="mkt-faq-page">
      <PageMeta title={PAGE_SEO.freeTrialTerms.title} description={PAGE_SEO.freeTrialTerms.description} />

      <section className="mkt-white mkt-section mkt-faq-hero">
        <MktShell>
          <div className="mkt-hiw-label">Legal</div>
          <h1>Free Trial Terms</h1>
          <p className="mkt-faq-hero-note howitworks-body-style">
            Effective Date: August 24, 2026
          </p>
        </MktShell>
      </section>

      <section className="mkt-cream mkt-section mkt-faq-body-section">
        <MktShell className="mkt-faq-layout">
          <aside className="mkt-faq-toc" aria-label="Free trial terms sections">
            <h2>Contents</h2>
            <ul>
              {termsItems.map((item) => {
                const id = freeTrialItemId(item.title);
                return (
                  <li key={item.title}>
                    <button
                      type="button"
                      className={cn(openId === id && 'is-active')}
                      aria-current={openId === id ? 'true' : undefined}
                      onClick={() => setOpenId(id)}
                    >
                      {item.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="mkt-faq-content">
            <p className="mkt-legal-paragraph howitworks-body-style">{FREE_TRIAL_TERMS_INTRO}</p>

            <div className="mkt-faq-accordion">
              {termsItems.map((item) => {
                const id = freeTrialItemId(item.title);
                const isOpen = openId === id;
                return (
                  <article
                    key={item.title}
                    id={id}
                    className={cn('mkt-faq-accordion-item', isOpen && 'is-open')}
                  >
                    <button
                      type="button"
                      className="mkt-faq-accordion-btn"
                      aria-expanded={isOpen}
                      onClick={() => setOpenId(isOpen ? '' : id)}
                    >
                      <span className="mkt-faq-accordion-icon" aria-hidden="true">
                        {isOpen ? '−' : '+'}
                      </span>
                      <span className="mkt-faq-accordion-q">{item.title}</span>
                    </button>
                    {isOpen ? (
                      <div className="mkt-faq-accordion-body">
                        <p className="mkt-faq-accordion-a">{item.body}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <p className="mkt-legal-paragraph howitworks-body-style">{FREE_TRIAL_TERMS_CLOSING}</p>

            <p className="mkt-faq-footer-note howitworks-body-style">
              Last Updated: August 24, 2026. Questions?{' '}
              <Link to="/contact" className="mkt-faq-inline-link">
                Reach out to us
              </Link>
              .
            </p>
          </div>
        </MktShell>
      </section>
    </div>
  );
}
