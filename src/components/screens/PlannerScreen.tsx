import { useState, useEffect } from 'react';
import {
  Calendar,
  Luggage,
  Plus,
  Check,
  Wand2,
  Droplets,
  Layers,
} from 'lucide-react';
import type {
  DayPlan,
  TripPlan,
  ClothingItem,
  Recommendation,
  CalendarEvent,
} from '@/lib/types';
import {
  getCalendarEvents,
  generateWeekPlan,
  analyzeLaundry,
  getSavedTrips,
  generatePackingList,
  addCalendarEvent,
} from '@/lib/plannerService';
import { fetchClothingItems } from '@/lib/wardrobeService';
import { getWeather } from '@/lib/weatherService';
import { generateRecommendations } from '@/lib/recommendationService';
import { Spinner } from '@/components/ui/Spinner';

interface PlannerScreenProps {
  onTryInDigitalTwin: (outfit: Recommendation) => void;
  onNavigateWardrobe?: () => void;
}

export function PlannerScreen({ onTryInDigitalTwin, onNavigateWardrobe }: PlannerScreenProps) {
  const [activeTab, setActiveTab] = useState<'week' | 'laundry' | 'packing' | 'capsule'>('week');
  const [loading, setLoading] = useState(true);
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([]);
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00 AM');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventDressCode, setNewEventDressCode] = useState<'Smart Casual' | 'Formal' | 'Casual' | 'Business'>('Smart Casual');

  // Packing trip form state
  const [tripDest, setTripDest] = useState('');
  const [tripDays, setTripDays] = useState(3);
  const [tripPurpose, setTripPurpose] = useState<'business' | 'vacation' | 'wedding' | 'weekend'>('business');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const items = await fetchClothingItems();
      const weather = await getWeather();
      const recs = generateRecommendations(items, {
        temp: weather.temperature,
        rain: weather.rain,
        occasion: 'weekly',
        formality: 'smart casual',
      });
      const evts = getCalendarEvents();
      const plan = generateWeekPlan(recs, items, evts);
      const savedTrips = getSavedTrips();

      setClothing(items);
      setEvents(evts);
      setWeekPlan(plan);
      setTrips(savedTrips);
      setLoading(false);
    }
    loadData();
  }, []);

  const laundryInfo = analyzeLaundry(clothing);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const created = addCalendarEvent({
      title: newEventTitle.trim(),
      time: newEventTime,
      date: newEventDate,
      type: 'meeting',
      dressCode: newEventDressCode,
    });

    setEvents((prev) => [...prev, created]);
    // Refresh week plan
    const updatedPlan = generateWeekPlan(
      weekPlan.map((d) => d.recommendedOutfit!).filter(Boolean),
      clothing,
      [...events, created]
    );
    setWeekPlan(updatedPlan);
    setShowAddEventModal(false);
    setNewEventTitle('');
  };

  const handleGenerateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripDest.trim()) return;

    const newTrip = generatePackingList(tripDest.trim(), tripDays, tripPurpose, clothing);
    setTrips((prev) => [newTrip, ...prev]);
    setTripDest('');
  };

  const togglePackingItem = (tripId: string, itemId: string) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== tripId) return t;
        return {
          ...t,
          checklist: t.checklist.map((c) => (c.id === itemId ? { ...c, packed: !c.packed } : c)),
        };
      })
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 pb-24 md:pb-8 pt-4 px-3 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-100 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-950">
            Style & Schedule Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-ink-600 mt-0.5">
            Align daily outfits with your calendar, weather forecasts, laundry readiness & trips.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-ink-100 rounded-2xl w-fit">
          {[
            { id: 'week' as const, label: 'My Week', icon: Calendar, badge: 0 },
            { id: 'laundry' as const, label: 'Laundry AI', icon: Droplets, badge: laundryInfo.itemsNeedingWash.length },
            { id: 'packing' as const, label: 'Trip Packing', icon: Luggage, badge: 0 },
            { id: 'capsule' as const, label: 'Capsule Builder', icon: Layers, badge: 0 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-ink-950 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-3xs font-bold text-amber-800">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. MY WEEK TAB */}
      {activeTab === 'week' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink-900">7-Day Outfit Timeline</h2>
              <p className="text-2xs text-ink-500">
                Outfits synchronized with {events.length} calendar commitments and local weather forecasts.
              </p>
            </div>
            <button
              onClick={() => setShowAddEventModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-ink-950 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-ink-800"
            >
              <Plus size={14} />
              <span>Add Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekPlan.map((day) => (
              <div
                key={day.date}
                className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                  day.isToday
                    ? 'bg-white border-ink-950 shadow-sm ring-1 ring-ink-950'
                    : 'bg-white/80 border-ink-100 hover:border-ink-200'
                }`}
              >
                <div>
                  {/* Top Day Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-ink-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink-950">{day.dayName}</span>
                        {day.isToday && (
                          <span className="rounded-md bg-accent-100 px-1.5 py-0.5 text-3xs font-bold text-accent-800">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="text-2xs text-ink-400">{day.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-ink-900">{day.weather.temperature}°C</span>
                      <p className="text-3xs text-ink-500 truncate max-w-[100px]">{day.weather.condition}</p>
                    </div>
                  </div>

                  {/* Day's Events */}
                  <div className="mt-2.5 space-y-1">
                    {day.events.length > 0 ? (
                      day.events.map((evt) => (
                        <div
                          key={evt.id}
                          className="flex items-center justify-between rounded-lg bg-sand-50 px-2 py-1 text-2xs text-sand-900 border border-sand-100"
                        >
                          <span className="font-semibold truncate">{evt.title}</span>
                          <span className="text-3xs font-medium text-sand-700 shrink-0 ml-1">
                            {evt.time}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-2xs text-ink-400 italic py-1">No scheduled meetings</p>
                    )}
                  </div>

                  {/* Recommended Outfit for Day */}
                  {day.recommendedOutfit && (
                    <div className="mt-3 pt-3 border-t border-ink-100">
                      <div className="flex items-center justify-between text-2xs text-ink-500 mb-1.5">
                        <span className="font-semibold text-ink-800 uppercase tracking-wider text-3xs">
                          {day.recommendedOutfit.style}
                        </span>
                        <span className="font-medium text-accent-700">
                          {Math.round(day.recommendedOutfit.confidence * 100)}% Fit
                        </span>
                      </div>

                      {/* Item miniatures */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {day.recommendedOutfit.items.slice(0, 3).map(({ item }) => (
                          <div
                            key={item.id}
                            className="aspect-square rounded-lg overflow-hidden bg-ink-100 relative group"
                          >
                            <img
                              src={item.image_url || ''}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>

                      <p className="text-2xs text-ink-600 line-clamp-2 mt-2">
                        {day.recommendedOutfit.reason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-2 border-t border-ink-100 flex items-center justify-between">
                  {day.laundryNeeded ? (
                    <span className="flex items-center gap-1 text-3xs font-semibold text-amber-700">
                      <Droplets size={11} /> Wash needed
                    </span>
                  ) : (
                    <span className="text-3xs font-semibold text-emerald-700">Clean ready</span>
                  )}

                  {day.recommendedOutfit && (
                    <button
                      onClick={() => onTryInDigitalTwin(day.recommendedOutfit!)}
                      className="flex items-center gap-1 text-2xs font-semibold text-ink-950 hover:text-accent-700"
                    >
                      <Wand2 size={12} />
                      <span>Try on Twin</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. LAUNDRY INTELLIGENCE TAB */}
      {activeTab === 'laundry' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 border border-ink-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 shrink-0">
                <Droplets size={24} />
              </div>
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-amber-800">
                  Smart Laundry Schedule
                </span>
                <h2 className="text-xl font-serif font-bold text-ink-950">
                  {laundryInfo.summaryMessage}
                </h2>
                <p className="text-xs text-ink-600 mt-1">
                  Optimal Wash Window: <span className="font-semibold text-ink-900">{laundryInfo.recommendedWashDay}</span>. Washing before Sunday ensures your work week outfits are dry and ironed.
                </p>
              </div>
            </div>

            {onNavigateWardrobe && (
              <button
                onClick={onNavigateWardrobe}
                className="rounded-xl bg-ink-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-ink-800 shrink-0"
              >
                Manage Wardrobe Status
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Items needing washing */}
            <div className="rounded-2xl bg-white p-5 border border-ink-100 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-ink-100 mb-4">
                <h3 className="text-sm font-semibold text-ink-900">
                  Needs Washing ({laundryInfo.itemsNeedingWash.length})
                </h3>
                <span className="text-2xs text-ink-500 font-medium">Auto-detected from wear history</span>
              </div>

              {laundryInfo.itemsNeedingWash.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-500">
                  All wardrobe items are clean! No washing needed right now.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {laundryInfo.itemsNeedingWash.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-ink-100 p-2.5 bg-ink-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-lg overflow-hidden bg-ink-100 shrink-0">
                          <img
                            src={item.image_url || ''}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-ink-900">{item.name}</p>
                          <p className="text-2xs text-ink-500">
                            Worn {item.wear_count} time{item.wear_count === 1 ? '' : 's'} • {item.category}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-2xs font-semibold text-amber-800">
                        Needs Wash
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* In the wash / drying */}
            <div className="rounded-2xl bg-white p-5 border border-ink-100 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-ink-100 mb-4">
                <h3 className="text-sm font-semibold text-ink-900">
                  Clean & Ready Rotation ({clothing.filter((i) => i.status === 'clean').length})
                </h3>
                <span className="text-2xs text-emerald-700 font-medium">Ready for AI Outfits</span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto no-scrollbar">
                {clothing
                  .filter((i) => i.status === 'clean')
                  .slice(0, 8)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-ink-100 p-2 bg-ink-50/30 flex items-center gap-2"
                    >
                      <div className="h-9 w-9 rounded-md overflow-hidden bg-ink-100 shrink-0">
                        <img
                          src={item.image_url || ''}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-medium text-ink-900 truncate">{item.name}</p>
                        <p className="text-3xs text-emerald-700">100% Ready</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PACKING ASSISTANT TAB */}
      {activeTab === 'packing' && (
        <div className="space-y-6">
          {/* Create new trip bar */}
          <div className="rounded-3xl bg-white p-5 border border-ink-100 shadow-sm">
            <h3 className="text-sm font-semibold text-ink-900 mb-3">
              Generate Minimalist Travel Packing Plan
            </h3>
            <form onSubmit={handleGenerateTrip} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-2xs font-semibold text-ink-600 block mb-1">Destination</label>
                <input
                  type="text"
                  placeholder="e.g. Mombasa, New York, Paris"
                  value={tripDest}
                  onChange={(e) => setTripDest(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 px-3 py-2 text-xs text-ink-950 focus:outline-none focus:ring-2 focus:ring-ink-900"
                />
              </div>

              <div>
                <label className="text-2xs font-semibold text-ink-600 block mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={tripDays}
                  onChange={(e) => setTripDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-ink-200 px-3 py-2 text-xs text-ink-950 focus:outline-none focus:ring-2 focus:ring-ink-900"
                />
              </div>

              <div>
                <label className="text-2xs font-semibold text-ink-600 block mb-1">Trip Purpose</label>
                <select
                  value={tripPurpose}
                  onChange={(e) => setTripPurpose(e.target.value as 'business' | 'vacation' | 'wedding' | 'weekend')}
                  className="w-full rounded-xl border border-ink-200 px-3 py-2 text-xs text-ink-950 focus:outline-none focus:ring-2 focus:ring-ink-900 bg-white"
                >
                  <option value="business">Business / Conference</option>
                  <option value="vacation">Vacation / Beach</option>
                  <option value="wedding">Wedding / Gala</option>
                  <option value="weekend">Weekend Getaway</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!tripDest.trim()}
                  className="w-full rounded-xl bg-ink-950 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-ink-800 disabled:opacity-40"
                >
                  Build Packing Checklist
                </button>
              </div>
            </form>
          </div>

          {/* Saved Trips Display */}
          <div className="space-y-4">
            {trips.map((trip) => {
              const packedCount = trip.checklist.filter((i) => i.packed).length;
              const progressPct = Math.round((packedCount / trip.checklist.length) * 100);
              return (
                <div key={trip.id} className="rounded-2xl bg-white p-5 border border-ink-100 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ink-100 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-ink-950">{trip.destination}</h4>
                        <span className="rounded-md bg-accent-100 px-2 py-0.5 text-2xs font-semibold text-accent-800 capitalize">
                          {trip.purpose}
                        </span>
                      </div>
                      <p className="text-2xs text-ink-500 mt-0.5">
                        {trip.days} days • Starting {trip.startDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-ink-900">
                          {packedCount} / {trip.checklist.length} Packed
                        </span>
                        <div className="h-1.5 w-24 bg-ink-100 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-accent-600 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checklist items grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    {trip.checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => togglePackingItem(trip.id, item.id)}
                        className={`cursor-pointer rounded-xl p-2.5 border transition-all flex items-center justify-between ${
                          item.packed
                            ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                            : 'border-ink-100 bg-ink-50/30 text-ink-800 hover:border-ink-200'
                        }`}
                      >
                        <div className="truncate">
                          <p className="text-3xs uppercase font-bold text-ink-400">{item.category}</p>
                          <p className={`text-xs font-medium truncate ${item.packed ? 'line-through text-ink-400' : ''}`}>
                            {item.name}
                          </p>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-md flex items-center justify-center border shrink-0 ml-2 ${
                            item.packed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-ink-300 bg-white'
                          }`}
                        >
                          {item.packed && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. CAPSULE BUILDER TAB */}
      {activeTab === 'capsule' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-sand-50 p-6 border border-sand-200/80">
            <h3 className="text-lg font-serif font-bold text-sand-950">
              10-Item Capsule Wardrobe: 32 Outfits
            </h3>
            <p className="text-xs text-sand-800 mt-1 max-w-2xl leading-relaxed">
              Our AI selected these 10 core interchangeable pieces. By coordinating neutral bases with structured outerwear and versatile footwear, you unlock over 30 unique combinations without shopping.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {clothing.slice(0, 10).map((item, idx) => (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-ink-100 p-3 shadow-xs hover:border-ink-300 transition-all"
              >
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-ink-100 relative">
                  <img
                    src={item.image_url || ''}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-ink-950/80 px-2 py-0.5 text-3xs font-bold text-white">
                    #{idx + 1}
                  </span>
                </div>
                <p className="text-xs font-semibold text-ink-900 mt-2 truncate">{item.name}</p>
                <p className="text-2xs text-ink-500 capitalize">{item.category} • {item.formality || 'Versatile'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD CALENDAR EVENT MODAL */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-ink-100">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h3 className="text-base font-serif font-bold text-ink-950">
                Sync Calendar Event
              </h3>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="rounded-full bg-ink-100 p-1.5 text-ink-500 hover:bg-ink-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-ink-700 block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Board Presentation, Dinner Date, Wedding"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 px-3 py-2 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink-700 block mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full rounded-xl border border-ink-200 px-3 py-2 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-700 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full rounded-xl border border-ink-200 px-3 py-2 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-700 block mb-1">
                  Expected Dress Code
                </label>
                <select
                  value={newEventDressCode}
                  onChange={(e) => setNewEventDressCode(e.target.value as 'Smart Casual' | 'Formal' | 'Casual' | 'Business')}
                  className="w-full rounded-xl border border-ink-200 px-3 py-2 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900 bg-white"
                >
                  <option value="Smart Casual">Smart Casual</option>
                  <option value="Business">Business / Executive</option>
                  <option value="Formal">Formal / Wedding</option>
                  <option value="Casual">Casual / Everyday</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!newEventTitle.trim()}
                className="w-full rounded-xl bg-ink-950 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-ink-800 disabled:opacity-40"
              >
                Save Event & Recommend Outfit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
