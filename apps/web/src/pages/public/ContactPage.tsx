import { SocialMediaIcons } from '@bestal/ui';
import { PageMeta } from '../../components/PageMeta';
import { ContactUsForm } from '../../components/marketing/ContactUsForm';
import { MktShell } from '../../components/marketing/MktShell';
import {
  CONTACT_ADDRESSES,
  CONTACT_DIRECT_LINES,
} from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

export function ContactPage() {
  return (
    <div className="mkt-contact-page">
      <PageMeta title={PAGE_SEO.contact.title} description={PAGE_SEO.contact.description} />

      <section className="mkt-hiw-hero-band">
        <MktShell className="mkt-page-hd mkt-hiw-hero">
          <div className="mkt-hiw-label">Contact us</div>
          <h1>Talk to us</h1>
          <p className="mkt-lead">
            Tell us what you need and the right team picks it up — usually within one business day.
          </p>
        </MktShell>
      </section>

      <section className="mkt-section mkt-contact-section">
        <MktShell className="mkt-contact-shell">
          <div className="mkt-contact-grid">
            <div className="mkt-contact-card mkt-contact-card-form">
              <ContactUsForm />
            </div>

            <div className="mkt-contact-info-stack">
              <aside className="mkt-contact-card mkt-contact-card-aside">
                <p className="mkt-contact-aside-label">Direct contact</p>
                <ol className="mkt-contact-direct-list">
                  {CONTACT_DIRECT_LINES.map((line) => (
                    <li key={line.num} className="mkt-contact-direct-item">
                      <span className="mkt-contact-direct-num">{line.num}</span>
                      <div>
                        <p className="mkt-contact-direct-title">{line.title}</p>
                        <a href={line.href} className="mkt-contact-link">
                          {line.display}
                        </a>
                        <p className="mkt-contact-direct-desc">{line.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </aside>

              <div className="mkt-contact-card mkt-contact-card-address">
                <p className="mkt-contact-aside-label">Address</p>
                <div className="mkt-contact-address-grid">
                  {CONTACT_ADDRESSES.map((address) => (
                    <div key={address.label} className="mkt-contact-address-block">
                      <p className="mkt-contact-address-label">{address.label}</p>
                      {address.lines.map((line) => (
                        <p key={line} className="mkt-contact-address-line">
                          {line}
                        </p>
                      ))}
                      {'phone' in address && address.phone ? (
                        <p className="mkt-contact-address-phone">
                          Ph:{' '}
                          <a href={address.phone.href} className="mkt-contact-link">
                            {address.phone.display}
                          </a>
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mkt-contact-card mkt-contact-card-social">
              <SocialMediaIcons />
            </div>
          </div>
        </MktShell>
      </section>
    </div>
  );
}
