import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse } from '@/lib/api/error';
import { getProjectById } from '@/lib/db/repositories/project.repo';
import { getProviderConfig, getActiveProviderConfig, listProviderConfigs } from '@/lib/db/repositories/provider-config.repo';
import { deleteStoryboardSegmentsByProject, bulkCreateStoryboardSegments, getStoryboardSegmentsByProject } from '@/lib/db/repositories/storyboard-segment.repo';
import { generateAllStoryboardSegments } from '@/lib/ai/storyboard-engine';
import { PromptPackageSchema } from '@/lib/validation/schemas';

export const runtime = 'nodejs';
export const maxDuration = 300; // Vercel Hobby plan max; generate long stories in chunks
export const dynamic = 'force-dynamic';

interface SseEvent {
  event: 'stage' | 'progress' | 'done' | 'error';
  data: Record<string, unknown>;
}

function sseFormat(evt: SseEvent): string {
  return `event: ${evt.event}\ndata: ${JSON.stringify(evt.data)}\n\n`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isFinite(projectId)) return errorResponse('VALIDATION_ERROR', 400, 'Invalid project id');

  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  const project = await getProjectById(projectId, userId);
  if (!project) return errorResponse('NOT_FOUND', 404, 'Project not found');
  if (!project.resultJson) return errorResponse('CONFLICT', 409, 'Project has no generated prompt package');

  let parsedPkg;
  try {
    parsedPkg = PromptPackageSchema.safeParse(JSON.parse(project.resultJson));
  } catch {
    return errorResponse('VALIDATION_ERROR', 400, 'Invalid stored prompt package');
  }
  if (!parsedPkg.success) return errorResponse('VALIDATION_ERROR', 400, 'Invalid stored prompt package');

  const body = await req.json().catch(() => ({}));
  const providerId = typeof body.providerId === 'number' ? body.providerId : undefined;
  const segmentDurationSeconds = typeof body.segmentDurationSeconds === 'number' ? body.segmentDurationSeconds : 10;
  const panelsPerSegment = typeof body.panelsPerSegment === 'number' ? body.panelsPerSegment : 8;

  let cfg;
  try {
    cfg = providerId ? await getProviderConfig(providerId, userId) : await getActiveProviderConfig(userId);
    if (!cfg) {
      const all = await listProviderConfigs(userId);
      cfg = all[0] ?? null;
    }
  } catch {
    return errorResponse('INTERNAL', 500, 'Provider lookup failed');
  }
  if (!cfg) return errorResponse('NOT_FOUND', 404, 'No provider config found');

  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (evt: SseEvent) => controller.enqueue(encoder.encode(sseFormat(evt)));

        try {
          send({ event: 'stage', data: { stage: 'starting', projectId, totalSegments: Math.ceil(parsedPkg.data.duration_target.seconds / segmentDurationSeconds) } });

          await deleteStoryboardSegmentsByProject(projectId);

          const result = await generateAllStoryboardSegments(
            parsedPkg.data,
            cfg,
            segmentDurationSeconds,
            panelsPerSegment,
            (stage, segmentIndex, total) => send({ event: 'progress', data: { stage, segmentIndex, total } }),
          );

          const inserts = result.segments.map((seg) => ({
            projectId,
            segmentIndex: seg.segmentIndex,
            segmentTimeStart: seg.segmentTimeStart,
            segmentTimeEnd: seg.segmentTimeEnd,
            panelCount: seg.panelCount,
            visualStyleJson: JSON.stringify(seg.visualStyle),
            characterSheetJson: JSON.stringify(seg.characterSheet),
            locationSheetJson: JSON.stringify(seg.locationSheet),
            panelsJson: JSON.stringify(seg.panels),
            markdownPrompt: seg.compiledMarkdownPrompt,
            segmentTransitionNote: seg.segmentTransitionNote,
            provider: cfg.provider,
            model: cfg.model,
            status: 'ready' as const,
          }));

          await bulkCreateStoryboardSegments(inserts);

          send({ event: 'done', data: { segments: result.segments.length, projectId } });
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          send({ event: 'error', data: { message: msg } });
          controller.close();
        }
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    },
  );
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isFinite(projectId)) return errorResponse('VALIDATION_ERROR', 400, 'Invalid project id');

  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  const project = await getProjectById(projectId, userId);
  if (!project) return errorResponse('NOT_FOUND', 404, 'Project not found');

  const segments = await getStoryboardSegmentsByProject(projectId);
  return Response.json({ segments });
}
