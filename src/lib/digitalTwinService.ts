import type {
  DigitalTwinProfile,
  Pose,
  CameraAngle,
  BackgroundSetting,
  PresentationContext,
  ClothingItem,
} from '@/lib/types';

const TWIN_STORAGE_KEY = 'ai_wardrobe_digital_twin_profile_v1';

export const MALE_POSES: Pose[] = [
  {
    id: 'male-prof-stand',
    name: 'Executive Stance',
    category: 'professional',
    presentationContext: 'male',
    occasion: 'Business Meeting',
    cameraAngle: 'front',
    description: 'Upright confident stance with hands relaxed at sides, projecting authority.',
  },
  {
    id: 'male-hands-pocket',
    name: 'Hands in Pockets',
    category: 'casual',
    presentationContext: 'male',
    occasion: 'Smart Casual',
    cameraAngle: 'three-quarter-left',
    description: 'Relaxed posture with hands resting casually in trouser pockets.',
  },
  {
    id: 'male-walking',
    name: 'Street Stride',
    category: 'streetwear',
    presentationContext: 'male',
    occasion: 'Everyday / Commute',
    cameraAngle: 'front',
    description: 'Mid-stride walking forward, showing drape of trousers and jacket movement.',
  },
  {
    id: 'male-jacket-adjust',
    name: 'Jacket Adjustment',
    category: 'formal',
    presentationContext: 'male',
    occasion: 'Wedding / Formal Gala',
    cameraAngle: 'three-quarter-right',
    description: 'Subtly buttoning or adjusting jacket lapel with hands at waist.',
  },
  {
    id: 'male-confident-side',
    name: 'Profile Stance',
    category: 'professional',
    presentationContext: 'male',
    occasion: 'Conference / Interview',
    cameraAngle: 'side',
    description: 'Clean side silhouette highlighting trouser break and posture.',
  },
  {
    id: 'male-three-quarter',
    name: 'Editorial Turn',
    category: 'fashion',
    presentationContext: 'male',
    occasion: 'Dinner / Evening',
    cameraAngle: 'three-quarter-left',
    description: 'Slight 45-degree body rotation with relaxed shoulder line.',
  },
  {
    id: 'male-back',
    name: 'Over the Shoulder',
    category: 'casual',
    presentationContext: 'male',
    occasion: 'Casual Outdoor',
    cameraAngle: 'back',
    description: 'Full rear view showing back tailoring and jacket drape.',
  },
];

export const FEMALE_POSES: Pose[] = [
  {
    id: 'female-prof-stand',
    name: 'Empowered Poise',
    category: 'professional',
    presentationContext: 'female',
    occasion: 'Boardroom / Presentation',
    cameraAngle: 'front',
    description: 'Balanced stance with weight centered and relaxed posture.',
  },
  {
    id: 'female-three-quarter',
    name: 'Classic Three-Quarter',
    category: 'fashion',
    presentationContext: 'female',
    occasion: 'Cocktail / Event',
    cameraAngle: 'three-quarter-left',
    description: 'Graceful three-quarter stance highlighting silhouette lines.',
  },
  {
    id: 'female-handbag',
    name: 'Accessory Drape',
    category: 'casual',
    presentationContext: 'female',
    occasion: 'Brunch / Shopping',
    cameraAngle: 'three-quarter-right',
    description: 'Subtle positioning highlighting handbag or wrist accessories.',
  },
  {
    id: 'female-walking',
    name: 'Dynamic Walk',
    category: 'streetwear',
    presentationContext: 'female',
    occasion: 'City Stroll',
    cameraAngle: 'front',
    description: 'Fluid walking motion capturing flow of skirts, dresses or wide-leg trousers.',
  },
  {
    id: 'female-elegant-side',
    name: 'Sleek Profile',
    category: 'formal',
    presentationContext: 'female',
    occasion: 'Gala / Wedding',
    cameraAngle: 'side',
    description: 'Clean profile view showing drape and shoe details.',
  },
  {
    id: 'female-relaxed-lean',
    name: 'Casual Ease',
    category: 'casual',
    presentationContext: 'female',
    occasion: 'Weekend Lounge',
    cameraAngle: 'three-quarter-left',
    description: 'Soft relaxed posture with comfortable arm placement.',
  },
  {
    id: 'female-back',
    name: 'Rear Architecture',
    category: 'fashion',
    presentationContext: 'female',
    occasion: 'Evening Look',
    cameraAngle: 'back',
    description: 'Full rear view accentuating back details and silhouette.',
  },
];

export const UNISEX_POSES: Pose[] = [
  {
    id: 'unisex-natural',
    name: 'Natural Standing',
    category: 'casual',
    presentationContext: 'unisex',
    occasion: 'Daily Wear',
    cameraAngle: 'front',
    description: 'Balanced, neutral stance with natural arm positioning.',
  },
  {
    id: 'unisex-three-quarter',
    name: 'Angle Stance',
    category: 'professional',
    presentationContext: 'unisex',
    occasion: 'Smart Casual',
    cameraAngle: 'three-quarter-left',
    description: 'Clean angled view showing garment depth and layering.',
  },
  {
    id: 'unisex-walking',
    name: 'Walking Motion',
    category: 'streetwear',
    presentationContext: 'unisex',
    occasion: 'Commute / Casual',
    cameraAngle: 'front',
    description: 'Gentle forward motion displaying clothing drape.',
  },
  {
    id: 'unisex-side',
    name: 'Side Profile',
    category: 'formal',
    presentationContext: 'unisex',
    occasion: 'Work / Formal',
    cameraAngle: 'side',
    description: 'Crisp side profile emphasizing silhouette structure.',
  },
  {
    id: 'unisex-back',
    name: 'Rear Silhouette',
    category: 'fashion',
    presentationContext: 'unisex',
    occasion: 'General',
    cameraAngle: 'back',
    description: 'Back view highlighting fit across shoulders and trousers.',
  },
];

// Curated high-fidelity representative portraits for digital twin demo mode
export const DEMO_TWIN_MODELS: Record<PresentationContext, { front: string; face: string; name: string }> = {
  male: {
    front: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=900',
    face: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600',
    name: 'Alex Vance',
  },
  female: {
    front: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=900',
    face: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
    name: 'Sophia Chen',
  },
  unisex: {
    front: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=900',
    face: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
    name: 'Morgan Taylor',
  },
};

export function getPosesForContext(context: PresentationContext): Pose[] {
  if (context === 'male') return MALE_POSES;
  if (context === 'female') return FEMALE_POSES;
  return UNISEX_POSES;
}

export function loadDigitalTwinProfile(): DigitalTwinProfile {
  try {
    const raw = localStorage.getItem(TWIN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // If user has not uploaded or generated a custom avatar, ensure referencePhotoUrl is null so avatar starts blank
      if (!parsed.customAvatarGenerated) {
        parsed.referencePhotoUrl = null;
      }
      return parsed;
    }
  } catch {
    /* ignore */
  }

  const defaultProfile: DigitalTwinProfile = {
    id: 'twin-primary-1',
    userId: 'demo-user-123',
    displayName: 'Alex',
    presentationContext: 'male',
    referencePhotoUrl: null,
    heightCm: 178,
    bodyType: 'Athletic / Regular',
    skinTone: 'Warm Sand',
    hairStyle: 'Short Textured',
    preferredPoses: ['male-prof-stand', 'male-hands-pocket', 'male-jacket-adjust'],
    activePoseId: 'male-prof-stand',
    activeAngle: 'front',
    activeBackground: 'studio',
    lastUpdated: new Date().toISOString(),
  };

  saveDigitalTwinProfile(defaultProfile);
  return defaultProfile;
}

export function saveDigitalTwinProfile(profile: DigitalTwinProfile): void {
  try {
    localStorage.setItem(TWIN_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

export interface PhotoshootShot {
  id: string;
  pose: Pose;
  title: string;
  description: string;
}

export function generatePhotoshootSequence(
  presentation: PresentationContext
): PhotoshootShot[] {
  const poses = getPosesForContext(presentation);
  return [
    {
      id: 'shot-hero',
      pose: poses[0],
      title: 'Hero Pose',
      description: 'Full-body front perspective highlighting overall balance and tailoring.',
    },
    {
      id: 'shot-three-quarter',
      pose: poses[1] || poses[0],
      title: 'Three-Quarter',
      description: 'Dynamic angled shot capturing garment drape and footwear coordination.',
    },
    {
      id: 'shot-walking',
      pose: poses.find((p) => p.name.toLowerCase().includes('walk')) || poses[2],
      title: 'Motion & Flow',
      description: 'Natural movement showcasing comfortable fit and silhouette response.',
    },
    {
      id: 'shot-side',
      pose: poses.find((p) => p.cameraAngle === 'side') || poses[3],
      title: 'Profile View',
      description: 'Clean vertical lines highlighting trouser break and proportions.',
    },
    {
      id: 'shot-back',
      pose: poses.find((p) => p.cameraAngle === 'back') || poses[poses.length - 1],
      title: 'Back Architecture',
      description: 'Tailored shoulder fit and rear drape.',
    },
  ];
}

export interface AvatarGenerationResult {
  avatarUrl: string;
  referencePhotoUrl: string;
  skinTone: string;
  undertone: string;
  faceMatchScore: number;
  bodyMatchScore: number;
  notes: string;
}

export const USER_AVATAR_PRESETS = [
  {
    id: 'preset-female-1',
    name: 'Elena (Warm Medium)',
    context: 'female' as PresentationContext,
    skinTone: 'Warm Sand',
    hair: 'Soft Wavy Brunette',
    photoUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
    fullBodyUrl: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    id: 'preset-male-1',
    name: 'Marcus (Deep Warm)',
    context: 'male' as PresentationContext,
    skinTone: 'Rich Umber',
    hair: 'Short Fade',
    photoUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600',
    fullBodyUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    id: 'preset-unisex-1',
    name: 'Kai (Neutral Fair)',
    context: 'unisex' as PresentationContext,
    skinTone: 'Neutral Ivory',
    hair: 'Modern Textured Cut',
    photoUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=600',
    fullBodyUrl: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    id: 'preset-female-2',
    name: 'Maya (Golden Tan)',
    context: 'female' as PresentationContext,
    skinTone: 'Golden Olive',
    hair: 'Sleek Bob',
    photoUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600',
    fullBodyUrl: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
];

export async function generateAvatarFromPhoto(
  photoUrl: string,
  context: PresentationContext = 'unisex',
  customAttributes?: {
    heightCm?: number;
    bodyType?: string;
    skinTone?: string;
  }
): Promise<AvatarGenerationResult> {
  // Simulated neural scanning latency
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const chosenSkinTone = customAttributes?.skinTone || (context === 'male' ? 'Warm Sand' : 'Honey Beige');

  return {
    avatarUrl: photoUrl, // Use the real captured photo directly as avatar likeness!
    referencePhotoUrl: photoUrl,
    skinTone: chosenSkinTone,
    undertone: 'Balanced Neutral-Warm',
    faceMatchScore: 98.7,
    bodyMatchScore: 96.4,
    notes: 'Biometric likeness calibrated. Micro-pose dynamics, eye focal alignment and living respiratory loop activated.',
  };
}

// Clean Virtual Try-On Service abstraction
export class VirtualTryOnService {
  static async requestTryOn(params: {
    twinProfile: DigitalTwinProfile;
    items: ClothingItem[];
    pose: Pose;
    angle: CameraAngle;
    background: BackgroundSetting;
  }): Promise<{
    success: boolean;
    renderedImageUrl: string;
    engine: 'demo_interactive_compositor' | 'ai_neural_virtual_tryon';
    confidence: number;
    latencyMs: number;
  }> {
    // Simulates service call with realistic response
    await new Promise((resolve) => setTimeout(resolve, 450));

    const modelAssets = DEMO_TWIN_MODELS[params.twinProfile.presentationContext];
    const image = params.twinProfile.referencePhotoUrl || modelAssets.front;

    return {
      success: true,
      renderedImageUrl: image,
      engine: 'demo_interactive_compositor',
      confidence: 0.94,
      latencyMs: 420,
    };
  }
}
