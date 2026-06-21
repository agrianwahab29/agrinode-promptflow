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
      "deskripsi_latar": "Anak perempuan petualang usia 10 tahun, ceria, berani, penuh rasa ingin tahu",
      "aksi": "Memimpin ekspedisi menjelajahi hutan misterius",
      "peran": "utama",
      "voice_type": "child",
      "age_range": "8-12"
    },
    {
      "nama": "Kakek",
      "gayarambut": "Rambut putih tipis, botak di atas",
      "wajah_asal": "Wajah keriput, mata coklat sayu, jenggot putih pendek",
      "pakaian_atas": "Kemeja batik coklat lengan panjang",
      "pakaian_bawah": "Celana panjang hitam",
      "alas_kaki": "Sandal kulit",
      "deskripsi_latar": "Kakek bijak usia 70 tahun, ahli cerita rakyat",
      "aksi": "Menceritakan legenda hutan kepada Rina",
      "peran": "pendamping",
      "voice_type": "elderly_male",
      "age_range": "65-80"
    }
  ],
  "scenes": [
    {
      "order": 1,
      "description": "Rina berdiri di teras rumah kakeknya yang beratapkan jerami, mengintip ke arah hutan yang terlihat dari kejauhan. Ekspresi penasaran bercampur ragu. Sinar pagi menyinari wajahnya.",
      "voiceover_script": "Pada suatu hari yang cerah, Rina memberanikan diri menceritakan keinginannya menjelajahi hutan legendaris kepada kakeknya...",
      "voiceover_speaker": "Rina",
      "transition_type": "fade_in",
      "transition_duration_ms": 2000,
      "transition_easing": "ease_in_out",
      "transition_direction": "forward",
      "voice_type": "child",
      "voice_emotion": "excited",
      "voice_speed": 1.1,
      "voice_pitch": "high",
      "duration_seconds": 12,
      "scene_pacing": "normal",
      "scene_mood": "cheerful",
      "image_prompts": {
        "characters": [
          {
            "target": "Rina",
            "prompt_text": "Seorang anak perempuan berusia 10 tahun dengan rambut hitam panjang bergelombang dikuncir dua, mata coklat besar ekspresif, pipi merona, memakai kaos kuning lengan pendek dengan logo bintang, celana pendek biru navy, sandal gunung coklat, berdiri di teras rumah kayu beratapkan jerami, mengintip ke arah hutan dengan ekspresi penasaran bercampur ragu, sinar pagi keemasan menyinari wajahnya, gaya 3D Pixar, depth of field dangkal fokus pada Rina, pencahayaan sinematik golden hour",
            "reference_filename": null,
            "composition": "{\\"foreground\\": \\"Rina berdiri di teras\\", \\"midground\\": \\"teras rumah kayu dan kakek di belakang\\", \\"background\\": \\"hutan hijau di kejauhan\\"}",
            "lighting": "{\\"key\\": \\"golden hour sunlight dari kiri\\", \\"fill\\": \\"soft ambient\\", \\"rim\\": \\"backlight pada rambut Rina\\", \\"style\\": \\"warm cinematic\\"}",
            "camera": "{\\"angle\\": \\"eye level medium shot\\", \\"lens\\": \\"50mm\\", \\"depth_of_field\\": \\"f/2.8 shallow\\", \\"movement\\": \\"static\\"}",
            "mood_atmosphere": "penasaran, ragu-ragu, cerah, penuh harap",
            "style_references": "Pixar 3D, Disney, Studio Ghibli"
          }
        ],
        "backgrounds": [
          {
            "target": "Teras Rumah Kakek",
            "prompt_text": "Teras rumah kayu tradisional dengan atap jerami, lantai kayu, pot bunga di sudut, kursi kayu tua, di latar belakang terlihat hutan hijau lebat dengan kabut tipis, gaya 3D Pixar, wide shot establishing, pencahayaan pagi keemasan",
            "reference_filename": null,
            "composition": "{\\"foreground\\": \\"lantai teras kayu\\", \\"midground\\": \\"kursi kayu dan pot bunga\\", \\"background\\": \\"hutan lebat berkabut\\"}",
            "lighting": "{\\"key\\": \\"sunrise warm light\\", \\"fill\\": \\"soft fill\\", \\"rim\\": \\"hazy light\\", \\"style\\": \\"natural morning\\"}",
            "camera": "{\\"angle\\": \\"wide establishing shot\\", \\"lens\\": \\"24mm wide\\", \\"depth_of_field\\": \\"f/5.6 deep\\", \\"movement\\": \\"static\\"}",
            "mood_atmosphere": "damai, tradisional, misterius, penuh antisipasi",
            "style_references": "Studio Ghibli, traditional Asian architecture"
          }
        ]
      },
      "audio_specs": [
        {
          "audio_type": "ambient",
          "description": "Suara pagi desa: burung berkicau, angin sepoi, daun berguguran ringan",
          "timing": "throughout",
          "duration_seconds": null,
          "volume": 0.4,
          "fade_in_ms": 2000,
          "fade_out_ms": 1000,
          "ambient_type": "forest_village_morning"
        },
        {
          "audio_type": "background_music",
          "description": "Musik latar petualangan ringan, orkestra kecil, suasana penasaran",
          "timing": "throughout",
          "duration_seconds": null,
          "volume": 0.3,
          "fade_in_ms": 1500,
          "fade_out_ms": 1500,
          "music_genre": "orchestral_light",
          "music_mood": "curious",
          "music_tempo_bpm": 90,
          "music_instruments": "flute,light_strings,piano"
        }
      ]
    },
    {
      "order": 2,
      "description": "Kakek duduk di kursi kayu di teras, matanya menerawang ke hutan. Wajahnya berubah serius saat menceritakan legenda. Rina duduk di sampingnya dengan penuh perhatian.",
      "voiceover_script": "Kakek terdiam sejenak, lalu berkata dengan nada bijak: 'Hutan itu menyimpan banyak rahasia, Nak. Tidak semua yang berkilau adalah emas, dan tidak semua yang menakutkan adalah bahaya...'",
      "voiceover_speaker": "Kakek",
      "transition_type": "match_cut",
      "transition_duration_ms": 0,
      "transition_easing": "linear",
      "transition_direction": "forward",
      "voice_type": "elderly_male",
      "voice_emotion": "dramatic",
      "voice_speed": 0.85,
      "voice_pitch": "low",
      "duration_seconds": 15,
      "scene_pacing": "slow",
      "scene_mood": "mysterious",
      "image_prompts": {
        "characters": [
          {
            "target": "Kakek",
            "prompt_text": "Seorang kakek berusia 70 tahun dengan rambut putih tipis, wajah keriput, mata coklat sayu, jenggot putih pendek, memakai kemeja batik coklat lengan panjang dan celana hitam, duduk di kursi kayu di teras, matanya menerawang ke arah hutan, ekspresi bijak dan sedikit serius, gaya 3D Pixar, medium close-up, pencahayaan dramatic",
            "reference_filename": null,
            "composition": "{\\"foreground\\": \\"Kakek duduk di kursi\\", \\"midground\\": \\"Rina di sampingnya\\", \\"background\\": \\"hutan berkabut\\"}",
            "lighting": "{\\"key\\": \\"side light dramatis\\", \\"fill\\": \\"minimal fill\\", \\"rim\\": \\"strong rim light pada rambut putih\\", \\"style\\": \\"dramatic portrait\\"}",
            "camera": "{\\"angle\\": \\"medium close-up eye level\\", \\"lens\\": \\"85mm portrait\\", \\"depth_of_field\\": \\"f/2.0 very shallow\\", \\"movement\\": \\"static\\"}",
            "mood_atmosphere": "bijak, serius, misterius, penuh cerita",
            "style_references": "Pixar character design, dramatic portrait"
          }
        ],
        "backgrounds": [
          {
            "target": "Sudut Teras dengan Kursi Kayu",
            "prompt_text": "Kursi kayu tua di teras rumah tradisional, dengan latar hutan yang mulai diselimuti kabut tipis, suasana sore menjelang senja, gaya 3D Pixar, medium shot",
            "reference_filename": null,
            "composition": "{\\"foreground\\": \\"kursi kayu tua\\", \\"midground\\": \\"Rina dan Kakek\\", \\"background\\": \\"hutan berkabut\\"}",
            "lighting": "{\\"key\\": \\"soft side light\\", \\"fill\\": \\"ambient\\", \\"rim\\": \\"rim pada kabut\\", \\"style\\": \\"naturalistic\\"}",
            "camera": "{\\"angle\\": \\"medium shot\\", \\"lens\\": \\"35mm\\", \\"depth_of_field\\": \\"f/4\\", \\"movement\\": \\"static\\"}",
            "mood_atmosphere": "bijak, tenang, memulai perjalanan",
            "style_references": "Studio Ghibli, traditional scenes"
          }
        ]
      },
      "audio_specs": [
        {
          "audio_type": "ambient",
          "description": "Suara tenang teras rumah, angin sepoi, jangkrik pagi",
          "timing": "throughout",
          "duration_seconds": null,
          "volume": 0.35,
          "fade_in_ms": 500,
          "fade_out_ms": 500,
          "ambient_type": "village_terrace"
        },
        {
          "audio_type": "background_music",
          "description": "Musik latar bijak dan tenang, harpa dan strings, suasana flashback",
          "timing": "throughout",
          "duration_seconds": null,
          "volume": 0.25,
          "fade_in_ms": 1000,
          "fade_out_ms": 2000,
          "music_genre": "orchestral_emotional",
          "music_mood": "wise_nostalgic",
          "music_tempo_bpm": 70,
          "music_instruments": "harp,strings,cello"
        },
        {
          "audio_type": "sfx",
          "description": "Suara kursi kayu berderit saat Kakek duduk",
          "timing": "start",
          "duration_seconds": 1,
          "volume": 0.5,
          "fade_in_ms": 0,
          "fade_out_ms": 0,
          "sfx_list": "[{\\"name\\": \\"wooden_chair_creak\\", \\"timing_ms\\": 0, \\"volume\\": 0.5}]"
        }
      ]
    }
  ],
  "image_prompts": {
    "characters": [
      {
        "target": "Rina",
        "prompt_text": "Character reference sheet: anak perempuan 10 tahun, rambut hitam panjang bergelombang dikuncir dua, mata coklat besar, kaos kuning, celana pendek biru navy, sandal gunung coklat, full body turnaround, 3D Pixar style, clean background",
        "reference_filename": null,
        "composition": "{\\"foreground\\": \\"Rina full body\\", \\"midground\\": \\"neutral\\", \\"background\\": \\"clean studio\\"}",
        "lighting": "{\\"key\\": \\"studio key\\", \\"fill\\": \\"soft fill\\", \\"rim\\": \\"none\\", \\"style\\": \\"clean character sheet\\"}",
        "camera": "{\\"angle\\": \\"front view full body\\", \\"lens\\": \\"50mm\\", \\"depth_of_field\\": \\"f/4\\", \\"movement\\": \\"static\\"}",
        "mood_atmosphere": "neutral, professional, cheerful",
        "style_references": "character turnaround sheet, Pixar"
      }
    ],
    "backgrounds": [
      {
        "target": "Teras Rumah Kakek",
        "prompt_text": "Master establishing shot: rumah kayu tradisional dengan atap jerami, dikelilingi pohon besar, di kaki hutan lebat, suasana pagi, gaya 3D Pixar, wide cinematic",
        "reference_filename": null,
        "composition": "{\\"foreground\\": \\"rumah dan taman\\", \\"midground\\": \\"pohon-pohon besar\\", \\"background\\": \\"hutan lebat\\"}",
        "lighting": "{\\"key\\": \\"morning sun\\", \\"fill\\": \\"ambient\\", \\"rim\\": \\"rim light\\", \\"style\\": \\"natural\\"}",
        "camera": "{\\"angle\\": \\"wide shot\\", \\"lens\\": \\"24mm\\", \\"depth_of_field\\": \\"f/8 deep\\", \\"movement\\": \\"static\\"}",
        "mood_atmosphere": "master reference, establishing",
        "style_references": "establishing shot, Studio Ghibli"
      }
    ]
  },
  "supporting_characters": [
    { "nama": "Burung Hantu Bijak", "tipe": "hewan", "aksi": "Turun dari pohon dan menasihati Rina dengan bijak" }
  ],
  "moral_message": "Keberanian bukan berarti tanpa rasa takut, tetapi tetap melangkah meskipun takut. Kebijaksanaan orang tua adalah peta bagi generasi muda."
}`;

export function buildSystemPrompt(): string {
  return `Kamu adalah PromptFlow Engine v3 — generator paket prompt animasi AI production-grade untuk downstream tools (Runway, Pika, Kling, Sora).

TUGAS UTAMA: Output HANYA JSON valid yang mengikuti schema PERSIS. TIDAK ADA teks tambahan, markdown, atau penjelasan.

=== JSON SCHEMA CONTOH (IKUTI PERSIS) ===
${JSON_SCHEMA_EXAMPLE}

=== FIELD RULES (WAJIB) ===

ROOT FIELDS:
- title: string (sama dengan input)
- duration_target: OBJECT {type: "shorts"|"tutorial", seconds: number}
- style: OBJECT {type: "3D"|"2D", aspect_ratio: string}
- character_profiles: array (WAJIB ada minimal 1 karakter utama)
  SETIAP karakter WAJIB punya: nama, gayarambut, wajah_asal, pakaian_atas, pakaian_bawah, alas_kaki, deskripsi_latar, aksi, peran (utama|lain|pendamping)
  TAMBAHAN V3: voice_type (WAJIB), age_range (opsional)
- scenes: array (WAJIB 3-6 scene untuk shorts, 8-20 untuk tutorial)
  SETIAP scene WAJIB: order, description, voiceover_script, transition_type, transition_duration_ms, transition_easing, transition_direction, voice_type, voice_emotion, voice_speed, voice_pitch, duration_seconds, scene_pacing, scene_mood, image_prompts, audio_specs
- image_prompts (ROOT): OBJECT {characters[], backgrounds[]} — master list WAJIB
- supporting_characters: array (opsional)
- moral_message: string tunggal

=== V3 INSTRUKSI KRITIS (WAJIB DIIKUTI) ===

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. TRANSITION FLOW (WAJIB — ANTI JARRING CUT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TUJUAN: Menghindari "adegan kaget" (jarring cut). Setiap transisi harus JELAS dan NATURAL.

RULES TRANSITION (6 types, V3 WARN-006):
- cut: 0ms, HANYA untuk action cepat atau perpindahan shot dalam scene yang sama
- dissolve: 500-2000ms, untuk time passage, pergantian waktu halus
- fade_to_black: 1500-3000ms, untuk chapter end, jeda signifikan
- fade_to_white: 1500-3000ms, untuk dream, flashback, transisi magis
- wipe: 500-1000ms, untuk location change yang jelas
- match_cut: 0ms, untuk visual continuity (benda/bentuk sama di kedua shot)

TRANSITION FLOW PATTERNS (WAJIB dipilih salah satu):
A) Discovery → Tension: fade_in (2000ms) → match_cut (0ms) → dissolve (1500ms) → fade_to_black (2500ms)
B) Calm → Action: dissolve (1000ms) → cut (0ms) → cut (0ms) → match_cut (0ms)
C) Setup → Climax: fade_in (2000ms) → dissolve (1500ms) → cut (0ms) → fade_to_black (3000ms)
D) Story → Flashback: fade_to_white (2000ms) → dissolve (1500ms) → match_cut (0ms) → fade_to_black (2500ms)
E) Continuation: match_cut (0ms) → dissolve (1000ms) → match_cut (0ms) → cut (0ms)

ATURAN:
- Scene 1 (opening) WAJIB pakai fade_in (2000ms) atau fade_to_white (2000ms)
- Scene terakhir (closing) WAJIB pakai fade_to_black (2500-3000ms)
- Di antara scene, WAJIB ada continuity: gunakan match_cut atau dissolve, BUKAN cut langsung
- duration_ms untuk dissolve/wipe/fade: WAJIB 800-3000ms
- easing: ease_in_out untuk transisi panjang, linear untuk cut
- direction: forward (default), backward (untuk flashback), loop (untuk repetitive motion)

CONTOH TRANSITION_CHAIN untuk 4 scene:
Scene 1 → Scene 2: dissolve (1500ms, ease_in_out) — waktu berlalu
Scene 2 → Scene 3: match_cut (0ms, linear) — visual continuity (mata karakter → mata hutan)
Scene 3 → Scene 4: fade_to_black (2500ms, ease_in_out) — chapter end

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. VOICE TYPE ASSIGNMENT (WAJIB KONTEKSTUAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ATURAN PEMETAAN KARAKTER → VOICE TYPE:
- child: usia 5-12 tahun (WAJIB gunakan "child" untuk karakter anak, voice_pitch="high", speed 1.0-1.2)
- teen: usia 13-19 tahun (speed 0.95-1.1, pitch "medium" atau "high")
- adult_male: pria 20-50 tahun (speed 0.9-1.1, pitch "low" atau "medium")
- adult_female: wanita 20-50 tahun (speed 0.9-1.1, pitch "medium")
- elderly_male: pria 50+ (speed 0.8-1.0, pitch "low", emotion "calm" atau "dramatic")
- elderly_female: wanita 50+ (speed 0.8-1.0, pitch "medium")
- narrator: TIDAK pernah muncul sebagai karakter, HANYA untuk narasi penghubung ATAU jika TIDAK ADA karakter yang bicara di scene

VOICE_TYPE FIELD (WAJIB di scene + character_profiles):
- voice_type: child|teen|adult_male|adult_female|elderly_male|elderly_female|narrator
- voice_emotion: neutral|happy|sad|excited|calm|dramatic
- voice_speed: 0.5-2.0 (default 1.0)
- voice_pitch: low|medium|high|auto
- voiceover_speaker: string (nama karakter yang bicara, atau "narrator" jika tidak ada karakter)

ATURAN:
- voice_type WAJIB konsisten dengan karakter yang bicara
- voiceover_script WAJIB di-tag dengan voiceover_speaker (nama karakter)
- Jika scene murni narasi tanpa karakter bicara: voice_type="narrator", voiceover_speaker="narrator"
- voice_emotion mengikuti mood scene: cheerful→happy, mysterious→dramatic, tense→dramatic, peaceful→calm
- voice_speed untuk narator: 0.95-1.05, untuk anak: 1.0-1.2, untuk lansia: 0.8-0.95

CONTOH KONTEKSTUAL:
- Rina (10 tahun) bicara di scene 1: voice_type="child", voice_emotion="excited", voice_pitch="high", voiceover_speaker="Rina"
- Kakek (70 tahun) bercerita: voice_type="elderly_male", voice_emotion="dramatic", voice_pitch="low", voice_speed=0.85, voiceover_speaker="Kakek"
- Narasi pembuka: voice_type="narrator", voice_emotion="neutral", voiceover_speaker="narrator"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. IMAGE PROMPT 8 LAYERS (WAJIB KOMPLEKS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SETIAP image_prompts[].characters[] dan .backgrounds[] WAJIB punya 8 layer:

Layer 1 — prompt_text: SINGLE string yang menggabungkan SEMUA layer di bawah (100-200 kata detail)
Layer 2 — composition: JSON string {foreground, midground, background} (WAJIB detail)
Layer 3 — lighting: JSON string {key, fill, rim, style} (WAJIB spesifik)
Layer 4 — camera: JSON string {angle, lens, depth_of_field, movement} (WAJIB)
Layer 5 — mood_atmosphere: string (3-5 kata sifat emosi)
Layer 6 — style_references: string (3-5 referensi gaya, dipisah koma)
Layer 7 — color_palette: array of hex colors atau string deskripsi warna dominan
Layer 8 — technical: JSON string {resolution, aspect_ratio, engine, format}

ATURAN PROMPT_TEXT (WAJIB detail):
- Panjang 80-200 kata
- WAJIB sebutkan: subjek + aksi + setting + pencahayaan + gaya kamera + mood
- WAJIB konsisten dengan character_profiles (deskripsi fisik WAJIB sama)
- PAKAI koma dan penghubung untuk readability
- HINDARI kata terlalu umum: "cantik", "bagus" → pakai spesifik

CONTOH PROMPT_TEXT COMPLEX:
"close-up portrait of [NAMA], [FISIK DETAIL], [PAKAIAN DETAIL], [AKSI], [SETTING], [EXPRESSION], [LIGHTING], [CAMERA], [STYLE], [MOOD], ultra-detailed, high quality, cinematic, 8K"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. AUDIO SPECS (WAJIB MINIMAL 1 PER SCENE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SETIAP scene WAJIB punya audio_specs[] (minimal 1, ideal 2-3):

AUDIO TYPES (5):
- background_music: musik latar kontinyu (WAJIB ada di > 80% scene)
- sfx: sound effect diskrit (langkah, pintu, ledakan)
- ambient: suara lingkungan (angin, hujan, keramaian)
- music_cue: isyarat musik untuk momen khusus
- transition_audio: audio untuk transisi (whoosh, riser)

FIELDS WAJIB untuk background_music/music_cue:
- music_genre: orchestral|electronic|ambient|jazz|pop|folk|rock|world
- music_mood: cheerful|dramatic|tense|peaceful|mysterious|romantic|epic|melancholic
- music_tempo_bpm: 60-200 (60-80 slow, 80-120 medium, 120-160 fast, 160-200 very fast)
- music_instruments: comma-separated (piano,strings,guitar,drums,flute,choir)
- music_volume: 0.0-1.0 (default 0.4 untuk bg music)

FIELDS WAJIB untuk sfx:
- sfx_list: JSON array [{name, timing_ms, volume}]

FIELDS WAJIB untuk ambient:
- ambient_type: forest|city|rain|wind|ocean|room|cave|market|night
- ambient_volume: 0.0-1.0 (default 0.3)

TIMING OPTIONS:
- start: awal scene saja
- throughout: sepanjang scene (default untuk bg music + ambient)
- end: akhir scene saja
- specific_moment: momen tertentu (butuh start_time_ms)

VOLUME RULES:
- background_music: 0.2-0.5 (jangan terlalu keras, biar voiceover jelas)
- ambient: 0.2-0.5
- sfx: 0.4-0.8 (diatas bg music)
- music_cue: 0.5-0.8 (emosional)
- transition_audio: 0.4-0.6

CONTOH AUDIO_SPECS untuk scene 1 (opening):
- ambient (throughout, volume 0.3): suara pagi desa
- background_music (throughout, volume 0.3): musik petualangan ringan

CONTOH AUDIO_SPECS untuk scene action:
- music_cue (throughout, volume 0.6): musik tegang cepat
- sfx (start, volume 0.7): suara benturan
- ambient (throughout, volume 0.2): suara latar minimal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. SCENE PACING & MOOD (WAJIB KONSISTEN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- duration_seconds: estimasi dari voiceover_script.length / 12 (BUKAN /15). 12 char/detik = bicara natural.
- scene_pacing: fast (action, chase) | normal (default) | slow (dramatis, emosional)
- scene_mood: cheerful|dramatic|tense|peaceful|mysterious

ATURAN PACING vs TRANSITION:
- fast pacing → cut (0ms) atau match_cut (0ms)
- normal pacing → dissolve (800-1500ms) atau match_cut
- slow pacing → fade_to_black (1500-3000ms) atau fade_to_white

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6. CONSISTENCY RULES (WAJIB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Identitas karakter WAJIB stabil lintas scene (nama, fisik, pakaian)
- voice_type WAJIB konsisten dengan character_profiles[].voice_type
- voiceover_speaker WAJIB ada di character_profiles atau "narrator"
- image_prompts[].target = nama di character_profiles
- Setiap scene WAJIB punya image_prompts.characters[] min 1 + image_prompts.backgrounds[] min 1
- Setiap scene WAJIB punya audio_specs[] min 1
- Root image_prompts WAJIB berisi master list untuk konsistensi visual

=== OUTPUT FORMAT ===
Langsung JSON object. JANGAN bungkus dalam \`\`\`json ... \`\`\`. JANGAN tulis teks sebelum/sesudah JSON.`;
}

export function buildUserMessage(input: GenerateInput['input'], references: ReferenceInfo[] = []): string {
  const refLines = references.length > 0
    ? `\n\nREFERENSI GAMBAR TERSEDIA:\n${references.map((r) => `- ${r.name} (${r.type})`).join('\n')}\nGunakan reference_filename untuk merujuk file yang sesuai di image_prompts[].`
    : '';

  const storyLine = input.storyDescription
    ? `\nDeskripsi Cerita: ${input.storyDescription}`
    : '';

  const numScenes = input.durationTarget.type === 'shorts'
    ? '3-6 scene (untuk shorts 30-60 detik, ideal 4-5 scene dengan transisi kompleks)'
    : '8-20 scene (untuk tutorial 7-15 menit, ideal 12-15 scene)';

  return `Buat paket prompt animasi V3 production-grade:

Judul: ${input.title}
Durasi: ${input.durationTarget.type} (${input.durationTarget.seconds} detik)
Style: ${input.style.type}, rasio ${input.style.ratio}${storyLine}${refLines}

REQUIREMENTS V3 (WAJIB):
- Generate ${numScenes}
- WAJIB gunakan TRANSITION FLOW PATTERN (A/B/C/D/E) — JANGAN adegan kaget (cut langsung)
- WAJIB scene 1 = fade_in atau fade_to_white, scene terakhir = fade_to_black
- WAJIB voice_type assignment kontekstual per karakter (child/elderly/narrator)
- WAJIB image_prompts 8 layers per item (composition, lighting, camera, mood, style, color_palette, technical)
- WAJIB audio_specs minimal 1 per scene (background_music + ambient ideal)
- WAJIB voiceover_speaker untuk identifikasi siapa yang bicara
- duration_seconds = voiceover_script.length / 12

PENTING:
- Output JSON OBJECT langsung (tanpa code block wrapper)
- duration_target dan style HARUS object, BUKAN string
- Setiap scene WAJIB punya: transition_* (4 fields), voice_* (4 fields), audio_specs, image_prompts 8-layer
- Root image_prompts WAJIB berisi master list untuk konsistensi visual`;
}
