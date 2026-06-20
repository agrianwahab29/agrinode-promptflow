'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';

export function DeleteProjectButton({ projectId, projectTitle }: { projectId: number; projectTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/delete`, { method: 'POST' });
      if (res.ok) {
        setOpen(false);
        toast.success('Project dihapus');
        router.push('/id/projects');
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

  return (
    <>
      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setOpen(true)}>
        Hapus
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Project</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus project <strong>&quot;{projectTitle}&quot;</strong>? Tindakan ini tidak bisa dibatalkan.
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
