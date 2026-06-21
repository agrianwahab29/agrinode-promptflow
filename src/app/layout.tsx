import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://promptflow.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'PromptFlow — Otomasi Prompt Animasi AI',
    template: '%s | PromptFlow',
  },
  description:
    'Workflow engine untuk menghasilkan paket prompt animasi AI terstruktur. Karakter konsisten. Multi-provider LLM. Export JSON/Markdown.',
  keywords: [
    'PromptFlow',
    'AI animation prompt',
    'otomatisasi prompt',
    'character consistency',
    'multi-provider LLM',
  ],
  authors: [{ name: 'PromptFlow' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: 'PromptFlow',
    title: 'PromptFlow — Otomasi Prompt Animasi AI',
    description:
      'Workflow engine untuk menghasilkan paket prompt animasi AI terstruktur. Karakter konsisten. Multi-provider LLM. Export JSON/Markdown.',
    images: [
      {
        url: '/og/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PromptFlow — Workflow Engine Otomasi Prompt Animasi AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptFlow — Otomasi Prompt Animasi AI',
    description:
      'Workflow engine untuk menghasilkan paket prompt animasi AI terstruktur. Karakter konsisten. Multi-provider LLM. Export JSON/Markdown.',
    images: ['/og/og-image.jpg'],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'id-ID': '/id',
      'en-US': '/en',
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
