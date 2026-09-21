import { useEffect, useState, useCallback } from 'react';
import { Plus, Camera, X, AlertCircle, Search, Wand2 } from 'lucide-react';
import { fetchClothingItems, insertClothingItem, uploadClothingImage, CATEGORIES, categoryLabel, deleteClothingItem } from '@/lib/wardrobeService';
import { useAuth } from '@/lib/auth';
import type { ClothingItem, ClothingCategory, Formality, ClothingStatus } from '@/lib/types';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

interface WardrobeScreenProps {
  onTryInTwin?: (item: ClothingItem) => void;
}

export function WardrobeScreen({ onTryInTwin }: WardrobeScreenProps) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchClothingItems();
      setItems(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdateStatus = (itemId: string, newStatus: ClothingStatus) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i))
    );
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const filtered = items.filter((i) => {
    if (activeCategory !== 'all' && i.category !== activeCategory) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          title="Couldn't load your wardrobe"
          description="Something went wrong. Let's try again."
          action={<Button onClick={load} variant="outline">Try again</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-ink-50/90 px-4 sm:px-6 pt-8 pb-3 backdrop-blur-lg border-b border-ink-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-950">Wardrobe</h1>
            <p className="text-2xs sm:text-xs text-ink-500">
              {items.length} items logged • Track wear counts, laundry status & virtual fitting
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-xl bg-ink-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-ink-800 transition-all active:scale-95"
          >
            <Plus size={16} /> Add Garment
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, color, or fabric..."
            className="w-full rounded-2xl border border-ink-200 bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:ring-2 focus:ring-ink-900"
          />
        </div>

        {/* Category tabs */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex-shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-ink-950 text-white shadow-xs'
                : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-100'
            }`}
          >
            All Items ({items.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-ink-950 text-white shadow-xs'
                    : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-100'
                }`}
              >
                {categoryLabel(cat)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 sm:px-6 pt-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Plus size={28} />}
            title={items.length === 0 ? 'Your wardrobe is empty' : 'No items found'}
            description={
              items.length === 0
                ? 'Add your first clothing item to get started.'
                : 'Try a different category filter or search term.'
            }
            action={
              items.length === 0 ? (
                <Button onClick={() => setShowAdd(true)}>Add clothing</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group cursor-pointer rounded-2xl bg-white border border-ink-100 p-2.5 shadow-xs hover:border-ink-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-ink-100 mb-2">
                    <img
                      src={item.image_url || ''}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.status && item.status !== 'clean' && (
                      <span className="absolute top-1.5 right-1.5 rounded-full bg-amber-500 px-2 py-0.5 text-3xs font-bold text-white shadow-xs">
                        {item.status === 'needs_washing' ? 'Wash' : 'Laundry'}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs font-bold text-ink-900">{item.name}</p>
                  <p className="text-2xs text-ink-500 capitalize">
                    {item.color || 'Classic'} • {item.formality || 'Everyday'}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-ink-100 flex items-center justify-between text-3xs text-ink-400">
                  <span>Worn {item.wear_count}x</span>
                  <span className="text-accent-700 font-semibold flex items-center gap-0.5">
                    <Wand2 size={10} /> Try On
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ITEM DETAIL & LAUNDRY MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl border border-ink-100">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <h3 className="text-base font-serif font-bold text-ink-950">Garment Details</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-full bg-ink-100 p-1.5 text-ink-500 hover:bg-ink-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-ink-100 border border-ink-200">
                <img
                  src={selectedItem.image_url || ''}
                  alt={selectedItem.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h4 className="text-lg font-serif font-bold text-ink-950">{selectedItem.name}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="rounded-md bg-ink-100 px-2 py-0.5 text-2xs font-semibold text-ink-700 capitalize">
                    {selectedItem.category}
                  </span>
                  <span className="rounded-md bg-ink-100 px-2 py-0.5 text-2xs font-semibold text-ink-700 capitalize">
                    {selectedItem.color || 'Neutral'}
                  </span>
                  <span className="rounded-md bg-ink-100 px-2 py-0.5 text-2xs font-semibold text-ink-700 capitalize">
                    {selectedItem.formality || 'Smart Casual'}
                  </span>
                </div>
              </div>

              {/* Laundry Status Selector */}
              <div className="rounded-2xl bg-ink-50 p-3 border border-ink-100">
                <label className="text-2xs font-bold uppercase tracking-wider text-ink-500 block mb-2">
                  Laundry & Readiness Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'clean', label: 'Clean' },
                      { id: 'needs_washing', label: 'Needs Wash' },
                      { id: 'washing', label: 'In Laundry' },
                    ] as { id: ClothingStatus; label: string }[]
                  ).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleUpdateStatus(selectedItem.id, s.id)}
                      className={`rounded-xl py-1.5 text-xs font-semibold border transition-all ${
                        (selectedItem.status || 'clean') === s.id
                          ? 'bg-ink-950 text-white border-ink-950 shadow-xs'
                          : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-ink-100">
                {onTryInTwin && (
                  <button
                    onClick={() => {
                      onTryInTwin(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-ink-950 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-ink-800"
                  >
                    <Wand2 size={14} className="text-sand-300" />
                    <span>See on Digital Twin</span>
                  </button>
                )}

                <button
                  onClick={async () => {
                    await deleteClothingItem(selectedItem.id);
                    setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
                    setSelectedItem(null);
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <AddClothingModal
          onClose={() => setShowAdd(false)}
          onAdded={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function AddClothingModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [color, setColor] = useState('');
  const [formality, setFormality] = useState<Formality>('casual');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please give your item a name.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let uploadedUrl: string | null = null;
      if (file && user) {
        uploadedUrl = await uploadClothingImage(file, user.id);
      }
      await insertClothingItem({
        name: name.trim(),
        category,
        color: color.trim() || null,
        formality,
        image_url: uploadedUrl ?? imageUrl,
        status: 'clean',
      });
      onAdded();
    } catch {
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 backdrop-blur-sm sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-ink-50 p-6 pb-8 animate-slide-up safe-bottom sm:rounded-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink-900">Add to wardrobe</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100">
            <X size={20} />
          </button>
        </div>

        {/* Photo upload */}
        <div className="mb-4">
          {imageUrl ? (
            <div className="relative">
              <img src={imageUrl} alt="Preview" className="h-48 w-full rounded-2xl object-cover" />
              <button
                onClick={() => {
                  setImageUrl(null);
                  setFile(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-ink-900/70 p-1.5 text-white"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-white text-ink-400 transition-colors hover:border-ink-400 hover:text-ink-600">
              <Camera size={24} />
              <span className="mt-2 text-sm">Take or upload a photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
          )}
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Item name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Navy linen shirt"
            className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-300 focus:border-ink-400"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${
                  category === cat
                    ? 'border-ink-900 bg-ink-900 text-ink-50'
                    : 'border-ink-200 bg-white text-ink-600'
                }`}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Colour (optional)</label>
          <input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g. navy, white, olive"
            className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none placeholder:text-ink-300 focus:border-ink-400"
          />
        </div>

        {/* Formality */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-ink-700">Formality</label>
          <div className="flex gap-2">
            {(['casual', 'smart casual', 'formal'] as Formality[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormality(f)}
                className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition-all ${
                  formality === f
                    ? 'border-ink-900 bg-ink-900 text-ink-50'
                    : 'border-ink-200 bg-white text-ink-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <Button fullWidth size="lg" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size="sm" className="border-ink-200 border-t-ink-50" /> : 'Add to wardrobe'}
        </Button>
      </div>
    </div>
  );
}

