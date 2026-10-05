import { useState, useEffect } from 'react';
import {
  Sparkles,
  Camera,
  Layers,
  Check,
  Bookmark,
  Shuffle,
  Trash2,
  ChevronRight,
  Maximize2,
  Wand2,
  SlidersHorizontal,
  Info,
  RotateCw,
} from 'lucide-react';
import {
  type DigitalTwinProfile,
  type Recommendation,
  type ClothingItem,
  type OutfitSlot,
  type PresentationContext,
} from '@/lib/types';
import {
  loadDigitalTwinProfile,
  saveDigitalTwinProfile,
  getPosesForContext,
  DEMO_TWIN_MODELS,
  generatePhotoshootSequence,
  type PhotoshootShot,
  type AvatarGenerationResult,
} from '@/lib/digitalTwinService';
import {
  parseAndApplyFashionPrompt,
  type MannequinPositionId,
  type FashionPromptResult,
} from '@/lib/mannequinFitEngine';
import { LiveMannequin } from '@/components/ui/LiveMannequin';
import { PhotorealisticTwinStage } from '@/components/ui/PhotorealisticTwinStage';
import { fetchClothingItems } from '@/lib/wardrobeService';
import { saveOutfit } from '@/lib/outfitService';
import { Spinner } from '@/components/ui/Spinner';
import { AvatarCreatorModal } from '@/components/ui/AvatarCreatorModal';
import { USER_AVATAR_PRESETS } from '@/lib/digitalTwinService';

interface DigitalTwinScreenProps {
  initialOutfit?: Recommendation | null;
  onNavigateHome?: () => void;
  onNavigateWardrobe?: () => void;
}

export function DigitalTwinScreen({
  initialOutfit,
  onNavigateWardrobe,
}: DigitalTwinScreenProps) {
  const [profile, setProfile] = useState<DigitalTwinProfile>(loadDigitalTwinProfile());
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [activeSlot, setActiveSlot] = useState<OutfitSlot | 'all'>('all');
  const [activeOutfitItems, setActiveOutfitItems] = useState<
    { item: ClothingItem; slot: OutfitSlot }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [photoshootMode, setPhotoshootMode] = useState(false);
  const [photoshootShots, setPhotoshootShots] = useState<PhotoshootShot[]>([]);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activePositionId, setActivePositionId] = useState<MannequinPositionId>('front');
  const [twinViewMode, setTwinViewMode] = useState<'photorealistic' | 'wireframe'>('photorealistic');
  const [fashionPrompt, setFashionPrompt] = useState('');
  const [isStylingPrompt, setIsStylingPrompt] = useState(false);
  const [promptResult, setPromptResult] = useState<FashionPromptResult | null>(null);

  const handlePresetSelect = (preset: (typeof USER_AVATAR_PRESETS)[0]) => {
    const updated: DigitalTwinProfile = {
      ...profile,
      referencePhotoUrl: preset.photoUrl,
      displayName: preset.name.split(' ')[0],
      presentationContext: preset.context,
      customAvatarGenerated: true,
      skinTone: preset.skinTone,
      lastUpdated: new Date().toISOString(),
    };
    setProfile(updated);
    saveDigitalTwinProfile(updated);
  };

  const handleApplyFashionPrompt = (promptText: string) => {
    if (!promptText.trim()) return;
    setIsStylingPrompt(true);
    setTimeout(() => {
      const res = parseAndApplyFashionPrompt(promptText, clothing);
      if (res.equippedItems.length > 0) {
        setActiveOutfitItems(res.equippedItems);
      }
      setPromptResult(res);
      setIsStylingPrompt(false);
    }, 350);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const items = await fetchClothingItems();
      setClothing(items);

      if (initialOutfit && initialOutfit.items.length > 0) {
        setActiveOutfitItems(initialOutfit.items);
      } else {
        // Default ensemble
        const defaultTop = items.find((i) => i.category === 'tops');
        const defaultBottom = items.find((i) => i.category === 'bottoms');
        const defaultShoes = items.find((i) => i.category === 'shoes');
        const defaultOuter = items.find((i) => i.category === 'outerwear');

        const initialList: { item: ClothingItem; slot: OutfitSlot }[] = [];
        if (defaultTop) initialList.push({ item: defaultTop, slot: 'top' });
        if (defaultBottom) initialList.push({ item: defaultBottom, slot: 'bottom' });
        if (defaultOuter) initialList.push({ item: defaultOuter, slot: 'outerwear' });
        if (defaultShoes) initialList.push({ item: defaultShoes, slot: 'shoes' });
        setActiveOutfitItems(initialList);
      }
      setLoading(false);
    }
    loadData();
  }, [initialOutfit]);

  const poses = getPosesForContext(profile.presentationContext);
  const currentPose = poses.find((p) => p.id === profile.activePoseId) || poses[0];
  const modelAsset = DEMO_TWIN_MODELS[profile.presentationContext];

  const handlePoseChange = (poseId: string) => {
    const updated = { ...profile, activePoseId: poseId, lastUpdated: new Date().toISOString() };
    setProfile(updated);
    saveDigitalTwinProfile(updated);
  };

  const handlePresentationChange = (ctx: PresentationContext) => {
    const contextPoses = getPosesForContext(ctx);
    const updated: DigitalTwinProfile = {
      ...profile,
      presentationContext: ctx,
      activePoseId: contextPoses[0].id,
      lastUpdated: new Date().toISOString(),
    };
    setProfile(updated);
    saveDigitalTwinProfile(updated);
  };

  // Direct equip of a clothing item
  const handleEquipItem = (item: ClothingItem, targetSlot?: OutfitSlot) => {
    const slot: OutfitSlot =
      targetSlot ||
      (item.category === 'tops'
        ? 'top'
        : item.category === 'bottoms'
        ? 'bottom'
        : item.category === 'shoes'
        ? 'shoes'
        : item.category === 'accessories'
        ? 'accessory'
        : 'outerwear');

    setActiveOutfitItems((prev) => {
      const filtered = prev.filter((i) => i.slot !== slot);
      return [...filtered, { item, slot }];
    });
  };

  const handleRemoveSlot = (slot: OutfitSlot) => {
    setActiveOutfitItems((prev) => prev.filter((i) => i.slot !== slot));
  };

  const handleClearAllGarments = () => {
    setActiveOutfitItems([]);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, item: ClothingItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (raw) {
        const item: ClothingItem = JSON.parse(raw);
        handleEquipItem(item);
      }
    } catch {
      /* ignore */
    }
  };

  const handleShuffleOutfit = () => {
    const tops = clothing.filter((c) => c.category === 'tops');
    const bottoms = clothing.filter((c) => c.category === 'bottoms');
    const shoes = clothing.filter((c) => c.category === 'shoes');
    const outerwear = clothing.filter((c) => c.category === 'outerwear');

    const newEnsemble: { item: ClothingItem; slot: OutfitSlot }[] = [];
    if (tops.length)
      newEnsemble.push({ item: tops[Math.floor(Math.random() * tops.length)], slot: 'top' });
    if (bottoms.length)
      newEnsemble.push({
        item: bottoms[Math.floor(Math.random() * bottoms.length)],
        slot: 'bottom',
      });
    if (shoes.length)
      newEnsemble.push({ item: shoes[Math.floor(Math.random() * shoes.length)], slot: 'shoes' });
    if (outerwear.length && Math.random() > 0.4) {
      newEnsemble.push({
        item: outerwear[Math.floor(Math.random() * outerwear.length)],
        slot: 'outerwear',
      });
    }

    setActiveOutfitItems(newEnsemble);
  };

  const handleAvatarGenerated = (result: AvatarGenerationResult) => {
    const updated: DigitalTwinProfile = {
      ...profile,
      referencePhotoUrl: result.referencePhotoUrl,
      generatedAvatarUrl: result.avatarUrl,
      customAvatarGenerated: true,
      livingStateEnabled: true,
      skinTone: result.skinTone,
      skinToneHex: result.skinToneHex,
      skinShadowHex: result.skinShadowHex,
      skinHighlightHex: result.skinHighlightHex,
      hairStyle: result.hairStyle,
      hairColor: result.hairColor,
      hairColorHex: result.hairColorHex,
      eyeColor: result.eyeColor,
      faceShape: result.faceShape,
      bodyType: result.bodyType,
      aestheticVibe: result.aestheticVibe,
      displayName: result.displayName || profile.displayName,
      avatarLikenessNotes: result.notes,
      lastUpdated: new Date().toISOString(),
    };
    setProfile(updated);
    saveDigitalTwinProfile(updated);
    setShowAvatarCreator(false);
  };

  const handleUpdateTwinFraming = (framing: { faceOffsetY?: number; faceOffsetX?: number; faceScale?: number }) => {
    const updated: DigitalTwinProfile = {
      ...profile,
      ...framing,
      lastUpdated: new Date().toISOString(),
    };
    setProfile(updated);
    saveDigitalTwinProfile(updated);
  };

  const handleResetToBlankAvatar = () => {
    const updated: DigitalTwinProfile = {
      ...profile,
      referencePhotoUrl: null,
      generatedAvatarUrl: undefined,
      customAvatarGenerated: false,
      lastUpdated: new Date().toISOString(),
    };
    setProfile(updated);
    saveDigitalTwinProfile(updated);
  };

  const handleStartPhotoshoot = () => {
    const shots = generatePhotoshootSequence(profile.presentationContext);
    setPhotoshootShots(shots);
    setCurrentShotIndex(0);
    setPhotoshootMode(true);
  };

  const handleSaveCurrentLook = async () => {
    if (activeOutfitItems.length === 0) return;
    try {
      await saveOutfit(
        {
          name: `Atelier Look (${profile.presentationContext})`,
          occasion: currentPose.occasion,
          style: currentPose.category,
          ai_confidence: 0.97,
          reason: `Created in Living Digital Twin Fitting Room. Pose: ${currentPose.name}`,
        },
        activeOutfitItems.map((i) => ({ clothing_item_id: i.item.id, slot: i.slot }))
      );
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredClothing = clothing.filter((item) => {
    if (activeSlot === 'all') return true;
    if (activeSlot === 'top') return item.category === 'tops';
    if (activeSlot === 'bottom') return item.category === 'bottoms';
    if (activeSlot === 'outerwear') return item.category === 'outerwear';
    if (activeSlot === 'shoes') return item.category === 'shoes';
    if (activeSlot === 'accessory') return item.category === 'accessories';
    return true;
  });

  return (
    <div className="min-h-screen bg-ink-50 pb-28 md:pb-12 pt-4 px-3 sm:px-6 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-100 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 items-center rounded-md bg-accent-100 px-2 text-2xs font-semibold text-accent-800">
              <Sparkles size={12} className="mr-1 inline text-accent-700" /> Living Fitting Room
            </span>
            <span className="text-2xs text-ink-500 font-medium">Atelier AI Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-950 mt-1">
            My Living Digital Twin
          </h1>
          <p className="text-xs sm:text-sm text-ink-600">
            {profile.customAvatarGenerated
              ? 'Your personalized living avatar is active. Drag or tap garments below to style in real time.'
              : 'Take a photo of yourself to generate an avatar that looks like you, then drag clothes onto it.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAvatarCreator(true)}
            className="flex items-center gap-1.5 rounded-xl bg-ink-950 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-ink-800 transition-all ring-2 ring-sand-300/30"
          >
            <Camera size={15} className="text-sand-300" />
            <span>{profile.customAvatarGenerated ? 'Update My Photo' : 'Take My Photo'}</span>
          </button>
          <button
            onClick={handleShuffleOutfit}
            className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-800 shadow-xs hover:bg-ink-100"
          >
            <Shuffle size={14} />
            <span>AI Remix</span>
          </button>
          <button
            onClick={handleStartPhotoshoot}
            className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-800 shadow-xs hover:bg-ink-100"
          >
            <Maximize2 size={14} />
            <span>5-Shot Lookbook</span>
          </button>
        </div>
      </div>

      {/* AI FASHION PROMPT STUDIO */}
      <div className="mb-6 rounded-3xl bg-white p-5 border border-ink-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-100 text-accent-800">
              <Wand2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-ink-950 flex items-center gap-2">
                <span>AI Fashion Prompt Studio</span>
                <span className="rounded-full bg-accent-50 text-accent-700 text-3xs px-2 py-0.5 border border-accent-200">
                  Live Mannequin Styling
                </span>
              </h2>
              <p className="text-2xs text-ink-500">
                Type any style request to dynamically dress the mannequin and test how attire behaves in real-time.
              </p>
            </div>
          </div>
          {promptResult && (
            <span className="text-3xs text-ink-500 self-start md:self-auto bg-ink-50 px-2.5 py-1 rounded-full border border-ink-100">
              Style applied: <strong className="text-ink-900">{promptResult.styleTitle}</strong>
            </span>
          )}
        </div>

        {/* Prompt Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleApplyFashionPrompt(fashionPrompt);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={fashionPrompt}
            onChange={(e) => setFashionPrompt(e.target.value)}
            placeholder="Type a style prompt: e.g. 'All-black minimalist look', 'Smart casual for evening dinner', 'Cozy layers with coat'..."
            className="w-full rounded-2xl bg-ink-50/70 border border-ink-200 pl-4 pr-32 py-3 text-xs sm:text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-950/20 focus:border-ink-950 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!fashionPrompt.trim() || isStylingPrompt}
            className="absolute right-1.5 flex items-center gap-1.5 rounded-xl bg-ink-950 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isStylingPrompt ? (
              <>
                <RotateCw size={13} className="animate-spin text-sand-300" />
                <span>Styling...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} className="text-sand-300" />
                <span>Dress Mannequin</span>
              </>
            )}
          </button>
        </form>

        {/* Preset Style Prompts */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-3xs font-semibold text-ink-400 uppercase mr-1">Quick Prompts:</span>
          {[
            'All-Black Minimalist',
            'Smart Casual Dinner',
            'White Shirt & Tailored Trousers',
            'Layered Autumn Trench',
            'Modern Boardroom Formal',
            'Relaxed Weekend Coffee',
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => {
                setFashionPrompt(promptText);
                handleApplyFashionPrompt(promptText);
              }}
              className="rounded-full bg-ink-50 px-2.5 py-1 text-2xs font-medium text-ink-700 hover:bg-ink-100 hover:text-ink-950 border border-ink-200/70 transition-all"
            >
              ⚡ {promptText}
            </button>
          ))}
        </div>

        {/* Styling feedback toast */}
        {promptResult && (
          <div className="mt-3 rounded-2xl bg-sand-50/80 border border-sand-200/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-700 animate-fade-in">
            <div className="flex items-start gap-2">
              <Sparkles size={15} className="text-sand-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-ink-900">{promptResult.styleTitle}</p>
                <p className="text-2xs text-ink-600">{promptResult.reasoning}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
              <span className="text-3xs font-semibold text-sand-800 bg-sand-200/60 px-2 py-0.5 rounded-md">
                {promptResult.equippedItems.length} Garments Fitted
              </span>
            </div>
          </div>
        )}
      </div>

      {/* DIGITAL TWIN REALISM SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-ink-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setTwinViewMode('photorealistic')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              twinViewMode === 'photorealistic'
                ? 'bg-ink-950 text-white shadow-xs'
                : 'text-ink-600 hover:text-ink-950 hover:bg-stone-50'
            }`}
          >
            <Sparkles size={13} className={twinViewMode === 'photorealistic' ? 'text-sand-300' : 'text-accent-600'} />
            <span>Photorealistic Real Human</span>
          </button>
          <button
            type="button"
            onClick={() => setTwinViewMode('wireframe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              twinViewMode === 'wireframe'
                ? 'bg-ink-950 text-white shadow-xs font-semibold'
                : 'text-ink-500 hover:text-ink-950 hover:bg-stone-50'
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Tailor Wireframe</span>
          </button>
        </div>

        <p className="text-2xs text-ink-500">
          {twinViewMode === 'photorealistic'
            ? '✨ Authentic studio model photography with real skin, lighting & drape'
            : '📐 Technical architectural tailoring measurements'}
        </p>
      </div>

      {/* LIVE INTERACTIVE MANNEQUIN STAGE */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mb-6 transition-all duration-300 rounded-3xl ${
          isDragOver ? 'ring-4 ring-accent-500 scale-[1.01]' : ''
        }`}
      >
        {twinViewMode === 'photorealistic' ? (
          <PhotorealisticTwinStage
            equippedItems={activeOutfitItems}
            userReferencePhotoUrl={profile.referencePhotoUrl}
            userName={profile.displayName || 'You'}
            gender={profile.presentationContext}
            twinProfile={profile}
            onEquipItem={handleEquipItem}
            onRemoveSlot={handleRemoveSlot}
            isDragOver={isDragOver}
            onOpenAvatarCreator={() => setShowAvatarCreator(true)}
            activePoseId={profile.activePoseId}
            onPoseChange={(poseId) => {
              const updated = { ...profile, activePoseId: poseId };
              setProfile(updated);
              saveDigitalTwinProfile(updated);
            }}
            onSelectPreset={handlePresetSelect}
            onResetToBlank={handleResetToBlankAvatar}
            onUpdateTwinFraming={handleUpdateTwinFraming}
          />
        ) : (
          <LiveMannequin
            equippedItems={activeOutfitItems}
            activePositionId={activePositionId}
            onPositionChange={(posId) => setActivePositionId(posId)}
            userReferencePhotoUrl={profile.referencePhotoUrl}
            userName={profile.displayName || 'Alex'}
            gender={profile.presentationContext}
            onEquipItem={handleEquipItem}
            onRemoveSlot={handleRemoveSlot}
            isDragOver={isDragOver}
          />
        )}

        {/* Bottom Actions Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-2">
            <span className="text-2xs text-ink-500">
              Active Attire: <strong>{activeOutfitItems.length} items</strong> equipped
            </span>
            {activeOutfitItems.length > 0 && (
              <button
                onClick={handleClearAllGarments}
                className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-2xs font-medium text-ink-600 border border-ink-200 shadow-xs hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <Trash2 size={12} />
                <span>Undress Model</span>
              </button>
            )}
          </div>

          <button
            onClick={handleSaveCurrentLook}
            className="flex items-center gap-1.5 rounded-xl bg-ink-950 text-white px-4 py-2 text-xs font-semibold shadow-xs hover:bg-ink-800 transition-all"
          >
            {savedSuccess ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-300">Look Saved!</span>
              </>
            ) : (
              <>
                <Bookmark size={14} className="text-sand-300" />
                <span>Save This Look</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* DRAGGABLE WARDROBE RACK (DIRECTLY BELOW AVATAR AS REQUESTED) */}
      <div className="rounded-3xl bg-white p-5 border border-ink-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ink-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink-100 text-ink-800">
              <Layers size={17} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-950">
                Draggable Wardrobe Rack
              </h3>
              <p className="text-2xs text-ink-500">
                Drag clothes up onto your avatar or click any item to try on instantly.
              </p>
            </div>
          </div>

          {/* Manage wardrobe link */}
          {onNavigateWardrobe && (
            <button
              onClick={onNavigateWardrobe}
              className="text-xs font-semibold text-accent-700 hover:text-accent-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View full wardrobe</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3">
          {(
            [
              { id: 'all', label: 'All Items' },
              { id: 'top', label: 'Tops & Shirts' },
              { id: 'bottom', label: 'Bottoms & Pants' },
              { id: 'outerwear', label: 'Jackets & Coats' },
              { id: 'shoes', label: 'Shoes' },
              { id: 'accessory', label: 'Accessories' },
            ] as { id: OutfitSlot | 'all'; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSlot(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                activeSlot === tab.id
                  ? 'bg-ink-950 text-white shadow-xs font-semibold'
                  : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Horizontal & Responsive Draggable Garments Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
          {filteredClothing.map((item) => {
            const isEquipped = activeOutfitItems.some(
              (slot) => slot.item.id === item.id
            );
            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => handleEquipItem(item)}
                className={`group relative cursor-grab active:cursor-grabbing rounded-2xl border p-2 transition-all select-none ${
                  isEquipped
                    ? 'border-ink-950 bg-ink-50 ring-2 ring-ink-950/15 shadow-sm'
                    : 'border-ink-100 bg-white hover:border-ink-300 hover:shadow-xs'
                }`}
              >
                {/* Drag affordance badge */}
                <div className="absolute top-3 left-3 z-10 rounded-md bg-black/60 backdrop-blur-xs px-1.5 py-0.5 text-3xs font-semibold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                  Drag
                </div>

                <div className="aspect-square w-full overflow-hidden rounded-xl bg-ink-100 relative">
                  <img
                    src={item.image_url || ''}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isEquipped && (
                    <div className="absolute top-2 right-2 rounded-full bg-ink-950 p-1 text-white shadow-sm">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <p className="text-xs font-semibold text-ink-900 truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center justify-between text-2xs text-ink-500 mt-0.5">
                    <span className="capitalize">{item.color || 'Classic'}</span>
                    <span
                      className={`font-semibold ${
                        isEquipped ? 'text-accent-700' : 'text-ink-400 group-hover:text-ink-900'
                      }`}
                    >
                      {isEquipped ? 'Equipped' : 'Tap to wear'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POSES & PHOTOSHOOT SECTION */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-3xl bg-white p-5 border border-ink-100 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-ink-100 mb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={17} className="text-ink-700" />
              <h3 className="text-sm font-semibold text-ink-900">Adaptive Natural Poses</h3>
            </div>
            <span className="text-2xs text-ink-500 capitalize">
              {poses.length} poses available
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {poses.map((pose) => {
              const isActive = pose.id === profile.activePoseId;
              return (
                <button
                  key={pose.id}
                  onClick={() => handlePoseChange(pose.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isActive
                      ? 'border-ink-950 bg-ink-50 ring-1 ring-ink-950 shadow-xs'
                      : 'border-ink-100 hover:border-ink-200 hover:bg-ink-50/50'
                  }`}
                >
                  <p className="text-xs font-semibold text-ink-900 truncate">{pose.name}</p>
                  <span className="text-2xs text-accent-700 capitalize block mt-0.5">
                    {pose.category}
                  </span>
                  <p className="text-3xs text-ink-500 mt-1 line-clamp-1">{pose.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Silhouette & AI Info */}
        <div className="rounded-3xl bg-sand-50 p-5 border border-sand-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Info size={18} className="text-sand-800" />
              <h4 className="text-sm font-serif font-bold text-sand-950">
                Living Digital Twin Engine
              </h4>
            </div>
            <p className="text-xs text-sand-800 mt-2 leading-relaxed">
              Atelier AI integrates your facial likeness with tailored physics. Garments adjust drape and proportions as you change camera angles, background ambiance, and poses.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-sand-200/60">
            <span className="text-2xs font-semibold text-sand-700 block mb-1">
              Archetype Silhouette:
            </span>
            <div className="flex items-center gap-1">
              {(['male', 'female', 'unisex'] as const).map((ctx) => (
                <button
                  key={ctx}
                  onClick={() => handlePresentationChange(ctx)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    profile.presentationContext === ctx
                      ? 'bg-ink-950 text-white shadow-xs'
                      : 'bg-white text-ink-700 hover:bg-sand-100 border border-sand-300/60'
                  }`}
                >
                  {ctx}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CAMERA / AVATAR CREATOR MODAL */}
      {showAvatarCreator && (
        <AvatarCreatorModal
          currentPhoto={profile.referencePhotoUrl}
          presentationContext={profile.presentationContext}
          onClose={() => setShowAvatarCreator(false)}
          onAvatarGenerated={handleAvatarGenerated}
          onResetToBlank={handleResetToBlankAvatar}
        />
      )}

      {/* 5-SHOT LOOKBOOK PHOTOSHOOT MODAL */}
      {photoshootMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-ink-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-ink-100">
              <div>
                <span className="text-2xs font-semibold uppercase tracking-wider text-accent-700">
                  Atelier Lookbook
                </span>
                <h2 className="text-xl font-serif font-bold text-ink-950">
                  Outfit in Multiple Editorial Poses
                </h2>
              </div>
              <button
                onClick={() => setPhotoshootMode(false)}
                className="rounded-full bg-ink-100 p-2 text-ink-600 hover:bg-ink-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-ink-100 border border-ink-200">
                <img
                  src={profile.referencePhotoUrl || modelAsset.front}
                  alt="Photoshoot Preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-accent-500 px-2 py-0.5 text-2xs font-bold uppercase">
                      {photoshootShots[currentShotIndex]?.title}
                    </span>
                    <span className="text-xs text-sand-200">
                      Shot {currentShotIndex + 1} of {photoshootShots.length}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold mt-1">
                    {photoshootShots[currentShotIndex]?.pose.name}
                  </h3>
                  <p className="text-xs text-ink-200 mt-0.5">
                    {photoshootShots[currentShotIndex]?.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {photoshootShots.map((shot, idx) => (
                  <button
                    key={shot.id}
                    onClick={() => setCurrentShotIndex(idx)}
                    className={`rounded-xl p-2 text-left border transition-all ${
                      currentShotIndex === idx
                        ? 'border-ink-950 bg-ink-50 ring-2 ring-ink-950'
                        : 'border-ink-100 hover:border-ink-200'
                    }`}
                  >
                    <p className="text-2xs font-bold text-ink-900 truncate">{shot.title}</p>
                    <p className="text-3xs text-ink-500 capitalize truncate">
                      {shot.pose.category}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-ink-100">
                <p className="text-xs text-ink-500">
                  Likeness preserved across all editorial angles.
                </p>
                <button
                  onClick={() => {
                    handleSaveCurrentLook();
                    setPhotoshootMode(false);
                  }}
                  className="rounded-xl bg-ink-950 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-ink-800"
                >
                  Save Lookbook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
