import { useState, type FormEvent } from 'react';
import { CONTACT_TOPICS, type ContactTopicValue } from '../../lib/marketing-copy';
import { contactMessagesApi } from '../../lib/api/contact-messages';
import { ApiError } from '../../lib/api/types';
import { MktSelect } from './MktSelect';

type FormState = {
  fullName: string;
  email: string;
  topic: ContactTopicValue;
  message: string;
};

const INITIAL: FormState = {
  fullName: '',
  email: '',
  topic: 'GENERAL',
  message: '',
};

export function ContactUsForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await contactMessagesApi.submit(form);
      setSuccess(result.message);
      setForm(INITIAL);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mkt-contact-form-success">
        <h2>Message sent</h2>
        <p>{success}</p>
        <button
          type="button"
          className="mkt-btn mkt-btn-primary"
          onClick={() => setSuccess(null)}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="mkt-contact-form" onSubmit={handleSubmit} noValidate>
      <div className="mkt-contact-form-row">
        <div className="mkt-contact-field">
          <label htmlFor="contact-full-name">
            Full name <span aria-hidden="true">*</span>
          </label>
          <input
            id="contact-full-name"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            placeholder="Jane Doe"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
          />
        </div>
        <div className="mkt-contact-field">
          <label htmlFor="contact-email">
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="jane@company.com"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>
      </div>

      <div className="mkt-contact-field">
        <label htmlFor="contact-topic">What is this about</label>
        <MktSelect
          id="contact-topic"
          className="mkt-select--contact"
          value={form.topic}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, topic: value as ContactTopicValue }))
          }
          options={CONTACT_TOPICS.map((topic) => ({
            value: topic.value,
            label: topic.label,
          }))}
        />
      </div>

      <div className="mkt-contact-field">
        <label htmlFor="contact-message">
          How can we help? <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder="Share the role, timeline, or question you have in mind."
          value={form.message}
          onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
        />
      </div>

      {error ? <p className="mkt-contact-form-error">{error}</p> : null}

      <div className="mkt-contact-form-actions">
        <button type="submit" className="mkt-btn mkt-btn-primary" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send message'}
        </button>
        <p className="mkt-contact-form-note">We reply within one business day</p>
      </div>

      <p className="mkt-contact-form-footnote">
        Prefer to write instead? Reach the right desk directly using the index on the right, or
        email{' '}
        <a href="mailto:support@bestal.co" className="mkt-contact-link">
          support@bestal.co
        </a>{' '}
        and we&apos;ll route it for you.
      </p>

      <input
        type="text"
        name="websiteConfirm"
        tabIndex={-1}
        autoComplete="off"
        className="mkt-contact-honeypot"
        aria-hidden="true"
      />
    </form>
  );
}
