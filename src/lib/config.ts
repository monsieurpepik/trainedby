/**
 * Central config - single source of truth for Supabase URLs and keys.
 * All pages import from here; no more copy-pasted constants.
 */

export const SUPABASE_URL =
  import.meta.env.PUBLIC_SUPABASE_URL ||
  'https://bvbfkzsslfbumzmpoxjg.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2YmZrenNzbGZidW16bXBveGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDI5NTksImV4cCI6MjA1OTc3ODk1OX0.VKkGnSFxcFJGJFbFLBfZHfRdFmQjJJNFkLJlqGBGHhE';

export const EDGE_BASE = `${SUPABASE_URL}/functions/v1`;

export const RESERVED_SLUGS = new Set([
  'edit', 'dashboard', 'join', 'pricing', 'privacy', 'terms',
  'landing', 'blog', 'plan-builder', 'find', 'about', 'contact',
]);

/** Fitness utilities */
export function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return parseFloat((weightKg / (h * h)).toFixed(1));
}

export function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#4fc3f7' };
  if (bmi < 25) return { label: 'Healthy', color: '#00C853' };
  if (bmi < 30) return { label: 'Overweight', color: '#FF5C00' };
  return { label: 'Obese', color: '#ff5555' };
}

export function calcTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
): number {
  const bmr =
    gender === 'female'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
      : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const multipliers: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] ?? 1.55));
}

/** UI helpers */
export function formatAED(amount: number): string {
  return 'AED ' + Number(amount).toLocaleString('en-AE', { minimumFractionDigits: 0 });
}

export function formatTimeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
}
