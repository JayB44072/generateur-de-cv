import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SubscriptionTier = 'free' | 'premium' | 'ai';

export interface Profile {
  id: string;
  subscription_tier: SubscriptionTier;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CVDataRow {
  id: string;
  user_id: string;
  template_id: number;
  cv_title: string;
  cv_content: CVContent;
  created_at: string;
  updated_at: string;
}

export interface CVContent {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
  languages: Language[];
  customSections: CustomSection[];
  profilePhoto?: string;
  portfolioPhotos?: string[];
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  linkedin: string;
  summary: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  location: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  location: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
  category: string;
}

export interface Language {
  id: string;
  name: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: 'premium' | 'ai';
  transaction_id: string;
  amount: number;
  payment_method: 'mtn' | 'orange' | 'paypal' | 'card';
  payment_details: Record<string, string>;
  status: 'success' | 'pending' | 'failed';
  paid_at: string;
}

export const defaultCVContent: CVContent = {
  personalInfo: {
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    linkedin: '',
    summary: '',
  },
  experiences: [],
  educations: [],
  skills: [],
  languages: [],
  customSections: [],
};
