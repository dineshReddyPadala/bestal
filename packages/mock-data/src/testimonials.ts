import type { Testimonial } from './types.js';

export const testimonials = [
  {
    id: 1,
    quote:
      'BesTal delivered three senior React architects in under two weeks. Every candidate passed our technical bar on the first interview.',
    authorName: 'Sarah Chen',
    authorTitle: 'VP of Engineering',
    company: 'Stripe',
    companyLogoUrl: 'https://logo.clearbit.com/stripe.com',
    rating: 5,
    featured: true,
  },
  {
    id: 2,
    quote:
      'We replaced a six-month hiring cycle with BesTal\'s curated shortlists. The quality rivals our internal senior hires.',
    authorName: 'Marcus Webb',
    authorTitle: 'CTO',
    company: 'Shopify',
    companyLogoUrl: 'https://logo.clearbit.com/shopify.com',
    rating: 5,
    featured: true,
  },
  {
    id: 3,
    quote:
      'Their DevOps specialists integrated with our platform team seamlessly. Background checks and compliance were handled end-to-end.',
    authorName: 'Elena Rodriguez',
    authorTitle: 'Director of Cloud Infrastructure',
    company: 'JPMorgan Chase',
    companyLogoUrl: 'https://logo.clearbit.com/jpmorganchase.com',
    rating: 5,
    featured: true,
  },
  {
    id: 4,
    quote:
      'BesTal\'s ML engineers helped us ship a production recommendation system in 90 days. Exceptional talent density.',
    authorName: 'David Okonkwo',
    authorTitle: 'Head of AI',
    company: 'Spotify',
    companyLogoUrl: 'https://logo.clearbit.com/spotify.com',
    rating: 5,
    featured: false,
  },
  {
    id: 5,
    quote:
      'From shortlist to deployment, the client portal kept our stakeholders aligned. Transparent evaluations and interview scheduling.',
    authorName: 'Jennifer Walsh',
    authorTitle: 'Chief People Officer',
    company: 'Airbnb',
    companyLogoUrl: 'https://logo.clearbit.com/airbnb.com',
    rating: 4,
    featured: false,
  },
] as const satisfies readonly Testimonial[];

export type Testimonials = typeof testimonials;
