import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Camera,
  X,
  AlertCircle,
  Search,
  Wand2,
  Trash2,
  Sparkles,
  Layers,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  fetchClothingItems,
  insertClothingItem,
  uploadClothingImage,
  CATEGORIES,
  categoryLabel,
  deleteClothingItem,
  clearAllClothingItems,
  restoreSampleClothingItems,
  checkHasSampleItems,
  analyzeGarmentImage,
  type GarmentAnalysisResult,
} from '@/lib/wardrobeService';
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
  const [isSampleMode, setIsSampleMode] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchClothingItems();
      setItems(data);
      setIsSampleMode(checkHasSampleItems());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleClearSampleData = async () => {
    if (confirm('Clear all sample clothing items and start fresh with your own wardrobe?')) {
      await clearAllClothingItems();
      await load();
      setActionNotice('Sample collection removed. Ready for your personal clothes!');
      setTimeout(() => setActionNotice(null), 3500);
    }
  };

  const handleRestoreSampleData = async () => {
    await restoreSampleClothingItems();
    await load();
    setActionNotice('Sample collection loaded for inspiration.');
    setTimeout(() => setActionNotice(null), 3500);
  };

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
      <div className="sticky top-0 z-20 bg-ink-50/95 px-4 sm:px-6 pt-6 pb-3 backdrop-blur-lg border-b border-ink-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 items-center rounded-md bg-accent-100 px-2 text-2xs font-semibold text-accent-800">
                <Layers size={12} className="mr-1 inline text-accent-700" /> Personal Closet
              </span>
              {isSampleMode ? (
                <span className="text-3xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Sample Data Active
                </span>
              ) : (
                <span className="text-3xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Your Real Wardrobe
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-950 mt-0.5">
              My Wardrobe
            </h1>
            <p className="text-2xs sm:text-xs text-ink-500">
              {items.length} garments logged • Snap photos of your clothes to auto-categorize with AI
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isSampleMode ? (
              <button
                onClick={handleClearSampleData}
                className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-ink-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-xs"
                title="Remove sample clothes and start clean"
              >
                <Trash2 size={13} />
                <span>Start Clean Slate</span>
              </button>
            ) : (
              items.length === 0 && (
                <button
                  onClick={handleRestoreSampleData}
                  className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-stone-50 transition-all shadow-xs"
                >
                  <RefreshCw size={13} />
                  <span>Load Sample Items</span>
                </button>
              )
            )}

            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 rounded-xl bg-ink-950 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-ink-800 transition-all ring-2 ring-sand-300/30"
            >
              <Camera size={15} className="text-sand-300" />
              <span>Snap / Add Garment</span>
            </button>
          </div>
        </div>

        {/* Action toast */}
        {actionNotice && (
          <div className="mt-2.5 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 flex items-center justify-between text-2xs text-emerald-800 animate-fade-in">
            <span className="flex items-center gap-1.5 font-medium">
              <Check size={13} className="text-emerald-600" />
              {actionNotice}
            </span>
          </div>
        )}

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
            if (count === 0 && activeCategory !== cat) return null;
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
          <div className="max-w-md mx-auto py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sand-100 text-sand-800 mb-3">
              <Camera size={26} />
            </div>
            <h3 className="text-lg font-serif font-bold text-ink-950">
              {items.length === 0 ? 'Your personal wardrobe is ready' : 'No items match filter'}
            </h3>
            <p className="text-xs text-ink-600 mt-1 max-w-sm mx-auto leading-relaxed">
              {items.length === 0
                ? 'Add your real clothing items! Take a quick photo with your phone or webcam, and our AI will automatically detect the category, color, and fabric.'
                : 'Try adjusting your search query or selecting All Items.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 rounded-xl bg-ink-950 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-ink-800"
              >
                <Camera size={14} className="text-sand-300" />
                <span>Snap My First Item</span>
              </button>
              {items.length === 0 && (
                <button
                  onClick={handleRestoreSampleData}
                  className="rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-50"
                >
                  Load Sample Closet
                </button>
              )}
            </div>
          </div>
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
  const [isScanning, setIsScanning] = useState(false);
  const [aiDetected, setAiDetected] = useState<GarmentAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processImageFile = async (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setImageUrl(dataUrl);
      if (dataUrl) {
        setIsScanning(true);
        try {
          const aiResult = await analyzeGarmentImage(dataUrl);
          if (aiResult) {
            setAiDetected(aiResult);
            setName(aiResult.name);
            setCategory(aiResult.category);
            setColor(aiResult.color);
            setFormality(aiResult.formality);
          }
        } finally {
          setIsScanning(false);
        }
      }
    };
    reader.readAsDataURL(f);
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
        try {
          uploadedUrl = await uploadClothingImage(file, user.id);
        } catch {
          // If storage mock uses dataUrl fallback
        }
      }
      await insertClothingItem({
        name: name.trim(),
        category,
        color: color.trim() || null,
        formality,
        image_url: uploadedUrl ?? imageUrl,
        status: 'clean',
        wear_count: 0,
      });
      onAdded();
    } catch {
      setError('Could not save item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 backdrop-blur-sm sm:items-center p-3 animate-fade-in">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 pb-8 shadow-2xl border border-ink-100 safe-bottom">
        <div className="mb-4 flex items-center justify-between pb-3 border-b border-ink-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink-950 text-sand-300">
              <Camera size={16} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-ink-950">Add Clothing to Wardrobe</h2>
              <p className="text-2xs text-ink-500">Take or upload a photo to auto-detect fabric & category with AI</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100">
            <X size={18} />
          </button>
        </div>

        {/* Photo upload / Camera */}
        <div className="mb-4">
          {imageUrl ? (
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-ink-100 border border-ink-200">
              <img src={imageUrl} alt="Garment Preview" className="h-full w-full object-cover" />
              <button
                onClick={() => {
                  setImageUrl(null);
                  setFile(null);
                  setAiDetected(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-ink-900/80 p-1.5 text-white hover:bg-ink-900"
                title="Retake photo"
              >
                <X size={15} />
              </button>

              {isScanning && (
                <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                  <Sparkles size={24} className="text-sand-300 animate-spin mb-2" />
                  <p className="text-xs font-semibold">AI Analyzing Garment Fabric & Cut...</p>
                  <p className="text-3xs text-ink-300">Detecting category, color, and formality</p>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-ink-50/50 hover:bg-ink-100/50 text-ink-500 transition-colors p-4 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs text-ink-800 mb-2">
                <Camera size={20} />
              </div>
              <span className="text-xs font-semibold text-ink-900">Take or Upload Garment Photo</span>
              <span className="text-3xs text-ink-500 mt-0.5">Snap a hanger shot or flat lay of your clothes</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processImageFile(f);
            }}
          />
        </div>

        {/* AI Detection Banner */}
        {aiDetected && (
          <div className="mb-4 rounded-xl bg-sand-50 border border-sand-200 p-2.5 flex items-start gap-2 text-2xs text-sand-900">
            <Sparkles size={14} className="text-sand-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">AI Autodetected:</span> {aiDetected.material ? `${aiDetected.material} • ` : ''}
              {aiDetected.stylingNote || 'Form fields pre-filled from your image.'}
            </div>
          </div>
        )}

        {/* Name */}
        <div className="mb-3">
          <label className="mb-1 block text-2xs font-bold uppercase tracking-wider text-ink-600">
            Garment Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Vintage Wash Denim Jacket, White Poplin Shirt..."
            className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-ink-900 outline-none focus:border-ink-900 focus:ring-1 focus:ring-ink-900"
          />
        </div>

        {/* Category */}
        <div className="mb-3">
          <label className="mb-1 block text-2xs font-bold uppercase tracking-wider text-ink-600">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                  category === cat
                    ? 'border-ink-950 bg-ink-950 text-white font-semibold shadow-xs'
                    : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-100'
                }`}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Color & Formality in 2 cols */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="mb-1 block text-2xs font-bold uppercase tracking-wider text-ink-600">
              Color
            </label>
            <input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Navy, Off-white, Olive"
              className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2 text-xs text-ink-900 outline-none focus:border-ink-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-2xs font-bold uppercase tracking-wider text-ink-600">
              Formality
            </label>
            <select
              value={formality}
              onChange={(e) => setFormality(e.target.value as Formality)}
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs text-ink-900 outline-none focus:border-ink-900"
            >
              <option value="casual">Casual</option>
              <option value="smart casual">Smart Casual</option>
              <option value="formal">Formal</option>
            </select>
          </div>
        </div>

        {error && (
          <p className="mb-3 rounded-xl bg-red-50 p-2 text-2xs font-medium text-red-600">{error}</p>
        )}

        <Button fullWidth size="lg" onClick={handleSave} disabled={saving || isScanning}>
          {saving ? (
            <Spinner size="sm" className="border-ink-200 border-t-ink-50" />
          ) : (
            'Add to My Wardrobe'
          )}
        </Button>
      </div>
    </div>
  );
}

