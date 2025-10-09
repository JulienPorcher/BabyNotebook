// Centralized type definitions for baby context data structures

export type Baby = {
  id: string;
  name: string;
  birth_date: string;
  gender: string;
  user_id: string;
  role: string;
  nickname: string;
};

// Data types for each activity
export type Bottle = {
  id: string;
  baby_id: string;
  user_id: string;
  date_time: string;
  quantity: number;
  comment?: string;
  created_at: string;
};

export type Meal = {
  id: string;
  baby_id: string;
  user_id: string;
  date_time: string;
  quantity: number;
  comment?: string;
  created_at: string;
};

export type Breast = {
  id: string;
  baby_id: string;
  user_id: string;
  date_time: string;
  duration: number;
  side: string;
  comment?: string;
  created_at: string;
};

export type Pump = {
  id: string;
  baby_id: string;
  user_id: string;
  date_time: string;
  quantity: number;
  comment?: string;
  created_at: string;
};

export type Diaper = {
  id: string;
  baby_id: string;
  user_id: string;
  date_time: string;
  type: string;
  comment?: string;
  created_at: string;
};

export type Bath = {
  id: string;
  baby_id: string;
  user_id: string;
  date: string;
  comment?: string;
  created_at: string;
};

export type Weight = {
  id: string;
  baby_id: string;
  user_id: string;
  date: string;
  weight: number;
  comment?: string;
  created_at: string;
};

export type Measure = {
  id: string;
  baby_id: string;
  user_id: string;
  date: string;
  height: number;
  comment?: string;
  created_at: string;
};

export type Activity = {
  id: string;
  baby_id: string;
  user_id: string;
  date_time: string;
  activity_type: string;
  comment?: string;
  created_at: string;
};

export type Photo = {
  id: string;
  baby_id: string;
  user_id: string;
  path: string;
  thumbnail_path?: string;
  preview_path?: string;
  medium_path?: string;
  description?: string;
  category?: string;
  title?: string;
  file_size?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  mime_type?: string;
  checksum?: string;
  encrypted?: boolean;
  encryption_key_id?: string;
  last_accessed?: string;
  created_at: string;
};

export type BabyData = {
  bottles: Bottle[];
  meals: Meal[];
  breast: Breast[];
  pumps: Pump[];
  diapers: Diaper[];
  baths: Bath[];
  weights: Weight[];
  measures: Measure[];
  observations: Activity[];
  photos: Photo[];
};

export type CachedBabyData = {
  babies: Baby[];
  babyData: Record<string, BabyData>;
  lastUpdated: number;
  userId: string;
};


