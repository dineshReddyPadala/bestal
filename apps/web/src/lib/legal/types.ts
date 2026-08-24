export type LegalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
  subsections?: LegalSection[];
};

export type LegalDocument = {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  intro?: LegalBlock[];
  sections: LegalSection[];
  outro?: LegalBlock[];
};
