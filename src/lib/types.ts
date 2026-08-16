export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'
  | 'other';

export type ItemStatus =
  | 'clean'
  | 'worn'
  | 'needs_washing'
  | 'washing'
  | 'drying'
  | 'ready'
  | 'unknown';

export type Formality = 'casual' | 'smart casual' | 'formal';

export type OutfitSlot =
  | 'top'
  | 'bottom'
  | 'dress'
  | 'outerwear'
  | 'shoes'
  | 'accessory';

export type Feedback = 'loved' | 'good' | 'okay' | 'not_for_me';

export interface ClothingItem {
  id: string;
  user_id: string;
  name: string;
  category: ClothingCategory;
  subcategory: string | null;
  color: string | null;
  pattern: string | null;
  material: string | null;
  style: string | null;
  formality: Formality | null;
  weather_suitability: string[];
  season: string[];
  brand: string | null;
  image_url: string | null;
  status: ItemStatus;
  wear_count: number;
  last_worn: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  name: string | null;
  occasion: string | null;
  style: string | null;
  weather: string | null;
  ai_confidence: number | null;
  reason: string | null;
  is_saved: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface OutfitItem {
  id: string;
  outfit_id: string;
  clothing_item_id: string;
  slot: OutfitSlot;
}

export interface OutfitWithItems extends Outfit {
  items: (OutfitItem & { clothing_item: ClothingItem })[];
}

export interface WearEvent {
  id: string;
  user_id: string;
  outfit_id: string | null;
  worn_at: string;
  occasion: string | null;
  weather: string | null;
  feedback: Feedback | null;
  notes: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  gender: string | null;
  location: string | null;
  lifestyle: string[];
  style_preferences: string[];
  color_preferences: string[];
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  rain: boolean;
  humidity: number;
  wind: number;
  location: string;
}

export interface Recommendation {
  items: { item: ClothingItem; slot: OutfitSlot }[];
  confidence: number;
  reason: string;
  style: string;
}
