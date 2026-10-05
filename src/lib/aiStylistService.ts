import type {
  StylistMessage,
  Recommendation,
  ClothingItem,
  WeatherData,
  CalendarEvent,
  Formality,
  OutfitSlot,
} from '@/lib/types';
import { generateRecommendations } from '@/lib/recommendationService';

const STYLIST_HISTORY_KEY = 'ai_wardrobe_stylist_messages_v1';

export const INITIAL_STYLIST_MESSAGES: StylistMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'stylist',
    text: "Hello! I'm your personal AI Style Assistant. I manage your wardrobe, coordinate outfits with the real weather and calendar, and ensure you feel sharp and confident. What are you dressing for today?",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actionPrompt: 'Ask for wedding, client meeting, or comfortable everyday outfit.',
  },
];

export function getStylistMessages(): StylistMessage[] {
  try {
    const raw = localStorage.getItem(STYLIST_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  saveStylistMessages(INITIAL_STYLIST_MESSAGES);
  return INITIAL_STYLIST_MESSAGES;
}

export function saveStylistMessages(msgs: StylistMessage[]): void {
  try {
    localStorage.setItem(STYLIST_HISTORY_KEY, JSON.stringify(msgs));
  } catch {
    /* ignore */
  }
}

export async function askStylist(
  query: string,
  clothingItems: ClothingItem[],
  weather: WeatherData,
  events: CalendarEvent[],
  userProfile?: { displayName?: string }
): Promise<StylistMessage> {
  let text = '';
  let returnedRec: Recommendation | undefined = undefined;

  try {
    const res = await fetch('/api/stylist/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userQuery: query,
        wardrobeItems: clothingItems,
        weather,
        events,
        userProfile,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        text = json.data.reply;
        const recNames: string[] = json.data.recommendedItemNames || [];
        const matchedItems: { item: ClothingItem; slot: OutfitSlot }[] = [];

        for (const name of recNames) {
          const item = clothingItems.find(
            (c) =>
              c.name.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(c.name.toLowerCase())
          );
          if (item) {
            const slot =
              item.category === 'tops'
                ? 'top'
                : item.category === 'bottoms'
                ? 'bottom'
                : item.category === 'outerwear'
                ? 'outerwear'
                : item.category === 'shoes'
                ? 'shoes'
                : 'accessory';
            if (!matchedItems.some((m) => m.slot === slot)) {
              matchedItems.push({ item, slot });
            }
          }
        }

        if (matchedItems.length >= 2) {
          returnedRec = {
            items: matchedItems,
            confidence: 0.96,
            reason: json.data.styleReason || 'Hand-picked for current conditions.',
            style: json.data.outfitTitle || 'Curated Look',
          };
        }
      }
    }
  } catch (err) {
    console.warn('[aiStylistService] Call to /api/stylist/chat failed, using local rules:', err);
  }

  // Fallback if network fails
  if (!text) {
    const dressCode = (events[0]?.dressCode || 'Smart Casual').toLowerCase();
    const formality: Formality = dressCode.includes('formal')
      ? 'formal'
      : dressCode.includes('casual')
      ? (dressCode.includes('smart') ? 'smart casual' : 'casual')
      : 'smart casual';

    const recs = generateRecommendations(clothingItems, {
      temp: weather.temperature,
      rain: weather.rain,
      occasion: 'consultation',
      formality,
    });
    returnedRec = recs[0] || undefined;
    text = `Based on your wardrobe and the current ${weather.condition} forecast in ${weather.location}, here is a balanced outfit curated for comfort and sharp presence.`;
  }

  const responseMsg: StylistMessage = {
    id: `msg-${Date.now()}`,
    sender: 'stylist',
    text,
    timestamp: new Date().toISOString(),
    recommendation: returnedRec,
  };

  const all = getStylistMessages();
  all.push(responseMsg);
  saveStylistMessages(all);

  return responseMsg;
}
