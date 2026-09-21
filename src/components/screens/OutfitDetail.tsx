import { useState, useEffect } from 'react';
import { Bookmark, RefreshCw, Check, ThumbsDown, ArrowLeft, Wand2 } from 'lucide-react';
import type { ClothingItem, OutfitSlot, Recommendation } from '@/lib/types';
import { FullBodyOutfit } from '@/components/ui/FullBodyOutfit';
import { ItemSelector } from '@/components/ui/ItemSelector';
import { Button } from '@/components/ui/Button';
import { compatibleItems, generateRecommendations } from '@/lib/recommendationService';
import { fetchClothingItems } from '@/lib/wardrobeService';
import { saveOutfit, recordWearEvent, toggleSaveOutfit } from '@/lib/outfitService';

interface OutfitDetailProps {
  recommendation: Recommendation;
  weather?: { temperature: number; rain: boolean; condition: string } | null;
  onClose: () => void;
  onTryInTwin?: (rec: Recommendation) => void;
}

export function OutfitDetail({ recommendation, weather, onClose, onTryInTwin }: OutfitDetailProps) {
  const [outfitItems, setOutfitItems] = useState(recommendation.items);
  const [allItems, setAllItems] = useState<ClothingItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<OutfitSlot | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedOutfitId, setSavedOutfitId] = useState<string | null>(null);

  useEffect(() => {
    fetchClothingItems().then(setAllItems).catch(() => {});
  }, []);

  const handleSlotClick = (slot: OutfitSlot) => {
    setSelectedSlot((prev) => (prev === slot ? null : slot));
  };

  const handleSelectItem = (item: ClothingItem) => {
    setOutfitItems((prev) => {
      const idx = prev.findIndex((o) => o.slot === selectedSlot);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { item, slot: selectedSlot! };
        return copy;
      }
      return [...prev, { item, slot: selectedSlot! }];
    });
    setSelectedSlot(null);
  };

  const handleRegenerate = () => {
    if (allItems.length === 0) return;
    const w = weather ?? { temperature: 22, rain: false };
    const recs = generateRecommendations(allItems, {
      temp: w.temperature,
      rain: w.rain,
      occasion: 'today',
      formality: 'smart casual',
    });
    if (recs.length > 0) {
      setOutfitItems(recs[0].items);
    }
  };

  const handleSave = async () => {
    if (saved && savedOutfitId) {
      await toggleSaveOutfit(savedOutfitId, false);
      setSaved(false);
      return;
    }
    try {
      const result = await saveOutfit(
        {
          name: recommendation.style,
          style: recommendation.style,
          weather: weather?.condition,
          ai_confidence: recommendation.confidence,
          reason: recommendation.reason,
          is_saved: true,
        },
        outfitItems.map((i) => ({ clothing_item_id: i.item.id, slot: i.slot }))
      );
      if (result) {
        setSavedOutfitId(result.id);
        setSaved(true);
      }
    } catch {
      /* ignore */
    }
  };

  const handleWear = async () => {
    try {
      const result = await saveOutfit(
        {
          name: recommendation.style,
          style: recommendation.style,
          weather: weather?.condition,
          ai_confidence: recommendation.confidence,
          reason: recommendation.reason,
        },
        outfitItems.map((i) => ({ clothing_item_id: i.item.id, slot: i.slot }))
      );
      if (result) {
        await recordWearEvent(result.id, 'good', 'today', weather?.condition);
      }
      onClose();
    } catch {
      /* ignore */
    }
  };

  const selectorItems = selectedSlot
    ? compatibleItems(allItems, selectedSlot, outfitItems)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-50 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-3">
        <button onClick={onClose} className="rounded-full p-2 text-ink-600 hover:bg-ink-100">
          <ArrowLeft size={22} />
        </button>
        <h2 className="font-serif text-lg text-ink-900">{recommendation.style}</h2>
        <button
          onClick={handleSave}
          className={`rounded-full p-2 transition-colors ${
            saved ? 'text-accent-600' : 'text-ink-600 hover:bg-ink-100'
          }`}
        >
          <Bookmark size={22} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Confidence + reason */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent-50 px-2.5 py-1 text-sm font-semibold text-accent-700">
            {recommendation.confidence}% match
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{recommendation.reason}</p>
      </div>

      {/* Full body outfit */}
      <div className="flex-1 overflow-y-auto px-5 pt-2">
        <div className="rounded-3xl border border-ink-100 bg-white p-5 shadow-sm">
          <p className="mb-3 text-center text-2xs font-medium uppercase tracking-wider text-ink-400">
            {selectedSlot ? `Tap an item to swap` : 'Tap any item to change it'}
          </p>
          <FullBodyOutfit
            items={outfitItems}
            onSlotClick={handleSlotClick}
            selectedSlot={selectedSlot}
            size="lg"
          />
        </div>

        {/* Item selector */}
        {selectedSlot && (
          <div className="mt-4 rounded-3xl border border-ink-100 bg-white p-4 shadow-sm">
            <ItemSelector
              items={selectorItems}
              slot={selectedSlot}
              onSelect={handleSelectItem}
              currentItemId={outfitItems.find((o) => o.slot === selectedSlot)?.item.id}
            />
          </div>
        )}

        {/* Why I chose this */}
        <div className="mt-4 rounded-2xl bg-ink-100 p-4">
          <h4 className="text-sm font-semibold text-ink-700">Why I chose this</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
            {recommendation.reason}
          </p>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="border-t border-ink-100 bg-ink-50/90 px-5 py-4 safe-bottom backdrop-blur-lg">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {onTryInTwin && (
            <button
              onClick={() => {
                onTryInTwin({ ...recommendation, items: outfitItems });
                onClose();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-white border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-900 shadow-xs hover:bg-ink-100"
            >
              <Wand2 size={16} className="text-accent-700" />
              <span>Try on Digital Twin</span>
            </button>
          )}
          <Button fullWidth size="lg" onClick={handleWear}>
            <Check size={18} /> Wear this
          </Button>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRegenerate}
              className="flex items-center justify-center rounded-full border border-ink-200 p-3 text-ink-600 transition-all hover:bg-ink-100 active:scale-95"
              aria-label="Regenerate"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={() => {
                onClose();
              }}
              className="flex items-center justify-center rounded-full border border-ink-200 p-3 text-ink-600 transition-all hover:bg-ink-100 active:scale-95"
              aria-label="Not for me"
            >
              <ThumbsDown size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
