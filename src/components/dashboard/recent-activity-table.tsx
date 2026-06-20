import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  projects: Array<{ id: number; title: string; status: string; createdAt: string }>;
}

export function RecentActivityTable({ projects }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Proyek Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada proyek.</p>
        ) : (
          <div className="space-y-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <Badge variant={p.status === 'complete' ? 'success' : 'secondary'} className="text-[10px]">{p.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
