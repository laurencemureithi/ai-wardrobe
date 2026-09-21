import type {
  StylistMessage,
  Recommendation,
  ClothingItem,
  WeatherData,
  CalendarEvent,
  Formality,
} from '@/lib/types';
import { generateRecommendations } from '@/lib/recommendationService';

const STYLIST_HISTORY_KEY = 'ai_wardrobe_stylist_messages_v1';

export const INITIAL_STYLIST_MESSAGES: StylistMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'stylist',
    text: "Hello Alex! I'm your AI Style Assistant. I manage your wardrobe, check the weather, sync with your calendar, and ensure you feel sharp and confident every day. What are you dressing for today?",
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
  events: CalendarEvent[]
): Promise<StylistMessage> {
  // Simulate intelligent response latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  const lower = query.toLowerCase();
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
  const primaryRec = recs[0] || null;

  let text = '';
  let returnedRec: Recommendation | undefined = primaryRec || undefined;

  if (lower.includes('wedding')) {
    text = `For a wedding, elegance and subtlety are key. I've paired clean neutral tailoring with polished leather shoes so you look sophisticated without competing with the wedding party. Notice the breathable fabric balance for both indoor and outdoor reception venues.`;
    // Find formal pieces
    const blazer = clothingItems.find((i) => i.name.toLowerCase().includes('blazer') || i.category === 'outerwear');
    const shirt = clothingItems.find((i) => i.name.toLowerCase().includes('shirt') && i.category === 'tops');
    const pants = clothingItems.find((i) => i.category === 'bottoms' && !i.name.toLowerCase().includes('jean'));
    const shoes = clothingItems.find((i) => i.category === 'shoes' && !i.name.toLowerCase().includes('sneak'));

    if (blazer && shirt && pants && shoes) {
      returnedRec = {
        items: [
          { item: shirt, slot: 'top' },
          { item: blazer, slot: 'outerwear' },
          { item: pants, slot: 'bottom' },
          { item: shoes, slot: 'shoes' },
        ],
        confidence: 0.98,
        reason: 'Harmonious formal ensemble suited for wedding ceremonies and banquets.',
        style: 'Modern Formal',
      };
    }
  } else if (lower.includes('tomorrow') || lower.includes('morning') || lower.includes('work')) {
    const nextMeeting = events[0];
    const meetingTitle = nextMeeting ? nextMeeting.title : 'work day';
    text = `For tomorrow's ${meetingTitle}, I took into account tomorrow's ${weather.temperature}°C forecast and your clean wardrobe rotation. Here is a balanced, high-confidence outfit ready to wear.`;
  } else if (lower.includes('professional') || lower.includes('meeting') || lower.includes('ceo')) {
    text = `Making this more professional: crisp structured collar, tailored trousers, and dark-toned leather accents. This silhouette conveys decisive leadership and elevated composure.`;
  } else if (lower.includes('comfort') || lower.includes('tired') || lower.includes('relax')) {
    text = `Comfort-first mode activated. Soft breathable cottons, relaxed shoulder drape, and footwear with superior cushioning. You'll stay cozy without looking disheveled.`;
    const tee = clothingItems.find((i) => i.subcategory === 't-shirt' || i.name.toLowerCase().includes('t-shirt'));
    const pants = clothingItems.find((i) => i.category === 'bottoms');
    const sneakers = clothingItems.find((i) => i.name.toLowerCase().includes('sneak') || i.category === 'shoes');
    if (tee && pants && sneakers) {
      returnedRec = {
        items: [
          { item: tee, slot: 'top' },
          { item: pants, slot: 'bottom' },
          { item: sneakers, slot: 'shoes' },
        ],
        confidence: 0.95,
        reason: 'Ultra-soft relaxed knitwear pairing for high comfort and ease.',
        style: 'Minimal Comfort',
      };
    }
  } else if (lower.includes('different') || lower.includes('never worn') || lower.includes('unworn')) {
    text = `Here is a fresh combination you haven't worn in weeks! Recombining versatile neutrals gives your wardrobe double the mileage without purchasing anything new.`;
  } else if (lower.includes('pose') || lower.includes('photoshoot')) {
    text = `I've prepared this outfit across multiple pose profiles (Executive Stance, Street Stride, Profile, and Editorial Turn). Tap 'Try on Digital Twin' to view the full photoshoot sequence!`;
  } else {
    text = `Based on your style preferences and the ${weather.condition} forecast in ${weather.location}, here is a tailored recommendation curated to save you morning decision fatigue.`;
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
