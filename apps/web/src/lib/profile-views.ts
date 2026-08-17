/** Profile tab artwork — files live in apps/web/public */

export type ProfileView = {
  id: string;
  label: string;
  src: string;
  fileName: string;
  alt: string;
  /** contain = full width, top aligned; cover-bottom = fill frame, bottom aligned */
  fit?: 'cover' | 'contain' | 'cover-bottom';
  hidden?: boolean;
};

export const PROFILE_VIEWS: ProfileView[] = [
  {
    id: 'overview',
    label: 'Overview',
    src: '/Container.png',
    fileName: 'Container.png',
    alt: 'Publishing checklist and snapshot — profile readiness overview',
    fit: 'contain',
  },
  {
    id: 'evolution',
    label: 'Evaluation',
    src: '/Frame 2087329911.png',
    fileName: 'Container-1.png',
    alt: 'Evaluation scores, recommendation and skill breakdown',
    fit: 'contain',
  },
  {
    id: 'bgv',
    label: 'BGV',
    src: '/Container_bvg.png',
    fileName: 'Container-2.png',
    alt: 'Background verification — five-category verification status',
    fit: 'contain',
  },
  {
    id: 'documents',
    label: 'Documents',
    src: '/Container-2.png',
    fileName: 'Frame 2087329911.png',
    alt: 'Uploaded documents — resume, identity and education files',
    fit: 'contain',
    hidden: true,
  },
];

/** Tabs shown in the profile carousel (Documents hidden) */
export const PROFILE_VIEWS_VISIBLE = PROFILE_VIEWS.filter((view) => !view.hidden);

/** BGV artwork sets the shared frame height at full width */
export const PROFILE_FRAME_VIEW = PROFILE_VIEWS.find((view) => view.id === 'bgv')!;
