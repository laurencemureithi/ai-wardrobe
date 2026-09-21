import type {
  CalendarEvent,
  DayPlan,
  TripPlan,
  ClothingItem,
  Recommendation,
  WeatherData,
} from '@/lib/types';

const CALENDAR_STORAGE_KEY = 'ai_wardrobe_calendar_events_v1';
const TRIPS_STORAGE_KEY = 'ai_wardrobe_trip_plans_v1';

export const DEFAULT_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Executive Client Presentation',
    time: '10:00 AM',
    date: new Date().toISOString().split('T')[0],
    type: 'meeting',
    dressCode: 'Smart Casual',
  },
  {
    id: 'evt-2',
    title: 'Team Architecture Sync',
    time: '2:30 PM',
    date: new Date().toISOString().split('T')[0],
    type: 'office',
    dressCode: 'Casual',
  },
  {
    id: 'evt-3',
    title: 'Dinner with Mentors',
    time: '7:30 PM',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    type: 'dinner',
    dressCode: 'Smart Casual',
  },
  {
    id: 'evt-4',
    title: 'Friday Product Demo',
    time: '11:00 AM',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    type: 'meeting',
    dressCode: 'Business',
  },
  {
    id: 'evt-5',
    title: 'Weekend Garden Wedding',
    time: '3:00 PM',
    date: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
    type: 'wedding',
    dressCode: 'Formal',
  },
];

export function getCalendarEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  saveCalendarEvents(DEFAULT_CALENDAR_EVENTS);
  return DEFAULT_CALENDAR_EVENTS;
}

export function saveCalendarEvents(events: CalendarEvent[]): void {
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
  } catch {
    /* ignore */
  }
}

export function addCalendarEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
  const all = getCalendarEvents();
  const newEvt: CalendarEvent = {
    ...event,
    id: `evt-${Date.now()}`,
  };
  all.push(newEvt);
  saveCalendarEvents(all);
  return newEvt;
}

export function generateWeekPlan(
  recommendations: Recommendation[],
  clothingItems: ClothingItem[],
  customEvents?: CalendarEvent[]
): DayPlan[] {
  const events = customEvents || getCalendarEvents();
  const days: DayPlan[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let i = 0; i < 7; i++) {
    const dateObj = new Date(Date.now() + i * 86400000);
    const dateStr = dateObj.toISOString().split('T')[0];
    const dayName = dayNames[dateObj.getDay()];
    const dayEvents = events.filter((e) => e.date === dateStr);

    // Weather simulation across week
    const isRain = i % 3 === 1;
    const baseTemp = 21 + (i % 4) - 2;
    const weather: WeatherData = {
      temperature: baseTemp,
      condition: isRain ? 'Light showers' : i % 2 === 0 ? 'Partly cloudy' : 'Sunny & pleasant',
      rain: isRain,
      humidity: 55 + i * 3,
      wind: 12 + i,
      location: 'London',
      advisory: isRain ? 'Carry an umbrella; avoid suede footwear.' : 'Ideal breathable cotton conditions.',
    };

    const rec = recommendations[i % Math.max(1, recommendations.length)];

    // Check if any items in outfit need wash
    const hasWornItems = rec?.items.some((slot) => {
      const liveItem = clothingItems.find((ci) => ci.id === slot.item.id);
      return liveItem?.status === 'needs_washing' || (liveItem && liveItem.wear_count >= 3);
    });

    days.push({
      date: dateStr,
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayName,
      isToday: i === 0,
      weather,
      events: dayEvents,
      recommendedOutfit: rec,
      laundryNeeded: hasWornItems || i === 5,
      isApproved: i === 0,
    });
  }

  return days;
}

// Laundry schedule analyzer
export interface LaundryDiagnostic {
  itemsNeedingWash: ClothingItem[];
  itemsInWash: ClothingItem[];
  urgentWashItems: ClothingItem[];
  recommendedWashDay: string;
  summaryMessage: string;
}

export function analyzeLaundry(items: ClothingItem[]): LaundryDiagnostic {
  const needsWash = items.filter(
    (i) => i.status === 'needs_washing' || (i.wear_count >= 2 && i.category !== 'outerwear')
  );
  const inWash = items.filter((i) => i.status === 'washing' || i.status === 'drying');
  const urgent = needsWash.filter((i) => i.name.toLowerCase().includes('shirt') || i.category === 'bottoms');

  let summary = 'All essential wardrobe items are clean and ready.';
  if (needsWash.length > 0) {
    summary = `You have ${needsWash.length} items that need washing. Wash before Saturday to be ready for next week's meetings.`;
  }

  return {
    itemsNeedingWash: needsWash,
    itemsInWash: inWash,
    urgentWashItems: urgent,
    recommendedWashDay: 'Saturday Morning',
    summaryMessage: summary,
  };
}

// Packing Assistant
export function getSavedTrips(): TripPlan[] {
  try {
    const raw = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  const defaultTrip: TripPlan = {
    id: 'trip-demo-1',
    destination: 'Mombasa Beach & Summit',
    days: 4,
    purpose: 'business',
    startDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    checklist: [
      { id: 'p1', name: 'White Oxford Shirt', category: 'Tops', packed: true },
      { id: 'p2', name: 'Navy T-Shirt', category: 'Tops', packed: true },
      { id: 'p3', name: 'Grey Chinos', category: 'Bottoms', packed: false },
      { id: 'p4', name: 'Navy Blazer', category: 'Outerwear', packed: false },
      { id: 'p5', name: 'Brown Leather Loafers', category: 'Shoes', packed: true },
      { id: 'p6', name: 'Leather Belt & Watch', category: 'Accessories', packed: false },
      { id: 'p7', name: 'Passport & Travel Docs', category: 'Essentials', packed: true },
      { id: 'p8', name: 'Laptop & Charger', category: 'Electronics', packed: true },
    ],
  };
  saveTripPlans([defaultTrip]);
  return [defaultTrip];
}

export function saveTripPlans(trips: TripPlan[]): void {
  try {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  } catch {
    /* ignore */
  }
}

export function generatePackingList(
  destination: string,
  days: number,
  purpose: 'business' | 'vacation' | 'wedding' | 'weekend',
  wardrobe: ClothingItem[]
): TripPlan {
  const tops = wardrobe.filter((i) => i.category === 'tops').slice(0, Math.min(days, 5));
  const bottoms = wardrobe.filter((i) => i.category === 'bottoms').slice(0, Math.min(Math.ceil(days / 2), 3));
  const shoes = wardrobe.filter((i) => i.category === 'shoes').slice(0, 2);
  const outerwear = wardrobe.filter((i) => i.category === 'outerwear').slice(0, 1);

  const checklist: TripPlan['checklist'] = [];

  tops.forEach((t, idx) =>
    checklist.push({ id: `top-${idx}`, name: t.name, category: 'Tops', packed: false, clothingItemId: t.id })
  );
  bottoms.forEach((b, idx) =>
    checklist.push({ id: `bot-${idx}`, name: b.name, category: 'Bottoms', packed: false, clothingItemId: b.id })
  );
  outerwear.forEach((o, idx) =>
    checklist.push({ id: `out-${idx}`, name: o.name, category: 'Outerwear', packed: false, clothingItemId: o.id })
  );
  shoes.forEach((s, idx) =>
    checklist.push({ id: `sho-${idx}`, name: s.name, category: 'Shoes', packed: false, clothingItemId: s.id })
  );

  checklist.push(
    { id: 'e-1', name: 'Passport & Boarding Pass', category: 'Essentials', packed: false },
    { id: 'e-2', name: 'Universal Charger & Phone Cable', category: 'Essentials', packed: false },
    { id: 'e-3', name: 'Toiletry Bag & Fragrance', category: 'Essentials', packed: false }
  );

  const trip: TripPlan = {
    id: `trip-${Date.now()}`,
    destination,
    days,
    purpose,
    startDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    checklist,
  };

  const current = getSavedTrips();
  current.unshift(trip);
  saveTripPlans(current);
  return trip;
}
