import type { LegalDocument } from './types';

export const COOKIE_POLICY: LegalDocument = {
  title: 'Cookie Policy',
  effectiveDate: 'August 24, 2026',
  lastUpdated: 'August 24, 2026',
  intro: [
    {
      type: 'paragraph',
      text: 'This Cookie Policy explains how BesTal ("BesTal," "we," "us," or "our") uses cookies and similar technologies when you visit or interact with our website.',
    },
    {
      type: 'paragraph',
      text: 'By using the BesTal website, you agree to the use of cookies as described in this Cookie Policy.',
    },
  ],
  sections: [
    {
      id: 'what-are-cookies',
      title: '1. What Are Cookies?',
      blocks: [
        {
          type: 'paragraph',
          text: 'Cookies are small text files stored on your device when you visit a website. They help websites function properly, remember preferences, and provide insights into how visitors use the site.',
        },
      ],
    },
    {
      id: 'how-we-use-cookies',
      title: '2. How We Use Cookies',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal uses cookies to:',
        },
        {
          type: 'list',
          items: [
            'Ensure the website functions properly',
            'Improve website performance and user experience',
            'Remember user preferences and settings',
            'Understand how visitors interact with the website',
            'Analyze website traffic and usage patterns',
            'Maintain website security and prevent misuse',
          ],
        },
      ],
    },
    {
      id: 'types-of-cookies',
      title: '3. Types of Cookies We Use',
      blocks: [],
      subsections: [
        {
          id: 'essential-cookies',
          title: 'Essential Cookies',
          blocks: [
            {
              type: 'paragraph',
              text: 'These cookies are necessary for the operation of our website and cannot be disabled through our website settings.',
            },
            {
              type: 'paragraph',
              text: 'They help with:',
            },
            {
              type: 'list',
              items: [
                'Website functionality',
                'Security and fraud prevention',
                'Session management',
                'User authentication',
              ],
            },
            {
              type: 'paragraph',
              text: 'Without these cookies, certain parts of the website may not function properly.',
            },
          ],
        },
        {
          id: 'analytics-cookies',
          title: 'Analytics Cookies',
          blocks: [
            {
              type: 'paragraph',
              text: 'These cookies help us understand how visitors use our website so we can improve its performance and user experience.',
            },
            {
              type: 'paragraph',
              text: 'They may collect information such as:',
            },
            {
              type: 'list',
              items: [
                'Pages visited',
                'Time spent on pages',
                'Traffic sources',
                'Device and browser information',
                'User interactions with website content',
              ],
            },
            {
              type: 'paragraph',
              text: 'Information collected through analytics cookies is typically aggregated and used to understand website performance and visitor behavior. This information generally does not directly identify individual visitors.',
            },
          ],
        },
        {
          id: 'functional-cookies',
          title: 'Functional Cookies',
          blocks: [
            {
              type: 'paragraph',
              text: 'These cookies allow the website to remember preferences such as:',
            },
            {
              type: 'list',
              items: ['Language selection', 'Form information', 'User settings'],
            },
            {
              type: 'paragraph',
              text: 'They help provide a more personalized experience.',
            },
          ],
        },
      ],
    },
    {
      id: 'third-party-services',
      title: '4. Third-Party Services',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal may use trusted third-party service providers, such as analytics, hosting, and security providers, to help operate our website and improve our services.',
        },
        {
          type: 'paragraph',
          text: 'These providers may use cookies and similar technologies in accordance with their own privacy policies.',
        },
      ],
    },
    {
      id: 'managing-cookies',
      title: '5. Managing Cookies',
      blocks: [
        {
          type: 'paragraph',
          text: 'Most web browsers allow you to:',
        },
        {
          type: 'list',
          items: [
            'View stored cookies',
            'Delete cookies',
            'Block specific cookies',
            'Block all cookies',
            'Receive notifications before cookies are stored',
          ],
        },
        {
          type: 'paragraph',
          text: 'You can manage cookie preferences through your browser settings.',
        },
        {
          type: 'paragraph',
          text: 'Please note that disabling certain cookies may impact website functionality and your overall user experience.',
        },
      ],
    },
    {
      id: 'browser-support',
      title: '6. Browser Support Resources',
      blocks: [
        {
          type: 'paragraph',
          text: 'For more information on managing cookies, visit:',
        },
        {
          type: 'list',
          items: [
            'Google Chrome: https://support.google.com/chrome',
            'Microsoft Edge: https://support.microsoft.com/edge',
            'Mozilla Firefox: https://support.mozilla.org/firefox',
            'Apple Safari: https://support.apple.com/safari',
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: '7. Changes to This Cookie Policy',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal may update this Cookie Policy from time to time.',
        },
        {
          type: 'paragraph',
          text: 'Any changes will be posted on this page with an updated Effective Date.',
        },
        {
          type: 'paragraph',
          text: 'By continuing to use the website after changes are posted, you agree to the updated Cookie Policy.',
        },
      ],
    },
    {
      id: 'contact',
      title: '8. Contact Us',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you have questions regarding this Cookie Policy, please contact us:',
        },
        {
          type: 'paragraph',
          text: 'BesTal\nEmail: connect@bestal.co\nWebsite: www.bestal.co',
        },
      ],
    },
  ],
};
