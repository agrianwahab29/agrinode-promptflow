import 'server-only';

export interface LogBufferEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

export interface LogBuffer {
  add(level: LogBufferEntry['level'], message: string): LogBufferEntry;
  drain(): LogBufferEntry[];
  toJSON(): string;
  entries: LogBufferEntry[];
}

const MAX_ENTRIES = 500;

export function createLogBuffer(): LogBuffer {
  const entries: LogBufferEntry[] = [];
  return {
    entries,
    add(level: LogBufferEntry['level'], message: string): LogBufferEntry {
      const entry: LogBufferEntry = { level, message, timestamp: Date.now() };
      if (entries.length < MAX_ENTRIES) entries.push(entry);
      return entry;
    },
    drain(): LogBufferEntry[] {
      return [...entries];
    },
    toJSON(): string {
      return JSON.stringify(entries);
    },
  };
}
