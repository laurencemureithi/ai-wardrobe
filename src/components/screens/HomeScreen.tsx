import { useEffect, useState, useCallback } from 'react';
import { Cloud, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fetchClothingItems } from '@/lib/wardrobeService';
import { generateRecommendations } from '@/lib/recommendationService';
import { getWeather } from '@/lib/weatherService';
import { saveOutfit, recordWearEvent, toggleSaveOutfit } from '@/lib/outfitService';
import type { ClothingItem, OutfitSlot, Recommendation, WeatherData } from '@/lib/types';
import { OutfitCard } from '@/components/ui/OutfitCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

interface HomeScreenProps {
  onNavigate: (tab: 'wardrobe') => void;
  onOutfitTap: (rec: Recommendation) => void;
}

export function HomeScreen({ onNavigate, onOutfitTap }: HomeScreenProps) {
  const { profile } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [clothingItems, w] = await Promise.all([
        fetchClothingItems(),
        getWeather(profile?.location ?? undefined),
      ]);
      setItems(clothingItems);
      setWeather(w);
      const recs = generateRecommendations(clothingItems, {
        temp: w.temperature,
        rain: w.rain,
        occasion: 'today',
        formality: 'smart casual',
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

  const handleRegenerate = () => {
    if (items.length === 0) return;
    const w = weather ?? { temperature: 22, rain: false } as WeatherData;
    const recs = generateRecommendations(items, {
      temp: w.temperature,
      rain: w.rain,
      occasion: 'today',
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
      if (saved) setSavedIds((prev) => new Set(prev).add(saved.id));
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
      }
    } catch {
      /* ignore */
    }
  };

  const handleReject = () => {
    setRecommendations((prev) => {
      const next = prev.slice(1);
      if (next.length === 0) {
        // Regenerate after state update
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
      <div className="px-6 pt-20">
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
      <div className="px-6 pt-20">
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

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-serif text-2xl text-ink-900">
          {greeting()}{profile?.display_name ? `, ${profile.display_name}` : ''}
        </h1>
        {/* Context bar */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {weather && (
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm text-ink-600 shadow-sm">
              <Cloud size={14} />
              {weather.temperature}°C • {weather.condition}
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm text-ink-600 shadow-sm">
            <Calendar size={14} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
        </div>
      </div>

      {/* What should you wear? */}
      <div className="px-5 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink-800">What should you wear?</h2>
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-800"
          >
            <RefreshCw size={14} /> Shuffle
          </button>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-4 px-5 pt-2">
        {recommendations.length === 0 ? (
          <EmptyState
            icon={<AlertCircle size={28} />}
            title="No recommendations yet"
            description="I need more variety in your wardrobe to suggest outfits. Try adding more items."
            action={<Button onClick={() => onNavigate('wardrobe')}>Add clothing</Button>}
          />
        ) : (
          recommendations.map((rec, idx) => (
            <OutfitCard
              key={idx}
              index={idx}
              style={rec.style}
              items={rec.items}
              confidence={rec.confidence}
              reason={rec.reason}
              onWear={() => handleWear(rec)}
              onSave={() => handleSave(rec)}
              onReject={handleReject}
              onRegenerate={handleRegenerate}
              onTap={() => onOutfitTap(rec)}
            />
          ))
        )}
      </div>
    </div>
  );
}
