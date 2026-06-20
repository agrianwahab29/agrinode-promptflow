'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  success: number;
  failed: number;
  partial: number;
}

export function SuccessFailBarChart({ success, failed, partial }: Props) {
  const data = [
    { name: 'Generations', success, failed, partial },
  ];
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 6 }} />
          <Legend />
          <Bar dataKey="success" fill="#22c55e" name="Sukses" radius={[4, 4, 0, 0]} />
          <Bar dataKey="partial" fill="#eab308" name="Partial" radius={[4, 4, 0, 0]} />
          <Bar dataKey="failed" fill="#ef4444" name="Gagal" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
