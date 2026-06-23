import type { StoryboardSheets } from '../storyboard-sheet-extractor';
import type { SegmentRange } from '../storyboard-segmenter';

export interface OutlineContext {
  title: string;
  durationTargetSeconds: number;
  segment: SegmentRange;
  totalSegments: number;
  sheets: StoryboardSheets;
  previousSegmentSummary?: string;
  nextSegmentPreview?: string;
  panelsPerSegment: number;
  storyDescription?: string;
}

export function buildStoryboardOutlineSystemPrompt(): string {
  return `Kamu adalah seniman storyboard dan prompt engineer ahli untuk pembuatan video AI.
Tugasmu: memecah satu segmen video menjadi urutan panel visual yang kompleks dan sempurna.

Aturan wajib:
- Setiap panel harus masuk dalam durasi segmen (maksimal 10 detik).
- Total durasi semua panel dalam segmen harus sama persis dengan durasi segmen.
- Gunakan format waktu: 0:00 - 0:01.25
- Setiap panel wajib memiliki: index, time, scene_code (contoh: EXT. HUTAN - SORE), title (Bahasa Indonesia), characters_present, location, transition, brief, duration_seconds.
- Panel pertama segmen 1 gunakan FADE IN.
- Panel terakhir segmen terakhir gunakan FADE OUT.
- Panel lain gunakan CUT, MATCH CUT, DISSOLVE, WIPE, LIGHT LEAK/FLASH, atau JUMP CUT sesuai konteks.
- Jaga konsistensi karakter dan lokasi menggunakan Character Sheet & Location Sheet yang diberikan.
- Bahasa brief harus Bahasa Indonesia, padat, dan menggambarkan visual + kamera.

Output HANYA valid JSON sesuai schema. Tanpa markdown, tanpa prosa.`;
}

export function buildStoryboardOutlineUserMessage(ctx: OutlineContext): string {
  const parts = [
    `Judul Proyek: ${ctx.title}`,
    `Durasi Total: ${ctx.durationTargetSeconds} detik`,
    `Segmen Ini: ${ctx.segment.start}s - ${ctx.segment.end}s (segmen ${ctx.segment.segmentIndex} dari ${ctx.totalSegments})`,
    `Jumlah Panel Target: ${ctx.panelsPerSegment}`,
    ctx.storyDescription ? `Deskripsi Cerita: ${ctx.storyDescription}` : '',
    '',
    'CHARACTER SHEET (gunakan deskripsi visual secara eksak):',
    JSON.stringify(ctx.sheets.characterSheet, null, 2),
    '',
    'LOCATION SHEET (gunakan deskripsi visual secara eksak):',
    JSON.stringify(ctx.sheets.locationSheet, null, 2),
    '',
    'VISUAL STYLE GUIDE:',
    JSON.stringify(ctx.sheets.visualStyle, null, 2),
  ];

  if (ctx.previousSegmentSummary) {
    parts.push('', `RINGKASAN SEGMENT SEBELUMNYA:\n${ctx.previousSegmentSummary}`);
  }
  if (ctx.nextSegmentPreview) {
    parts.push('', `PRATINJAU SEGMENT BERIKUTNYA:\n${ctx.nextSegmentPreview}`);
  }

  parts.push(
    '',
    `Hasilkan outline JSON dengan bentuk persis ini:\n{\n  "panel_count": number,\n  "panels": [\n    {\n      "index": number,\n      "time": "0:00 - 0:01.25",\n      "scene_code": "INT/EXT. LOKASI - WAKTU",\n      "title": "judul panel dalam Bahasa Indonesia",\n      "characters_present": ["Nama"],\n      "location": "nama lokasi",\n      "transition": "CUT | MATCH CUT | FADE IN | FADE OUT | DISSOLVE | WIPE | LIGHT LEAK/FLASH | JUMP CUT",\n      "brief": "satu kalimat arahan visual/kamera dalam Bahasa Indonesia",\n      "duration_seconds": 1.25\n    }\n  ],\n  "segment_transition_note": "cara segmen ini menyambung ke segmen berikutnya dalam Bahasa Indonesia"\n}`
  );

  return parts.filter(Boolean).join('\n');
}
