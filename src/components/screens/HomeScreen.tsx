import { useEffect, useState, useCallback } from 'react';
import {
  Cloud,
  Calendar,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Wand2,
  Check,
  ArrowRight,
  Smile,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fetchClothingItems } from '@/lib/wardrobeService';
import { generateRecommendations } from '@/lib/recommendationService';
import { getWeather } from '@/lib/weatherService';
import { saveOutfit, recordWearEvent } from '@/lib/outfitService';
import { getCalendarEvents } from '@/lib/plannerService';
import type { ClothingItem, Recommendation, WeatherData, CalendarEvent, UserMood, Formality } from '@/lib/types';
import { OutfitCard } from '@/components/ui/OutfitCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { getBranding } from '@/lib/brandingService';

interface HomeScreenProps {
  onNavigate: (tab: 'wardrobe' | 'twin' | 'stylist' | 'planner' | 'insights') => void;
  onOutfitTap: (rec: Recommendation) => void;
  onTryInDigitalTwin: (rec: Recommendation) => void;
}

const MOODS: { id: UserMood; label: string; icon: string; styleHint: string }[] = [
  { id: 'confident', label: 'Confident & Sharp', icon: '⚡', styleHint: 'Tailored lines & crisp contrast' },
  { id: 'relaxed', label: 'Effortless & Casual', icon: '🌿', styleHint: 'Breathable soft layers & comfort' },
  { id: 'professional', label: 'Executive Poise', icon: '💼', styleHint: 'Clean collar & structured neutral tones' },
  { id: 'creative', label: 'Artistic & Expressive', icon: '🎨', styleHint: 'Playful textures & statement pairings' },
  { id: 'minimalist', label: 'Monochrome Zen', icon: '⚪', styleHint: 'Pure neutrals & architectural silhouette' },
];

export function HomeScreen({ onNavigate, onOutfitTap, onTryInDigitalTwin }: HomeScreenProps) {
  const { profile } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [wornOutfits, setWornOutfits] = useState<Set<string>>(new Set());
  const [selectedMood, setSelectedMood] = useState<UserMood>('confident');
  const [morningMode, setMorningMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [clothingItems, w, evts] = await Promise.all([
        fetchClothingItems(),
        getWeather(profile?.location ?? undefined),
        getCalendarEvents(),
      ]);
      setItems(clothingItems);
      setWeather(w);
      setEvents(evts);

      const dressCode = evts[0]?.dressCode || 'Smart Casual';
      const rawDress = dressCode.toLowerCase();
      const mappedFormality: Formality = rawDress.includes('formal')
        ? 'formal'
        : rawDress.includes('casual')
        ? (rawDress.includes('smart') ? 'smart casual' : 'casual')
        : 'smart casual';

      const recs = generateRecommendations(clothingItems, {
        temp: w.temperature,
        rain: w.rain,
        occasion: 'today',
        formality: mappedFormality,
      });
      setRecommendations(recs);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [profile?.location]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMoodSelect = (mood: UserMood) => {
    setSelectedMood(mood);
    if (items.length === 0) return;
    const w = weather ?? ({ temperature: 22, rain: false } as WeatherData);

    let formality: Formality = 'smart casual';
    if (mood === 'professional') formality = 'formal';
    if (mood === 'relaxed') formality = 'casual';

    const recs = generateRecommendations(items, {
      temp: w.temperature,
      rain: w.rain,
      occasion: mood,
      formality,
    });
    setRecommendations(recs);
  };

  const handleRegenerate = () => {
    if (items.length === 0) return;
    const w = weather ?? ({ temperature: 22, rain: false } as WeatherData);
    const recs = generateRecommendations(items, {
      temp: w.temperature,
      rain: w.rain,
      occasion: selectedMood,
      formality: Math.random() > 0.5 ? 'smart casual' : 'casual',
    });
    setRecommendations(recs);
  };

  const handleSave = async (rec: Recommendation) => {
    try {
      const saved = await saveOutfit(
        {
          name: rec.style,
          occasion: 'today',
          style: rec.style,
          weather: weather?.condition,
          ai_confidence: rec.confidence,
          reason: rec.reason,
          is_saved: true,
        },
        rec.items.map((i) => ({ clothing_item_id: i.item.id, slot: i.slot }))
      );
      if (saved) setSavedIds((prev) => new Set(prev).add(rec.style));
    } catch {
      /* ignore */
    }
  };

  const handleWear = async (rec: Recommendation) => {
    try {
      const saved = await saveOutfit(
        {
          name: rec.style,
          occasion: 'today',
          style: rec.style,
          weather: weather?.condition,
          ai_confidence: rec.confidence,
          reason: rec.reason,
        },
        rec.items.map((i) => ({ clothing_item_id: i.item.id, slot: i.slot }))
      );
      if (saved) {
        await recordWearEvent(saved.id, 'good', 'today', weather?.condition);
        setWornOutfits((prev) => new Set(prev).add(rec.style));
      }
    } catch {
      /* ignore */
    }
  };

  const handleReject = () => {
    setRecommendations((prev) => {
      const next = prev.slice(1);
      if (next.length === 0) {
        setTimeout(() => handleRegenerate(), 0);
      }
      return next;
    });
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 pt-20 max-w-lg mx-auto">
        <EmptyState
          icon={<AlertCircle size={28} />}
          title="I couldn't load your wardrobe"
          description="Something went wrong. Let's try again."
          action={
            <Button onClick={load} variant="outline">
              <RefreshCw size={16} /> Try again
            </Button>
          }
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-6 pt-20 max-w-lg mx-auto">
        <EmptyState
          icon={<AlertCircle size={28} />}
          title="Your wardrobe is empty"
          description="Add a few clothing items and I'll start recommending outfits for you."
          action={
            <Button onClick={() => onNavigate('wardrobe')}>
              Add to wardrobe
            </Button>
          }
        />
      </div>
    );
  }

  const primaryRec = recommendations[0];
  const todayEvents = events.filter((e) => e.date === new Date().toISOString().split('T')[0]);

  return (
    <div className="min-h-screen pb-24 md:pb-8 pt-4 px-3 sm:px-6 max-w-7xl mx-auto">
      {/* Top Greeting & Weather Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">
              {getBranding().aiAssistantName} Styling Live
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-950 mt-0.5">
            {greeting()}{profile?.display_name ? `, ${profile.display_name}` : ''}
          </h1>
          <p className="text-xs sm:text-sm text-ink-600">
            Dressing tailored for today’s meetings, temperature and comfort.
          </p>
        </div>

        {/* Weather & Date Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {weather && (
            <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 text-xs font-semibold text-ink-800 border border-ink-200 shadow-xs">
              <Cloud size={16} className="text-accent-600" />
              <span>
                {weather.temperature}°C • {weather.condition}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 text-xs font-semibold text-ink-800 border border-ink-200 shadow-xs">
            <Calendar size={15} className="text-ink-600" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <button
            onClick={() => setMorningMode(!morningMode)}
            className={`flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs ${
              morningMode
                ? 'bg-accent-600 text-white'
                : 'bg-ink-100 hover:bg-ink-200 text-ink-800'
            }`}
          >
            <Sparkles size={14} />
            <span>{morningMode ? 'Morning Mode Active' : '60s Morning Mode'}</span>
          </button>
        </div>
      </div>

      {/* Morning Mode Hero Banner (Instant 60-Second Pick) */}
      {morningMode && primaryRec && (
        <div className="rounded-3xl bg-gradient-to-r from-ink-950 via-ink-900 to-ink-950 p-6 text-white mb-6 shadow-md border border-ink-800 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-accent-500 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-white">
                  60-Second Instant Pick
                </span>
                <span className="text-2xs text-sand-300 font-semibold">
                  Zero Decision Fatigue
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                Wear the {primaryRec.style}
              </h2>
              <p className="text-xs sm:text-sm text-sand-100 max-w-xl">
                {primaryRec.reason} All garments are clean and pressed in your wardrobe.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onTryInDigitalTwin(primaryRec)}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-ink-950 hover:bg-sand-100 transition-all shadow-sm"
              >
                <Wand2 size={16} className="text-accent-700" />
                <span>Try on Digital Twin</span>
              </button>
              <button
                onClick={() => handleWear(primaryRec)}
                className="flex items-center gap-2 rounded-xl bg-accent-500 hover:bg-accent-400 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm"
              >
                <Check size={16} />
                <span>Wear & Head Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Schedule & Agenda Context Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Today's Agenda */}
        <div className="rounded-2xl bg-white p-4 border border-ink-100 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-ink-100 mb-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-ink-400">
              Today's Agenda
            </span>
            <button
              onClick={() => onNavigate('planner')}
              className="text-2xs font-semibold text-accent-700 hover:text-accent-800 flex items-center"
            >
              Planner <ArrowRight size={11} className="ml-0.5" />
            </button>
          </div>
          {todayEvents.length > 0 ? (
            <div className="space-y-1.5">
              {todayEvents.map((evt) => (
                <div key={evt.id} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-900 truncate">{evt.title}</span>
                  <span className="text-2xs text-ink-500 font-medium shrink-0 ml-2">{evt.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-2xs text-ink-500 italic">No formal meetings scheduled today.</p>
          )}
        </div>

        {/* Digital Twin Shortcut */}
        <div
          onClick={() => onNavigate('twin')}
          className="cursor-pointer rounded-2xl bg-white p-4 border border-ink-100 shadow-xs hover:border-ink-300 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-1.5 text-accent-700 mb-1">
              <Wand2 size={16} />
              <span className="text-2xs font-bold uppercase tracking-wider">Living Avatar Studio</span>
            </div>
            <h4 className="text-xs font-bold text-ink-950 group-hover:text-accent-800">
              Launch Living Digital Twin
            </h4>
            <p className="text-2xs text-ink-500 mt-0.5">
              Photo-accurate twin & drag-and-drop fitting
            </p>
          </div>
          <ArrowRight size={16} className="text-ink-400 group-hover:translate-x-1 transition-transform" />
        </div>

        {/* AI Stylist Shortcut */}
        <div
          onClick={() => onNavigate('stylist')}
          className="cursor-pointer rounded-2xl bg-white p-4 border border-ink-100 shadow-xs hover:border-ink-300 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-1.5 text-ink-700 mb-1">
              <Sparkles size={16} className="text-accent-600" />
              <span className="text-2xs font-bold uppercase tracking-wider">
                Styling with {profile?.ai_assistant_name || 'Aria'}
              </span>
            </div>
            <h4 className="text-xs font-bold text-ink-950 group-hover:text-accent-800">
              Ask {profile?.ai_assistant_name || 'Aria'} a Question
            </h4>
            <p className="text-2xs text-ink-500 mt-0.5">
              "What to wear tomorrow?", "Style for dinner"
            </p>
          </div>
          <ArrowRight size={16} className="text-ink-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Mood / Vibe Selector Strip */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Smile size={16} className="text-ink-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-700">
              How do you want to feel today?
            </h3>
          </div>
          <span className="text-2xs text-ink-500">
            {MOODS.find((m) => m.id === selectedMood)?.styleHint}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.id;
            return (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`flex items-center gap-2 rounded-xl p-2.5 border text-left transition-all ${
                  isSelected
                    ? 'border-ink-950 bg-white shadow-xs ring-1 ring-ink-950'
                    : 'border-ink-100 bg-white/70 hover:border-ink-200'
                }`}
              >
                <span className="text-base">{mood.icon}</span>
                <span className="text-xs font-semibold text-ink-900 truncate">{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations Feed Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-ink-950">
            Curated Outfits for You
          </h2>
          <p className="text-2xs text-ink-500">
            Tuned to {selectedMood} vibe • Tap any outfit to view pieces or try on Digital Twin
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-950 rounded-xl px-3 py-1.5 border border-ink-200 bg-white"
        >
          <RefreshCw size={13} />
          <span>Remix Looks</span>
        </button>
      </div>

      {/* Outfit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<AlertCircle size={28} />}
              title="No recommendations found"
              description="Try adding more versatile items in your wardrobe to allow more outfit combinations."
              action={<Button onClick={() => onNavigate('wardrobe')}>Add clothing</Button>}
            />
          </div>
        ) : (
          recommendations.map((rec, idx) => (
            <OutfitCard
              key={`${rec.style}-${idx}`}
              index={idx}
              style={rec.style}
              items={rec.items}
              confidence={rec.confidence}
              reason={rec.reason}
              saved={savedIds.has(rec.style)}
              worn={wornOutfits.has(rec.style)}
              onWear={() => handleWear(rec)}
              onSave={() => handleSave(rec)}
              onReject={handleReject}
              onRegenerate={handleRegenerate}
              onTap={() => onOutfitTap(rec)}
              onTryInTwin={() => onTryInDigitalTwin(rec)}
            />
          ))
        )}
      </div>
    </div>
  );
}
