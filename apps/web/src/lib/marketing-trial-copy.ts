import {
  ABOUT_DIFFERENCE,
  CONTROL_TABLE,
  EVIDENCE_STRIP,
  FAQ_PAGE,
  HIW_CLIENT,
  HOME_STATS,
  TRIAL_SETTLED,
  TRIAL_STEPS,
  type AboutDifferenceCard,
  type FaqCategory,
  type FaqItem,
} from './marketing-copy';
import {
  DEFAULT_FREE_TRIAL_HOURS,
  formatFirstFreeTrialHours,
  formatFreeTrialHours,
  formatFreeTrialHoursHyphenated,
  formatFreeTrialHoursTitle,
  formatUpToFreeTrialHours,
} from './trial-policy';

export function buildEvidenceStrip(freeTrialHours: number = DEFAULT_FREE_TRIAL_HOURS) {
  return EVIDENCE_STRIP.map((item) =>
    item.num === '06'
      ? { ...item, title: `${formatFreeTrialHoursTitle(freeTrialHours)} Free Trial` }
      : item,
  );
}

export function buildHomeStats(
  freeTrialHours: number = DEFAULT_FREE_TRIAL_HOURS,
  skillCommunityCount?: number,
) {
  return HOME_STATS.map((stat) => {
    if (stat.label.startsWith('Hours free')) {
      return { ...stat, value: String(freeTrialHours) };
    }
    if (stat.label === 'Skill Communities' && skillCommunityCount != null && skillCommunityCount > 0) {
      return { ...stat, value: String(skillCommunityCount) };
    }
    return stat;
  });
}

export function buildTrialSteps(freeTrialHours: number = DEFAULT_FREE_TRIAL_HOURS) {
  const hoursLabel = formatFreeTrialHours(freeTrialHours);
  return TRIAL_STEPS.map((step) => {
    if (step.step === 2) {
      return {
        ...step,
        title: `Define the ${hoursLabel}`,
      };
    }
    if (step.step === 4) {
      return {
        ...step,
        body: `Continue into a paid engagement, swap for a different engineer, or stop. No charge for the ${hoursLabel} either way.`,
      };
    }
    return step;
  });
}

export function buildTrialSettled(freeTrialHours: number = DEFAULT_FREE_TRIAL_HOURS) {
  const hoursLabel = formatFreeTrialHours(freeTrialHours);
  return TRIAL_SETTLED.map((item) =>
    item.strong.startsWith('The ')
      ? { ...item, strong: `The ${hoursLabel} are free.` }
      : item,
  );
}

export function buildControlTable(freeTrialHours: number = DEFAULT_FREE_TRIAL_HOURS) {
  const hoursLabel = formatFreeTrialHours(freeTrialHours);
  return {
    ...CONTROL_TABLE,
    youControl: CONTROL_TABLE.youControl.map((row) =>
      row.startsWith('What the ') ? `What the ${hoursLabel} are spent on` : row,
    ),
  };
}

export function buildAboutDifference(
  freeTrialHours: number = DEFAULT_FREE_TRIAL_HOURS,
): AboutDifferenceCard[] {
  const hoursLabel = formatUpToFreeTrialHours(freeTrialHours);
  return ABOUT_DIFFERENCE.map((item) =>
    item.num === '04'
      ? {
          ...item,
          body: `Put any available engineer on real work for ${hoursLabel} at no charge. Keep everything they produce, whether you continue or not. The best way to evaluate talent is through real work, in your systems, alongside your team.`,
        }
      : item,
  );
}

export function buildHiwClient(freeTrialHours: number = DEFAULT_FREE_TRIAL_HOURS) {
  return {
    ...HIW_CLIENT,
    flowRibbon: {
      ...HIW_CLIENT.flowRibbon,
      right: `${freeTrialHours} free hours · 3 outcomes`,
    },
    processCards: HIW_CLIENT.processCards.map((card) =>
      'trialHours' in card
        ? {
            ...card,
            trialHours: freeTrialHours,
            body: `${freeTrialHours} free hours. You choose the engineer and what the hours are spent on.`,
          }
        : card,
    ),
    stages: HIW_CLIENT.stages.map((stage) =>
      stage.num === '04'
        ? {
            ...stage,
            title: `Start a ${formatFreeTrialHoursHyphenated(freeTrialHours)} Free Trial`,
          }
        : stage,
    ),
  };
}

function buildFaqTrialItems(freeTrialHours: number): FaqItem[] {
  const hoursHyphen = formatFreeTrialHoursHyphenated(freeTrialHours);
  const hoursLabel = formatFreeTrialHours(freeTrialHours);
  const trialCategory = FAQ_PAGE.categories.find((category) => category.id === 'trial');
  if (!trialCategory) return [];

  return trialCategory.items.map((item) => {
    if (item.question.includes('How does the') && item.question.includes('Free Trial work')) {
      return {
        ...item,
        question: `How does the ${hoursHyphen} Free Trial work?`,
        answer: `You can assign real work to an engineer for ${formatUpToFreeTrialHours(freeTrialHours)} at no charge. The trial is designed to help you evaluate technical capability, communication, and overall fit.`,
      };
    }
    if (item.answer.includes('10 hours')) {
      return {
        ...item,
        answer: item.answer.replace(/10 hours/g, hoursLabel),
      };
    }
    return item;
  });
}

export function buildFaqCategories(
  freeTrialHours: number = DEFAULT_FREE_TRIAL_HOURS,
): FaqCategory[] {
  return FAQ_PAGE.categories.map((category) =>
    category.id === 'trial'
      ? { ...category, items: buildFaqTrialItems(freeTrialHours) }
      : category,
  );
}

export function buildTryForAWeekSeo(freeTrialHours: number = DEFAULT_FREE_TRIAL_HOURS) {
  return {
    title: `${formatFreeTrialHoursTitle(freeTrialHours)} Trial — See Them Perform Before You Commit`,
    description: `See test results, rate and start date up front, then try an engineer free. No recruiter calls, no sourcing cycle, no commitment for ${formatFirstFreeTrialHours(freeTrialHours)}.`,
  };
}
