import type { ClothingItem, OutfitSlot } from '@/lib/types';

interface FullBodyOutfitProps {
  items: { item: ClothingItem; slot: OutfitSlot }[];
  onSlotClick?: (slot: OutfitSlot) => void;
  selectedSlot?: OutfitSlot | null;
  size?: 'sm' | 'md' | 'lg';
}

const SLOT_ORDER: OutfitSlot[] = ['accessory', 'outerwear', 'top', 'dress', 'bottom', 'shoes'];
const SLOT_LABELS: Record<OutfitSlot, string> = {
  top: 'Top',
  bottom: 'Bottom',
  dress: 'Dress',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessory: 'Accessory',
};

export function FullBodyOutfit({
  items,
  onSlotClick,
  selectedSlot,
  size = 'md',
}: FullBodyOutfitProps) {
  const sorted = [...items].sort(
    (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot)
  );

  const hasDress = items.some((i) => i.slot === 'dress');

  // Layout: accessory/top/outerwear stacked on top, then bottom or dress, then shoes
  const topSection = sorted.filter((i) =>
    ['accessory', 'top', 'outerwear'].includes(i.slot)
  );
  const midSection = sorted.filter((i) =>
    hasDress ? i.slot === 'dress' : i.slot === 'bottom'
  );
  const bottomSection = sorted.filter((i) => i.slot === 'shoes');

  const heights = {
    sm: { top: 'h-24', mid: 'h-28', bottom: 'h-16', img: 'h-full' },
    md: { top: 'h-32', mid: 'h-40', bottom: 'h-20', img: 'h-full' },
    lg: { top: 'h-40', mid: 'h-52', bottom: 'h-24', img: 'h-full' },
  };
  const h = heights[size];

  const renderItem = (entry: { item: ClothingItem; slot: OutfitSlot }) => {
    const isSel = selectedSlot === entry.slot;
    const isTop = ['accessory', 'top', 'outerwear'].includes(entry.slot);
    const isMid = ['bottom', 'dress'].includes(entry.slot);
    const heightClass = isTop ? h.top : isMid ? h.mid : h.bottom;
    return (
      <div
        key={entry.item.id}
        onClick={() => onSlotClick?.(entry.slot)}
        className={`relative flex-1 ${heightClass} overflow-hidden rounded-xl bg-ink-100 transition-all duration-200 ${
          onSlotClick ? 'cursor-pointer hover:shadow-md' : ''
        } ${isSel ? 'ring-2 ring-ink-900' : ''}`}
      >
        {entry.item.image_url ? (
          <img
            src={entry.item.image_url}
            alt={entry.item.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-2 text-center text-2xs text-ink-400">
            {entry.item.name}
          </div>
        )}
        {onSlotClick && (
          <span className="absolute bottom-1 left-1 rounded bg-ink-900/60 px-1.5 py-0.5 text-2xs font-medium text-white">
            {SLOT_LABELS[entry.slot]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Top section: accessory + outerwear + top in a row */}
      {topSection.length > 0 && (
        <div className="flex w-full gap-2">
          {topSection.map(renderItem)}
        </div>
      )}
      {/* Mid section: dress or bottom */}
      {midSection.length > 0 && (
        <div className="flex w-full gap-2">
          {midSection.map(renderItem)}
        </div>
      )}
      {/* Bottom section: shoes */}
      {bottomSection.length > 0 && (
        <div className="flex w-full gap-2">
          {bottomSection.map(renderItem)}
        </div>
      )}
    </div>
  );
}
