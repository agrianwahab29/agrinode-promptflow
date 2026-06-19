'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export interface AssetRef {
  id: number;
  filename: string;
  url: string;
  tipe: 'tokoh' | 'background';
  label: string | null;
}

export function DropzoneUploader({ projectId, onUploaded }: { projectId: number; onUploaded: (refs: AssetRef[]) => void }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [tipe, setTipe] = useState<'tokoh' | 'background'>('tokoh');
  const [label, setLabel] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: AssetRef[] = [];
    for (const f of Array.from(files)) {
      try {
        const form = new FormData();
        form.append('file', f);
        form.append('tipe', tipe);
        if (label) form.append('label', label);
        const res = await fetch(`/api/v1/upload?projectId=${projectId}`, { method: 'POST', body: form });
        if (!res.ok) {
          const txt = await res.text();
          toast.error(`${f.name}: ${txt.slice(0, 120)}`);
          continue;
        }
        const body = await res.json();
        uploaded.push(body.data);
      } catch (e) {
        toast.error(`${f.name}: ${e instanceof Error ? e.message : 'Upload gagal'}`);
      }
    }
    setUploading(false);
    if (uploaded.length > 0) {
      toast.success(`${uploaded.length} file terupload`);
      onUploaded(uploaded);
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="rounded-lg border border-dashed bg-muted/30 p-6 text-center transition-colors hover:bg-muted/50"
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-sm text-muted-foreground">Drag & drop atau klik untuk pilih file gambar (max 10MB, image/*)</p>
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Pilih File'}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="tipe">Tipe Default</Label>
          <Select id="tipe" value={tipe} onChange={(e) => setTipe(e.target.value as 'tokoh' | 'background')}>
            <option value="tokoh">Tokoh</option>
            <option value="background">Background</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="label">Label (opsional)</Label>
          <input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="cth: Hero"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
