'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ProjectDTO {
  id: number;
  title: string;
  durationType: string;
  durationTargetSeconds: number;
  styleType: string;
  aspectRatio: string;
  status: string;
  createdAt: string;
}

export function ProjectCard({ p, locale }: { p: ProjectDTO; locale: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const statusVariant =
    p.status === 'complete' ? 'success' : p.status === 'failed' ? 'destructive' : 'secondary';

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/projects/${p.id}/delete`, { method: 'POST' });
      if (res.ok) {
        setDialogOpen(false);
        toast.success('Project dihapus');
        router.refresh();
      } else {
        toast.error('Gagal hapus project');
      }
    } catch {
      toast.error('Gagal hapus project');
    } finally {
      setDeleting(false);
    }
  }

  function openDialog(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDialogOpen(true);
  }

  return (
    <>
      <Link href={`/${locale}/projects/${p.id}`}>
        <Card className="relative transition-colors hover:bg-accent">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="line-clamp-1 text-base">{p.title}</CardTitle>
              <div className="flex items-center gap-1 shrink-0">
                <Badge variant={statusVariant}>{p.status}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={openDialog}
                  title="Hapus project"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </Button>
              </div>
            </div>
            <CardDescription>
              {p.durationType} • {p.durationTargetSeconds}s • {p.styleType} {p.aspectRatio}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {new Date(p.createdAt).toLocaleString(locale)}
          </CardContent>
        </Card>
      </Link>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Project</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus project <strong>&quot;{p.title}&quot;</strong>? Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deleting}>Batal</Button>
            </DialogClose>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
