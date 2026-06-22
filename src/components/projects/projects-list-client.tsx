'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ProjectCard } from './project-card';

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

export function ProjectsListClient({
  projects,
  locale,
  total,
}: {
  projects: ProjectDTO[];
  locale: string;
  total: number;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const selectionMode = selectedIds.size > 0;
  const allSelected = projects.length > 0 && selectedIds.size === projects.length;

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(projects.map((p) => p.id)));
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const res = await fetch('/api/v1/projects/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`${data.deleted} proyek berhasil dihapus`);
        setSelectedIds(new Set());
        setBulkDialogOpen(false);
        router.refresh();
      } else {
        toast.error('Gagal menghapus proyek');
      }
    } catch {
      toast.error('Gagal menghapus proyek');
    } finally {
      setBulkDeleting(false);
    }
  }

  return (
    <>
      {/* Bulk action toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAll}
          className="text-xs"
        >
          {allSelected ? 'Batal Pilih' : 'Pilih Semua'}
        </Button>
        {selectionMode && (
          <>
            <span className="text-xs text-muted-foreground">
              {selectedIds.size} dari {total} dipilih
            </span>
            <Button
              variant="destructive"
              size="sm"
              className="text-xs"
              onClick={() => setBulkDialogOpen(true)}
            >
              Hapus Terpilih ({selectedIds.size})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setSelectedIds(new Set())}
            >
              Batal
            </Button>
          </>
        )}
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            locale={locale}
            p={p}
            selectable
            selected={selectedIds.has(p.id)}
            onToggle={() => toggleSelect(p.id)}
          />
        ))}
      </div>

      {/* Bulk delete dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus {selectedIds.size} Proyek</DialogTitle>
            <DialogDescription>
              Yakin ingin menghapus <strong>{selectedIds.size} proyek</strong> yang dipilih?
              Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={bulkDeleting}>Batal</Button>
            </DialogClose>
            <Button variant="destructive" disabled={bulkDeleting} onClick={handleBulkDelete}>
              {bulkDeleting ? 'Menghapus...' : `Ya, Hapus ${selectedIds.size} Proyek`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
