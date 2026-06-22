'use client';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Baby, User, Mic } from 'lucide-react';

const VOICE_ICONS: Record<string, typeof Baby> = {
  child: Baby,
  teen: User,
  adult_male: User,
  adult_female: User,
  elderly_male: User,
  elderly_female: User,
  narrator: Mic,
};

interface VoiceSpec {
  voiceType: string;
  voiceEmotion: string;
  voiceSpeed: number;
  voicePitch: string;
}

export function VoiceTypeSelector({ voice }: { voice: VoiceSpec }) {
  const t = useTranslations('voice');
  const Icon = VOICE_ICONS[voice.voiceType] ?? User;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Badge variant="outline" className="gap-1">
        <Icon className="h-3 w-3" />
        {t(`types.${voice.voiceType}`)}
      </Badge>
      <Badge variant="secondary">{t(`emotions.${voice.voiceEmotion}`)}</Badge>
      <span className="text-xs text-muted-foreground">
        {t('speedLabel')}: {voice.voiceSpeed}x
      </span>
      <Badge variant="outline" className="text-xs">
        {t('pitchLabel')}: {t(`pitch.${voice.voicePitch}`)}
      </Badge>
    </div>
  );
}
