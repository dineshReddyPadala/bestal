import { CAREER_PATH_IMAGES } from './talent-community-images';

export const CAREERS_HERO = {
  label: 'Careers',
  title: 'Explore A World Of Opportunities',
  body: 'We believe in creating a diversified culture of the best talent for tech innovation, which reflects in everything we do with heart and mind. Join us to find the purpose and help change the world!',
} as const;

/** Placeholder imagery — replace with BesTal assets when available. */
export const CAREERS_IMAGES = {
  hero: '/Image (8) (1).png',
  vision: '/Image (7) (1).png',
  why: '/Image (9) (1).png',
  india: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
  us: '/Image (11) (1).png',
  values: '/Image (10) (1).png',
  join: '/group-people-working-out-business-plan-office.jpg',
  emptyOpenings:
    '/ChatGPT Image Sep 9, 2026, 08_40_29 PM.png',
  closing: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80',
} as const;

export const CAREERS_EMPTY_OPENINGS_IMAGE = CAREERS_IMAGES.emptyOpenings;

export const CAREERS_V2_PAGE = {
  hero: {
    label: 'CAREERS',
    titleLine1: 'Build What\u2019s Next.',
    titleLine2: 'Grow With BesTal.',
    lead: 'Meaningful technology opportunities for professionals in the U.S. and India.',
    body:
      'Your career should be defined by what you can do, what you can learn, and the impact you can create \u2014 not just the keywords on your resume.',
    primaryCta: 'Explore Open Opportunities',
    image: CAREERS_IMAGES.hero,
  },
  vision: {
    image: CAREERS_IMAGES.vision,
    lead:
      'BesTal connects skilled technology professionals with opportunities across our own teams and client engagements. Whether you\u2019re looking for a full-time role, contract assignment, project-based work or a flexible engagement, we help you discover opportunities aligned with your expertise, experience and ambitions.',
    body:
      'From AI and data to cloud, enterprise platforms and digital engineering, BesTal is building a community of people who want to solve meaningful problems and keep growing.',
  },
  why: {
    title: 'Why Build Your Career Through BesTal?',
    subtitle: 'The right opportunity should move your career forward.',
    image: CAREERS_IMAGES.why,
    items: [
      {
        num: '01',
        title: 'Work on Meaningful Technology Challenges',
        body:
          'Get considered for roles and projects where your expertise can contribute to real products, platforms, transformation programs and business outcomes.',
      },
      {
        num: '02',
        title: 'Access Opportunities Across the U.S. and India',
        body:
          'BesTal supports opportunities across geographies and working models. Depending on the role, opportunities may be remote, hybrid, onsite or aligned to client time zones.',
      },
      {
        num: '03',
        title: 'Be Recognized for What You Can Do',
        body:
          'We look beyond job titles and r\u00e9sum\u00e9 keywords. Relevant roles may include structured assessment of technical depth, problem solving, communication and readiness to work with modern engineering teams.',
      },
      {
        num: '04',
        title: 'Choose the Work Model That Fits',
        body:
          'Depending on the opportunity, engagement models may include full-time employment, contract work, part-time assignments, freelance engagements and project-based roles.',
      },
      {
        num: '05',
        title: 'Stay Visible for Future Opportunities',
        body:
          'A strong profile can help BesTal consider you for future roles that match your skills, experience, availability and work preferences \u2014 even when you are not applying to a specific opening.',
      },
      {
        num: '06',
        title: 'Grow With Emerging Technology',
        body:
          'Build experience across high-demand areas such as AI, data, cloud, platform engineering and enterprise applications while working with teams solving real technology problems.',
      },
    ],
  },
  paths: {
    title: 'Explore Technology Career Paths',
    intro:
      'Whether you are a specialist, engineer, consultant, architect or technology leader, explore opportunities across BesTal\u2019s growing technology communities.',
    cards: [
      {
        title: 'AI & Machine Learning',
        body:
          'AI Engineering, Generative AI, Machine Learning, Data Science, MLOps, NLP, Computer Vision and emerging AI technologies.',
        image: CAREER_PATH_IMAGES.aiMl,
      },
      {
        title: 'Data Engineering & Analytics',
        body:
          'Data Engineering, Analytics Engineering, Databricks, Snowflake, ETL/ELT, Data Platforms, BI and modern analytics.',
        image: CAREER_PATH_IMAGES.dataEngineering,
      },
      {
        title: 'Cloud, DevOps & Platform Engineering',
        body:
          'AWS, Azure, Google Cloud, DevOps, SRE, Kubernetes, Infrastructure Automation and Platform Engineering.',
        image: CAREER_PATH_IMAGES.cloudDevOps,
      },
      {
        title: 'Full-Stack & Software Engineering',
        body:
          'Frontend, Backend, Java, .NET, Python, React, Angular, Node.js, APIs, Microservices, Mobile and QA Automation.',
        image: CAREER_PATH_IMAGES.fullStack,
      },
      {
        title: 'Enterprise Applications',
        body: 'SAP, Oracle ERP/EPM/HCM/SCM, Microsoft technologies and other enterprise platforms.',
        image: CAREER_PATH_IMAGES.enterpriseApps,
      },
      {
        title: 'ServiceNow',
        body:
          'Development, Administration, Architecture, ITSM, ITOM, CSM, HRSD, SecOps and Platform Implementation.',
        image: CAREER_PATH_IMAGES.serviceNow,
      },
      {
        title: 'Salesforce',
        body:
          'Development, Administration, Architecture, Integration, Sales Cloud, Service Cloud, Marketing Cloud and Data Cloud.',
        image: CAREER_PATH_IMAGES.salesforce,
      },
      {
        title: 'Others',
        body: 'Other Skill Communities.',
        image: CAREER_PATH_IMAGES.others,
      },
    ],
  },
  journey: {
    title: 'How the BesTal Career Journey Works',
    steps: [
      {
        num: '1',
        title: 'Explore',
        body: 'Browse current opportunities or join the BesTal Network for future roles.',
      },
      {
        num: '2',
        title: 'Create Your Profile',
        body:
          'Tell us about your skills, experience, location, availability, work preferences and career interests.',
      },
      {
        num: '3',
        title: 'Demonstrate Your Expertise',
        body:
          'For relevant opportunities, complete a structured assessment or interview process designed around the role.',
      },
      {
        num: '4',
        title: 'Get Matched',
        body:
          'We consider your capabilities, experience, availability and preferences against relevant BesTal or client opportunities.',
      },
      {
        num: '5',
        title: 'Meet the Team',
        body:
          'If there is a strong fit, meet the BesTal hiring team or client team to understand the role, expectations and working environment.',
      },
      {
        num: '6',
        title: 'Decide Together',
        body:
          'A great engagement should work for both sides. If the role, expectations and terms align, move forward with clarity.',
      },
      {
        num: '7',
        title: 'Do Work You\u2019re Proud Of',
        body:
          'Join the team, contribute your expertise, keep learning and build the next chapter of your career.',
      },
    ],
  },
  regions: [
    {
      title: 'For Professionals in India',
      accent: 'green' as const,
      paragraphs: [
        'Build a career with global exposure without limiting yourself to traditional local opportunities. Depending on the role, BesTal professionals in India may work with global teams, collaborate across time zones and contribute to technology initiatives for clients in international markets.',
        'Working hours, location expectations and engagement terms vary by opportunity and are communicated during the selection process.',
      ],
      image: CAREERS_IMAGES.india,
    },
    {
      title: 'For Professionals in the United States',
      accent: 'slate' as const,
      paragraphs: [
        'Explore technology opportunities that combine specialized expertise with flexible ways of working. BesTal supports roles and engagements where U.S.-based professionals can contribute to client programs, consulting initiatives, engineering teams and specialized technology projects.',
        'Role type, location, compensation structure and employment or contracting terms vary by opportunity.',
      ],
      image: CAREERS_IMAGES.us,
    },
  ],
  values: {
    title: 'What We Value',
    intro:
      'Great technology teams are built on more than technical skill. We value professionals who combine expertise with curiosity, ownership and the ability to work well with others.',
    image: CAREERS_IMAGES.values,
    items: [
      'Strong technical fundamentals and a willingness to keep learning',
      'Ownership and accountability',
      'Clear, respectful communication',
      'Problem solving and practical thinking',
      'Collaboration across teams, cultures and time zones',
      'Customer and business awareness',
      'Integrity and professionalism',
    ],
  },
  join: {
    title: 'Join the BesTal Network',
    subtitle: 'Not every opportunity starts with a job posting.',
    body:
      'Join the BesTal Network to build professional visibility for future opportunities aligned with your expertise, location, availability and career interests. When a relevant opportunity arises, our team can review your profile and reach out if there is a potential fit.',
    primaryCta: 'Join now',
    image: CAREERS_IMAGES.join,
  },
  process: {
    title: 'A Transparent Process',
    paragraphs: [
      'Applying for a role or joining the BesTal Network does not guarantee an interview, assignment, client engagement or placement. Opportunities depend on business and client demand, role requirements, location, work authorization where applicable, skills, experience, assessment results, availability and overall fit.',
      'We believe candidates deserve clarity. Where possible, BesTal aims to communicate the role, engagement model, working expectations and next steps early in the process.',
    ],
  },
  emptyOpenings: {
    label: 'CAREERS',
    title: 'No current openings',
    body:
      'There are no open positions available at the moment. Please check back soon for new opportunities.',
    primaryCta: 'Explore our teams',
    primaryHref: '#career-paths',
    secondaryCta: 'Check back soon',
    cardText: 'Great people build great products',
    image: CAREERS_EMPTY_OPENINGS_IMAGE,
  },
  closing: {
    title: 'Ready for Your Next Opportunity?',
    body:
      'Explore current openings or join the BesTal Network and stay visible for opportunities that match what you do best.',
    asideTitle: 'Your Skills Deserve More Than a Resume',
    cta: 'Explore Opportunities',
    secondaryPrompt: 'Not ready to apply?',
    secondaryCta: 'Join the BesTal Network.',
    image: CAREERS_IMAGES.closing,
  },
} as const;

export const CAREERS_WHY_TABS = [
  {
    id: 'impact',
    label: 'Impact',
    title: 'Happy customers',
    body: 'Empowering our customers to achieve their business goals consistently leveraging our deep technology experience without negotiating on the quality.',
    image: CAREERS_IMAGES.why,
    imageAlt: 'Team reviewing customer feedback on a dashboard',
  },
] as const;

export type CareersWhyTabId = (typeof CAREERS_WHY_TABS)[number]['id'];

export const CAREERS_CORE_VALUES = [
  {
    id: 'innovation',
    title: 'Innovation',
    body: 'We unleash creativity by making innovation part of each associate\u2019s job responsibility.',
  },
] as const;

export const CAREERS_EQUAL = {
  title: 'WE ENCOURAGE EQUAL RIGHTS AND OPPORTUNITIES',
  intro:
    'We exercise an inclusive and safe work environment to provide equal rights and opportunities for our stakeholders across the globe as foundational values to envision a better society.',
  image: CAREERS_IMAGES.india,
  imageAlt: 'Modern office desk with laptop and workspace essentials',
  items: [] as const,
} as const;

export const CAREERS_APPLY_EMAIL = 'careers@bestal.co';

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
