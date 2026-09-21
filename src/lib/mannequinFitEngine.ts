import type { ClothingItem, OutfitSlot } from '@/lib/types';

export type MannequinPositionId =
  | 'front'
  | 'hands_on_hips'
  | 'walking'
  | 'crossed_arms'
  | 'side_profile'
  | 'three_quarter'
  | 'seated'
  | 'back_view';

export interface PositionFitCheck {
  area: 'Shoulders' | 'Chest' | 'Waist' | 'Hips' | 'Hemline' | 'Stride / Mobility';
  status: 'optimal' | 'tailored' | 'relaxed' | 'snug';
  tensionPct: number; // 0 (loose) to 100 (tight)
  observation: string;
}

export interface MannequinPosition {
  id: MannequinPositionId;
  name: string;
  tagline: string;
  angleDeg: number;
  cameraPerspective: string;
  description: string;
  fitFocus: string;
  diagnostics: PositionFitCheck[];
}

export const MANNEQUIN_POSITIONS: MannequinPosition[] = [
  {
    id: 'front',
    name: 'Runway Front',
    tagline: 'Standard Architectural Stance',
    angleDeg: 0,
    cameraPerspective: 'rotateY(0deg)',
    description: 'Upright balanced poise. Checks vertical drop, shoulder line, and silhouette balance.',
    fitFocus: 'Shoulder balance, collar pitch, and trouser break.',
    diagnostics: [
      {
        area: 'Shoulders',
        status: 'tailored',
        tensionPct: 35,
        observation: 'Shoulder seam sits flush on the acromion with natural drape.',
      },
      {
        area: 'Chest',
        status: 'optimal',
        tensionPct: 28,
        observation: 'Fabric rests flat with zero pulling across the sternum.',
      },
      {
        area: 'Waist',
        status: 'tailored',
        tensionPct: 40,
        observation: 'Clean suppression without fabric puckering or tightness.',
      },
      {
        area: 'Hemline',
        status: 'optimal',
        tensionPct: 15,
        observation: 'Trouser hem breaks with a gentle 1.5cm forward crease over footwear.',
      },
    ],
  },
  {
    id: 'hands_on_hips',
    name: 'Hands on Hips',
    tagline: 'Waist & Armhole Pitch Check',
    angleDeg: 15,
    cameraPerspective: 'rotateY(15deg)',
    description: 'Elbows flared outward with hands on waist. Tests armhole depth, sleeve rise, and jacket flare.',
    fitFocus: 'Armhole (scye) depth, waist gathering, and sleeve creasing.',
    diagnostics: [
      {
        area: 'Shoulders',
        status: 'snug',
        tensionPct: 62,
        observation: 'Slight dynamic tension along deltoid line; within comfortable fabric elasticity.',
      },
      {
        area: 'Chest',
        status: 'tailored',
        tensionPct: 45,
        observation: 'Garment body remains anchored without lifting off the torso.',
      },
      {
        area: 'Waist',
        status: 'tailored',
        tensionPct: 50,
        observation: 'Waistband sits smoothly with no lateral stress lines.',
      },
      {
        area: 'Stride / Mobility',
        status: 'optimal',
        tensionPct: 30,
        observation: 'Sleeve pitch allows effortless high-reach mobility.',
      },
    ],
  },
  {
    id: 'walking',
    name: 'Dynamic Stride',
    tagline: 'Motion, Fabric Flow & Flare',
    angleDeg: 25,
    cameraPerspective: 'rotateY(25deg)',
    description: 'Mid-stride walking motion with opposite arm swing. Inspects fabric fluidity and trouser leg drape.',
    fitFocus: 'Thigh clearance, hemline swing, and kinetic comfort.',
    diagnostics: [
      {
        area: 'Stride / Mobility',
        status: 'optimal',
        tensionPct: 20,
        observation: 'Generous 78cm stride clearance with fluid garment return.',
      },
      {
        area: 'Hips',
        status: 'tailored',
        tensionPct: 38,
        observation: 'Fabric moves freely across hip pivot with zero dragging.',
      },
      {
        area: 'Hemline',
        status: 'relaxed',
        tensionPct: 12,
        observation: 'Natural kinetic flare prevents catching on shoe collar.',
      },
      {
        area: 'Shoulders',
        status: 'optimal',
        tensionPct: 25,
        observation: 'Arm swing maintains smooth chest lapel line.',
      },
    ],
  },
  {
    id: 'crossed_arms',
    name: 'Crossed Arms',
    tagline: 'Upper Back & Bicep Stretch',
    angleDeg: -10,
    cameraPerspective: 'rotateY(-10deg)',
    description: 'Forearms folded across the chest. Rigorously tests back seam tension, sleeve girth, and chest drape.',
    fitFocus: 'Rear shoulder yoke stretch and upper chest fabric tension.',
    diagnostics: [
      {
        area: 'Shoulders',
        status: 'snug',
        tensionPct: 68,
        observation: 'Back yoke flexes gently across shoulder blades; seam integrity verified.',
      },
      {
        area: 'Chest',
        status: 'tailored',
        tensionPct: 52,
        observation: 'Overlapping fabric remains smooth with no bunched creasing.',
      },
      {
        area: 'Waist',
        status: 'optimal',
        tensionPct: 25,
        observation: 'Torso stays centered with comfortable ease.',
      },
      {
        area: 'Stride / Mobility',
        status: 'optimal',
        tensionPct: 35,
        observation: 'Zero armhole pinch during forearm crossing.',
      },
    ],
  },
  {
    id: 'three_quarter',
    name: '3/4 Perspective',
    tagline: 'Dimensional Depth & Layers',
    angleDeg: 45,
    cameraPerspective: 'rotateY(45deg)',
    description: 'High-fashion editorial turn at 45°. Exposes lapel roll, layer transitions, and profile silhouette.',
    fitFocus: 'Outerwear layering clearance and dimensional silhouette.',
    diagnostics: [
      {
        area: 'Chest',
        status: 'tailored',
        tensionPct: 32,
        observation: 'Jacket lapel rolls cleanly over base shirt without buckling.',
      },
      {
        area: 'Waist',
        status: 'tailored',
        tensionPct: 36,
        observation: 'Profile curve highlights precise waist-to-hip ratio.',
      },
      {
        area: 'Hemline',
        status: 'optimal',
        tensionPct: 18,
        observation: 'Trouser side seam drops in a clean plumb vertical line.',
      },
      {
        area: 'Shoulders',
        status: 'tailored',
        tensionPct: 30,
        observation: 'Subtle sleeve cap roll adds elevated structure.',
      },
    ],
  },
  {
    id: 'side_profile',
    name: 'Side Profile',
    tagline: '90° Silhouette & Posture Line',
    angleDeg: 90,
    cameraPerspective: 'rotateY(90deg)',
    description: 'True lateral view. Inspects bust/chest projection, lumbar contour, seat rise, and trouser side seams.',
    fitFocus: 'Spine alignment, trouser seat depth, and balance point.',
    diagnostics: [
      {
        area: 'Waist',
        status: 'optimal',
        tensionPct: 30,
        observation: 'Waistline follows natural lumbar curve without gap at back waistband.',
      },
      {
        area: 'Hips',
        status: 'tailored',
        tensionPct: 42,
        observation: 'Trouser seat fits comfortably with zero pulling across rear pockets.',
      },
      {
        area: 'Hemline',
        status: 'optimal',
        tensionPct: 15,
        observation: 'Front and rear hem levels maintain parallel grounding.',
      },
      {
        area: 'Shoulders',
        status: 'tailored',
        tensionPct: 26,
        observation: 'Posture line is erect and unconstrained by upper collar.',
      },
    ],
  },
  {
    id: 'seated',
    name: 'Seated Lounge',
    tagline: 'Lap Creasing & Waistband Comfort',
    angleDeg: 30,
    cameraPerspective: 'rotateY(30deg) translateY(8px)',
    description: 'Seated posture with 90° knee bend. Evaluates lap drape, rise comfort, and jacket button pull.',
    fitFocus: 'Waistband ease, rise depth, and thigh compression.',
    diagnostics: [
      {
        area: 'Waist',
        status: 'snug',
        tensionPct: 58,
        observation: '+2.0cm comfort ease in waistband ensures effortless seated breathing.',
      },
      {
        area: 'Hips',
        status: 'tailored',
        tensionPct: 48,
        observation: 'Thigh and seat fabric spreads naturally without seam strain.',
      },
      {
        area: 'Hemline',
        status: 'relaxed',
        tensionPct: 10,
        observation: 'Trouser hem rides up 3.5cm cleanly; socks and shoe vamp visible.',
      },
      {
        area: 'Chest',
        status: 'tailored',
        tensionPct: 35,
        observation: 'Jacket skirts flare naturally over the hips.',
      },
    ],
  },
  {
    id: 'back_view',
    name: 'Rear Architecture',
    tagline: '180° Back Drape & Tailoring',
    angleDeg: 180,
    cameraPerspective: 'rotateY(180deg)',
    description: 'Full rear inspection. Highlights back shoulder blades, center back seam, jacket vent, and rear trouser rise.',
    fitFocus: 'Back yoke pitch, jacket vent opening, and rear trouser seat.',
    diagnostics: [
      {
        area: 'Shoulders',
        status: 'tailored',
        tensionPct: 32,
        observation: 'Smooth back yoke with zero diagonal puckering from collar to armpit.',
      },
      {
        area: 'Waist',
        status: 'tailored',
        tensionPct: 38,
        observation: 'Clean back suppression accentuates taper.',
      },
      {
        area: 'Hips',
        status: 'optimal',
        tensionPct: 28,
        observation: 'Jacket double vents remain closed and flush in resting posture.',
      },
      {
        area: 'Hemline',
        status: 'optimal',
        tensionPct: 15,
        observation: 'Rear trouser cuffs rest comfortably on the shoe heel counter.',
      },
    ],
  },
];

export interface MannequinBodyConfig {
  gender: 'female' | 'male' | 'unisex';
  heightCm: number;
  chestScale: number; // 0.85 to 1.25
  waistScale: number; // 0.85 to 1.25
  hipScale: number;   // 0.85 to 1.25
  shoulderScale: number; // 0.85 to 1.25
  skinTone: string;
  skinToneName: string;
  headStyle: 'real_face' | 'atelier_sculpt';
  referencePhotoUrl: string | null;
}

export const SKIN_TONE_PALETTES = [
  { id: 'alabaster', name: 'Fair Alabaster', hex: '#f6ebe2', shadow: '#dfccbd' },
  { id: 'sand', name: 'Warm Sand', hex: '#eed0b4', shadow: '#cca98b' },
  { id: 'honey', name: 'Honey Golden', hex: '#deaa7d', shadow: '#b88355' },
  { id: 'olive', name: 'Sunlit Olive', hex: '#cb9c74', shadow: '#9f734b' },
  { id: 'amber', name: 'Rich Amber', hex: '#ab7047', shadow: '#7d4a27' },
  { id: 'espresso', name: 'Deep Espresso', hex: '#633c23', shadow: '#422413' },
  { id: 'haute-couture', name: 'Atelier Chrome Stone', hex: '#d6d3cd', shadow: '#9e9b94' },
];

export interface FashionPromptResult {
  reasoning: string;
  styleTitle: string;
  equippedItems: { item: ClothingItem; slot: OutfitSlot }[];
  matchedKeywords: string[];
}

export function parseAndApplyFashionPrompt(
  prompt: string,
  wardrobe: ClothingItem[]
): FashionPromptResult {
  const p = prompt.toLowerCase();
  const matchedKeywords: string[] = [];

  // Color keywords
  const colors = ['black', 'white', 'navy', 'blue', 'beige', 'grey', 'gray', 'cream', 'brown', 'olive', 'green', 'camel', 'red'];
  const requestedColors = colors.filter((c) => {
    if (p.includes(c)) {
      matchedKeywords.push(c);
      return true;
    }
    return false;
  });

  // Vibe / Occasion
  const isFormal = p.includes('formal') || p.includes('wedding') || p.includes('black tie') || p.includes('gala');
  const isBusiness = p.includes('business') || p.includes('work') || p.includes('meeting') || p.includes('office') || p.includes('executive') || p.includes('interview');
  const isCasual = p.includes('casual') || p.includes('relaxed') || p.includes('weekend') || p.includes('comfort') || p.includes('coffee') || p.includes('chill');
  const isEvening = p.includes('dinner') || p.includes('evening') || p.includes('date') || p.includes('party') || p.includes('cocktail') || p.includes('night');
  const isRain = p.includes('rain') || p.includes('cold') || p.includes('winter') || p.includes('autumn') || p.includes('coat') || p.includes('trench');
  const isSummer = p.includes('summer') || p.includes('breeze') || p.includes('linen') || p.includes('warm') || p.includes('vacation');
  const isMonochrome = p.includes('monochrome') || p.includes('all black') || p.includes('all-black') || p.includes('minimalist');

  if (isFormal) matchedKeywords.push('formal');
  if (isBusiness) matchedKeywords.push('business');
  if (isCasual) matchedKeywords.push('casual');
  if (isEvening) matchedKeywords.push('evening');
  if (isRain) matchedKeywords.push('weather-layers');
  if (isSummer) matchedKeywords.push('summer-breeze');
  if (isMonochrome) matchedKeywords.push('monochrome');

  // Filter helpers
  const tops = wardrobe.filter((i) => i.category === 'tops');
  const bottoms = wardrobe.filter((i) => i.category === 'bottoms');
  const outer = wardrobe.filter((i) => i.category === 'outerwear');
  const shoes = wardrobe.filter((i) => i.category === 'shoes');
  const accessories = wardrobe.filter((i) => i.category === 'accessories');

  // Helper to score an item
  const scoreItem = (item: ClothingItem) => {
    let score = 1;
    const name = item.name.toLowerCase();
    const sub = (item.subcategory || '').toLowerCase();
    const col = (item.color || '').toLowerCase();

    if (requestedColors.length > 0 && requestedColors.some((c) => col.includes(c) || name.includes(c) || sub.includes(c))) {
      score += 5;
    }
    if (isMonochrome && (p.includes('black') ? col.includes('black') : true)) {
      if (col.includes('black') || col.includes('charcoal')) score += 4;
    }
    if (isFormal || isBusiness) {
      if (item.formality === 'formal' || item.formality === 'smart casual') score += 3;
      if (name.includes('oxford') || name.includes('shirt') || name.includes('blazer') || name.includes('trousers') || name.includes('loafer') || name.includes('derby') || name.includes('dress')) score += 4;
    }
    if (isCasual || isSummer) {
      if (item.formality === 'casual') score += 3;
      if (name.includes('t-shirt') || name.includes('tee') || name.includes('jean') || name.includes('sneak') || name.includes('linen') || name.includes('shorts')) score += 4;
    }
    if (isEvening) {
      if (col.includes('black') || col.includes('navy') || name.includes('blazer') || name.includes('silk') || name.includes('cashmere')) score += 4;
    }
    if (isRain) {
      if (item.category === 'outerwear' || name.includes('coat') || name.includes('jacket') || name.includes('boots')) score += 6;
    }
    return score;
  };

  // Sort and pick best
  const chosenTop = tops.slice().sort((a, b) => scoreItem(b) - scoreItem(a))[0] || tops[0];
  const chosenBottom = bottoms.slice().sort((a, b) => scoreItem(b) - scoreItem(a))[0] || bottoms[0];
  const chosenShoes = shoes.slice().sort((a, b) => scoreItem(b) - scoreItem(a))[0] || shoes[0];
  
  // Decide whether outerwear is required
  let chosenOuter: ClothingItem | null = null;
  if (isRain || isFormal || isBusiness || isEvening || p.includes('jacket') || p.includes('coat') || p.includes('blazer') || p.includes('layer')) {
    chosenOuter = outer.slice().sort((a, b) => scoreItem(b) - scoreItem(a))[0] || outer[0] || null;
  }

  // Pick accessory if relevant
  let chosenAcc: ClothingItem | null = null;
  if (accessories.length > 0 && (isEvening || isFormal || p.includes('watch') || p.includes('bag') || p.includes('glasses') || Math.random() > 0.4)) {
    chosenAcc = accessories.slice().sort((a, b) => scoreItem(b) - scoreItem(a))[0] || accessories[0] || null;
  }

  const resultList: { item: ClothingItem; slot: OutfitSlot }[] = [];
  if (chosenTop) resultList.push({ item: chosenTop, slot: 'top' });
  if (chosenBottom) resultList.push({ item: chosenBottom, slot: 'bottom' });
  if (chosenOuter) resultList.push({ item: chosenOuter, slot: 'outerwear' });
  if (chosenShoes) resultList.push({ item: chosenShoes, slot: 'shoes' });
  if (chosenAcc) resultList.push({ item: chosenAcc, slot: 'accessory' });

  // Generate title & editorial reasoning
  let styleTitle = 'Custom Tailored Ensemble';
  let reasoning = `Curated from your wardrobe based on "${prompt}". Fitted directly onto your live mannequin silhouette.`;

  if (isMonochrome || p.includes('all black')) {
    styleTitle = 'Architectural Noir Minimalist';
    reasoning = `Dressed in an uninterrupted monochromatic line. The contrast between textures—matte wool, smooth cotton, and polished leather—creates sophisticated dimension without visual noise.`;
  } else if (isFormal || p.includes('wedding')) {
    styleTitle = 'Refined Modern Gala Tailoring';
    reasoning = `Selected structured shoulders and clean trouser lines to command effortless poise. The collar pitch and waist taper provide balanced formal structure.`;
  } else if (isBusiness) {
    styleTitle = 'Executive Modern Tailoring';
    reasoning = `Tailored for high-impact presence. Crisp collar geometry, muted tones, and clean trouser breaks create a focused, decisive appearance.`;
  } else if (isEvening) {
    styleTitle = 'Subtle Evening Elegance';
    reasoning = `Rich evening palette with soft drape and refined footwear. Designed to catch warm ambient lighting while maintaining relaxed ease.`;
  } else if (isRain || p.includes('cold')) {
    styleTitle = 'Weather-Shield Layered Architecture';
    reasoning = `Engineered for shifting weather. Features breathable inner layers with a protective outer drape that allows full stride mobility.`;
  } else if (isCasual || isSummer) {
    styleTitle = 'Effortless Contemporary Ease';
    reasoning = `Breezy silhouettes with relaxed body tension. Optimized for natural movement and all-day thermal comfort.`;
  }

  return {
    styleTitle,
    reasoning,
    equippedItems: resultList,
    matchedKeywords,
  };
}
