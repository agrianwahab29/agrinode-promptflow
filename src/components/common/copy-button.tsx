'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label ?? 'Copy'}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Tersalin');
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? (
        <Check className="h-4 w-4 text-[var(--color-success)]" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}
