import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
  rows: Array<{ provider: string; model: string; count: number; avgDurationMs: number }>;
}

export function PerProviderBreakdownTable({ rows }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Per-Provider Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada data.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Avg (ms)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={`${r.provider}-${r.model}`}>
                  <TableCell className="font-medium">{r.provider}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.model}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.avgDurationMs}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
