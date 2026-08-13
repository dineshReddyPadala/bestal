import { Link } from 'react-router-dom';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { PageMeta } from '../../components/PageMeta';
import { CONTACT_REASONS } from '../../lib/marketing-copy';
import { PAGE_SEO } from '../../lib/marketing-seo';

function MktWrap({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1150px] px-[22px] sm:px-[34px] ${className}`}>{children}</div>
  );
}

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && personalDomains.includes(domain)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setSubmitted(true);
  }

  return (
    <>
      <PageMeta title={PAGE_SEO.contact.title} description={PAGE_SEO.contact.description} />
      <MktWrap className="mkt-page-hd max-w-[660px]">
        <div className="mkt-eyebrow">Contact</div>
        <h1 className="mt-4">Talk to us</h1>
        <p className="mkt-lead mt-[22px]">
          Want to see the platform, discuss what you need, or run a security review first? This
          reaches a person, not a queue.
        </p>
      </MktWrap>

      <section className="mkt-section">
        <MktWrap className="mkt-g2t">
          <div className="mkt-card p-8">
            {submitted ? (
              <div>
                <h3>Message received.</h3>
                <p className="mt-3 text-base">
                  We&apos;ll reply within [FACT: SLA] on business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-[17px]">
                  <label className="mb-[7px] block text-[13.5px] font-semibold text-[var(--mkt-ink)]">
                    Name
                  </label>
                  <input
                    name="name"
                    required
                    className="w-full rounded-[9px] border border-[var(--mkt-line)] bg-[var(--mkt-surface)] px-[14px] py-3 text-[15.5px] text-[var(--mkt-ink)] outline-none focus:border-[var(--mkt-teal)] focus:shadow-[0_0_0_3px_var(--mkt-teal-t)]"
                  />
                </div>
                <div className="mb-[17px]">
                  <label className="mb-[7px] block text-[13.5px] font-semibold text-[var(--mkt-ink)]">
                    Work email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-[9px] border border-[var(--mkt-line)] bg-[var(--mkt-surface)] px-[14px] py-3 text-[15.5px] text-[var(--mkt-ink)] outline-none focus:border-[var(--mkt-teal)] focus:shadow-[0_0_0_3px_var(--mkt-teal-t)]"
                  />
                  {emailError && (
                    <p className="mt-2 text-sm text-red-600">
                      Please use your work email — we can&apos;t route personal addresses to the
                      right team.
                    </p>
                  )}
                </div>
                <div className="mb-[17px]">
                  <label className="mb-[7px] block text-[13.5px] font-semibold text-[var(--mkt-ink)]">
                    Company
                  </label>
                  <input
                    name="company"
                    required
                    className="w-full rounded-[9px] border border-[var(--mkt-line)] bg-[var(--mkt-surface)] px-[14px] py-3 text-[15.5px] text-[var(--mkt-ink)] outline-none focus:border-[var(--mkt-teal)] focus:shadow-[0_0_0_3px_var(--mkt-teal-t)]"
                  />
                </div>
                <div className="mb-[17px]">
                  <label className="mb-[7px] block text-[13.5px] font-semibold text-[var(--mkt-ink)]">
                    What do you need?
                  </label>
                  <select
                    name="reason"
                    required
                    defaultValue=""
                    className="w-full rounded-[9px] border border-[var(--mkt-line)] bg-[var(--mkt-surface)] px-[14px] py-3 text-[15.5px] text-[var(--mkt-ink)] outline-none focus:border-[var(--mkt-teal)] focus:shadow-[0_0_0_3px_var(--mkt-teal-t)]"
                  >
                    <option value="" disabled>
                      Select a reason
                    </option>
                    {CONTACT_REASONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-[17px]">
                  <label className="mb-[7px] block text-[13.5px] font-semibold text-[var(--mkt-ink)]">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    className="w-full rounded-[9px] border border-[var(--mkt-line)] bg-[var(--mkt-surface)] px-[14px] py-3 text-[15.5px] text-[var(--mkt-ink)] outline-none focus:border-[var(--mkt-teal)] focus:shadow-[0_0_0_3px_var(--mkt-teal-t)]"
                  />
                </div>
                <button
                  type="submit"
                  className="mkt-btn mkt-btn-primary mkt-btn-lg w-full justify-center"
                >
                  Send message
                </button>
              </form>
            )}
          </div>

          <div className="mkt-stack">
            <div className="mkt-card">
              <h4>Just want to look first?</h4>
              <p className="mt-[7px] text-[15px]">
                Browse engineers with full test results and rates. No account needed.
              </p>
              <Link to="/sample-talent" className="mkt-btn mkt-btn-ghost mt-[10px] pl-0">
                Browse Engineers →
              </Link>
            </div>
            <div className="mkt-card">
              <h4>Running a vendor security review?</h4>
              <p className="mt-[7px] text-[15px]">
                Start with what we verify and what we deliberately don&apos;t claim.
              </p>
              <Link to="/trust" className="mkt-btn mkt-btn-ghost mt-[10px] pl-0">
                Trust & Verification →
              </Link>
            </div>
            <div className="mkt-card">
              <h4>You&apos;re an engineer?</h4>
              <p className="mt-[7px] text-[15px]">Wrong page, right company.</p>
              <Link to="/for-engineers" className="mkt-btn mkt-btn-ghost mt-[10px] pl-0">
                For Engineers →
              </Link>
            </div>
          </div>
        </MktWrap>
      </section>
    </>
  );
}
