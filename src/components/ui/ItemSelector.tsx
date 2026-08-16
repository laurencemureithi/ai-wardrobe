import type { ClothingItem, OutfitSlot } from '@/lib/types';
import { ClothingTile } from './ClothingTile';

interface ItemSelectorProps {
  items: ClothingItem[];
  onSelect: (item: ClothingItem) => void;
  slot: OutfitSlot;
  currentItemId?: string;
}

const SLOT_LABELS: Record<OutfitSlot, string> = {
  top: 'Tops',
  bottom: 'Bottoms',
  dress: 'Dresses',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessory: 'Accessories',
};

export function ItemSelector({ items, onSelect, slot, currentItemId }: ItemSelectorProps) {
  return (
    <div className="animate-slide-up">
      <div className="mb-3 flex items-center justify-between px-1">
        <h4 className="font-serif text-lg text-ink-900">{SLOT_LABELS[slot]}</h4>
        <span className="text-sm text-ink-400">{items.length} items</span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl bg-ink-100 p-8 text-center">
          <p className="text-sm text-ink-400">
            No items in this category yet. Add some to your wardrobe to swap.
          </p>
        </div>
      ) : (
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {items.map((item) => (
            <div key={item.id} className="w-28 flex-shrink-0">
              <ClothingTile
                item={item}
                size="md"
                onClick={() => onSelect(item)}
                selected={item.id === currentItemId}
              />
              <p className="mt-1.5 truncate text-center text-2xs font-medium text-ink-600">
                {item.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
