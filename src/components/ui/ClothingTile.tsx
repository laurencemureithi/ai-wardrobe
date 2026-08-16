import type { ClothingItem } from '@/lib/types';

interface ClothingTileProps {
  item: ClothingItem;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
}

export function ClothingTile({ item, size = 'md', onClick, selected }: ClothingTileProps) {
  const sizes = {
    sm: 'w-20 h-24',
    md: 'w-full aspect-[3/4]',
    lg: 'w-full aspect-[3/4]',
  };
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-ink-100 transition-all duration-200 ${
        selected ? 'ring-2 ring-ink-900 ring-offset-2 ring-offset-ink-50' : ''
      } ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${sizes[size]}`}
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-ink-300">
          <span className="text-xs">No image</span>
        </div>
      )}
      {item.status !== 'clean' && item.status !== 'ready' && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-ink-900/70 px-1.5 py-0.5 text-2xs font-medium text-white">
          {item.status.replace('_', ' ')}
        </span>
      )}
    </button>
  );
}
