import { describe, it, expect } from 'vitest';
import { createLogBuffer } from '@/lib/ai/log-buffer';

describe('log-buffer', () => {
  it('adds entries with timestamp', () => {
    const buf = createLogBuffer();
    const e1 = buf.add('info', 'hello');
    const e2 = buf.add('warn', 'careful');
    expect(e1.level).toBe('info');
    expect(e1.message).toBe('hello');
    expect(typeof e1.timestamp).toBe('number');
    expect(e2.level).toBe('warn');
    expect(buf.entries.length).toBe(2);
  });

  it('drain returns a copy', () => {
    const buf = createLogBuffer();
    buf.add('error', 'oops');
    const drained = buf.drain();
    expect(drained).toHaveLength(1);
    drained.push({ level: 'info', message: 'fake', timestamp: 0 });
    expect(buf.entries).toHaveLength(1);
  });

  it('toJSON returns valid JSON', () => {
    const buf = createLogBuffer();
    buf.add('info', 'x');
    const json = buf.toJSON();
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json) as unknown[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
  });

  it('caps at 500 entries', () => {
    const buf = createLogBuffer();
    for (let i = 0; i < 600; i++) buf.add('info', `m${i}`);
    expect(buf.entries.length).toBe(500);
    expect(buf.entries[0]?.message).toBe('m0');
    expect(buf.entries[499]?.message).toBe('m499');
  });
});
