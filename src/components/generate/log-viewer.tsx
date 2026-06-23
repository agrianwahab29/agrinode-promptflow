'use client';
import { useState, useEffect, useRef } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Switch } from '@/components/ui/switch';
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

export function LogViewer({ logs, defaultOpen = false, streaming = false }: { logs: LogEntry[]; defaultOpen?: boolean; streaming?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-open when streaming starts producing logs
  useEffect(() => {
    if (streaming && logs.length > 0 && !open) setOpen(true);
  }, [streaming, logs.length, open]);

  // Auto-scroll to bottom on new log
  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [logs, open]);

  if (logs.length === 0) return null;

  const latest = logs[logs.length - 1]!;

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Processing Logs ({logs.length})</span>
        <Collapsible.Trigger asChild>
          <Switch checked={open} onCheckedChange={setOpen} aria-label="Toggle log viewer" />
        </Collapsible.Trigger>
      </div>
      {/* Latest log always visible (even when collapsed) */}
      {!open && (
        <div className="mt-1 flex items-start gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">{formatTime(latest.timestamp)}</span>
          <LevelBadge level={latest.level} />
          <span className="break-all">{escapeHtml(latest.message).slice(0, 120)}{latest.message.length > 120 ? '…' : ''}</span>
        </div>
      )}
      <Collapsible.Content>
        <div ref={scrollRef} className="mt-2 max-h-48 w-full overflow-y-auto rounded-md border bg-muted/30 p-2">
          <div className="space-y-0.5 font-mono text-xs">
            {logs.map((entry, i) => (
              <div key={i} className="flex items-start gap-2 py-0.5">
                <span className="text-muted-foreground tabular-nums">{formatTime(entry.timestamp)}</span>
                <LevelBadge level={entry.level} />
                <span className="break-all">{escapeHtml(entry.message)}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
