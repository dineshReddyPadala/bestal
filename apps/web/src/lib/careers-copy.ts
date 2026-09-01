export const CAREERS_HERO = {
  label: 'Careers',
  title: 'Explore A World Of Opportunities',
  body: 'We believe in creating a diversified culture of the best talent for tech innovation, which reflects in everything we do with heart and mind. Join us to find the purpose and help change the world!',
} as const;

/** Placeholder imagery — replace with BesTal assets when available. */
export const CAREERS_IMAGES = {
  why: {
    impact:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=960&q=80',
    development:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=960&q=80',
    progress:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=960&q=80',
    support:
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=960&q=80',
  },
  equal:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=960&q=80',
} as const;

export const CAREERS_WHY_TABS = [
  {
    id: 'impact',
    label: 'Impact',
    title: 'Happy customers',
    body: 'Empowering our customers to achieve their business goals consistently leveraging our deep technology experience without negotiating on the quality.',
    image: CAREERS_IMAGES.why.impact,
    imageAlt: 'Team reviewing customer feedback on a dashboard',
  },
  {
    id: 'development',
    label: 'Development',
    title: 'Proven track record',
    body: 'Our teams combine deep technology expertise with consistent delivery, helping clients solve complex challenges while building meaningful careers.',
    image: CAREERS_IMAGES.why.development,
    imageAlt: 'Colleagues collaborating around a laptop',
  },
  {
    id: 'progress',
    label: 'Progress',
    title: 'Continuous growth',
    body: 'Structured learning, mentorship, and clear advancement paths help you grow from contributor to leader at BesTal.',
    image: CAREERS_IMAGES.why.progress,
    imageAlt: 'Professional development session in a meeting room',
  },
  {
    id: 'support',
    label: 'Support',
    title: 'People-first culture',
    body: 'HR partners, collaborative teams, and accessible leadership ensure you have support at every stage of your journey.',
    image: CAREERS_IMAGES.why.support,
    imageAlt: 'Supportive team conversation in the office',
  },
] as const;

export type CareersWhyTabId = (typeof CAREERS_WHY_TABS)[number]['id'];

export const CAREERS_CORE_VALUES = [
  {
    id: 'innovation',
    title: 'Innovation',
    body: 'We unleash creativity by making innovation part of each associate’s job responsibility.',
  },
  {
    id: 'excellence',
    title: 'Excellence',
    body: 'We challenge the status quo and opinions to build premier products and deliver the best services.',
  },
  {
    id: 'integrity',
    title: 'Integrity',
    body: 'We strive towards doing the right thing, at the right time for our customers, partners and teams.',
  },
  {
    id: 'empathy',
    title: 'Empathy',
    body: 'We are curious and take leaps to understand and respect other’s perspectives for success.',
  },
  {
    id: 'inclusivity',
    title: 'Inclusivity',
    body: 'We prioritize inclusion and diversity to build great culture, better teams and meaningful tech products.',
  },
  {
    id: 'expectancy',
    title: 'Expectancy',
    body: 'We are committed to customer satisfaction and success through our best-in-class support program.',
  },
] as const;

export const CAREERS_EQUAL = {
  title: 'WE ENCOURAGE EQUAL RIGHTS AND OPPORTUNITIES',
  intro:
    'We exercise an inclusive and safe work environment to provide equal rights and opportunities for our stakeholders across the globe as foundational values to envision a better society.',
  image: CAREERS_IMAGES.equal,
  imageAlt: 'Modern office desk with laptop and workspace essentials',
  items: [
    {
      title: 'Team Work',
      body: 'Working at BesTal means having an interesting and challenging job and being a part of an exciting digital journey.',
    },
    {
      title: 'Growth',
      body: 'Our unique approach, digital frameworks and custom tech accelerators help businesses and teams to grow consistently.',
    },
    {
      title: 'Impact',
      body: 'We solve our clients’ technology challenges by leveraging our deep tech expertise to deliver great customer experiences and achieve higher ROI.',
    },
    {
      title: 'Modest',
      body: 'We encourage and accept constructive criticism with grace, and are receptive to fresh ideas. Experience the true results of your efforts! Both your speech and your code will be heard.',
    },
  ],
} as const;

export const CAREERS_APPLY_EMAIL = 'bestal@gmail.co';

export const CAREERS_APPLY_MAILTO = `mailto:${CAREERS_APPLY_EMAIL}`;

function buildGmailComposeUrl(to: string): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function buildOutlookComposeUrl(to: string): string {
  const params = new URLSearchParams({ to });
  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
}

/** Opens Gmail or Outlook web compose with recipient only (no pre-filled text). */
export function openCareersEmail(): void {
  const to = CAREERS_APPLY_EMAIL;
  const isWindows = /windows/i.test(navigator.userAgent);
  const webUrl = isWindows ? buildOutlookComposeUrl(to) : buildGmailComposeUrl(to);

  const opened = window.open(webUrl, '_blank', 'noopener,noreferrer');
  if (!opened) {
    window.location.href = CAREERS_APPLY_MAILTO;
  }
}
