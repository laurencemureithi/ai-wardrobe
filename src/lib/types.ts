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

export type ClothingStatus = ItemStatus;

export type UserMood = 'confident' | 'relaxed' | 'professional' | 'creative' | 'minimalist';

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
  ai_assistant_name?: string | null;
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
  advisory?: string;
}

export interface Recommendation {
  items: { item: ClothingItem; slot: OutfitSlot }[];
  confidence: number;
  reason: string;
  style: string;
}

export type PresentationContext = 'male' | 'female' | 'unisex';

export type CameraAngle =
  | 'front'
  | 'three-quarter-left'
  | 'three-quarter-right'
  | 'side'
  | 'back'
  | 'mid-body';

export type BackgroundSetting =
  | 'studio'
  | 'minimal'
  | 'office'
  | 'street'
  | 'wedding'
  | 'outdoor'
  | 'bedroom'
  | 'travel';

export interface Pose {
  id: string;
  name: string;
  category: 'professional' | 'casual' | 'formal' | 'streetwear' | 'fashion' | 'sports';
  presentationContext: PresentationContext;
  occasion: string;
  clothingCompatibility?: ClothingCategory[];
  cameraAngle: CameraAngle;
  description: string;
  previewIcon?: string;
  isFavorite?: boolean;
}

export interface DigitalTwinProfile {
  id: string;
  userId: string;
  displayName: string;
  presentationContext: PresentationContext;
  referencePhotoUrl: string | null;
  generatedAvatarUrl?: string | null;
  customAvatarGenerated?: boolean;
  livingStateEnabled?: boolean;
  avatarLikenessNotes?: string;
  heightCm?: number;
  bodyType?: string;
  skinTone?: string;
  hairStyle?: string;
  hairColor?: string;
  eyeColor?: string;
  preferredPoses: string[];
  activePoseId: string;
  activeAngle: CameraAngle;
  activeBackground: BackgroundSetting;
  lastUpdated: string;
}

export type MoodType = 'tired' | 'happy' | 'confident' | 'neutral' | 'excited' | 'low_energy';

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  date: string; // YYYY-MM-DD
  type: 'meeting' | 'wedding' | 'date' | 'gym' | 'flight' | 'dinner' | 'casual' | 'office';
  dressCode: 'Formal' | 'Smart Casual' | 'Casual' | 'Business' | 'Athletic';
  suggestedOutfitId?: string;
}

export interface DayPlan {
  date: string;
  dayName: string;
  isToday: boolean;
  weather: WeatherData;
  events: CalendarEvent[];
  recommendedOutfit?: Recommendation;
  laundryNeeded?: boolean;
  isApproved?: boolean;
}

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
  clothingItemId?: string;
  quantity?: number;
}

export interface TripPlan {
  id: string;
  destination: string;
  days: number;
  purpose: 'business' | 'vacation' | 'wedding' | 'weekend';
  startDate: string;
  checklist: PackingItem[];
}

export interface StylistMessage {
  id: string;
  sender: 'user' | 'stylist';
  text: string;
  timestamp: string;
  recommendation?: Recommendation;
  actionPrompt?: string;
}

export type ReactionType = 'fire' | 'love' | 'smart' | 'stylish';

export interface SocialPost {
  id: string;
  userName: string;
  userAvatar?: string;
  outfitTitle: string;
  outfitItems: string[];
  imageUrl: string;
  caption: string;
  tags: string[];
  timestamp: string;
  reactions: {
    fire: number;
    love: number;
    smart: number;
    stylish: number;
  };
  userReaction?: ReactionType;
}

export interface WardrobeInsight {
  utilizationRate: number; // percentage e.g. 48
  totalItems: number;
  activeItems: number;
  dormantItems: number;
  avgCostPerWear: number;
  currency: string;
  topWornItem?: ClothingItem;
  leastWornItem?: ClothingItem;
  missingPieces: {
    itemType: string;
    reason: string;
    impact: string;
  }[];
}
