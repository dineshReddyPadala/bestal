import { useState, type FormEvent } from 'react';
import { Seo } from '@/components/common/Seo';
import { IconBadge } from '@/components/ui/IconBadge';
import { COMMUNITIES, FIT_BANDS, WORKING_PREFERENCES } from '@/constants/content';
import { submitCommunityApplication } from '@/services/community.service';
import { useApp } from '@/context/app-context';

const FAQ_CARDS = [
  {
    title: 'What will I be paid?',
    icon: 'commercials',
    description:
      'Rate expectations are discussed and agreed with you before your profile is visible to clients. Rates do not change without your agreement.',
  },
  {
    title: 'When am I paid?',
    icon: 'calendar',
    description: 'Payment terms are set out in the engagement agreement. Trial hours are paid by BesTal — never unpaid work for you.',
  },
  {
    title: 'What working hours are expected?',
    icon: 'clock',
    description:
      'Working-hour expectations are agreed based on the specific engagement, and reflected on your profile so clients understand availability up front.',
  },
  {
    title: 'How does BesTal engage me?',
    icon: 'file',
    description: 'Directly, under a written agreement between you and BesTal. Rate, scope and hours are visible to you throughout.',
  },
];

const JOURNEY = [
  { title: 'Apply', description: 'A short application — stack, experience, availability, working preference.', icon: 'send' },
  { title: 'Review', description: 'A recruiter in your community reviews it against current demand.', icon: 'eye' },
  { title: 'Evaluate', description: 'A specialist assessment in your field, five areas, written note.', icon: 'clipboard_check' },
  { title: 'Verify', description: 'Identity, employment and education checked as applicable.', icon: 'shield' },
  { title: 'Community', description: 'Your profile is live and visible to relevant clients.', icon: 'community' },
  { title: 'Relevant Opportunities', description: 'Clients review your profile for requirements that fit.', icon: 'discover' },
];

export function CandidatePage() {
  const { toast } = useApp();
  const [discipline, setDiscipline] = useState(COMMUNITIES[0].title);
  const [years, setYears] = useState('6');
  const [hours, setHours] = useState(WORKING_PREFERENCES[0]);
  const [fitHtml, setFitHtml] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    community: COMMUNITIES[0].title,
    years: '',
    profileLink: '',
    workingPreference: WORKING_PREFERENCES[0],
  });

  function showFit() {
    const band = FIT_BANDS[discipline] ?? [20, 40];
    const y = Number(years) || 0;
    const level = y < 3 ? 'early-career' : y < 7 ? 'mid-level' : 'senior';
    const rate = y < 3 ? band[0] : y < 7 ? Math.round((band[0] + band[1]) / 2) : band[1];
    if (hours === 'To Be Discussed') {
      setFitHtml(
        'Thank you for being direct about that. Working arrangements vary by engagement, and we will discuss what is realistic for you before anything is agreed.',
      );
      return;
    }
    setFitHtml(
      `You would likely sit in ${discipline}, as a ${level} profile. An indicative rate for that profile is around $${rate}/hour, agreed with you before anything is listed. Your working preference (${hours}) is confirmed and shared with clients before any conversation.`,
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'A valid email is required.';
    if (!form.mobile.trim()) nextErrors.mobile = 'Mobile is required.';
    if (!form.years.trim()) nextErrors.years = 'Years of experience is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    const result = await submitCommunityApplication(form);
    setLoading(false);
    if (!result.ok) {
      toast(result.message);
      return;
    }
    setSubmitted(true);
  }

  return (
    <main>
      <Seo page="candidate" />
      <section className="hero" style={{ paddingBottom: 44 }}>
        <div className="dotgrid" />
        <div className="shell heroG">
          <div>
            <span className="tag gold">Join a BesTal Technology Community</span>
            <h1 style={{ marginTop: 14, fontSize: 'clamp(34px,4vw,50px)' }}>
              Get evaluated once. Build visibility across relevant opportunities.
            </h1>
            <p className="lead" style={{ marginTop: 14 }}>
              Join a specialist technology community, complete BesTal's evaluation and verification process, and become
              discoverable for relevant opportunities across Technology Consulting, Managed Services and Talent
              Solutions.
            </p>
            <div className="acts">
              <a className="btn goldb lg" href="#apply">
                Submit Profile
              </a>
              <a className="btn outline lg" href="#fit">
                Check your fit first
              </a>
            </div>
          </div>
          <div className="card" style={{ padding: 26 }}>
            <h3>How the Model Works</h3>
            <p style={{ marginTop: 10, fontSize: 14.5 }}>
              BesTal builds specialist technology communities aligned to client demand. Professionals who complete the
              relevant evaluation and verification process may be considered for opportunities across consulting
              engagements, managed services and Talent Solutions assignments.
            </p>
            <p style={{ marginTop: 12, fontSize: 13.5, color: 'var(--muted)' }}>
              Joining a community does not guarantee an engagement. Opportunities depend on client requirements,
              capability fit, availability and engagement readiness.
            </p>
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="shell">
          <div className="sechead">
            <h2>A few questions we're asked often</h2>
          </div>
          <div className="g4">
            {FAQ_CARDS.map((card) => (
              <div className="card" key={card.title}>
                <IconBadge name={card.icon} size="sm" />
                <h4 style={{ marginTop: 12 }}>{card.title}</h4>
                <p style={{ fontSize: 14, marginTop: 6 }}>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="fit">
        <div className="shell two" style={{ alignItems: 'start' }}>
          <div>
            <span className="k">Quick check</span>
            <h2 style={{ marginTop: 8 }}>Check your fit in under a minute.</h2>
            <p className="lead" style={{ marginTop: 14 }}>
              A few questions. Nothing is saved.
            </p>
            <div className="card form" style={{ marginTop: 18 }}>
              <label htmlFor="fC">Primary discipline</label>
              <select id="fC" value={discipline} onChange={(event) => setDiscipline(event.target.value)}>
                {COMMUNITIES.map((community) => (
                  <option key={community.id}>{community.title}</option>
                ))}
              </select>
              <label htmlFor="fY">Years of experience</label>
              <input id="fY" type="number" min={0} max={30} value={years} onChange={(event) => setYears(event.target.value)} />
              <label htmlFor="fZ">Which working hours could you commit to?</label>
              <select id="fZ" value={hours} onChange={(event) => setHours(event.target.value)}>
                {WORKING_PREFERENCES.map((pref) => (
                  <option key={pref}>{pref}</option>
                ))}
              </select>
              <button className="btn blue" style={{ width: '100%', marginTop: 14 }} type="button" onClick={showFit}>
                Show my fit
              </button>
              {fitHtml ? (
                <div style={{ display: 'block', marginTop: 14, padding: 16, borderRadius: 'var(--r2)', background: 'var(--tint-blue)' }}>
                  <b style={{ fontSize: 15.5, color: 'var(--navy)' }}>{fitHtml.split('.')[0]}.</b>
                  <p style={{ fontSize: 14, marginTop: 6 }}>{fitHtml.split('.').slice(1).join('.').trim()}</p>
                  {hours !== 'To Be Discussed' ? (
                    <a className="btn blue sm" style={{ marginTop: 12 }} href="#apply">
                      Join a Technology Community
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <span className="k">The process</span>
            <h2 style={{ marginTop: 8 }}>What happens after you apply.</h2>
            <div className="card" style={{ marginTop: 18 }}>
              {JOURNEY.map((step) => (
                <div className="row" key={step.title}>
                  <IconBadge name={step.icon} size="xs" />
                  <div>
                    <b style={{ fontSize: 14 }}>{step.title}</b>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="apply" className="alt">
        <div className="shell two" style={{ alignItems: 'start' }}>
          <div>
            <h2>Join a Technology Community</h2>
            <p className="lead" style={{ marginTop: 12 }}>
              A short application now. Evaluation and verification steps follow.
            </p>
          </div>
          {submitted ? (
            <div className="card form">
              <h3>Thank you.</h3>
              <p style={{ marginTop: 10, fontSize: 14.5 }}>
                Thank you for your interest in joining a BesTal technology community. Our team will review your profile
                against relevant current and upcoming opportunities and contact you if there is a suitable next step.
              </p>
            </div>
          ) : (
            <form className="card form" onSubmit={(event) => void onSubmit(event)} noValidate>
              <label htmlFor="a_name">Full name</label>
              <input id="a_name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
              {errors.fullName ? <p className="field-error">{errors.fullName}</p> : null}
              <label htmlFor="a_email">Email</label>
              <input id="a_email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              {errors.email ? <p className="field-error">{errors.email}</p> : null}
              <label htmlFor="a_mobile">Mobile</label>
              <input id="a_mobile" type="tel" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} required />
              {errors.mobile ? <p className="field-error">{errors.mobile}</p> : null}
              <label htmlFor="aC">Primary community</label>
              <select id="aC" value={form.community} onChange={(event) => setForm({ ...form, community: event.target.value })}>
                {COMMUNITIES.map((community) => (
                  <option key={community.id}>{community.title}</option>
                ))}
              </select>
              <label htmlFor="a_years">Years of experience</label>
              <input id="a_years" type="number" min={0} value={form.years} onChange={(event) => setForm({ ...form, years: event.target.value })} required />
              {errors.years ? <p className="field-error">{errors.years}</p> : null}
              <label htmlFor="a_link">LinkedIn or CV link</label>
              <input id="a_link" value={form.profileLink} onChange={(event) => setForm({ ...form, profileLink: event.target.value })} />
              <label htmlFor="a_pref">Working preference</label>
              <select
                id="a_pref"
                value={form.workingPreference}
                onChange={(event) => setForm({ ...form, workingPreference: event.target.value })}
              >
                {WORKING_PREFERENCES.map((pref) => (
                  <option key={pref}>{pref}</option>
                ))}
              </select>
              <button className="btn goldb lg" style={{ width: '100%', marginTop: 16 }} type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Profile'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
