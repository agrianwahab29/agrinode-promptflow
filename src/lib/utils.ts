import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(epoch: number | null | undefined): string {
  if (!epoch) return '';
  return new Date(epoch * 1000).toISOString();
}

export function epochNow(): number {
  return Math.floor(Date.now() / 1000);
}

export function fromDate(d: Date): number {
  return Math.floor(d.getTime() / 1000);
}
