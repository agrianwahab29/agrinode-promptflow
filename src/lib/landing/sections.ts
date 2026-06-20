export type SectionId = 'features' | 'how-it-works' | 'faq';

export const SECTIONS: { id: SectionId; labelKey: string }[] = [
  { id: 'features', labelKey: 'nav.features' },
  { id: 'how-it-works', labelKey: 'nav.howItWorks' },
  { id: 'faq', labelKey: 'nav.faq' },
];
