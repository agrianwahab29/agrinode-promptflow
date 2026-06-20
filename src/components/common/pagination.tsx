'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

function buildHref(base: string, page: number, params?: Record<string, string>): string {
  const url = new URL(base, 'http://localhost');
  url.searchParams.set('page', String(page));
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  return url.pathname + url.search;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <Button variant="outline" size="sm" asChild={currentPage > 1}>
        {currentPage > 1 ? (
          <Link href={buildHref(baseUrl, currentPage - 1, searchParams)} aria-label="Previous">Prev</Link>
        ) : (
          <span className="opacity-50 pointer-events-none">Prev</span>
        )}
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-1 text-muted-foreground">...</span>
        ) : (
          <Button
            key={p}
            variant={p === currentPage ? 'default' : 'outline'}
            size="sm"
            asChild={p !== currentPage}
          >
            {p === currentPage ? (
              <span aria-current="page">{p}</span>
            ) : (
              <Link href={buildHref(baseUrl, p, searchParams)}>{p}</Link>
            )}
          </Button>
        ),
      )}

      <Button variant="outline" size="sm" asChild={currentPage < totalPages}>
        {currentPage < totalPages ? (
          <Link href={buildHref(baseUrl, currentPage + 1, searchParams)} aria-label="Next">Next</Link>
        ) : (
          <span className="opacity-50 pointer-events-none">Next</span>
        )}
      </Button>
    </nav>
  );
}
