import { Bookmark, RefreshCw, ThumbsDown, Check, Wand2 } from 'lucide-react';
import type { ClothingItem, OutfitSlot } from '@/lib/types';
import { FullBodyOutfit } from './FullBodyOutfit';

interface OutfitCardProps {
  index: number;
  style: string;
  items: { item: ClothingItem; slot: OutfitSlot }[];
  confidence: number;
  reason: string;
  onWear: () => void;
  onSave: () => void;
  onReject: () => void;
  onRegenerate: () => void;
  onTap?: () => void;
  onTryInTwin?: () => void;
  saved?: boolean;
  worn?: boolean;
}

export function OutfitCard({
  index,
  style,
  items,
  confidence,
  reason,
  onWear,
  onSave,
  onReject,
  onRegenerate,
  onTap,
  onTryInTwin,
  saved,
  worn,
}: OutfitCardProps) {
  return (
    <div className="animate-slide-up rounded-3xl border border-ink-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">
            Look {String(index + 1).padStart(2, '0')}
          </p>
          <h3 className="font-serif text-xl text-ink-900">{style}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-accent-50 px-2.5 py-1 text-sm font-semibold text-accent-700">
            {typeof confidence === 'number' && confidence <= 1 ? Math.round(confidence * 100) : confidence}% match
          </span>
          {onTryInTwin && (
            <button
              onClick={onTryInTwin}
              className="flex items-center gap-1 rounded-full bg-sand-100 hover:bg-sand-200 px-2.5 py-0.5 text-2xs font-semibold text-sand-900 transition-colors"
            >
              <Wand2 size={11} className="text-accent-700" />
              <span>Try on Twin</span>
            </button>
          )}
        </div>
      </div>

      {/* Outfit visual */}
      <div onClick={onTap} className={onTap ? 'cursor-pointer' : ''}>
        <FullBodyOutfit items={items} size="md" />
      </div>

      {/* Item names */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span
            key={i.item.id}
            className="rounded-full bg-ink-100 px-2.5 py-1 text-2xs font-medium text-ink-600"
          >
            {i.item.color ? `${i.item.color} ` : ''}
            {i.item.name.toLowerCase().includes(i.item.color ?? '_')
              ? i.item.name
              : i.item.name}
          </span>
        ))}
      </div>

      {/* Reason */}
      <p className="mt-3 text-sm leading-relaxed text-ink-500">{reason}</p>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={onWear}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-medium transition-all active:scale-95 ${
            worn
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-ink-900 text-ink-50 hover:bg-ink-800'
          }`}
        >
          <Check size={16} /> {worn ? 'Worn Today' : 'Wear this'}
        </button>

        {onTryInTwin && (
          <button
            onClick={onTryInTwin}
            className="flex items-center justify-center gap-1.5 rounded-full border border-ink-200 bg-sand-50/60 hover:bg-sand-100 px-3.5 py-2.5 text-sm font-semibold text-ink-800 transition-all active:scale-95"
          >
            <Wand2 size={16} className="text-accent-700" />
            <span className="hidden sm:inline">Try on Twin</span>
          </button>
        )}

        <button
          onClick={onSave}
          className={`flex items-center justify-center rounded-full border p-2.5 transition-all active:scale-95 ${
            saved
              ? 'border-accent-500 bg-accent-50 text-accent-600'
              : 'border-ink-200 text-ink-600 hover:bg-ink-100'
          }`}
          aria-label="Save look"
        >
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <button
          onClick={onReject}
          className="flex items-center justify-center rounded-full border border-ink-200 p-2.5 text-ink-600 transition-all hover:bg-ink-100 active:scale-95"
          aria-label="Not for me"
        >
          <ThumbsDown size={18} />
        </button>
        <button
          onClick={onRegenerate}
          className="flex items-center justify-center rounded-full border border-ink-200 p-2.5 text-ink-600 transition-all hover:bg-ink-100 active:scale-95"
          aria-label="Regenerate"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
}
