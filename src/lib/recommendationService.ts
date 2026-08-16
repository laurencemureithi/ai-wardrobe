import type { ClothingItem, OutfitSlot, Formality } from '@/lib/types';

interface ScoredOutfit {
  items: { item: ClothingItem; slot: OutfitSlot }[];
  confidence: number;
  reason: string;
  style: string;
}

const SLOT_CATEGORY_MAP: Record<OutfitSlot, string[]> = {
  top: ['tops'],
  bottom: ['bottoms'],
  dress: ['dresses'],
  outerwear: ['outerwear'],
  shoes: ['shoes'],
  accessory: ['accessories'],
};

// Color compatibility groups — colors within the same group pair well
const COLOR_GROUPS: string[][] = [
  ['navy', 'grey', 'gray', 'charcoal', 'white', 'cream', 'brown', 'tan'],
  ['black', 'white', 'grey', 'gray', 'red', 'burgundy'],
  ['olive', 'khaki', 'brown', 'tan', 'cream', 'white'],
  ['blue', 'light blue', 'navy', 'white', 'beige'],
];

function colorScore(a: string | null, b: string | null): number {
  if (!a || !b) return 0.5;
  if (a === b) return 0.7;
  for (const group of COLOR_GROUPS) {
    if (group.includes(a.toLowerCase()) && group.includes(b.toLowerCase())) return 0.9;
  }
  return 0.4;
}

function formalityScore(a: Formality | null, b: Formality | null): number {
  if (!a || !b) return 0.5;
  if (a === b) return 1;
  const order: Formality[] = ['casual', 'smart casual', 'formal'];
  const diff = Math.abs(order.indexOf(a) - order.indexOf(b));
  return diff === 1 ? 0.7 : 0.3;
}

function weatherScore(
  item: ClothingItem,
  temp: number,
  rain: boolean
): number {
  let score = 0.6;
  const ws = item.weather_suitability;
  if (temp < 10 && ws.includes('cold')) score += 0.3;
  if (temp >= 10 && temp <= 22 && ws.includes('mild')) score += 0.3;
  if (temp > 22 && ws.includes('hot')) score += 0.3;
  if (rain && ws.includes('rain')) score += 0.2;
  if (rain && ws.includes('hot') && !ws.includes('rain')) score -= 0.2;
  return Math.min(score, 1);
}

function recencyScore(item: ClothingItem): number {
  if (!item.last_worn) return 1;
  const days = Math.floor(
    (Date.now() - new Date(item.last_worn).getTime()) / 86400000
  );
  if (days < 2) return 0.1;
  if (days < 5) return 0.4;
  if (days < 10) return 0.7;
  return 1;
}

function availabilityScore(item: ClothingItem): number {
  if (item.status === 'clean' || item.status === 'ready') return 1;
  if (item.status === 'worn') return 0.3;
  if (item.status === 'needs_washing' || item.status === 'washing' || item.status === 'drying')
    return 0;
  return 0.5;
}

function pickBest(
  items: ClothingItem[],
  slot: OutfitSlot,
  context: { temp: number; rain: boolean; formality: Formality; pairedColors: string[] }
): ClothingItem | null {
  const cats = SLOT_CATEGORY_MAP[slot];
  const candidates = items.filter((i) => cats.includes(i.category));
  if (candidates.length === 0) return null;

  let best: ClothingItem | null = null;
  let bestScore = -1;
  for (const c of candidates) {
    const avail = availabilityScore(c);
    if (avail === 0) continue;
    const weather = weatherScore(c, context.temp, context.rain);
    const recent = recencyScore(c);
    const formality = formalityScore(c.formality, context.formality);
    let color = 0.5;
    if (context.pairedColors.length > 0) {
      color = Math.max(
        ...context.pairedColors.map((pc) => colorScore(c.color, pc))
      );
    }
    const score = avail * 0.35 + weather * 0.2 + recent * 0.2 + formality * 0.15 + color * 0.1;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

export function generateRecommendations(
  items: ClothingItem[],
  context: { temp: number; rain: boolean; occasion: string; formality: Formality },
  count = 3
): ScoredOutfit[] {
  const results: ScoredOutfit[] = [];

  // Determine if we should use dresses or top+bottom
  const hasDresses = items.some((i) => i.category === 'dresses');
  const hasTops = items.some((i) => i.category === 'tops');
  const hasBottoms = items.some((i) => i.category === 'bottoms');

  const configs: { slots: OutfitSlot[]; style: string }[] = [];

  if (hasDresses) {
    configs.push({ slots: ['dress', 'shoes', 'accessory'], style: 'Dress' });
  }
  if (hasTops && hasBottoms) {
    configs.push({ slots: ['top', 'bottom', 'shoes', 'accessory'], style: 'Smart' });
    configs.push({ slots: ['top', 'bottom', 'outerwear', 'shoes'], style: 'Layered' });
  }
  if (configs.length === 0) {
    // fallback: whatever slots we can fill
    const allSlots: OutfitSlot[] = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'];
    const usable = allSlots.filter((s) =>
      items.some((i) => SLOT_CATEGORY_MAP[s].includes(i.category))
    );
    if (usable.length === 0) return [];
    configs.push({ slots: usable, style: 'Casual' });
  }

  const usedItemIds = new Set<string>();

  for (const config of configs) {
    if (results.length >= count) break;
    const outfitItems: { item: ClothingItem; slot: OutfitSlot }[] = [];
    const pairedColors: string[] = [];
    let totalScore = 0;
    let slotsFilled = 0;

    for (const slot of config.slots) {
      const picked = pickBest(items, slot, {
        temp: context.temp,
        rain: context.rain,
        formality: context.formality,
        pairedColors,
      });
      if (picked && !usedItemIds.has(picked.id)) {
        outfitItems.push({ item: picked, slot });
        if (picked.color) pairedColors.push(picked.color);
        totalScore +=
          availabilityScore(picked) * 0.3 +
          weatherScore(picked, context.temp, context.rain) * 0.25 +
          recencyScore(picked) * 0.2 +
          formalityScore(picked.formality, context.formality) * 0.15 +
          0.1;
        slotsFilled++;
        usedItemIds.add(picked.id);
      }
    }

    if (outfitItems.length === 0) continue;

    const confidence = Math.round(Math.min((totalScore / Math.max(slotsFilled, 1)) * 100, 99));
    const reasons: string[] = [];
    if (context.occasion) reasons.push(`good for ${context.occasion}`);
    reasons.push(`suits ${context.temp}°C weather`);
    const recentItem = outfitItems.find((o) => o.item.last_worn);
    if (recentItem) {
      const days = Math.floor(
        (Date.now() - new Date(recentItem.item.last_worn!).getTime()) / 86400000
      );
      if (days > 7) reasons.push(`hasn't worn the ${recentItem.item.name.toLowerCase()} in ${days} days`);
    }

    results.push({
      items: outfitItems,
      confidence,
      reason: `Great ${config.style.toLowerCase()} look — ${reasons.join(', ')}.`,
      style: config.style,
    });
  }

  return results;
}

export function compatibleItems(
  allItems: ClothingItem[],
  slot: OutfitSlot,
  currentOutfit: { item: ClothingItem; slot: OutfitSlot }[]
): ClothingItem[] {
  const cats = SLOT_CATEGORY_MAP[slot];
  const pairedColors = currentOutfit
    .filter((o) => o.slot !== slot && o.item.color)
    .map((o) => o.item.color!);
  const pairedFormalities = currentOutfit
    .filter((o) => o.slot !== slot)
    .map((o) => o.item.formality)
    .filter(Boolean) as Formality[];

  const candidates = allItems.filter((i) => cats.includes(i.category));
  return candidates.sort((a, b) => {
    const aColor = pairedColors.length
      ? Math.max(...pairedColors.map((pc) => colorScore(a.color, pc)))
      : 0.5;
    const bColor = pairedColors.length
      ? Math.max(...pairedColors.map((pc) => colorScore(b.color, pc)))
      : 0.5;
    const aForm = pairedFormalities.length
      ? Math.max(...pairedFormalities.map((pf) => formalityScore(a.formality, pf)))
      : 0.5;
    const bForm = pairedFormalities.length
      ? Math.max(...pairedFormalities.map((pf) => formalityScore(b.formality, pf)))
      : 0.5;
    return bColor + bForm - (aColor + aForm);
  });
}
