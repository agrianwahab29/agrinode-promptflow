import 'server-only';
import { generateStructuredResponse } from './llm-client';
import { extractSheets } from './storyboard-sheet-extractor';
import { calculateSegments } from './storyboard-segmenter';
import { buildStoryboardOutlineSystemPrompt, buildStoryboardOutlineUserMessage, type OutlineContext } from './prompts/storyboard-outline.system';
import { buildStoryboardPanelsSystemPrompt, buildStoryboardPanelsUserMessage, type PanelsContext } from './prompts/storyboard-panels.system';
import { compileStoryboardMarkdown } from './prompts/storyboard-compiler';
import {
  StoryboardSegmentSchema,
  StoryboardOutlineSchema,
  StoryboardPanelsSchema,
  type PromptPackage,
  type StoryboardSegment,
} from '@/lib/validation/schemas';
import type { ProviderConfig } from '@/lib/db/schema';
import type { SegmentRange } from './storyboard-segmenter';

export interface StoryboardEngineOptions {
  providerConfig: ProviderConfig;
  segment: SegmentRange;
  totalSegments: number;
  panelsPerSegment: number;
  previousSegmentSummary?: string;
  nextSegmentPreview?: string;
}

export async function generateStoryboardSegment(
  pkg: PromptPackage,
  opts: StoryboardEngineOptions,
): Promise<StoryboardSegment> {
  const sheets = extractSheets(pkg);

  // Stage 1: outline
  const outlineCtx: OutlineContext = {
    title: pkg.title,
    durationTargetSeconds: pkg.duration_target.seconds,
    segment: opts.segment,
    totalSegments: opts.totalSegments,
    sheets,
    previousSegmentSummary: opts.previousSegmentSummary,
    nextSegmentPreview: opts.nextSegmentPreview,
    panelsPerSegment: opts.panelsPerSegment,
    storyDescription: pkg.moral_message,
  };

  const outline = await generateStructuredResponse({
    provider: {
      provider: opts.providerConfig.provider,
      baseUrl: opts.providerConfig.baseUrl,
      model: opts.providerConfig.model,
      apiKeyEncrypted: opts.providerConfig.apiKeyEncrypted,
    },
    system: buildStoryboardOutlineSystemPrompt(),
    messages: [{ role: 'user', content: buildStoryboardOutlineUserMessage(outlineCtx) }],
    schema: StoryboardOutlineSchema,
    validateLabel: 'StoryboardOutline',
  });

  if (!outline?.panels || outline.panels.length === 0) {
    throw new Error('Outline generation returned empty panels');
  }

  // Stage 2: detailed panels
  const panelsCtx: PanelsContext = {
    title: pkg.title,
    segment: opts.segment,
    panelsPerSegment: opts.panelsPerSegment,
    sheets,
    outline,
  };

  const panelsData = await generateStructuredResponse({
    provider: {
      provider: opts.providerConfig.provider,
      baseUrl: opts.providerConfig.baseUrl,
      model: opts.providerConfig.model,
      apiKeyEncrypted: opts.providerConfig.apiKeyEncrypted,
    },
    system: buildStoryboardPanelsSystemPrompt(),
    messages: [{ role: 'user', content: buildStoryboardPanelsUserMessage(panelsCtx) }],
    schema: StoryboardPanelsSchema,
    validateLabel: 'StoryboardPanels',
  });

  if (!panelsData?.panels || panelsData.panels.length === 0) {
    throw new Error('Panel generation returned empty panels');
  }

  const segment: StoryboardSegment = {
    segmentIndex: opts.segment.segmentIndex,
    segmentTimeStart: opts.segment.start,
    segmentTimeEnd: opts.segment.end,
    durationSeconds: opts.segment.end - opts.segment.start,
    panelCount: panelsData.panels.length,
    visualStyle: sheets.visualStyle,
    characterSheet: sheets.characterSheet,
    locationSheet: sheets.locationSheet,
    panels: panelsData.panels.map((p) => ({
      index: p.index,
      time: p.time,
      sceneCode: p.scene_code,
      title: p.title,
      imagePrompt: p.imagePrompt,
      referenceImagePrompt: p.referenceImagePrompt,
      actionVisual: p.actionVisual,
      cameraMovement: p.cameraMovement,
      composition: p.composition,
      lighting: p.lighting,
      mood: p.mood,
      dialogueVo: p.dialogueVo,
      onScreenText: p.onScreenText,
      transition: p.transition,
      charactersPresent: p.charactersPresent,
      location: p.location,
      props: p.props,
      costumeNotes: p.costumeNotes,
      negativePrompt: p.negativePrompt,
      audioNotes: p.audioNotes,
      productionNotes: p.productionNotes,
      durationSeconds: p.durationSeconds,
    })),
    segmentTransitionNote: panelsData.segmentTransitionNote,
    compiledMarkdownPrompt: '',
  };

  segment.compiledMarkdownPrompt = compileStoryboardMarkdown(segment);

  return StoryboardSegmentSchema.parse(segment);
}

export interface StoryboardRunResult {
  segments: StoryboardSegment[];
}

export async function generateAllStoryboardSegments(
  pkg: PromptPackage,
  providerConfig: ProviderConfig,
  segmentDurationSeconds: number = 10,
  panelsPerSegment: number = 8,
  onProgress?: (stage: string, segmentIndex: number, total: number) => void,
): Promise<StoryboardRunResult> {
  const ranges = calculateSegments(pkg.duration_target.seconds, segmentDurationSeconds);
  const totalSegments = ranges.length;
  const segments: StoryboardSegment[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    if (!range) continue;
    onProgress?.('generating_outline', range.segmentIndex, totalSegments);

    const prevSummary = i > 0 ? summarizeSegment(segments[i - 1]!) : undefined;
    const nextRange = ranges[i + 1];
    const nextPreview = nextRange ? `Segment ${range.segmentIndex + 1} starts at ${nextRange.start}s` : undefined;

    const segment = await generateStoryboardSegment(pkg, {
      providerConfig,
      segment: range,
      totalSegments,
      panelsPerSegment,
      previousSegmentSummary: prevSummary,
      nextSegmentPreview: nextPreview,
    });

    segments.push(segment);
    onProgress?.('segment_complete', range.segmentIndex, totalSegments);
  }

  return { segments };
}

function summarizeSegment(segment: StoryboardSegment): string {
  const lastPanel = segment.panels[segment.panels.length - 1];
  return `Segment ${segment.segmentIndex} ends at ${lastPanel?.time ?? segment.segmentTimeEnd}s. ` +
    `Final panel: "${lastPanel?.title ?? ''}" — ${lastPanel?.actionVisual ?? ''}. ` +
    `Transition out: ${lastPanel?.transition ?? 'CUT'}. ` +
    `Active characters: ${[...new Set(segment.panels.flatMap((p) => p.charactersPresent))].join(', ')}.`;
}
