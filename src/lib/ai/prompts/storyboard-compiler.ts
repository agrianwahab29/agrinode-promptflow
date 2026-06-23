import type { StoryboardSegment } from '@/lib/validation/schemas';

export function compileStoryboardMarkdown(segment: StoryboardSegment): string {
  const vs = segment.visualStyle;
  const lines = [
    `# STORYBOARD — Segmen ${segment.segmentIndex}`,
    `**Judul:** ${segment.segmentTransitionNote}`,
    `**Durasi:** ${segment.segmentTimeStart}s - ${segment.segmentTimeEnd}s`,
    `**Format:** ${vs.aspectRatio} | ${vs.artDirection}`,
    '',
    '## Panduan Gaya Visual',
    `- **Rasio Aspek:** ${vs.aspectRatio}`,
    `- **Arah Seni:** ${vs.artDirection}`,
    `- **Palet Warna:** ${vs.colorPalette}`,
    `- **Sinematografi:** ${typeof vs.cinematography === 'string' ? vs.cinematography : JSON.stringify(vs.cinematography)}`,
    '',
    '## Daftar Karakter',
    ...segment.characterSheet.map((c) =>
      `- **${c.name}:** ${c.visualDescription}${c.referenceImagePrompt ? ` | Ref: ${c.referenceImagePrompt}` : ''}`
    ),
    '',
    '## Daftar Lokasi',
    ...segment.locationSheet.map((l) =>
      `- **${l.name}:** ${l.visualDescription}${l.referenceImagePrompt ? ` | Ref: ${l.referenceImagePrompt}` : ''}`
    ),
    '',
    '## Panel-panel',
  ];

  for (const p of segment.panels) {
    lines.push(
      `### Panel ${p.index} | ${p.time} | ${p.sceneCode}`,
      `**${p.title}**`,
      '',
      `**ACTION/VISUAL**`,
      p.actionVisual,
      '',
      `**CAMERA/MOVEMENT**`,
      p.cameraMovement,
      ...(p.composition ? ['', `**KOMPOSISI**`, p.composition] : []),
      ...(p.lighting ? ['', `**PENCAYAAN**`, p.lighting] : []),
      ...(p.mood ? ['', `**MOOD/SUASANA**`, p.mood] : []),
      '',
      `**DIALOG/VO**`,
      p.dialogueVo || '(tidak ada)',
      ...(p.onScreenText ? ['', `**ON SCREEN TEXT**`, p.onScreenText] : []),
      '',
      `**TRANSISI**`,
      p.transition,
      '',
      `**PROMPT GAMBAR (AI Image Prompt)**`,
      '```',
      p.imagePrompt,
      '```',
      ...(p.referenceImagePrompt ? ['', `**REFERENSI VISUAL (Thumbnail Prompt)**`, '```', p.referenceImagePrompt, '```'] : []),
      ...(p.negativePrompt ? ['', `**NEGATIVE PROMPT**`, p.negativePrompt] : []),
      ...(p.charactersPresent.length > 0 ? ['', `**Karakter Hadir:** ${p.charactersPresent.join(', ')}`] : []),
      ...(p.location ? ['', `**Lokasi:** ${p.location}`] : []),
      ...(p.props && p.props.length > 0 ? ['', `**Properti:** ${p.props.join(', ')}`] : []),
      ...(p.costumeNotes ? ['', `**Catatan Kostum/Penampilan:** ${p.costumeNotes}`] : []),
      ...(p.audioNotes ? ['', `**Catatan Audio:** ${p.audioNotes}`] : []),
      ...(p.productionNotes ? ['', `**CATATAN PRODUKSI**`, p.productionNotes] : []),
      '',
      '---'
    );
  }

  lines.push('', `**Catatan Transisi Segmen:** ${segment.segmentTransitionNote}`, '');
  return lines.filter((l) => l !== '').join('\n');
}
