export type Feature = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string; // lucide icon name
  colSpan?: number;
};

export const FEATURES: Feature[] = [
  { id: 'input-minimal', titleKey: 'f1Title', descriptionKey: 'f1Desc', icon: 'PenLine' },
  { id: 'character-master', titleKey: 'f2Title', descriptionKey: 'f2Desc', icon: 'Users', colSpan: 2 },
  { id: 'multi-provider', titleKey: 'f3Title', descriptionKey: 'f3Desc', icon: 'Cpu' },
  { id: 'export', titleKey: 'f4Title', descriptionKey: 'f4Desc', icon: 'FileDown' },
  { id: 'realtime-logs', titleKey: 'f5Title', descriptionKey: 'f5Desc', icon: 'Terminal' },
  { id: 'upload-ref', titleKey: 'f6Title', descriptionKey: 'f6Desc', icon: 'Upload' },
];
