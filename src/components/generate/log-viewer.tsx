'use client';
import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

function LevelBadge({ level }: { level: LogEntry['level'] }) {
  const variants: Record<string, string> = {
    info: 'bg-blue-100 text-blue-800',
    warn: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  return <Badge variant="secondary" className={`text-[10px] ${variants[level]}`}>{level}</Badge>;
}

// SEC-C24: escape HTML in log lines before render
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
    '.' + String(d.getMilliseconds()).padStart(3, '0');
}

export function LogViewer({ logs }: { logs: LogEntry[] }) {
  const [open, setOpen] = useState(false);

  if (logs.length === 0) return null;

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Processing Logs ({logs.length})</span>
        <Collapsible.Trigger asChild>
          <Switch checked={open} onCheckedChange={setOpen} aria-label="Toggle log viewer" />
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content>
        <ScrollArea className="mt-2 h-48 w-full rounded-md border bg-muted/30 p-2">
          <div className="space-y-0.5 font-mono text-xs">
            {logs.map((entry, i) => (
              <div key={i} className="flex items-start gap-2 py-0.5">
                <span className="text-muted-foreground tabular-nums">{formatTime(entry.timestamp)}</span>
                <LevelBadge level={entry.level} />
                <span className="break-all">{escapeHtml(entry.message)}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
