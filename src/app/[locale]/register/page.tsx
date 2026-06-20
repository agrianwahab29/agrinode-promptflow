'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: name || undefined }),
      });
      if (!res.ok) {
        const txt = await res.text();
        try {
          const j = JSON.parse(txt);
          setError(j?.error?.message ?? 'Registrasi gagal');
        } catch {
          setError('Registrasi gagal');
        }
        setLoading(false);
        return;
      }
      // Auto-login
      const signin = await signIn('credentials', { email, password, redirect: false });
      setLoading(false);
      if (signin?.error) {
        console.error('Auto-login failed:', signin.error, signin);
        toast.error('Akun dibuat tapi auto-login gagal. Coba login manual.');
        router.push(`/${locale}/login?error=CredentialsSignin`);
        return;
      }
      toast.success('Akun berhasil dibuat');
      router.push(`/${locale}/generate`);
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Network error');
    }
  }

  return (
    <div className="mx-auto max-w-[640px] py-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('registerTitle')}</CardTitle>
          <CardDescription>{t('registerSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label htmlFor="name">Nama (opsional)</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (min 8 karakter)</Label>
              <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Loading...' : t('register')}</Button>
            <p className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link href={`/${locale}/login`} className="font-medium text-primary hover:underline">
                {t('login')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}