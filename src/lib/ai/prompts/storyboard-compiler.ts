import type { StoryboardSegment } from '@/lib/validation/schemas';

export function compileStoryboardMarkdown(segment: StoryboardSegment): string {
  const lines = [
    `# STORYBOARD — Segment ${segment.segmentIndex}`,
    `**Project:** ${segment.segmentTransitionNote}`,
    `**Duration:** ${segment.segmentTimeStart}s - ${segment.segmentTimeEnd}s`,
    `**Format:** ${segment.visualStyle.aspectRatio} | ${segment.visualStyle.artDirection}`,
    '',
    '## Visual Style Guide',
    `- **Aspect Ratio:** ${segment.visualStyle.aspectRatio}`,
    `- **Art Direction:** ${segment.visualStyle.artDirection}`,
    `- **Color Palette:** ${segment.visualStyle.colorPalette}`,
    `- **Cinematography:** ${segment.visualStyle.cinematography}`,
    '',
    '## Character Sheet',
    ...segment.characterSheet.map((c) => `- **${c.name}:** ${c.visualDescription}${c.referenceImagePrompt ? ` | Ref: ${c.referenceImagePrompt}` : ''}`),
    '',
    '## Location Sheet',
    ...segment.locationSheet.map((l) => `- **${l.name}:** ${l.visualDescription}${l.referenceImagePrompt ? ` | Ref: ${l.referenceImagePrompt}` : ''}`),
    '',
    '## Panels',
  ];

  for (const p of segment.panels) {
    lines.push(
      `### Panel ${p.index} | ${p.time} | ${p.sceneCode}`,
      `**${p.title}**`,
      '',
      `- **Image Prompt:** ${p.imagePrompt}`,
      `- **Action/Visual:** ${p.actionVisual}`,
      `- **Camera/Movement:** ${p.cameraMovement}`,
      `- **Dialogue/VO:** ${p.dialogueVo || '(none)'}`,
      `- **Transition:** ${p.transition}`,
      `- **Characters:** ${p.charactersPresent.join(', ')}`,
      `- **Location:** ${p.location}`,
      p.negativePrompt ? `- **Negative Prompt:** ${p.negativePrompt}` : '',
      p.audioNotes ? `- **Audio Notes:** ${p.audioNotes}` : '',
      ''
    );
  }

  lines.push('---', `**Segment Transition:** ${segment.segmentTransitionNote}`);

  return lines.filter((l) => l !== '').join('\n');
}
