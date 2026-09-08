import type { LegalDocument } from './types';

export const TERMS_OF_SERVICE: LegalDocument = {
  title: 'Terms of Service',
  effectiveDate: 'August 24, 2026',
  lastUpdated: 'August 24, 2026',
  intro: [
    {
      type: 'paragraph',
      text: 'Welcome to BesTal. These Terms of Service ("Terms") govern your access to and use of the BesTal website, platform, and related services.',
    },
    {
      type: 'paragraph',
      text: 'By accessing or using BesTal, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.',
    },
  ],
  sections: [
    {
      id: 'about-bestal',
      title: '1. About BesTal',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal is a talent platform that connects organizations with Pre-Vetted Technology Professionals, including freelancers, contractors, dedicated engineers, and managed teams.',
        },
        {
          type: 'paragraph',
          text: 'BesTal provides access to talent profiles, assessment information, verification status, availability information, and related workforce solutions.',
        },
      ],
    },
    {
      id: 'eligibility',
      title: '2. Eligibility',
      blocks: [
        {
          type: 'paragraph',
          text: 'You must be at least 18 years of age and legally capable of entering into binding agreements to use the platform.',
        },
        {
          type: 'paragraph',
          text: 'If you use BesTal on behalf of an organization, you represent that you have authority to bind that organization to these Terms.',
        },
      ],
    },
    {
      id: 'account-registration',
      title: '3. Account Registration',
      blocks: [
        {
          type: 'paragraph',
          text: 'Certain features of the platform may require registration.',
        },
        {
          type: 'paragraph',
          text: 'You agree to:',
        },
        {
          type: 'list',
          items: [
            'Provide accurate and current information',
            'Maintain the confidentiality of your account credentials',
            'Notify BesTal of any unauthorized account activity',
            'Accept responsibility for activity occurring under your account',
          ],
        },
      ],
    },
    {
      id: 'platform-use',
      title: '4. Platform Use',
      blocks: [
        {
          type: 'paragraph',
          text: 'You agree to use BesTal only for lawful business purposes.',
        },
        {
          type: 'paragraph',
          text: 'You may not:',
        },
        {
          type: 'list',
          items: [
            'Use the platform for fraudulent or unlawful activities',
            'Misrepresent your identity or organization',
            'Attempt to gain unauthorized access to the platform or systems',
            'Interfere with platform operation or security',
            'Upload malicious software, viruses, or harmful code',
            'Copy, scrape, or systematically extract platform data without permission',
          ],
        },
        {
          type: 'paragraph',
          text: 'BesTal reserves the right to suspend or terminate access for violations of these Terms.',
        },
      ],
    },
    {
      id: 'engineer-profiles',
      title: '5. Engineer Profiles and Information',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal makes reasonable efforts to verify information presented on engineer profiles.',
        },
        {
          type: 'paragraph',
          text: 'Profile information may include:',
        },
        {
          type: 'list',
          items: [
            'Skills and experience',
            'Assessment results',
            'Availability',
            'Rate information',
            'Verification status',
          ],
        },
        {
          type: 'paragraph',
          text: 'While BesTal strives for accuracy, clients remain responsible for evaluating whether an engineer is suitable for their specific requirements.',
        },
      ],
    },
    {
      id: 'assessments-verification',
      title: '6. Assessments and Verification',
      blocks: [
        {
          type: 'paragraph',
          text: 'Assessment results and verification information are provided to assist decision-making.',
        },
        {
          type: 'paragraph',
          text: 'Assessment scores, feedback, and verification status should not be considered guarantees of future performance or outcomes.',
        },
      ],
    },
    {
      id: 'free-trial-program',
      title: '7. Free Trial Program',
      blocks: [
        {
          type: 'paragraph',
          text: 'From time to time, BesTal may offer a Free Trial Program.',
        },
        {
          type: 'paragraph',
          text: 'Participation in any trial program is subject to the applicable Free Trial Terms presented at the time of enrollment.',
        },
        {
          type: 'paragraph',
          text: 'BesTal reserves the right to modify, suspend, or discontinue trial programs at its discretion.',
        },
      ],
    },
    {
      id: 'engagements',
      title: '8. Engagements and Commercial Terms',
      blocks: [
        {
          type: 'paragraph',
          text: 'Any engagement between a client and an engineer beyond a trial period may be subject to additional commercial terms, statements of work, service agreements, or other applicable documentation.',
        },
        {
          type: 'paragraph',
          text: 'Rates, availability, and engagement terms may vary by engineer and project.',
        },
      ],
    },
    {
      id: 'intellectual-property',
      title: '9. Intellectual Property',
      blocks: [
        {
          type: 'paragraph',
          text: 'Unless otherwise agreed:',
        },
        {
          type: 'list',
          items: [
            'BesTal retains ownership of the website, platform, trademarks, branding, content, and technology.',
            'Users may not copy, reproduce, modify, distribute, or create derivative works from platform content without prior written permission.',
            'All BesTal trademarks, logos, and branding remain the property of BesTal.',
          ],
        },
      ],
    },
    {
      id: 'user-content',
      title: '10. User Content',
      blocks: [
        {
          type: 'paragraph',
          text: 'Users may submit information, documents, comments, profiles, project details, or other materials through the platform.',
        },
        {
          type: 'paragraph',
          text: 'You represent that:',
        },
        {
          type: 'list',
          items: [
            'You have the right to provide such content.',
            'The content does not violate applicable laws or third-party rights.',
            'The content is accurate to the best of your knowledge.',
          ],
        },
        {
          type: 'paragraph',
          text: 'You grant BesTal a limited right to use such content for the purpose of operating and providing platform services.',
        },
      ],
    },
    {
      id: 'confidentiality',
      title: '11. Confidentiality',
      blocks: [
        {
          type: 'paragraph',
          text: 'Users may receive confidential information through interactions on the platform.',
        },
        {
          type: 'paragraph',
          text: 'Both clients and engineers agree to use confidential information solely for legitimate business purposes and to protect such information from unauthorized disclosure.',
        },
      ],
    },
    {
      id: 'fair-use',
      title: '12. Fair Use of Introductions',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal invests significant effort in sourcing, assessing, verifying, and presenting engineering talent.',
        },
        {
          type: 'paragraph',
          text: 'If a client chooses to continue working with an engineer introduced through BesTal, we expect the engagement to be managed through BesTal unless otherwise agreed in writing.',
        },
      ],
    },
    {
      id: 'third-party-services',
      title: '13. Third-Party Services',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal may integrate with or link to third-party services, tools, or websites.',
        },
        {
          type: 'paragraph',
          text: 'We are not responsible for:',
        },
        {
          type: 'list',
          items: [
            'Third-party content',
            'Third-party services',
            'Third-party privacy practices',
            'Third-party system availability',
          ],
        },
        {
          type: 'paragraph',
          text: 'Use of third-party services is subject to their respective terms and policies.',
        },
      ],
    },
    {
      id: 'disclaimer',
      title: '14. Disclaimer of Warranties',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal provides its website, platform, and services on an "as is" and "as available" basis.',
        },
        {
          type: 'paragraph',
          text: 'To the maximum extent permitted by law, BesTal disclaims all warranties, whether express or implied, including:',
        },
        {
          type: 'list',
          items: [
            'Merchantability',
            'Fitness for a particular purpose',
            'Non-infringement',
            'Availability or uninterrupted access',
          ],
        },
        {
          type: 'paragraph',
          text: 'BesTal does not guarantee:',
        },
        {
          type: 'list',
          items: [
            'Specific hiring outcomes',
            'Project success',
            'Availability of any particular engineer',
            'Continuous platform operation',
          ],
        },
      ],
    },
    {
      id: 'limitation-of-liability',
      title: '15. Limitation of Liability',
      blocks: [
        {
          type: 'paragraph',
          text: 'To the fullest extent permitted by law, BesTal shall not be liable for:',
        },
        {
          type: 'list',
          items: [
            'Indirect damages',
            'Consequential damages',
            'Incidental damages',
            'Lost profits',
            'Lost revenue',
            'Lost business opportunities',
            'Data loss',
          ],
        },
        {
          type: 'paragraph',
          text: 'Our total liability arising from or related to the use of the platform shall not exceed the amount paid to BesTal during the twelve (12) months preceding the claim, if any.',
        },
      ],
    },
    {
      id: 'indemnification',
      title: '16. Indemnification',
      blocks: [
        {
          type: 'paragraph',
          text: 'You agree to indemnify and hold harmless BesTal, its affiliates, employees, officers, directors, and partners from claims, damages, liabilities, losses, and expenses arising from:',
        },
        {
          type: 'list',
          items: [
            'Your use of the platform',
            'Your violation of these Terms',
            'Your violation of applicable laws',
            'Your infringement of third-party rights',
          ],
        },
      ],
    },
    {
      id: 'suspension-termination',
      title: '17. Suspension and Termination',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal may suspend or terminate access to the platform at any time if:',
        },
        {
          type: 'list',
          items: [
            'These Terms are violated',
            'Fraudulent activity is suspected',
            'Platform security is threatened',
            'Required by law',
          ],
        },
        {
          type: 'paragraph',
          text: 'Termination does not affect rights or obligations that accrued before termination.',
        },
      ],
    },
    {
      id: 'changes-to-terms',
      title: '18. Changes to These Terms',
      blocks: [
        {
          type: 'paragraph',
          text: 'BesTal may update these Terms from time to time.',
        },
        {
          type: 'paragraph',
          text: 'Updated versions will be posted on this page with a revised Effective Date.',
        },
        {
          type: 'paragraph',
          text: 'Continued use of the platform after changes become effective constitutes acceptance of the updated Terms.',
        },
      ],
    },
    {
      id: 'governing-law',
      title: '19. Governing Law',
      blocks: [
        {
          type: 'paragraph',
          text: 'These Terms shall be governed by and construed in accordance with the laws of the State of Texas without regard to conflict-of-law principles.',
        },
      ],
    },
    {
      id: 'contact',
      title: '20. Contact Us',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you have questions regarding these Terms of Service, please contact:',
        },
        {
          type: 'paragraph',
          text: 'BesTal\nEmail: connect@bestal.co\nWebsite: www.bestal.co',
        },
      ],
    },
  ],
};
