import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function parseNominal(s: string): number {
  const value = s.toLowerCase().trim();
  let multiplier = 1;
  
  if (value.endsWith('k') || value.endsWith('rb')) {
    multiplier = 1000;
  } else if (value.endsWith('jt')) {
    multiplier = 1000000;
  }
  
  const numericStr = value.replace(/[krbtj]/g, '').replace(/,/g, '.');
  const number = parseFloat(numericStr);
  
  if (isNaN(number)) return 0;
  
  return number * multiplier;
}

export function getNameFromEmail(email?: string): string {
  if (!email) return "Kamu";
  const namePart = email.split('@')[0];
  return namePart
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
