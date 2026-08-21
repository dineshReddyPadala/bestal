export const FREE_TRIAL_TERMS_INTRO =
  'By starting a free trial with a BesTal engineer, you acknowledge and agree to the following:';

export const FREE_TRIAL_TERMS_CHECKBOX_LABEL =
  'I have read and agree to the BesTal Free Trial Terms.';

export const FREE_TRIAL_TERMS_CLOSING =
  'The Free Trial is intended to help clients evaluate talent through real work in their own environment before making a hiring or engagement decision.';

export function buildFreeTrialTermsItems(freeTrialHours: number): Array<{ title: string; body: string }> {
  const hoursLabel = String(freeTrialHours);

  return [
    {
      title: 'Trial Scope',
      body: `The BesTal Free Trial allows your organization to engage a selected engineer for up to ${hoursLabel} working hours at no charge to evaluate technical skills, communication, and overall suitability for your requirements.`,
    },
    {
      title: 'Evaluation Purpose',
      body: "The Free Trial is intended solely for evaluating an engineer's capabilities and fit for a potential engagement with your organization.",
    },
    {
      title: 'Work Product',
      body: 'Any work completed during the trial belongs to your organization and may be retained and used by you, regardless of whether you proceed with a paid engagement.',
    },
    {
      title: 'No Employment Relationship',
      body: 'Participation in the trial does not create an employment relationship between your organization and the engineer.',
    },
    {
      title: 'Non-Circumvention',
      body: 'Engineers introduced through BesTal are introduced solely through the BesTal platform. You agree not to directly hire, employ, contract with, solicit, or otherwise engage a BesTal-introduced engineer outside of BesTal during the trial period and for six (6) months thereafter.',
    },
    {
      title: 'One Trial Per Engineer',
      body: "The Free Trial is available once per engineer per client organization. Additional trial requests for the same engineer are on BesTal's discretion.",
    },
    {
      title: 'Trial Hours Limit',
      body: `The Free Trial is limited to a maximum of ${hoursLabel} hours per engineer unless otherwise agreed in writing by BesTal.`,
    },
    {
      title: 'Right to Modify or Withdraw',
      body: 'The Free Trial must be used in good faith for evaluation purposes. BesTal reserves the right to modify or decline or discontinue the Free Trial Program at any time.',
    },
    {
      title: 'Confidential Information',
      body: 'Both parties may exchange confidential information during the trial. Each party agrees to protect such information and use it only for trial and evaluation purposes.',
    },
    {
      title: 'No Guarantees',
      body: "While BesTal conducts assessments and verification checks, the Free Trial is provided so that you may independently evaluate the engineer's suitability for your specific needs. BesTal does not guarantee any particular outcome from the trial.",
    },
    {
      title: 'Transition to Paid Engagement',
      body: `Any work requested beyond the ${hoursLabel}-hour Free Trial must be performed under a paid engagement arranged through BesTal.`,
    },
    {
      title: 'Authority to Accept',
      body: 'By accepting these terms, you confirm that you are authorized to act on behalf of your organization and agree to these Free Trial Terms.',
    },
  ];
}

/** @deprecated Use buildFreeTrialTermsItems(freeTrialHours) */
export const FREE_TRIAL_TERMS_ITEMS = buildFreeTrialTermsItems(20);
