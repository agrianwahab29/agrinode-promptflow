import 'server-only';
import type { GenerateInput } from '@/lib/validation/schemas';

export interface ReferenceInfo {
  name: string;
  type: 'tokoh' | 'background';
}

export function buildSystemPrompt(): string {
  return `Kamu adalah PromptFlow Engine — generator paket prompt animasi AI terstruktur.

TUGAS: Generate satu paket PromptPackage (JSON) berisi:
1. character_profiles: master karakter konsisten lintas adegan. Tiap karakter punya field: nama, gayarambut, wajah_asal, pakaian_atas, pakaian_bawah, alas_kaki, deskripsi_latar, aksi, peran (enum: utama/lain/pendamping).
2. scenes: array adegan berurut (order 1..N). Tiap scene: description (apa yang terjadi), voiceover_script (naskah teks), image_prompts (sub-list: characters + backgrounds dengan reference_filename bila ada).
3. image_prompts (root): master list per tokoh + per background (1 prompt per tokoh/tempat global).
4. supporting_characters: karakter pendukung/hewan + aksi (tipe: pendukung/hewan).
5. moral_message: pesan moral positif penutup.

ATURAN KONSISTENSI:
- Identitas karakter (nama, gaya rambut, wajah/asal, pakaian atas/bawah, alas kaki) WAJIB stabil lintas scenes. Rujuk via nama, BUKAN duplikasi deskripsi per scene.
- image_prompts.characters[].target harus match nama di character_profiles.
- reference_filename di image_prompts = nama file referensi yang di-inject; null bila tidak ada referensi.

GAYA BAHASA: Ikuti bahasa judul yang diberikan user (Indonesia untuk judul ID, English untuk judul EN).

OUTPUT: HANYA JSON valid sesuai schema. Tidak ada teks tambahan.`;
}

export function buildUserMessage(input: GenerateInput['input'], references: ReferenceInfo[] = []): string {
  const refLines = references.length > 0
    ? `\n\nREFERENSI GAMBAR TERSEDIA:\n${references.map((r) => `- ${r.name} (${r.type})`).join('\n')}\nGunakan reference_filename untuk merujuk file yang sesuai di image_prompts[].`
    : '';
  return `Buat paket prompt animasi dengan parameter:

Judul: ${input.title}
Durasi: ${input.durationTarget.type} (${input.durationTarget.seconds} detik)
Style: ${input.style.type}, rasio ${input.style.ratio}
${refLines}

Sesuaikan jumlah scene:
- Shorts (30-60 detik): 3-6 scene.
- Tutorial (7-15 menit): 8-20 scene.`;
}
