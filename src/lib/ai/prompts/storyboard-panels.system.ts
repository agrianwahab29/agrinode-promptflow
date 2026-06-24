import type { StoryboardSheets } from '../storyboard-sheet-extractor';
import type { StoryboardOutline } from '@/lib/validation/schemas';

export interface PanelsContext {
  title: string;
  segment: { segmentIndex: number; start: number; end: number };
  panelsPerSegment: number;
  sheets: StoryboardSheets;
  outline: StoryboardOutline;
}

export function buildStoryboardPanelsSystemPrompt(): string {
  return `Kamu adalah prompt engineer ahli untuk generator gambar/video AI (Midjourney, Runway, Kling, Stable Video Diffusion, Luma, Pika).
Ubah outline storyboard menjadi panel-panel detail yang kompleks dan siap generate.

Aturan wajib:
- Setiap image_prompt HARUS dalam Bahasa Inggris, kaya detail, dan siap langsung dipakai generator gambar AI.
- Jaga konsistensi visual di seluruh panel menggunakan style guide dan sheet yang diberikan. Konsistensi adalah MUTLAK.
- Sebutkan nama karakter, pakaian, warna, bentuk wajah, dan detail visual eksak dari Character Sheet.
- Sebutkan nama lokasi, pencahayaan, dan suasana dari Location Sheet.
- Camera movement gunakan bahasa sinematografi profesional.
- Negative prompt sebutkan hal-hal yang harus dihindari (text, watermark, blur, deformity, extra limbs, dll).
- Setiap panel WAJIB memiliki voiceover/narasi yang kuat:
  • voiceoverScript = teks Bahasa Indonesia yang dibacakan untuk panel ini.
  • voiceoverSpeaker = "narrator" atau nama karakter yang bicara.
  • voiceDirection = instruksi vokal (emosi, kecepatan, nada, intonasi).
  • soundDesign = suara/SFX/ambient spesifik untuk panel ini.
- Dialogue/VO ditulis dalam Bahasa Indonesia. Kosongkan jika tidak ada suara.
- Semua field selain imagePrompt, referenceImagePrompt, dan negativePrompt harus dalam Bahasa Indonesia.
- Tambahkan detail: komposisi, pencahayaan, mood, properti, catatan kostum, catatan produksi, dan teks di layar jika relevan.

Output HANYA valid JSON sesuai schema. Tanpa markdown, tanpa prosa.`;
}

export function buildStoryboardPanelsUserMessage(ctx: PanelsContext): string {
  return [
    `Judul Proyek: ${ctx.title}`,
    `Segmen ${ctx.segment.segmentIndex}: ${ctx.segment.start}s - ${ctx.segment.end}s`,
    '',
    'CHARACTER SHEET:',
    JSON.stringify(ctx.sheets.characterSheet, null, 2),
    '',
    'LOCATION SHEET:',
    JSON.stringify(ctx.sheets.locationSheet, null, 2),
    '',
    'VISUAL STYLE GUIDE:',
    JSON.stringify(ctx.sheets.visualStyle, null, 2),
    '',
    'SEGMENT OUTLINE:',
    JSON.stringify(ctx.outline, null, 2),
    '',
    `Hasilkan JSON panel detail dengan bentuk persis ini. Semua teks penjelasan dalam Bahasa Indonesia kecuali imagePrompt, referenceImagePrompt, negativePrompt:\n{\n  "panels": [\n    {\n      "index": number,\n      "time": "0:00 - 0:01.25",\n      "scene_code": "EXT. LOKASI - WAKTU",\n      "title": "judul panel Bahasa Indonesia",\n      "imagePrompt": "prompt gambar Bahasa Inggris yang sangat detail",\n      "referenceImagePrompt": "prompt thumbnail referensi visual Bahasa Inggris",\n      "actionVisual": "deskripsi aksi/visual dalam Bahasa Indonesia",\n      "cameraMovement": "contoh: WIDE SHOT - slow push in",\n      "composition": "komposisi frame",\n      "lighting": "pencahayaan dan waktu",\n      "mood": "suasana/emosi",\n      "voiceoverScript": "teks narasi/dialog yang dibacakan dalam Bahasa Indonesia",\n      "voiceoverSpeaker": "narrator atau nama karakter",\n      "voiceDirection": "instruksi vokal: emosi, kecepatan, nada",\n      "soundDesign": "catatan suara/SFX/ambient spesifik panel",\n      "dialogueVo": "teks voice-over Bahasa Indonesia atau kosong",\n      "onScreenText": "teks di layar jika ada, atau kosong",\n      "transition": "CUT | MATCH CUT | DISSOLVE | WIPE | FADE IN | FADE OUT | LIGHT LEAK/FLASH | JUMP CUT",\n      "charactersPresent": ["Nama"],\n      "location": "nama lokasi",\n      "props": ["properti"],\n      "costumeNotes": "catatan kostum/detail penampilan",\n      "negativePrompt": "things to avoid in English",\n      "audioNotes": "catatan musik/SFX Bahasa Indonesia",\n      "productionNotes": "catatan produksi Bahasa Indonesia",\n      "durationSeconds": 1.25\n    }\n  ],\n  "segmentTransitionNote": "catatan transisi antar segmen Bahasa Indonesia"\n}`
  ].join('\n');
}
