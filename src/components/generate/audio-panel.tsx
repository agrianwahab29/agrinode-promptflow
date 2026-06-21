'use client';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Music, Volume2, CloudRain, Music2, AudioLines } from 'lucide-react';

const AUDIO_ICONS: Record<string, typeof Music> = {
  background_music: Music,
  sfx: Volume2,
  ambient: CloudRain,
  music_cue: Music2,
  transition_audio: AudioLines,
};

interface AudioEntry {
  audio_type: string;
  audioType?: string;
  description: string;
  timing: string;
  volume: number;
  duration_seconds?: number | null;
  fade_in_ms?: number;
  fade_out_ms?: number;
  music_genre?: string | null;
  music_mood?: string | null;
  music_tempo_bpm?: number | null;
  music_instruments?: string | null;
  sfx_list?: string | null;
  ambient_type?: string | null;
  ambient_volume?: number;
}

export function AudioPanel({ audio }: { audio: AudioEntry[] }) {
  const t = useTranslations('audio');

  if (audio.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('noAudio')}</p>;
  }

  return (
    <div className="space-y-2">
      {audio.map((a, i) => {
        const atype = a.audio_type ?? a.audioType ?? '';
        const Icon = AUDIO_ICONS[atype] ?? Music;
        return (
          <div key={i} className="flex items-center gap-2 rounded-md border p-2 text-sm">
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Badge variant="outline" className="text-xs">
              {t(`types.${atype}`)}
            </Badge>
            <span className="flex-1 truncate">{a.description}</span>
            <span className="text-xs text-muted-foreground">{t(`timing.${a.timing}`)}</span>
            <span className="text-xs text-muted-foreground">{Math.round(a.volume * 100)}%</span>
          </div>
        );
      })}
    </div>
  );
}
