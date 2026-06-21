import 'server-only';
import type { GenerateInput, AssetRole } from '@/lib/validation/schemas';

export interface ReferenceInfo {
  name: string;
  type: AssetRole;
}

const JSON_SCHEMA_EXAMPLE = `{
  "title": "Petualangan di Hutan",
  "duration_target": { "type": "shorts", "seconds": 60 },
  "style": { "type": "3D", "aspect_ratio": "16:9" },
  "character_profiles": [
    {
      "nama": "Rina",
      "gayarambut": "Rambut hitam panjang bergelombang",
      "wajah_asal": "Wajah bulat, mata coklat besar, kulit sawo matang",
      "pakaian_atas": "Kaos kuning lengan pendek",
      "pakaian_bawah": "Celana pendek biru",
      "alas_kaki": "Sandal gunung coklat",
      "deskripsi_latar": "Anak perempuan petualang usia 10 tahun",
      "aksi": "Memimpin ekspedisi",
      "peran": "utama"
    }
  ],
  "scenes": [
    {
      "order": 1,
      "description": "Rina berdiri di tepi hutan, menatap pepohonan lebat dengan ekspresi penasaran",
      "voiceover_script": "Pada suatu hari, Rina memberanikan diri masuk ke hutan misterius...",
      "transition_type": "dissolve",
      "transition_duration_ms": 1000,
      "transition_easing": "ease_in_out",
      "transition_direction": "forward",
      "voice_type": "narrator",
      "voice_emotion": "neutral",
      "voice_speed": 1.0,
      "voice_pitch": "auto",
      "duration_seconds": 8,
      "scene_pacing": "normal",
      "scene_mood": "mysterious",
      "image_prompts": {
        "characters": [
          {
            "target": "Rina",
            "prompt_text": "Seorang anak perempuan berusia 10 tahun dengan rambut hitam panjang bergelombang, kaos kuning lengan pendek, celana pendek biru, dan sandal gunung coklat, berdiri di tepi hutan dengan ekspresi penasaran, gaya 3D Pixar, pencahayaan sinematik",
            "reference_filename": null,
            "composition": "{\\"foreground\\": \\"Rina\\", \\"midground\\": \\"trees\\", \\"background\\": \\"forest canopy\\"}",
            "lighting": "{\\"key\\": \\"golden hour\\", \\"fill\\": \\"soft ambient\\", \\"rim\\": \\"backlit leaves\\", \\"style\\": \\"cinematic\\"}",
            "camera": "{\\"angle\\": \\"eye level\\", \\"lens\\": \\"35mm\\", \\"depth_of_field\\": \\"f/2.8\\"}",
            "mood_atmosphere": "mysterious, curious, adventurous",
            "style_references": "Pixar, Disney, Studio Ghibli"
          }
        ],
        "backgrounds": [
          {
            "target": "Tepi Hutan",
            "prompt_text": "Hutan lebat dengan pepohonan besar dan cahaya matahari menerobos dedaunan, gaya 3D, sudut lebar",
            "reference_filename": null,
            "composition": "{\\"foreground\\": \\"clearing\\", \\"midground\\": \\"trees\\", \\"background\\": \\"sky\\"}",
            "lighting": "{\\"key\\": \\"dappled sunlight\\", \\"fill\\": \\"green bounce\\", \\"rim\\": \\"rim light on leaves\\", \\"style\\": \\"natural\\"}",
            "camera": "{\\"angle\\": \\"wide shot\\", \\"lens\\": \\"24mm\\", \\"depth_of_field\\": \\"f/5.6\\"}",
            "mood_atmosphere": "enchanted, natural, serene",
            "style_references": "Studio Ghibli, nature photography"
          }
        ]
      }
    }
  ],
  "image_prompts": {
    "characters": [
      {
        "target": "Rina",
        "prompt_text": "Karakter utama Rina berdiri tegak dengan determinasi, full body, latar netral",
        "reference_filename": null,
        "composition": "{\\"foreground\\": \\"Rina\\", \\"midground\\": \\"neutral\\", \\"background\\": \\"studio\\"}",
        "lighting": "{\\"key\\": \\"studio key\\", \\"fill\\": \\"soft fill\\", \\"rim\\": \\"none\\", \\"style\\": \\"clean\\"}",
        "camera": "{\\"angle\\": \\"front view\\", \\"lens\\": \\"50mm\\", \\"depth_of_field\\": \\"f/4\\"}",
        "mood_atmosphere": "neutral, professional",
        "style_references": "character sheet, turnaround"
      }
    ],
    "backgrounds": [
      {
        "target": "Tepi Hutan",
        "prompt_text": "Hutan lebat dengan detail cahaya alami, wide shot, gaya 3D",
        "reference_filename": null
      }
    ]
  },
  "supporting_characters": [
    { "nama": "Kancil", "tipe": "hewan", "aksi": "Menemani Rina di hutan" }
  ],
  "moral_message": "Keberanian dan rasa ingin tahu membawa kita pada petualangan yang tak terlupakan."
}`;

export function buildSystemPrompt(): string {
  return `Kamu adalah PromptFlow Engine — generator paket prompt animasi AI terstruktur.

TUGAS: Output HANYA JSON valid yang mengikuti schema PERSIS seperti contoh di bawah. Tidak ada teks tambahan, tidak ada markdown code block, tidak ada penjelasan di luar JSON.

=== STRUKTUR JSON YANG HARUS DIIKUTI (PERSIS) ===
${JSON_SCHEMA_EXAMPLE}

=== FIELD RULES ===
- title: string (sama dengan judul input)
- duration_target: OBJECT {"type": "shorts"|"tutorial", "seconds": number} — BUKAN string!
- style: OBJECT {"type": "3D"|"2D", "aspect_ratio": string} — BUKAN string!
- character_profiles: array karakter. Field WAJIB semua: nama, gayarambut, wajah_asal, pakaian_atas, pakaian_bawah, alas_kaki, deskripsi_latar, aksi, peran (enum: utama|lain|pendamping).
- scenes: array scene. Field WAJIB: order (number), description, voiceover_script, image_prompts (OBJECT berisi characters[] dan backgrounds[], SETIAP item punya target, prompt_text, reference_filename|null).
- image_prompts (ROOT, di luar scenes): OBJECT berisi characters[] dan backgrounds[] (master list per tokoh + per background global).
- supporting_characters: array. Field WAJIB: nama, tipe (enum: pendukung|hewan), aksi.
- moral_message: STRING tunggal (BUKAN object).

=== ATURAN KONSISTENSI ===
- Identitas karakter WAJIB stabil lintas scenes (nama, gayarambut, wajah_asal, pakaian_atas, pakaian_bawah, alas_kaki).
- image_prompts.characters[].target = nama di character_profiles.
- reference_filename = nama file referensi yang di-inject; null jika tidak ada referensi.
- Setiap scene WAJIB punya image_prompts.characters[] dan image_prompts.backgrounds[] minimal 1 item.
- Root image_prompts WAJIB ada (BUKAN kosong), berisi master list untuk tokoh + background global.

=== OUTPUT FORMAT ===
Langsung JSON object. JANGAN bungkus dalam \`\`\`json ... \`\`\`. JANGAN tulis teks sebelum atau sesudah JSON.

=== V3 METADATA INSTRUCTIONS ===

1. TRANSITION METADATA (setiap scene WAJIB punya):
   - transition_type: Pilih dari enum: cut, dissolve, fade_to_black, fade_to_white, wipe, match_cut.
     * cut = instant, action scenes (default)
     * dissolve = time passage (500-2000ms)
     * fade_to_black = chapter end (1000-3000ms)
     * fade_to_white = dream/flashback (1000-3000ms)
     * wipe = location change (500-1000ms)
     * match_cut = visual continuity (0ms)
   - transition_duration_ms: Durasi dalam milidetik. cut/match_cut = 0, lainnya 500-3000
   - transition_easing: linear (default), ease_in, ease_out, ease_in_out
   - transition_direction: forward (default), backward, loop

2. VOICE SPECIFICATIONS (setiap scene WAJIB punya):
   - voice_type: Pilih dari: child, teen, adult_male, adult_female, elderly_male, elderly_female, narrator
     * Sesuaikan dengan karakter yang bicara di scene
     * narrator default untuk voiceover
   - voice_emotion: neutral (default), happy, sad, excited, calm, dramatic
   - voice_speed: 0.5-2.0, default 1.0. Anak/orang tua = 0.9-1.1, aksi = 1.2-1.5
   - voice_pitch: low, medium, high, auto (default)

3. IMAGE PROMPT LAYERS (min 6/8 layer per prompt):
   - composition: JSON string: {foreground, midground, background}
   - lighting: JSON string: {key, fill, rim, style}
   - camera: JSON string: {angle, lens, depth_of_field}
   - mood_atmosphere: Emotional tone + atmosphere description
   - style_references: Comma-separated style references
   - prompt_text: Tetap single string yang menggabungkan semua layer

4. SCENE DURATION & PACING:
   - duration_seconds: Estimasi durasi scene dari panjang voiceover_script / 15
   - scene_pacing: fast, normal (default), slow
   - scene_mood: cheerful, dramatic, tense, peaceful, mysterious (opsional)

5. AUDIO CUES (minimal 1 audio cue per >= 80% scenes):
   - scenes[].image_prompts.backgrounds[0] bisa include audio hint di prompt_text
   - Audio metadata ditangani oleh application layer, bukan LLM output
`;
}

export function buildUserMessage(input: GenerateInput['input'], references: ReferenceInfo[] = []): string {
  const refLines = references.length > 0
    ? `\n\nREFERENSI GAMBAR TERSEDIA:\n${references.map((r) => `- ${r.name} (${r.type})`).join('\n')}\nGunakan reference_filename untuk merujuk file yang sesuai di image_prompts[].`
    : '';

  // V2: inject story description for richer context
  const storyLine = input.storyDescription
    ? `\nDeskripsi Cerita: ${input.storyDescription}`
    : '';

  return `Buat paket prompt animasi dengan parameter:

Judul: ${input.title}
Durasi: ${input.durationTarget.type} (${input.durationTarget.seconds} detik)
Style: ${input.style.type}, rasio ${input.style.ratio}${storyLine}
${refLines}

Sesuaikan jumlah scene:
- Shorts (30-60 detik): 3-6 scene.
- Tutorial (7-15 menit): 8-20 scene.

PENTING:
- Output JSON OBJECT langsung (tanpa code block wrapper).
- duration_target dan style HARUS object, BUKAN string.
- Setiap scene WAJIB punya image_prompts.characters dan image_prompts.backgrounds minimal 1 item dengan prompt_text yang detail.
- Root image_prompts.characters dan image_prompts.backgrounds WAJIB berisi master list.`;
}
