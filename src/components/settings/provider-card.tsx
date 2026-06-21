'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ProviderDTO {
  id: number;
  name: string;
  provider: string;
  baseUrl: string;
  model: string;
  apiKeyMasked: string;
  isActive: number;
}

interface TestResult {
  ok: boolean;
  latencyMs?: number;
  sample?: string;
  message?: string;
  detail?: string;
}

export function ProviderCard({ p }: { p: ProviderDTO }) {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  async function handleTest() {
    setTesting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/v1/settings/providers/${p.id}/test`, { method: 'POST' });
      const body = await res.json();
      const data = body?.data ?? body;
      if (res.ok && data?.ok) {
        setResult({ ok: true, latencyMs: data.latencyMs, sample: data.sample });
        toast.success(`${p.name}: OK (${data.latencyMs}ms)`);
      } else {
        const msg = data?.message ?? data?.error?.message ?? 'Gagal';
        const detail = data?.detail ?? '';
        setResult({ ok: false, message: msg, detail });
        toast.error(`${p.name}: ${msg}`);
        console.error(`[provider-test] UI error id=${p.id}`, data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setResult({ ok: false, message: msg });
      toast.error(`${p.name}: ${msg}`);
      console.error(`[provider-test] UI catch id=${p.id}`, err);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{p.name}</div>
          <div className="text-xs text-muted-foreground">
            {p.provider} • {p.baseUrl} • {p.model}
          </div>
          <div className="mt-1 font-mono text-xs">{p.apiKeyMasked}</div>
        </div>
        <div className="flex items-center gap-2">
          {p.isActive === 1 && <Badge variant="success">Active</Badge>}
          <Button
            variant="outline"
            size="sm"
            disabled={testing}
            onClick={handleTest}
          >
            {testing ? 'Testing...' : 'Test'}
          </Button>
          <form
            action={`/api/v1/settings/providers/${p.id}/delete`}
            method="post"
          >
            <Button variant="ghost" size="sm" type="submit">
              Delete
            </Button>
          </form>
        </div>
      </div>

      {result && (
        <div className={`mt-2 rounded p-2 text-xs font-mono ${result.ok ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
          {result.ok ? (
            <>
              <div>OK — {result.latencyMs}ms</div>
              {result.sample && <div className="mt-1 opacity-70">Response: &quot;{result.sample}&quot;</div>}
            </>
          ) : (
            <>
              <div>Error: {result.message}</div>
              {result.detail && <div className="mt-1 whitespace-pre-wrap opacity-70">{result.detail}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
