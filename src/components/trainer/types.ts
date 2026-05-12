export interface Trainer {
  id: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  profile_photo_url?: string;
  specialties?: string[] | string;
  avg_rating?: number | string | null;
  review_count?: number;
  reps_verified?: boolean;
  is_verified?: boolean;
  verification_status?: string;
  city?: string;
  country?: string;
  bio?: string;
  instagram?: string;
  instagram_handle?: string;
  whatsapp?: string;
  phone?: string;
  certifications?: string[];
  experience_years?: number;
  years_experience?: number;
  total_clients?: number;
  client_count?: number;
  goal_achievement_rate?: number | null;
}

export interface Package {
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number | string | null;
  currency?: string;
  sessions?: number;
}

export interface Review {
  id?: string;
  rating?: number;
  review_text?: string;
  client_name?: string;
  created_at?: string;
}

export interface StatItem {
  num: string;
  label: string;
}

export interface TrainerProfileProps {
  slug: string;
  paymentEnabled: boolean;
  currencySymbol: string;
}
