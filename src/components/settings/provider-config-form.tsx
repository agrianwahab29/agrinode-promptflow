'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { CreateProviderConfigInputSchema } from '@/lib/validation/schemas';

const FormSchema = CreateProviderConfigInputSchema;

const PROVIDER_BASE_URLS: Record<string, string> = {
  ollama: 'https://ollama.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  '9router': 'http://localhost:20128/v1',
  custom: '',
};

export function ProviderConfigForm({ locale: _locale }: { locale: string }) {
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      provider: 'openrouter',
      name: '',
      baseUrl: PROVIDER_BASE_URLS.openrouter!,
      model: '',
      apiKey: '',
    },
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/settings/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const txt = await res.text();
        toast.error(`Gagal simpan: ${txt.slice(0, 200)}`);
        return;
      }
      toast.success('Provider tersimpan');
      form.reset();
      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" {...form.register('name')} placeholder="OpenRouter Utama" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                id="provider"
                {...form.register('provider', {
                  onChange: (e) => {
                    const url = PROVIDER_BASE_URLS[e.target.value];
                    if (url) form.setValue('baseUrl', url);
                  },
                })}
              >
                <option value="ollama">Ollama Cloud</option>
                <option value="openrouter">OpenRouter</option>
                <option value="9router">9router (lokal)</option>
                <option value="custom">Custom</option>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input id="baseUrl" {...form.register('baseUrl')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input id="model" {...form.register('model')} placeholder="anthropic/claude-3.5-sonnet" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input id="apiKey" type="password" {...form.register('apiKey')} placeholder="sk-or-v1-..." />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan Provider'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
