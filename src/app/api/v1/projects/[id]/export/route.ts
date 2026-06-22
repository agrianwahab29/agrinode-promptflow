import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse } from '@/lib/api/error';
import { getProjectById } from '@/lib/db/repositories/project.repo';
import { PromptPackageSchema } from '@/lib/validation/schemas';
import { renderMarkdown } from '@/lib/export/markdown.template';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const format = req.nextUrl.searchParams.get('format') ?? 'json';
  if (format !== 'json' && format !== 'markdown') return errorResponse('VALIDATION_ERROR', 400, 'format harus json atau markdown');
  const row = await getProjectById(id, userId);
  if (!row) return errorResponse('NOT_FOUND', 404);
  if (!row.resultJson) return errorResponse('CONFLICT', 409, 'Project belum di-generate');
  let pkg;
  let rawJsonObj;
  try {
    rawJsonObj = JSON.parse(row.resultJson);
    pkg = PromptPackageSchema.parse(rawJsonObj);
  } catch {
    return errorResponse('INTERNAL', 500, 'result_json tidak valid');
  }
  const filename = `${row.title.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 80) || 'project'}`;
  if (format === 'json') {
    if (row.storyDescription) {
      rawJsonObj._storyDescription = row.storyDescription;
    }
    return new Response(JSON.stringify(rawJsonObj, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.json"`,
      },
    });
  }
  const md = renderMarkdown(pkg, row.storyDescription);
  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.md"`,
    },
  });
}