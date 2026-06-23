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
      "gayarambut": "Rambut hitam panjang bergelombang, dikuncir dua",
      "wajah_asal": "Wajah bulat, mata coklat besar ekspresif, kulit sawo matang, pipi merona",
      "pakaian_atas": "Kaos kuning lengan pendek dengan logo bintang",
      "pakaian_bawah": "Celana pendek biru navy sampai lutut",
      "alas_kaki": "Sandal gunung coklat tali panjang",
      "deskripsi_latar": "Petualang cilik yang pemberani",
      "aksi": "Memimpin ekspedisi menjelajahi hutan",
      "peran": "utama",
      "voice_type": "child",
      "age_range": "young"
    }
  ],
  "scenes": [
    {
      "order": 1,
      "description": "Rina berdiri di teras rumah kakeknya, mengintip ke hutan. Ekspresi penasaran.",
      "voiceover_script": "Pada suatu hari yang cerah, Rina memberanikan diri menjelajahi hutan legendaris...",
      "voiceover_speaker": "narrator",
      "transition_type": "fade_in",
      "transition_duration_ms": 2000,
      "transition_easing": "ease_in_out",
      "transition_direction": "forward",
      "voice_type": "narrator",
      "voice_emotion": "neutral",
      "voice_speed": 1.0,
      "voice_pitch": "medium",
      "duration_seconds": 12,
      "scene_pacing": "normal",
      "scene_mood": "cheerful",
      "image_prompts": {
        "characters": [
          {
            "target": "Rina",
            "prompt_text": "Seorang petualang cilik dengan rambut hitam dikuncir dua, mata coklat besar, kaos kuning, celana biru navy, berdiri di teras rumah kayu, ekspresi penasaran, gaya 3D Pixar, golden hour lighting",
            "reference_filename": null,
            "composition": "foreground: Rina di teras; midground: teras kayu; background: hutan hijau",
            "lighting": "key: golden hour; fill: soft ambient; rim: backlight; style: warm cinematic",
            "camera": "angle: eye level medium shot; lens: 50mm; depth_of_field: f/2.8; movement: static",
            "mood_atmosphere": "penasaran, cerah, penuh harap",
            "style_references": "Pixar 3D, Disney, Studio Ghibli",
            "color_palette": ["#FFD700", "#FFA500", "#2E8B57"],
            "technical": "resolution: 3840x2160; aspect_ratio: 16:9; engine: Unreal Engine 5; format: PNG"
          }
        ],
        "backgrounds": [
          {
            "target": "Teras Rumah Kakek",
            "prompt_text": "Teras rumah kayu tradisional dengan atap jerami, hutan lebat di latar belakang, gaya 3D Pixar, wide shot, pagi keemasan",
            "reference_filename": null,
            "composition": "foreground: lantai teras; midground: kursi kayu; background: hutan berkabut",
            "lighting": "key: sunrise; fill: soft fill; rim: hazy; style: natural morning",
            "camera": "angle: wide establishing; lens: 24mm; depth_of_field: f/5.6; movement: static",
            "mood_atmosphere": "damai, tradisional, misterius",
            "style_references": "Studio Ghibli, traditional Asian",
            "color_palette": ["#8B4513", "#2E8B57", "#FFD700"],
            "technical": "resolution: 3840x2160; aspect_ratio: 16:9; engine: Octane Render; format: EXR"
          }
        ]
      },
      "audio_specs": [
        {
          "audio_type": "ambient",
          "description": "Suara pagi desa: burung berkicau, angin sepoi",
          "timing": "throughout",
          "volume": 0.4,
          "fade_in_ms": 2000,
          "fade_out_ms": 1000,
          "ambient_type": "forest_village_morning"
        },
        {
          "audio_type": "background_music",
          "description": "Musik latar petualangan ringan, orkestra kecil",
          "timing": "throughout",
          "volume": 0.3,
          "fade_in_ms": 1500,
          "fade_out_ms": 1500,
          "music_genre": "orchestral_light",
          "music_mood": "curious",
          "music_tempo_bpm": 90,
          "music_instruments": "flute,light_strings,piano"
        },
        {
          "audio_type": "sfx",
          "description": "Suara langkah kaki di atas kayu",
          "timing": "specific_moment",
          "volume": 0.6,
          "sfx_list": ["footstep", "wood creak"]
        }
      ]
    }
  ],
  "image_prompts": {
    "characters": [
      {
        "target": "Rina",
        "prompt_text": "Character reference sheet: petualang cilik dengan rambut hitam dikuncir dua, mata coklat besar, kaos kuning, celana biru navy, sandal gunung, full body turnaround, 3D Pixar style, clean background",
        "reference_filename": null,
        "composition": "foreground: Rina full body; midground: neutral; background: clean studio",
        "lighting": "key: studio key; fill: soft fill; rim: none; style: clean sheet",
        "camera": "angle: front view full body; lens: 50mm; depth_of_field: f/4; movement: static",
        "mood_atmosphere": "neutral, professional",
        "style_references": "character turnaround, Pixar",
        "color_palette": ["#FFD700", "#1E3A5F", "#8B4513"],
        "technical": "resolution: 3840x2160; aspect_ratio: 16:9; engine: Unreal Engine 5; format: PNG"
      }
    ],
    "backgrounds": [
      {
        "target": "Teras Rumah Kakek",
        "prompt_text": "Master establishing shot: rumah kayu tradisional, hutan lebat di belakang, pagi, gaya 3D Pixar, wide cinematic",
        "reference_filename": null,
        "composition": "foreground: rumah; midground: pohon; background: hutan",
        "lighting": "key: morning sun; fill: ambient; rim: rim light; style: natural",
        "camera": "angle: wide shot; lens: 24mm; depth_of_field: f/8; movement: static",
        "mood_atmosphere": "establishing, master reference",
        "style_references": "establishing shot, Studio Ghibli",
        "color_palette": ["#8B4513", "#2E8B57", "#FFD700"],
        "technical": "resolution: 3840x2160; aspect_ratio: 16:9; engine: Octane Render; format: EXR"
      }
    ]
  },
  "supporting_characters": [
    { "nama": "Burung Hantu", "tipe": "hewan", "aksi": "Menasihati Rina" }
  ],
  "moral_message": "Keberanian bukan tanpa rasa takut, tetapi tetap melangkah meskipun takut."
}`;

export function buildSystemPrompt(): string {
  return `Kamu PromptFlow Engine v3 — generator paket prompt animasi AI. Output HANYA satu JSON object valid (TANPA code block, TANPA teks sebelum/sesudah, TANPA markdown wrapper).

CONTOH FORMAT (1 scene saja, kamu harus buat sesuai jumlah yang diminta):
${JSON_SCHEMA_EXAMPLE}

=== RULES ===

ROOT FIELDS: title, duration_target {type,seconds}, style {type,aspect_ratio}, character_profiles[], scenes[], image_prompts {characters[],backgrounds[]}, supporting_characters[], moral_message

CHARACTER_PROFILES: nama, gayarambut, wajah_asal, pakaian_atas, pakaian_bawah, alas_kaki, deskripsi_latar, aksi, peran, voice_type (child|teen|adult_male|adult_female|elderly_male|elderly_female|narrator), age_range

SCENES: order, description, voiceover_script, voiceover_speaker, transition_type (cut|dissolve|fade_to_black|fade_to_white|wipe|match_cut|fade_in), transition_duration_ms, transition_easing (linear|ease_in|ease_out|ease_in_out), transition_direction (forward|backward|loop), voice_type, voice_emotion (neutral|happy|sad|excited|calm|dramatic), voice_speed (0.5-2.0), voice_pitch (low|medium|high|auto), duration_seconds, scene_pacing (fast|normal|slow), scene_mood (cheerful|dramatic|tense|peaceful|mysterious), image_prompts, audio_specs[]

IMAGE PROMPTS 8 LAYERS: target, prompt_text (80-200 kata detail), reference_filename, composition (plain string, jangan JSON escaped, contoh: "foreground: Rina di teras; midground: teras kayu; background: hutan hijau"), lighting (plain string, contoh: "key: golden hour; fill: soft ambient; rim: backlight; style: warm cinematic"), camera (plain string, contoh: "angle: eye level medium shot; lens: 50mm; depth_of_field: f/2.8; movement: static"), mood_atmosphere, style_references, color_palette (array hex), technical (plain string, contoh: "resolution: 3840x2160; aspect_ratio: 16:9; engine: Unreal Engine 5; format: PNG")

AUDIO_SPECS: audio_type (background_music|sfx|ambient|music_cue|transition_audio), description, timing (start|throughout|end|specific_moment), volume (0-1), fade_in_ms, fade_out_ms. Untuk musik: music_genre, music_mood, music_tempo_bpm, music_instruments. Untuk ambient: ambient_type, ambient_volume. Untuk sfx: sfx_list (array of string, contoh: ["footstep","door creak","wind"]).

TRANSITION RULES:
- Scene 1: fade_in (2000ms). Scene terakhir: fade_to_black (2500ms)
- Antar scene: dissolve/match_cut, BUKAN cut langsung
- Dissolve/fade: 800-3000ms, easing ease_in_out

VOICE RULES:
- child: karakter muda, pitch high, speed 1.0-1.2
- elderly_male: usia 50+, pitch low, speed 0.8-1.0
- narrator: hanya untuk narasi tanpa karakter bicara

PENTING:
- Output HANYA satu JSON object yang 100% valid. TANPA \`\`\`json wrapper, TANPA teks sebelum/sesudah, TANPA markdown.
- Jangan gunakan newline mentah (U+000A) di dalam string value, gunakan \\n escape jika perlu.
- JANGAN mengembalikan JSON string escaped di dalam value string untuk composition/lighting/camera/technical. Isi dengan plain string saja.
- JANGAN gunakan tanda kutip ganda di dalam string value tanpa escape dengan backslash.
- Setiap scene WAJIB punya image_prompts (min 1 character + 1 background) + audio_specs (min 1)
- Root image_prompts = master reference list
- duration_seconds = voiceover_script.length / 12
- Jika ragu, tetap output JSON valid dengan nilai default.

=== SAFETY RULES (WAJIB DIPATUHI) ===
- DILARANG menyebutkan angka usia eksplisit (misalnya "9 tahun", "10 tahun", "anak 8 tahun") di prompt_text, description, deskripsi_latar, atau field output lainnya.
- Gunakan istilah netral: "petualang cilik", "karakter muda", "tokoh kecil", "penjelajah muda".
- age_range HANYA boleh berisi: "young", "teen", "adult", "elderly". JANGAN gunakan rentang angka.
- Fokus pada EMOSI dan SUASANA (takjub, kagum, damai, ceria) daripada usia.
- Tekankan situasi AMAN: "hutan magis", "suasana damai", "petualangan menyenangkan".
- Hindari kombinasi: karakter muda + lingkungan gelap/menakutkan + low angle shot. Jika karakter muda di alam, gunakan lighting cerah dan mood positif.
- DILARANG menghasilkan konten yang menampilkan karakter muda dalam situasi: berbahaya, eksploitasi, kekerasan, atau tidak pantas.
- prompt_text harus aman untuk di-feed ke video/image generator (Sora, Veo, Midjourney, dll).`;
}

export function buildUserMessage(input: GenerateInput['input'], references: ReferenceInfo[] = []): string {
  const refLines = references.length > 0
    ? `\n\nREFERENSI GAMBAR:\n${references.map((r) => `- ${r.name} (${r.type})`).join('\n')}\nGunakan reference_filename untuk merujuk file yang sesuai.`
    : '';

  const storyLine = input.storyDescription
    ? `\nDeskripsi Cerita: ${input.storyDescription}`
    : '';

  const numScenes = input.durationTarget.type === 'shorts'
    ? '3-5 scene (shorts 30-60 detik)'
    : '8-15 scene (tutorial 7-15 menit)';

  return `Buat paket prompt animasi V3:

Judul: ${input.title}
Durasi: ${input.durationTarget.type} (${input.durationTarget.seconds} detik)
Style: ${input.style.type}, rasio ${input.style.ratio}${storyLine}${refLines}

Generate ${numScenes}. Output HANYA JSON object langsung (TANPA code block, TANPA teks tambahan).`;
}
