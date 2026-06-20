'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
  locale?: string;
}

export function PageErrorBoundary({ error, reset, locale = 'id' }: Props) {
  useEffect(() => {
    console.error('[page-error]', error);
  }, [error]);

  return (
    <div className="p-4">
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" aria-hidden />
            <CardTitle className="text-destructive">Terjadi Kesalahan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{error.message || 'Gagal memuat halaman'}</p>
          {error.digest && <p className="text-xs text-muted-foreground">Trace ID: {error.digest}</p>}
          <div className="flex gap-2">
            <Button onClick={reset}>Coba Lagi</Button>
            <Link href={`/${locale}`}>
              <Button variant="outline">Kembali ke Beranda</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
