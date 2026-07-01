import { Button } from '@bestal/ui';
import { Container } from '../../components/Container';
import { Building2, Mail, MessageSquare, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <section className="bg-navy py-16 text-white lg:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Get in Touch</h1>
            <p className="mt-4 text-lg text-white/75">
              Tell us about your hiring needs. A talent strategist will respond within one business day.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 lg:py-24">
        <Container size="narrow">
          {submitted ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <MessageSquare className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-navy">Thank you!</h2>
              <p className="mt-2 text-muted-foreground">
                We&apos;ve received your message and will be in touch shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-card p-8 shadow-elevated lg:p-10"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground">
                    Full name
                  </label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm outline-none ring-ring focus:ring-2"
                      placeholder="Jane Smith"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Work email
                  </label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm outline-none ring-ring focus:ring-2"
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="company" className="block text-sm font-medium text-foreground">
                  Company
                </label>
                <div className="relative mt-2">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm outline-none ring-ring focus:ring-2"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="role" className="block text-sm font-medium text-foreground">
                  Role you&apos;re hiring for
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  className="mt-2 h-11 w-full rounded-md border border-input bg-background px-4 text-sm outline-none ring-ring focus:ring-2"
                  placeholder="Senior React Developer"
                />
              </div>

              <div className="mt-6">
                <label htmlFor="message" className="block text-sm font-medium text-foreground">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none ring-ring focus:ring-2"
                  placeholder="Tell us about your team, timeline, and requirements..."
                />
              </div>

              <Button type="submit" size="lg" className="mt-8 w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          )}
        </Container>
      </section>
    </>
  );
}
