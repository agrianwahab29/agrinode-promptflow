export interface TitleTemplate {
  id: string;
  title: string;
  durationType: 'shorts' | 'tutorial';
  styleType: '3D' | '2D';
  description: string;
}

export const TEMPLATE_TITLES: TitleTemplate[] = [
  { id: 'hutan-3d', title: 'Petualangan di Hutan', durationType: 'shorts', styleType: '3D', description: 'Anak-anak menjelajahi hutan belantara' },
  { id: 'kucing-lucu', title: 'Kucing Pemberani', durationType: 'shorts', styleType: '2D', description: 'Kucing kecil menyelamatkan teman dari masalah' },
  { id: 'roket-angkasa', title: 'Petualangan Angkasa', durationType: 'tutorial', styleType: '3D', description: 'Eksplorasi planet baru oleh astronot cilik' },
  { id: 'laut-biru', title: 'Misteri Laut Biru', durationType: 'tutorial', styleType: '2D', description: 'Penyelaman untuk menemukan kota bawah laut' },
  { id: 'persahabatan', title: 'Persahabatan Sejati', durationType: 'shorts', styleType: '3D', description: 'Dua sahabat mengatasi perbedaan mereka' },
  { id: 'musim-gugur', title: 'Musim Gugur yang Ajaib', durationType: 'shorts', styleType: '2D', description: 'Daun-daun berubah warna dan terbang bersama peri' },
  { id: 'kue-ulang-tahun', title: 'Kue Ulang Tahun Ajaib', durationType: 'shorts', styleType: '3D', description: 'Kue yang membawa anak ke dunia fantasi' },
  { id: 'sekolah-sejarah', title: 'Sejarah Indonesia untuk Anak', durationType: 'tutorial', styleType: '2D', description: 'Perjalanan singkat sejarah Indonesia' },
];
