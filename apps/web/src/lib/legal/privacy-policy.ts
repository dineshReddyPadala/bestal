import type { LegalDocument } from './types';

export const PRIVACY_POLICY: LegalDocument = {
  title: 'Privacy Policy',
  effectiveDate: 'August 24, 2026',
  lastUpdated: 'August 24, 2026',
  sections: [
    {
      id: 'introduction',
      title: '1. Introduction',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal ("BesTal," "we," "us," or "our") respects your privacy and is committed to protecting the personal information you share with us.',
        },
        {
          type: 'paragraph',
          text: 'This Privacy Policy explains how we collect, use, disclose, and safeguard information when you visit our website, use our platform, or interact with our services.',
        },
        {
          type: 'paragraph',
          text: 'By accessing or using the BesTal website and services, you agree to the collection and use of information in accordance with this Privacy Policy.',
        },
      ],
    },
    {
      id: 'information-we-collect',
      title: '2. Information We Collect & Information You Provide',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may collect information that you voluntarily provide when you:',
        },
        {
          type: 'list',
          items: [
            'Create an account',
            'Submit an inquiry',
            'Request information',
            'Apply as an engineer',
            'Complete assessments',
            'Engage with a client or engineer through the platform',
            'Contact our support team',
          ],
        },
        {
          type: 'paragraph',
          text: 'This information may include:',
        },
        {
          type: 'list',
          items: [
            'Name',
            'Email address',
            'Phone number',
            'Company name',
            'Job title',
            'Location',
            'Resume or professional profile information',
            'Skills and experience',
            'Availability information',
            'Billing or payment-related information',
          ],
        },
      ],
      subsections: [
        {
          id: 'talent-assessment',
          title: '2.1 Talent Assessment Information',
          blocks: [
            {
              type: 'paragraph',
              text: 'For engineers using the BesTal platform, we may collect information related to:',
            },
            {
              type: 'list',
              items: [
                'Technical assessments',
                'Assessment scores',
                'Interview feedback',
                'Communication evaluations',
                'Professional qualifications',
                'Work experience',
                'Availability preferences',
                'Skill verification results',
              ],
            },
            {
              type: 'paragraph',
              text: "Assessment results may be displayed to prospective clients as part of an engineer's profile.",
            },
          ],
        },
        {
          id: 'verification',
          title: '2.2 Verification Information',
          blocks: [
            {
              type: 'paragraph',
              text: 'To maintain platform integrity, BesTal may collect information necessary to verify identity and professional credentials.',
            },
            {
              type: 'paragraph',
              text: 'This may include:',
            },
            {
              type: 'list',
              items: [
                'Government-issued identification',
                'Identity verification records',
                'Employment verification information',
                'Education verification information',
              ],
            },
            {
              type: 'paragraph',
              text: 'Verification documents are used solely for verification purposes and are not shared publicly with clients.',
            },
            {
              type: 'paragraph',
              text: "BesTal may display verification status on engineer profiles but does not share underlying identity, education, employment, or verification documents without the engineer's consent, unless required by law.",
            },
          ],
        },
        {
          id: 'automatically-collected',
          title: '2.3 Information Collected Automatically',
          blocks: [
            {
              type: 'paragraph',
              text: 'When you visit our website, we may automatically collect:',
            },
            {
              type: 'list',
              items: [
                'IP address',
                'Browser type',
                'Device information',
                'Operating system',
                'Pages visited',
                'Date and time of access',
                'Referral URLs',
                'Website usage and interaction data',
              ],
            },
            {
              type: 'paragraph',
              text: 'This information helps us improve our website, services, and user experience.',
            },
          ],
        },
      ],
    },
    {
      id: 'how-we-use',
      title: '3. How We Use Information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may use your information to:',
        },
        {
          type: 'list',
          items: [
            'Operate and improve our platform and services',
            'Create and manage user accounts',
            'Match clients with engineers',
            'Facilitate communications between users',
            'Conduct assessments and verification activities',
            'Provide customer support',
            'Process payments',
            'Monitor platform security',
            'Detect fraud, abuse, or misuse',
            'Comply with legal obligations',
            'Send service-related communications',
          ],
        },
        {
          type: 'paragraph',
          text: 'Where permitted by law, we may also send marketing and promotional communications. You may opt out of these communications at any time.',
        },
      ],
    },
    {
      id: 'how-we-share',
      title: '4. How We Share Information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We do not sell personal information.',
        },
        {
          type: 'paragraph',
          text: 'We may share information in the following circumstances:',
        },
      ],
      subsections: [
        {
          id: 'with-clients',
          title: '4.1 With Clients',
          blocks: [
            {
              type: 'paragraph',
              text: 'Engineer profile information may be shared with prospective clients, including:',
            },
            {
              type: 'list',
              items: [
                'Skills and experience',
                'Assessment results',
                'Availability',
                'Hourly rates',
                'Verification status',
                'Professional background information',
              ],
            },
            {
              type: 'paragraph',
              text: 'Personal verification documents are never shared with clients.',
            },
          ],
        },
        {
          id: 'service-providers',
          title: '4.2 With Service Providers',
          blocks: [
            {
              type: 'paragraph',
              text: 'We may share information with trusted third-party providers that help us operate our business, including providers of:',
            },
            {
              type: 'list',
              items: [
                'Identity verification services',
                'Assessment services',
                'Website hosting',
                'Analytics',
                'Payment processing',
                'Customer support',
              ],
            },
            {
              type: 'paragraph',
              text: 'These providers are authorized to use information only as necessary to provide services on our behalf.',
            },
          ],
        },
        {
          id: 'legal-requirements',
          title: '4.3 Legal Requirements',
          blocks: [
            {
              type: 'paragraph',
              text: 'We may disclose information if required by law or when we reasonably believe disclosure is necessary to:',
            },
            {
              type: 'list',
              items: [
                'Comply with legal obligations',
                'Protect our rights and property',
                'Prevent fraud or misuse',
                'Protect the safety of users or others',
              ],
            },
          ],
        },
        {
          id: 'business-transactions',
          title: '4.4 Business Transactions',
          blocks: [
            {
              type: 'paragraph',
              text: 'If BesTal is involved in a merger, acquisition, financing, reorganization, or sale of assets, information may be transferred as part of that transaction.',
            },
          ],
        },
      ],
    },
    {
      id: 'data-retention',
      title: '5. Data Retention',
      blocks: [
        {
          type: 'paragraph',
          text: 'We retain personal information only for as long as reasonably necessary to:',
        },
        {
          type: 'list',
          items: [
            'Provide services',
            'Maintain business records',
            'Comply with legal obligations',
            'Resolve disputes',
            'Enforce our agreements',
            'Protect the security and integrity of the platform',
          ],
        },
        {
          type: 'paragraph',
          text: 'When information is no longer required, it will be securely deleted or anonymized where appropriate.',
        },
      ],
    },
    {
      id: 'data-security',
      title: '6. Data Security',
      blocks: [
        {
          type: 'paragraph',
          text: 'We implement reasonable administrative, technical, and organizational safeguards designed to protect personal information from unauthorized access, disclosure, alteration, or destruction.',
        },
        {
          type: 'paragraph',
          text: 'BesTal regularly reviews its security practices and access controls to help protect the confidentiality, integrity, and availability of personal information.',
        },
        {
          type: 'paragraph',
          text: 'While we strive to protect your information, no method of transmission over the internet or electronic storage can be guaranteed to be completely secure.',
        },
      ],
    },
    {
      id: 'cookies',
      title: '7. Cookies and Similar Technologies',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal may use cookies and similar technologies to:',
        },
        {
          type: 'list',
          items: [
            'Improve website performance',
            'Remember user preferences',
            'Analyze website usage',
            'Enhance user experience',
            'Support marketing and advertising activities',
          ],
        },
        {
          type: 'paragraph',
          text: 'You can control cookie settings through your browser preferences. Disabling cookies may impact certain website functionality.',
        },
        {
          type: 'paragraph',
          text: 'For more information, please review our Cookie Policy.',
        },
      ],
    },
    {
      id: 'privacy-choices',
      title: '8. Your Privacy Choices',
      blocks: [
        {
          type: 'paragraph',
          text: 'You may have the right to:',
        },
        {
          type: 'list',
          items: [
            'Access personal information we hold about you',
            'Request correction of inaccurate information',
            'Request deletion of personal information, where applicable',
            'Opt out of marketing communications',
            'Request information regarding how your data is used',
          ],
        },
        {
          type: 'paragraph',
          text: 'To make a request, please contact us using the details provided below.',
        },
      ],
    },
    {
      id: 'international-transfers',
      title: '9. International Data Transfers',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal operates globally and may transfer, store, or process information in countries other than your country of residence.',
        },
        {
          type: 'paragraph',
          text: 'By using our services, you acknowledge that your information may be processed in locations where BesTal or its service providers operate.',
        },
      ],
    },
    {
      id: 'third-party-websites',
      title: '10. Third-Party Websites',
      blocks: [
        {
          type: 'paragraph',
          text: 'Our website may contain links to third-party websites or services.',
        },
        {
          type: 'paragraph',
          text: 'BesTal is not responsible for the privacy practices or content of third-party websites. We encourage users to review the privacy policies of any third-party sites they visit.',
        },
      ],
    },
    {
      id: 'childrens-privacy',
      title: "11. Children's Privacy",
      blocks: [
        {
          type: 'paragraph',
          text: "BesTal's services are intended for business and professional use.",
        },
        {
          type: 'paragraph',
          text: 'We do not knowingly collect personal information from individuals under the age of 18. If we become aware that such information has been collected, we will take appropriate steps to delete it.',
        },
      ],
    },
    {
      id: 'changes',
      title: '12. Changes to This Privacy Policy',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may update this Privacy Policy from time to time.',
        },
        {
          type: 'paragraph',
          text: 'Any changes will be posted on this page with an updated Effective Date.',
        },
        {
          type: 'paragraph',
          text: 'Continued use of our website or services after changes become effective constitutes acceptance of the updated Privacy Policy.',
        },
      ],
    },
    {
      id: 'contact',
      title: '13. Contact Us',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you have questions about this Privacy Policy, our privacy practices, or would like to request access, correction, or deletion of your personal information, please contact us:',
        },
        {
          type: 'paragraph',
          text: 'BesTal\nEmail: connect@bestal.co\nWebsite: www.bestal.co',
        },
      ],
    },
  ],
};
