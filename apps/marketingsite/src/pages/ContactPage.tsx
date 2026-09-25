import { useState, type FormEvent } from 'react';
import { Seo } from '@/components/common/Seo';
import { CONTACT_TOPICS } from '@/constants/content';
import { submitContact } from '@/services/contact.service';
import { useApp } from '@/context/app-context';

export function ContactPage() {
  const { toast } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState('');
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    role: '',
    country: '',
    topic: CONTACT_TOPICS[0],
    details: '',
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (!form.company.trim()) next.company = 'Company is required.';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'A valid work email is required.';
    if (form.details.trim() && form.details.trim().length < 10) {
      next.details = 'Please share a little more detail (at least 10 characters).';
    }
    setErrors(next);
    if (Object.keys(next).length) {
      toast('Please complete name, company and work email');
      return;
    }
    setLoading(true);
    const result = await submitContact(form, honeypot);
    setLoading(false);
    if (!result.ok) {
      setErrors(result.fieldErrors ?? {});
      toast(result.message);
      return;
    }
    setReferenceCode(result.referenceCode);
    setSubmitted(true);
  }

  return (
    <main>
      <Seo page="contact" />
      <section className="hero" style={{ paddingBottom: 44 }}>
        <div className="dotgrid" />
        <div className="shell two" style={{ alignItems: 'start' }}>
          <div>
            <span className="tag">Contact</span>
            <h1 style={{ marginTop: 14, fontSize: 'clamp(34px,4vw,50px)' }}>
              Let's talk about what you're trying to achieve.
            </h1>
            <p className="lead" style={{ marginTop: 16 }}>
              Tell us about the challenge, not a headcount. We'll route it to the right people at BesTal.
            </p>
          </div>
          {submitted ? (
            <div className="card form">
              <h3>Thank you.</h3>
              <p style={{ marginTop: 10, fontSize: 14.5 }}>
                Thank you for contacting BesTal. A member of the team will review your enquiry and follow up.
                {referenceCode ? ` Reference ${referenceCode}.` : ''}
              </p>
            </div>
          ) : (
            <form className="card form" onSubmit={(event) => void onSubmit(event)} noValidate>
              <label htmlFor="ct_name">Name</label>
              <input id="ct_name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              {errors.name ? <p className="field-error">{errors.name}</p> : null}
              <label htmlFor="ct_company">Company</label>
              <input id="ct_company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} required />
              {errors.company ? <p className="field-error">{errors.company}</p> : null}
              <label htmlFor="ct_email">Work Email</label>
              <input
                id="ct_email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
              {errors.email ? <p className="field-error">{errors.email}</p> : null}
              <label htmlFor="ct_role">Role</label>
              <input
                id="ct_role"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                placeholder="e.g. VP Engineering, CTO, Procurement"
              />
              <label htmlFor="ct_country">Country</label>
              <input id="ct_country" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} />
              <label htmlFor="ct_topic">What would you like to discuss?</label>
              <select id="ct_topic" value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })}>
                {CONTACT_TOPICS.map((topic) => (
                  <option key={topic}>{topic}</option>
                ))}
              </select>
              <label htmlFor="ct_details">Requirement details</label>
              <textarea
                id="ct_details"
                value={form.details}
                onChange={(event) => setForm({ ...form, details: event.target.value })}
                placeholder="What are you trying to achieve?"
              />
              {errors.details ? <p className="field-error">{errors.details}</p> : null}
              <label className="sr-only" htmlFor="ct_website">
                Website
              </label>
              <input
                id="ct_website"
                className="form-honeypot"
                name="websiteConfirm"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
                aria-hidden="true"
              />
              <button className="btn primary lg" style={{ width: '100%', marginTop: 16 }} type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
