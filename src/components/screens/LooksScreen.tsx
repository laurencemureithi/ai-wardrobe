import { useEffect, useState, useCallback } from 'react';
import { Bookmark, AlertCircle, Heart, Trash2 } from 'lucide-react';
import { fetchSavedOutfits, toggleFavoriteOutfit, deleteOutfit } from '@/lib/outfitService';
import type { OutfitWithItems } from '@/lib/types';
import { FullBodyOutfit } from '@/components/ui/FullBodyOutfit';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

interface LooksScreenProps {
  onNavigate: (tab: 'home') => void;
}

export function LooksScreen({ onNavigate }: LooksScreenProps) {
  const [outfits, setOutfits] = useState<OutfitWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchSavedOutfits();
      setOutfits(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleFavorite = async (id: string, fav: boolean) => {
    await toggleFavoriteOutfit(id, !fav);
    setOutfits((prev) =>
      prev.map((o) => (o.id === id ? { ...o, is_favorite: !fav } : o))
    );
  };

  const handleDelete = async (id: string) => {
    await deleteOutfit(id);
    setOutfits((prev) => prev.filter((o) => o.id !== id));
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
          title="Couldn't load your looks"
          description="Something went wrong. Let's try again."
          action={<Button onClick={load} variant="outline">Try again</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-serif text-2xl text-ink-900">Saved Looks</h1>
        <p className="mt-1 text-sm text-ink-500">Your favourite outfits, ready to wear again.</p>
      </div>

      {outfits.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={28} />}
          title="No saved looks yet"
          description="When you find an outfit you love, tap the bookmark to save it here."
          action={<Button onClick={() => onNavigate('home')}>Get recommendations</Button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 px-5">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="group relative rounded-3xl border border-ink-100 bg-white p-4 shadow-sm"
            >
              {/* Favorite + delete */}
              <div className="absolute right-3 top-3 z-10 flex gap-1">
                <button
                  onClick={() => handleFavorite(outfit.id, outfit.is_favorite)}
                  className={`rounded-full p-1.5 transition-colors ${
                    outfit.is_favorite ? 'text-accent-600' : 'text-ink-300 hover:text-ink-500'
                  }`}
                >
                  <Heart size={16} fill={outfit.is_favorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => handleDelete(outfit.id)}
                  className="rounded-full p-1.5 text-ink-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mb-3">
                <FullBodyOutfit
                  items={outfit.items.map((i) => ({ item: i.clothing_item, slot: i.slot }))}
                  size="sm"
                />
              </div>
              <h3 className="truncate font-serif text-base text-ink-900">
                {outfit.name ?? 'Saved look'}
              </h3>
              <p className="mt-0.5 text-2xs text-ink-400">
                {new Date(outfit.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
                {outfit.occasion ? ` • ${outfit.occasion}` : ''}
              </p>
              {outfit.ai_confidence && (
                <span className="mt-2 inline-block rounded-full bg-accent-50 px-2 py-0.5 text-2xs font-semibold text-accent-700">
                  {outfit.ai_confidence}% match
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
