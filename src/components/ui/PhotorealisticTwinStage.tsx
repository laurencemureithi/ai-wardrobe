import React, { useState } from 'react';
import {
  Camera,
  Sparkles,
  Sun,
  X,
  User,
  ShieldCheck,
  RotateCcw,
  RotateCw,
  Activity,
  Check,
} from 'lucide-react';
import type { ClothingItem, OutfitSlot, PresentationContext, DigitalTwinProfile } from '@/lib/types';
import { USER_AVATAR_PRESETS, VirtualTryOnService } from '@/lib/digitalTwinService';

export type TwinViewAngle = 'front' | 'three_quarter' | 'side' | 'back' | 'detail';

interface PhotorealisticTwinStageProps {
  equippedItems: { item: ClothingItem; slot: OutfitSlot }[];
  userReferencePhotoUrl: string | null;
  userName: string;
  gender: PresentationContext;
  twinProfile?: DigitalTwinProfile;
  onEquipItem?: (item: ClothingItem) => void;
  onRemoveSlot?: (slot: OutfitSlot) => void;
  isDragOver?: boolean;
  onOpenAvatarCreator?: () => void;
  activePoseId?: string;
  onPoseChange?: (poseId: string) => void;
  onSelectPreset?: (preset: (typeof USER_AVATAR_PRESETS)[0]) => void;
  onResetToBlank?: () => void;
  onUpdateTwinFraming?: (framing: { faceOffsetY?: number; faceOffsetX?: number; faceScale?: number }) => void;
}

interface LightingSetting {
  id: string;
  name: string;
  filter: string;
  bgGradient: string;
  plinthColor: string;
  ambientNote: string;
}

const LIGHTING_PRESETS: LightingSetting[] = [
  {
    id: 'studio',
    name: 'Editorial Studio',
    filter: 'brightness(1.02) contrast(1.02)',
    bgGradient: 'from-stone-100 via-stone-200/90 to-stone-300/80',
    plinthColor: 'rgba(28, 25, 23, 0.16)',
    ambientNote: 'Neutral daylight 5400K flash',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    filter: 'sepia(0.08) saturate(1.12) brightness(1.03)',
    bgGradient: 'from-amber-50/80 via-stone-100 to-amber-100/50',
    plinthColor: 'rgba(120, 53, 15, 0.18)',
    ambientNote: 'Warm 3200K natural sunset',
  },
  {
    id: 'penthouse',
    name: 'Glass Penthouse',
    filter: 'contrast(1.04) brightness(0.99)',
    bgGradient: 'from-slate-100 via-zinc-200 to-slate-300/90',
    plinthColor: 'rgba(15, 23, 42, 0.18)',
    ambientNote: 'Diffused cool architectural daylight',
  },
  {
    id: 'atelier',
    name: 'Parisian Atelier',
    filter: 'saturate(0.94) contrast(1.03)',
    bgGradient: 'from-stone-50 via-zinc-150 to-stone-200',
    plinthColor: 'rgba(24, 24, 27, 0.2)',
    ambientNote: 'High-contrast monochrome atelier lighting',
  },
];

interface FitHotspot {
  id: string;
  area: string;
  viewAngle: TwinViewAngle;
  xPct: number;
  yPct: number;
  title: string;
  diagnosis: string;
  status: 'tailored' | 'optimal' | 'relaxed';
}

const FIT_HOTSPOTS: FitHotspot[] = [
  {
    id: 'hs-collar',
    area: 'Collar & Neckline',
    viewAngle: 'front',
    xPct: 50,
    yPct: 20,
    title: 'Collar Pitch & Stance',
    diagnosis: 'Collar sits flush around the neck with zero gap or lifting. Lapel points drape with clean symmetry.',
    status: 'optimal',
  },
  {
    id: 'hs-shoulder',
    area: 'Shoulder Seam',
    viewAngle: 'front',
    xPct: 34,
    yPct: 22,
    title: 'Acromion Alignment',
    diagnosis: 'Shoulder seam aligns directly with the acromion bone — zero pad overhang or bunching wrinkles.',
    status: 'tailored',
  },
  {
    id: 'hs-chest',
    area: 'Torso Ease',
    viewAngle: 'front',
    xPct: 50,
    yPct: 34,
    title: 'Button Stance & Breathing Room',
    diagnosis: 'Clean 2-inch tailored ease across chest. Buttons fasten cleanly with zero "X" pull stress.',
    status: 'optimal',
  },
  {
    id: 'hs-waist',
    area: 'Waist Suppression',
    viewAngle: 'front',
    xPct: 50,
    yPct: 48,
    title: 'Waistband Position',
    diagnosis: 'Waistband sits level on natural waist. Trousers hang with zero pulling across pocket seams.',
    status: 'tailored',
  },
  {
    id: 'hs-trouser-break',
    area: 'Trouser Break',
    viewAngle: 'front',
    xPct: 50,
    yPct: 84,
    title: 'Trouser Break over Footwear',
    diagnosis: 'Slight half-break resting 1.5cm forward over shoe instep. Back hem hangs clean and unclipped.',
    status: 'tailored',
  },
  // 3/4 Perspective hotspots
  {
    id: 'hs-3q-sleeve',
    area: 'Sleeve Pitch',
    viewAngle: 'three_quarter',
    xPct: 31,
    yPct: 35,
    title: 'Sleeve Curvature & Armhole Depth',
    diagnosis: 'High-scye armhole cut allows effortless natural arm reach without lifting jacket hemline.',
    status: 'optimal',
  },
  {
    id: 'hs-3q-drape',
    area: 'Lateral Drape',
    viewAngle: 'three_quarter',
    xPct: 54,
    yPct: 42,
    title: 'Torso Depth & Layering',
    diagnosis: 'Outerwear layers smoothly over inner top with adequate clearance across solar plexus.',
    status: 'tailored',
  },
  // Side Profile hotspots
  {
    id: 'hs-side-spine',
    area: 'Posture Line',
    viewAngle: 'side',
    xPct: 46,
    yPct: 30,
    title: 'Spine & Upper Back Contour',
    diagnosis: 'Garment back follows natural cervical curve without tenting or pulling backward.',
    status: 'optimal',
  },
  {
    id: 'hs-side-seat',
    area: 'Seat Clearance',
    viewAngle: 'side',
    xPct: 48,
    yPct: 55,
    title: 'Trouser Rise & Seat Ease',
    diagnosis: 'Rear rise accommodates sitting and standing without pulling tight across buttocks.',
    status: 'tailored',
  },
  // Rear View hotspots
  {
    id: 'hs-back-yoke',
    area: 'Back Shoulder Yoke',
    viewAngle: 'back',
    xPct: 50,
    yPct: 24,
    title: 'Shoulder Blade Ease',
    diagnosis: 'Upper back seam distributes across shoulder blades with zero horizontal drag wrinkles.',
    status: 'optimal',
  },
  {
    id: 'hs-back-vent',
    area: 'Jacket Vent',
    viewAngle: 'back',
    xPct: 50,
    yPct: 47,
    title: 'Rear Vent Alignment',
    diagnosis: 'Center vent stays closed in natural standing position, opening fluidly only in motion.',
    status: 'tailored',
  },
];

export function PhotorealisticTwinStage({
  equippedItems,
  userReferencePhotoUrl,
  userName,
  gender,
  twinProfile,
  onRemoveSlot,
  isDragOver = false,
  onOpenAvatarCreator,
  onResetToBlank,
  onUpdateTwinFraming,
}: PhotorealisticTwinStageProps) {
  // Stage Display Mode: Interactive 3D Model vs Real Photo Lookbook
  const [stageMode, setStageMode] = useState<'twin' | 'lookbook'>('twin');
  const [showFaceControls, setShowFaceControls] = useState(false);

  // Active View & Angle State
  const [viewAngle, setViewAngle] = useState<TwinViewAngle>('front');
  const [orbitDeg, setOrbitDeg] = useState<number>(0);
  const [activeLighting, setActiveLighting] = useState<LightingSetting>(LIGHTING_PRESETS[0]);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<FitHotspot | null>(null);
  const [isSynthesizingTryOn, setIsSynthesizingTryOn] = useState(false);
  const [tryOnReport, setTryOnReport] = useState<{
    drapeScore: number;
    colorHarmony: string;
    editorialCaption: string;
    stylingNotes: string;
    tailoringDiagnosis?: {
      shoulders: string;
      chest: string;
      waist: string;
      trouserBreak: string;
    };
  } | null>(null);
  const livingBreathing = true;

  const activeFacePhoto = twinProfile?.generatedAvatarUrl || userReferencePhotoUrl;
  const faceOffsetX = twinProfile?.faceOffsetX || 0;
  const faceOffsetY = twinProfile?.faceOffsetY || 0;
  const faceScale = twinProfile?.faceScale || 1.0;

  const skinMain = twinProfile?.skinToneHex || '#cf9e7d';
  const skinShadow = twinProfile?.skinShadowHex || '#8d5b40';
  const skinHighlight = twinProfile?.skinHighlightHex || '#dfb293';

  const handleRunAiTryOn = async () => {
    setIsSynthesizingTryOn(true);
    try {
      const itemsList = equippedItems.map((i) => i.item);
      const res = await VirtualTryOnService.requestTryOn({
        twinProfile: twinProfile || {
          id: 'temp',
          userId: 'user',
          displayName: userName,
          presentationContext: gender,
          referencePhotoUrl: userReferencePhotoUrl,
          preferredPoses: [],
          activePoseId: 'front',
          activeAngle: 'front',
          activeBackground: 'studio',
          lastUpdated: new Date().toISOString(),
        },
        items: itemsList,
        pose: {
          id: 'front',
          name: viewAngle.toUpperCase() + ' Stance',
          category: 'fashion',
          presentationContext: gender,
          occasion: 'Fitting Room',
          cameraAngle: 'front',
          description: 'Custom Fitting Stance',
        },
        angle: 'front',
        background: 'studio',
      });
      if (res.tailoringReport) {
        setTryOnReport(res.tailoringReport);
      }
    } finally {
      setIsSynthesizingTryOn(false);
    }
  };

  // Derive Garment Slots
  const equippedTop = equippedItems.find((i) => i.slot === 'top')?.item;
  const equippedBottom = equippedItems.find((i) => i.slot === 'bottom')?.item;
  const equippedOuterwear = equippedItems.find((i) => i.slot === 'outerwear')?.item;
  const equippedShoes = equippedItems.find((i) => i.slot === 'shoes')?.item;
  const equippedAccessory = equippedItems.find((i) => i.slot === 'accessory')?.item;

  // View angle presets mapping to degrees
  const angleDegByView: Record<TwinViewAngle, number> = {
    front: 0,
    three_quarter: 45,
    side: 90,
    back: 180,
    detail: 0,
  };

  const handleSelectView = (v: TwinViewAngle) => {
    setViewAngle(v);
    setOrbitDeg(angleDegByView[v]);
    setSelectedHotspot(null);
  };

  const handleStepRotate = (delta: number) => {
    let next = (orbitDeg + delta) % 360;
    if (next < 0) next += 360;
    setOrbitDeg(next);

    // Map orbit to nearest named view
    if (next >= 335 || next < 25) setViewAngle('front');
    else if (next >= 25 && next < 70) setViewAngle('three_quarter');
    else if (next >= 70 && next < 135) setViewAngle('side');
    else if (next >= 135 && next < 225) setViewAngle('back');
    else setViewAngle('three_quarter');
  };

  // Helper to parse garment color into realistic gradient palette
  const parseGarmentColors = (item?: ClothingItem, fallbackHex = '#27272a') => {
    if (!item) {
      return {
        main: fallbackHex,
        highlight: '#3f3f46',
        shadow: '#18181b',
        stitch: '#52525b',
      };
    }
    const c = (item.color || '').toLowerCase();
    const name = item.name.toLowerCase();

    if (c.includes('white') || name.includes('white') || name.includes('ivory') || name.includes('oxford')) {
      return { main: '#f4f4f5', highlight: '#ffffff', shadow: '#e4e4e7', stitch: '#d4d4d8' };
    }
    if (c.includes('black') || name.includes('black') || name.includes('charcoal')) {
      return { main: '#1c1917', highlight: '#292524', shadow: '#0c0a09', stitch: '#44403c' };
    }
    if (c.includes('navy') || name.includes('navy')) {
      return { main: '#1e293b', highlight: '#334155', shadow: '#0f172a', stitch: '#475569' };
    }
    if (c.includes('blue') || name.includes('denim')) {
      return { main: '#2563eb', highlight: '#60a5fa', shadow: '#1d4ed8', stitch: '#d97706' };
    }
    if (c.includes('beige') || c.includes('cream') || name.includes('beige') || name.includes('sand') || name.includes('tan')) {
      return { main: '#d6c7b2', highlight: '#e8dec8', shadow: '#b5a289', stitch: '#a18868' };
    }
    if (c.includes('brown') || name.includes('camel') || name.includes('brown')) {
      return { main: '#78350f', highlight: '#92400e', shadow: '#451a03', stitch: '#b45309' };
    }
    if (c.includes('grey') || c.includes('gray')) {
      return { main: '#71717a', highlight: '#a1a1aa', shadow: '#52525b', stitch: '#3f3f46' };
    }
    if (c.includes('green') || name.includes('olive')) {
      return { main: '#365314', highlight: '#4d7c0f', shadow: '#1a2e05', stitch: '#65a30d' };
    }
    if (c.includes('red') || name.includes('burgundy')) {
      return { main: '#7f1d1d', highlight: '#991b1b', shadow: '#450a0a', stitch: '#b91c1c' };
    }

    return { main: '#3f3f46', highlight: '#52525b', shadow: '#27272a', stitch: '#71717a' };
  };

  const topPalette = parseGarmentColors(equippedTop, '#f5f5f4');
  const bottomPalette = parseGarmentColors(equippedBottom, '#27272a');
  const outerPalette = parseGarmentColors(equippedOuterwear, '#1c1917');
  const shoePalette = parseGarmentColors(equippedShoes, '#0f172a');

  // Determine top type
  const isTopShirt =
    equippedTop?.name.toLowerCase().includes('shirt') ||
    equippedTop?.name.toLowerCase().includes('oxford') ||
    equippedTop?.name.toLowerCase().includes('button');
  const isTopSweater =
    equippedTop?.name.toLowerCase().includes('sweater') ||
    equippedTop?.name.toLowerCase().includes('knit') ||
    equippedTop?.name.toLowerCase().includes('cashmere');
  const isTopHoodie = equippedTop?.name.toLowerCase().includes('hoodie');

  // Determine bottom type
  const isBottomJeans =
    equippedBottom?.name.toLowerCase().includes('jean') ||
    equippedBottom?.name.toLowerCase().includes('denim');
  const isBottomShorts = equippedBottom?.name.toLowerCase().includes('short');

  // Determine shoe type
  const isShoeSneaker =
    equippedShoes?.name.toLowerCase().includes('sneaker') ||
    equippedShoes?.name.toLowerCase().includes('trainer') ||
    equippedShoes?.name.toLowerCase().includes('runner');
  const isShoeBoot =
    equippedShoes?.name.toLowerCase().includes('boot') ||
    equippedShoes?.name.toLowerCase().includes('chelsea');

  // Active hotspots for current angle
  const activeHotspots = FIT_HOTSPOTS.filter(
    (h) => h.viewAngle === (viewAngle === 'detail' ? 'front' : viewAngle)
  );

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-xl select-none">
      {/* 1. TOP HEADER & IDENTITY STATUS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 z-20 relative">
        {/* Left identity status */}
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-2xl overflow-hidden border border-ink-200 bg-stone-100 flex items-center justify-center shadow-xs">
            {userReferencePhotoUrl ? (
              <img
                src={userReferencePhotoUrl}
                alt={userName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={20} className="text-ink-400" />
            )}
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                userReferencePhotoUrl ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-serif font-bold text-ink-950">
                {userReferencePhotoUrl ? `${userName}’s Digital Twin` : 'Blank Atelier Avatar'}
              </h2>
              {userReferencePhotoUrl ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-3xs font-semibold text-emerald-800 border border-emerald-200">
                  <ShieldCheck size={11} className="text-emerald-600" />
                  <span>Real Photo Calibrated</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-3xs font-semibold text-stone-600 border border-stone-200">
                  <span>Blank Neutral Silhouette</span>
                </span>
              )}
            </div>

            <p className="text-2xs text-ink-500">
              {userReferencePhotoUrl
                ? `Biometric face linked • Tailored to ${gender} silhouette`
                : 'No photo uploaded yet — neutral blank form. Upload your photo to personalize your twin.'}
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            <button
              onClick={() => setStageMode('twin')}
              className={`px-2.5 py-1 rounded-lg text-2xs font-semibold transition-all ${
                stageMode === 'twin'
                  ? 'bg-ink-950 text-white shadow-2xs'
                  : 'text-ink-600 hover:text-ink-950'
              }`}
            >
              3D Living Twin
            </button>
            <button
              onClick={() => setStageMode('lookbook')}
              className={`px-2.5 py-1 rounded-lg text-2xs font-semibold transition-all ${
                stageMode === 'lookbook'
                  ? 'bg-ink-950 text-white shadow-2xs'
                  : 'text-ink-600 hover:text-ink-950'
              }`}
            >
              Real Photo Studio
            </button>
          </div>

          {activeFacePhoto && (
            <button
              onClick={() => setShowFaceControls(!showFaceControls)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-2xs font-medium border transition-all ${
                showFaceControls
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-stone-200 text-ink-600 hover:bg-stone-50'
              }`}
              title="Fine-tune face framing and alignment on model"
            >
              <span>Align Face</span>
            </button>
          )}

          {userReferencePhotoUrl ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAvatarCreator}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-ink-800 text-xs font-semibold transition-all border border-sand-300"
              >
                <Camera size={13} className="text-accent-700" />
                <span>Change Photo</span>
              </button>
              {onResetToBlank && (
                <button
                  onClick={onResetToBlank}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-2xs font-medium text-ink-500 hover:text-red-600 hover:bg-red-50 transition-all border border-stone-200"
                  title="Clear photo likeness and return to blank neutral mannequin"
                >
                  <RotateCcw size={12} />
                  <span className="hidden sm:inline">Reset to Blank</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAvatarCreator}
              className="flex items-center gap-1.5 rounded-2xl bg-ink-950 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-ink-800 transition-all ring-2 ring-sand-300/40"
            >
              <Camera size={14} className="text-sand-300" />
              <span>Upload My Photo to Personalize</span>
            </button>
          )}

          {/* Fit Hotspots Toggle */}
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            title="Toggle Tailoring Fit Anchors"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-2xs font-semibold transition-all border ${
              showHotspots
                ? 'bg-ink-900 text-white border-ink-900 shadow-xs'
                : 'bg-white text-ink-700 border-ink-200 hover:bg-stone-50'
            }`}
          >
            <Activity size={12} className={showHotspots ? 'text-sand-300' : ''} />
            <span className="hidden sm:inline">Fit Anchors</span>
          </button>

          {/* AI Neural Try-On Review Button */}
          <button
            onClick={handleRunAiTryOn}
            disabled={isSynthesizingTryOn || equippedItems.length === 0}
            title="Generate AI Tailoring Analysis and Editorial Critique"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-2xs font-semibold bg-ink-950 text-white shadow-xs hover:bg-ink-800 disabled:opacity-40 transition-all border border-stone-800"
          >
            <Sparkles size={12} className={isSynthesizingTryOn ? 'animate-spin text-sand-300' : 'text-sand-300'} />
            <span>{isSynthesizingTryOn ? 'AI Analyzing...' : 'AI Try-On Review'}</span>
          </button>
        </div>
      </div>

      {/* 2. MULTI-VIEW & ORBIT NAVIGATION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100/90 bg-stone-50/90 px-4 sm:px-6 py-2.5 text-xs z-10 relative">
        {/* Segmented View Angle Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-3xs font-bold uppercase tracking-wider text-ink-400 mr-1.5 shrink-0">
            View Angle:
          </span>
          {(
            [
              { id: 'front', label: 'Front (0°)', desc: 'Runway Front' },
              { id: 'three_quarter', label: '3/4 Turn (45°)', desc: 'Editorial 3/4' },
              { id: 'side', label: 'Side Profile (90°)', desc: 'Lateral Silhouette' },
              { id: 'back', label: 'Back (180°)', desc: 'Rear Architecture' },
              { id: 'detail', label: 'Fit Zoom 🔍', desc: 'Macro Tailor Detail' },
            ] as { id: TwinViewAngle; label: string; desc: string }[]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectView(item.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                viewAngle === item.id
                  ? 'bg-ink-950 text-white shadow-xs'
                  : 'bg-white text-ink-700 border border-ink-200/80 hover:bg-stone-100 hover:text-ink-950'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Orbit Step Controls & Lighting */}
        <div className="flex items-center gap-2">
          {/* Quick Step Rotation */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-ink-200 p-0.5 shadow-2xs">
            <button
              onClick={() => handleStepRotate(-45)}
              className="p-1 rounded-lg hover:bg-stone-100 text-ink-700"
              title="Rotate Left 45°"
            >
              <RotateCcw size={13} />
            </button>
            <span className="text-3xs font-mono font-bold text-ink-800 px-1">
              {orbitDeg}°
            </span>
            <button
              onClick={() => handleStepRotate(45)}
              className="p-1 rounded-lg hover:bg-stone-100 text-ink-700"
              title="Rotate Right 45°"
            >
              <RotateCw size={13} />
            </button>
          </div>

          {/* Lighting Selector */}
          <div className="flex items-center gap-1">
            <Sun size={13} className="text-ink-400" />
            <select
              value={activeLighting.id}
              onChange={(e) => {
                const found = LIGHTING_PRESETS.find((p) => p.id === e.target.value);
                if (found) setActiveLighting(found);
              }}
              className="bg-white text-ink-800 border border-ink-200 rounded-xl px-2 py-1 text-2xs font-medium focus:ring-1 focus:ring-ink-950 outline-hidden"
            >
              {LIGHTING_PRESETS.map((lp) => (
                <option key={lp.id} value={lp.id}>
                  {lp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. MAIN ATELIER STAGE CANVAS */}
      <div
        className={`relative flex min-h-[640px] sm:min-h-[720px] w-full items-center justify-center overflow-hidden transition-all duration-700 bg-gradient-to-b ${activeLighting.bgGradient}`}
        style={{ filter: activeLighting.filter }}
      >
        {/* Drag over glow overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-accent-950/25 backdrop-blur-xs ring-4 ring-inset ring-accent-500 animate-pulse">
            <div className="rounded-2xl bg-white/95 px-6 py-4 shadow-xl text-center border border-accent-200">
              <Sparkles size={24} className="mx-auto text-accent-600 mb-1" />
              <p className="text-sm font-semibold text-ink-950">Release to Equip on Model</p>
              <p className="text-2xs text-ink-600">Garment fits into appropriate body slot</p>
            </div>
          </div>
        )}

        {/* CALIBRATED BIOMETRIC AVATAR BADGE (When user has uploaded photo) */}
        {userReferencePhotoUrl && (
          <div className="absolute top-4 left-4 z-30 pointer-events-auto max-w-[240px] sm:max-w-xs animate-fade-in">
            <div className="rounded-2xl bg-white/95 backdrop-blur-md p-3 shadow-lg border border-stone-200/90 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="relative h-8 w-8 rounded-full overflow-hidden border border-emerald-400 bg-stone-100 shrink-0">
                  <img src={userReferencePhotoUrl} alt="" className="h-full w-full object-cover" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
                </div>
                <div className="truncate">
                  <p className="text-2xs font-bold text-ink-950 truncate">{userName}’s Avatar</p>
                  <p className="text-3xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Check size={9} />
                    <span>Biometric Face Linked</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1 text-3xs text-ink-600">
                <span className="bg-stone-100 px-1.5 py-0.5 rounded text-ink-800 font-medium">
                  {twinProfile?.skinTone || 'Warm Sand'}
                </span>
                {twinProfile?.aestheticVibe && (
                  <span className="bg-sand-100 text-sand-800 px-1.5 py-0.5 rounded font-medium truncate max-w-[140px]">
                    {twinProfile.aestheticVibe}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FACE FRAMING & ALIGNMENT CONTROLS */}
        {showFaceControls && activeFacePhoto && (
          <div className="absolute top-4 left-4 z-40 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-ink-200 text-xs w-64 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-ink-900 text-2xs uppercase tracking-wider">Face Fit & Alignment</span>
              <button onClick={() => setShowFaceControls(false)} className="text-ink-400 hover:text-ink-700">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-2xs font-medium">
                <span>Scale ({Math.round(faceScale * 100)}%)</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateTwinFraming?.({ faceScale: Math.max(0.7, Number((faceScale - 0.05).toFixed(2))) })}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-ink-800 font-bold"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onUpdateTwinFraming?.({ faceScale: Math.min(1.8, Number((faceScale + 0.05).toFixed(2))) })}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-ink-800 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-2xs font-medium">
                <span>Vertical Shift ({faceOffsetY}px)</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateTwinFraming?.({ faceOffsetY: faceOffsetY - 2 })}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-ink-800 font-bold"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => onUpdateTwinFraming?.({ faceOffsetY: faceOffsetY + 2 })}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-ink-800 font-bold"
                  >
                    ▼
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-2xs font-medium">
                <span>Horizontal Shift ({faceOffsetX}px)</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateTwinFraming?.({ faceOffsetX: faceOffsetX - 2 })}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-ink-800 font-bold"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => onUpdateTwinFraming?.({ faceOffsetX: faceOffsetX + 2 })}
                    className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-ink-800 font-bold"
                  >
                    ▶
                  </button>
                </div>
              </div>
              <button
                onClick={() => onUpdateTwinFraming?.({ faceScale: 1.0, faceOffsetY: 0, faceOffsetX: 0 })}
                className="w-full text-center text-3xs text-ink-500 hover:text-ink-900 pt-1.5 border-t border-stone-100"
              >
                Reset Default Framing
              </button>
            </div>
          </div>
        )}

        {/* AI TRY-ON REPORT FLOATING CARD */}
        {tryOnReport && (
          <div className="absolute top-4 right-4 z-40 max-w-sm w-full animate-fade-in">
            <div className="rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-2xl border border-sand-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-sand-600" />
                  <span className="text-2xs font-bold uppercase tracking-wider text-ink-950">
                    AI Try-On Editorial Review
                  </span>
                </div>
                <button
                  onClick={() => setTryOnReport(null)}
                  className="rounded-full p-1 text-stone-400 hover:text-stone-700"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-serif font-bold text-ink-950">
                  Drape & Proportion Score
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {tryOnReport.drapeScore}% Harmonious
                </span>
              </div>

              <p className="text-2xs text-ink-700 italic leading-relaxed mb-3 bg-stone-50 p-2.5 rounded-xl border border-stone-150">
                “{tryOnReport.editorialCaption}”
              </p>

              {tryOnReport.tailoringDiagnosis && (
                <div className="space-y-1 text-3xs text-ink-600 mb-2">
                  <div className="flex justify-between border-b border-stone-100 py-0.5">
                    <span className="font-semibold text-ink-800">Shoulders:</span>
                    <span>{tryOnReport.tailoringDiagnosis.shoulders}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 py-0.5">
                    <span className="font-semibold text-ink-800">Chest Ease:</span>
                    <span>{tryOnReport.tailoringDiagnosis.chest}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 py-0.5">
                    <span className="font-semibold text-ink-800">Waistline:</span>
                    <span>{tryOnReport.tailoringDiagnosis.waist}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="font-semibold text-ink-800">Trouser Break:</span>
                    <span>{tryOnReport.tailoringDiagnosis.trouserBreak}</span>
                  </div>
                </div>
              )}

              <p className="text-3xs text-ink-500 leading-normal pt-1 border-t border-stone-100">
                {tryOnReport.stylingNotes}
              </p>
            </div>
          </div>
        )}

        {/* Studio Lighting Radial Spotlight */}
        <div className="absolute top-1/4 w-[500px] h-[500px] rounded-full bg-white/30 blur-3xl pointer-events-none" />

        {/* Architectural Studio Plinth & Shadows */}
        <div
          className="absolute bottom-10 w-72 sm:w-80 h-14 rounded-[50%] blur-md pointer-events-none transform -rotate-1 transition-all"
          style={{ backgroundColor: activeLighting.plinthColor }}
        />
        <div className="absolute bottom-9 w-60 sm:w-68 h-4 rounded-[50%] bg-ink-950/20 blur-xs pointer-events-none" />

        {/* Dynamic Avatar Container with View Zoom / Macro Crop */}
        {stageMode === 'lookbook' && activeFacePhoto ? (
          <div className="relative z-10 w-full max-w-2xl flex flex-col md:flex-row items-center gap-6 p-6 animate-fade-in my-8">
            <div className="relative w-64 h-84 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/95 shrink-0 bg-stone-100">
              <img
                src={activeFacePhoto}
                alt={userName}
                className="h-full w-full object-cover"
                style={{ filter: activeLighting.filter }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 text-white">
                <p className="font-serif text-sm font-bold">{userName}</p>
                <p className="text-3xs text-sand-300">Live Client Portrait • {activeLighting.name}</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <div className="rounded-2xl bg-white/95 backdrop-blur-md p-4 border border-ink-100 shadow-sm">
                <h4 className="text-xs font-bold text-ink-950 uppercase tracking-wider mb-2">Equipped Ensemble</h4>
                {equippedItems.length === 0 ? (
                  <p className="text-2xs text-ink-500 italic">No garments equipped yet. Choose items below to try on.</p>
                ) : (
                  <div className="space-y-1.5">
                    {equippedItems.map(({ item, slot }) => (
                      <div key={item.id} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-stone-50 border border-stone-100">
                        <span className="font-semibold text-ink-900">{item.name}</span>
                        <span className="text-3xs text-ink-500 uppercase bg-white px-2 py-0.5 rounded border border-stone-200">{slot}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleRunAiTryOn}
                disabled={isSynthesizingTryOn || equippedItems.length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-ink-950 text-white text-xs font-semibold shadow-md hover:bg-ink-800 disabled:opacity-50 transition-all"
              >
                <Sparkles size={14} className={isSynthesizingTryOn ? 'animate-spin text-sand-300' : 'text-sand-300'} />
                <span>{isSynthesizingTryOn ? 'AI Analyzing Tailoring...' : 'Analyze Tailored Fit on Portrait'}</span>
              </button>

              <button
                onClick={() => setStageMode('twin')}
                className="w-full py-2 px-4 rounded-xl text-xs font-medium text-ink-700 bg-white hover:bg-stone-50 border border-stone-200 transition-all"
              >
                Switch to 3D Living Model
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`relative h-[620px] sm:h-[680px] w-full max-w-[420px] flex items-center justify-center transition-transform duration-500 ease-out ${
              viewAngle === 'detail' ? 'scale-[1.65] origin-[50%_32%]' : 'scale-100 origin-center'
            } ${livingBreathing ? 'animate-living-breathe' : ''}`}
          >
            {/* THE PHOTOREALISTIC SVG / 3D CANVAS MANNEQUIN ENGINE */}
            <svg
              viewBox="0 0 400 700"
              className="h-full w-full drop-shadow-2xl overflow-visible select-none"
              preserveAspectRatio="xMidYMid meet"
            >
            <defs>
              {/* Studio Shading & Lighting Gradients */}
              <linearGradient id="bodyBlankGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#404040" />
                <stop offset="35%" stopColor="#737373" />
                <stop offset="60%" stopColor="#8c8c8c" />
                <stop offset="85%" stopColor="#525252" />
                <stop offset="100%" stopColor="#303030" />
              </linearGradient>

              <linearGradient id="skinGradReal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={skinShadow} />
                <stop offset="30%" stopColor={skinMain} />
                <stop offset="65%" stopColor={skinHighlight} />
                <stop offset="85%" stopColor={skinMain} />
                <stop offset="100%" stopColor={skinShadow} />
              </linearGradient>

              {/* Garment Fabric Dynamic Gradients */}
              <linearGradient id="topFabricGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={topPalette.shadow} />
                <stop offset="35%" stopColor={topPalette.main} />
                <stop offset="60%" stopColor={topPalette.highlight} />
                <stop offset="85%" stopColor={topPalette.main} />
                <stop offset="100%" stopColor={topPalette.shadow} />
              </linearGradient>

              <linearGradient id="outerFabricGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={outerPalette.shadow} />
                <stop offset="30%" stopColor={outerPalette.main} />
                <stop offset="65%" stopColor={outerPalette.highlight} />
                <stop offset="85%" stopColor={outerPalette.main} />
                <stop offset="100%" stopColor={outerPalette.shadow} />
              </linearGradient>

              <linearGradient id="bottomFabricGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={bottomPalette.shadow} />
                <stop offset="35%" stopColor={bottomPalette.main} />
                <stop offset="60%" stopColor={bottomPalette.highlight} />
                <stop offset="85%" stopColor={bottomPalette.main} />
                <stop offset="100%" stopColor={bottomPalette.shadow} />
              </linearGradient>

              <linearGradient id="shoeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={shoePalette.highlight} />
                <stop offset="50%" stopColor={shoePalette.main} />
                <stop offset="100%" stopColor={shoePalette.shadow} />
              </linearGradient>

              {/* Head Silhouette Mask */}
              <clipPath id="avatarHeadClip">
                <path d="M 166 88 C 166 52 180 44 200 44 C 220 44 234 52 234 88 C 234 116 218 138 200 138 C 182 138 166 116 166 88 Z" />
              </clipPath>
            </defs>

            {/* LAYER 0: BASE ANATOMICAL BODY (Exposed Skin or Blank Form) */}
            <g id="anatomicalBody">
              {/* Neck */}
              <path
                d={
                  viewAngle === 'side'
                    ? 'M 194 130 C 190 145 186 160 182 172 L 214 172 C 216 158 214 142 210 130 Z'
                    : 'M 188 132 C 188 145 186 160 183 170 L 217 170 C 214 160 212 145 212 132 Z'
                }
                fill={userReferencePhotoUrl ? 'url(#skinGradReal)' : 'url(#bodyBlankGrad)'}
              />

              {/* Shoulders & Clavicle base */}
              <path
                d={
                  viewAngle === 'side'
                    ? 'M 182 172 C 172 176 166 186 164 200 L 222 200 C 224 186 218 176 214 172 Z'
                    : 'M 183 170 C 160 172 142 180 135 194 L 265 194 C 258 180 240 172 217 170 Z'
                }
                fill={userReferencePhotoUrl ? 'url(#skinGradReal)' : 'url(#bodyBlankGrad)'}
              />

              {/* Exposed Arms & Hands (visible when no outerwear or top is short-sleeved) */}
              {viewAngle !== 'side' && (
                <g id="arms">
                  {/* Left Arm */}
                  <path
                    d="M 135 194 C 128 220 125 260 124 300 C 123 340 120 380 118 410 C 117 418 124 422 127 412 C 131 382 136 342 138 302 C 140 262 142 222 144 198 Z"
                    fill={userReferencePhotoUrl ? 'url(#skinGradReal)' : 'url(#bodyBlankGrad)'}
                  />
                  {/* Right Arm */}
                  <path
                    d="M 265 194 C 272 220 275 260 276 300 C 277 340 280 380 282 410 C 283 418 276 422 273 412 C 269 382 264 342 262 302 C 260 262 258 222 256 198 Z"
                    fill={userReferencePhotoUrl ? 'url(#skinGradReal)' : 'url(#bodyBlankGrad)'}
                  />
                </g>
              )}

              {/* Legs / Ankles (under trousers) */}
              <path
                d="M 172 580 L 170 630 L 186 630 L 188 580 Z"
                fill={userReferencePhotoUrl ? 'url(#skinGradReal)' : 'url(#bodyBlankGrad)'}
              />
              <path
                d="M 212 580 L 214 630 L 230 630 L 228 580 Z"
                fill={userReferencePhotoUrl ? 'url(#skinGradReal)' : 'url(#bodyBlankGrad)'}
              />
            </g>

            {/* LAYER 1: BASE UNDERGARMENT / ATELIER FOUNDATION (Ensures model is never naked) */}
            <g id="atelierBaseFoundation" opacity={equippedTop ? 0.35 : 0.95}>
              {/* Sleek Minimalist Base Tank Top */}
              <path
                d="M 170 178 Q 200 195 230 178 L 236 320 Q 200 325 164 320 Z"
                fill="#18181b"
                stroke="#27272a"
                strokeWidth="1"
              />
              {/* Sleek Fitted Base Shorts */}
              <path
                d="M 164 320 Q 200 325 236 320 L 244 410 L 205 410 L 200 360 L 195 410 L 156 410 Z"
                fill="#18181b"
                stroke="#27272a"
                strokeWidth="1"
              />
            </g>

            {/* LAYER 2: BOTTOMS (Pants / Trousers / Jeans / Chinos / Shorts) */}
            {equippedBottom ? (
              <g id="bottomGarment" className="transition-all duration-300">
                {/* 2A. Front View Bottoms */}
                {viewAngle === 'front' && (
                  <g id="pantsFront">
                    {/* Main Trousers / Jeans Body */}
                    <path
                      d={
                        isBottomShorts
                          ? 'M 160 318 C 172 320 228 320 240 318 L 248 435 L 208 435 L 200 375 L 192 435 L 152 435 Z'
                          : 'M 160 318 C 172 320 228 320 240 318 L 246 440 C 248 480 244 540 240 622 C 232 626 214 626 206 622 C 210 540 206 480 200 400 C 194 480 190 540 194 622 C 186 626 168 626 160 622 C 156 540 152 480 154 440 Z'
                      }
                      fill="url(#bottomFabricGrad)"
                      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.18))"
                    />

                    {/* Waistband */}
                    <path
                      d="M 160 318 C 175 322 225 322 240 318 L 241 332 C 225 336 175 336 159 332 Z"
                      fill={bottomPalette.shadow}
                    />

                    {/* Fly Placket & Crease Lines */}
                    <path d="M 200 332 L 200 385 C 196 385 192 380 192 375" stroke={bottomPalette.stitch} strokeWidth="1.5" fill="none" />

                    {/* Tailored Center Leg Creases or Denim Seams */}
                    {!isBottomShorts && (
                      <>
                        <path d="M 178 350 L 176 618" stroke={bottomPalette.highlight} strokeWidth="1" opacity="0.65" strokeDasharray={isBottomJeans ? 'none' : 'none'} />
                        <path d="M 222 350 L 224 618" stroke={bottomPalette.highlight} strokeWidth="1" opacity="0.65" strokeDasharray={isBottomJeans ? 'none' : 'none'} />
                      </>
                    )}

                    {/* Denim Details (Rivets, Coin Pocket, Gold Topstitch) */}
                    {isBottomJeans && (
                      <>
                        <path d="M 168 335 C 180 340 185 352 186 360" stroke={bottomPalette.stitch} strokeWidth="1.2" fill="none" />
                        <path d="M 232 335 C 220 340 215 352 214 360" stroke={bottomPalette.stitch} strokeWidth="1.2" fill="none" />
                        <circle cx="168" cy="336" r="1.5" fill="#ca8a04" />
                        <circle cx="232" cy="336" r="1.5" fill="#ca8a04" />
                      </>
                    )}

                    {/* Trouser Break Crease over shoes */}
                    {!isBottomShorts && (
                      <path
                        d="M 162 616 Q 177 622 192 616 M 208 616 Q 223 622 238 616"
                        stroke={bottomPalette.shadow}
                        strokeWidth="2"
                        fill="none"
                      />
                    )}
                  </g>
                )}

                {/* 2B. 3/4 Turn Bottoms */}
                {viewAngle === 'three_quarter' && (
                  <g id="pantsThreeQuarter">
                    <path
                      d="M 166 318 C 180 321 226 321 238 318 L 244 440 C 245 490 240 550 238 622 C 230 626 215 626 208 622 C 211 550 206 480 201 405 C 196 480 189 550 190 622 C 182 626 167 626 161 622 C 158 550 156 480 158 440 Z"
                      fill="url(#bottomFabricGrad)"
                    />
                    {/* Inseam / Outseam Perspective */}
                    <path d="M 190 340 L 180 618" stroke={bottomPalette.stitch} strokeWidth="1.2" fill="none" opacity="0.7" />
                  </g>
                )}

                {/* 2C. Side Profile Bottoms */}
                {viewAngle === 'side' && (
                  <g id="pantsSide">
                    <path
                      d="M 174 318 C 186 320 220 320 226 318 L 230 420 C 232 480 228 540 226 622 C 218 626 186 626 178 622 C 176 540 174 480 172 420 Z"
                      fill="url(#bottomFabricGrad)"
                    />
                    {/* Lateral Outseam */}
                    <path d="M 202 322 L 202 618" stroke={bottomPalette.stitch} strokeWidth="1.5" fill="none" />
                    <path d="M 216 332 L 210 360" stroke={bottomPalette.highlight} strokeWidth="1.2" fill="none" />
                  </g>
                )}

                {/* 2D. Back View Bottoms */}
                {viewAngle === 'back' && (
                  <g id="pantsBack">
                    <path
                      d="M 160 318 C 172 320 228 320 240 318 L 246 440 C 248 480 244 540 240 622 C 232 626 214 626 206 622 C 210 540 206 480 200 400 C 194 480 190 540 194 622 C 186 626 168 626 160 622 C 156 540 152 480 154 440 Z"
                      fill="url(#bottomFabricGrad)"
                    />
                    {/* Back Yoke & Pockets */}
                    <path d="M 160 334 L 200 342 L 240 334" stroke={bottomPalette.stitch} strokeWidth="1.5" fill="none" />
                    {/* Left & Right Back Pockets */}
                    <path d="M 168 350 L 188 350 L 186 376 L 178 382 L 170 376 Z" fill={bottomPalette.shadow} stroke={bottomPalette.stitch} strokeWidth="1" />
                    <path d="M 212 350 L 232 350 L 230 376 L 222 382 L 214 376 Z" fill={bottomPalette.shadow} stroke={bottomPalette.stitch} strokeWidth="1" />
                  </g>
                )}
              </g>
            ) : null}

            {/* LAYER 3: TOPS (Shirt / T-Shirt / Sweater / Hoodie) */}
            {equippedTop && (
              <g id="topGarment" className="transition-all duration-300">
                {/* 3A. Front View Top */}
                {viewAngle === 'front' && (
                  <g id="topFront">
                    {/* Torso Body */}
                    <path
                      d="M 136 194 C 160 176 240 176 264 194 L 254 330 C 230 334 170 334 146 330 Z"
                      fill="url(#topFabricGrad)"
                      filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                    />

                    {/* Short or Long Sleeves */}
                    <path
                      d="M 136 194 C 128 220 126 250 126 270 L 146 274 C 146 250 148 220 150 198 Z"
                      fill="url(#topFabricGrad)"
                    />
                    <path
                      d="M 264 194 C 272 220 274 250 274 270 L 254 274 C 254 250 252 220 250 198 Z"
                      fill="url(#topFabricGrad)"
                    />

                    {/* COLLARED SHIRT SPECIFICS (Collar Points, Button Placket, Chest Pocket) */}
                    {isTopShirt && (
                      <>
                        {/* Center Button Placket */}
                        <path d="M 197 194 L 197 330 L 203 330 L 203 194 Z" fill={topPalette.shadow} />
                        {/* Real Buttons */}
                        {[210, 235, 260, 285, 310].map((by) => (
                          <circle key={by} cx="200" cy={by} r="2" fill="#ffffff" stroke="#9ca3af" strokeWidth="0.8" />
                        ))}

                        {/* Crisp Turned Collar Lapels */}
                        <path
                          d="M 183 170 L 193 196 L 200 188 L 194 172 Z"
                          fill={topPalette.highlight}
                          stroke={topPalette.stitch}
                          strokeWidth="1"
                        />
                        <path
                          d="M 217 170 L 207 196 L 200 188 L 206 172 Z"
                          fill={topPalette.highlight}
                          stroke={topPalette.stitch}
                          strokeWidth="1"
                        />

                        {/* Left Chest Pocket */}
                        <path
                          d="M 164 228 L 180 228 L 179 246 L 172 250 L 165 246 Z"
                          fill={topPalette.shadow}
                          stroke={topPalette.stitch}
                          strokeWidth="1"
                        />
                      </>
                    )}

                    {/* T-SHIRT SPECIFICS (Ribbed Crewneck) */}
                    {!isTopShirt && !isTopSweater && !isTopHoodie && (
                      <path
                        d="M 184 172 Q 200 192 216 172 Q 200 186 184 172"
                        fill={topPalette.shadow}
                        stroke={topPalette.stitch}
                        strokeWidth="1.2"
                      />
                    )}

                    {/* KNITWEAR SWEATER SPECIFICS (Ribbed Hem & V-neck / Crew) */}
                    {isTopSweater && (
                      <>
                        {/* Ribbed Hem Band */}
                        <rect x="146" y="322" width="108" height="12" fill={topPalette.shadow} />
                        <path d="M 184 172 Q 200 186 216 172" stroke={topPalette.highlight} strokeWidth="2" fill="none" />
                      </>
                    )}

                    {/* HOODIE SPECIFICS (Drawn Hood & Kangaroo Pocket) */}
                    {isTopHoodie && (
                      <>
                        <path
                          d="M 170 270 L 230 270 L 226 314 L 174 314 Z"
                          fill={topPalette.shadow}
                          stroke={topPalette.stitch}
                          strokeWidth="1"
                        />
                        {/* Drawstrings */}
                        <path d="M 192 188 L 192 225" stroke="#ffffff" strokeWidth="1.5" />
                        <path d="M 208 188 L 208 225" stroke="#ffffff" strokeWidth="1.5" />
                      </>
                    )}
                  </g>
                )}

                {/* 3B. 3/4 Turn Top */}
                {viewAngle === 'three_quarter' && (
                  <g id="topThreeQuarter">
                    <path
                      d="M 140 194 C 165 176 240 176 260 194 L 250 330 C 226 334 174 334 150 330 Z"
                      fill="url(#topFabricGrad)"
                    />
                    {isTopShirt && (
                      <path d="M 206 194 L 204 330" stroke={topPalette.shadow} strokeWidth="3" />
                    )}
                  </g>
                )}

                {/* 3C. Side Profile Top */}
                {viewAngle === 'side' && (
                  <g id="topSide">
                    <path
                      d="M 166 196 C 182 178 226 178 230 196 L 224 330 C 206 334 180 334 170 330 Z"
                      fill="url(#topFabricGrad)"
                    />
                    {/* Lateral Arm */}
                    <path d="M 198 196 L 196 280" stroke={topPalette.shadow} strokeWidth="4" />
                  </g>
                )}

                {/* 3D. Back View Top */}
                {viewAngle === 'back' && (
                  <g id="topBack">
                    <path
                      d="M 136 194 C 160 176 240 176 264 194 L 254 330 C 230 334 170 334 146 330 Z"
                      fill="url(#topFabricGrad)"
                    />
                    {/* Back Shoulder Yoke & Center Back Seam */}
                    <path d="M 140 216 Q 200 224 260 216" stroke={topPalette.stitch} strokeWidth="1.5" fill="none" />
                    <path d="M 200 224 L 200 330" stroke={topPalette.stitch} strokeWidth="1" fill="none" opacity="0.6" />
                  </g>
                )}
              </g>
            )}

            {/* LAYER 4: OUTERWEAR (Blazer / Jacket / Overcoat / Trench) — Over Top */}
            {equippedOuterwear && (
              <g id="outerwearGarment" className="transition-all duration-300">
                {/* 4A. Front View Outerwear */}
                {viewAngle === 'front' && (
                  <g id="outerFront">
                    {/* Left Jacket Panel */}
                    <path
                      d="M 132 190 C 145 186 174 186 182 192 L 180 348 C 160 350 142 346 138 340 Z"
                      fill="url(#outerFabricGrad)"
                      filter="drop-shadow(-2px 4px 6px rgba(0,0,0,0.25))"
                    />
                    {/* Right Jacket Panel (Crosses over front) */}
                    <path
                      d="M 268 190 C 255 186 226 186 218 192 L 220 348 C 240 350 258 346 262 340 Z"
                      fill="url(#outerFabricGrad)"
                      filter="drop-shadow(2px 4px 6px rgba(0,0,0,0.25))"
                    />

                    {/* Structured Shoulders & Full Sleeves */}
                    <path
                      d="M 132 190 C 122 220 118 260 116 340 L 134 342 C 136 280 142 220 146 196 Z"
                      fill="url(#outerFabricGrad)"
                    />
                    <path
                      d="M 268 190 C 278 220 282 260 284 340 L 266 342 C 264 280 258 220 254 196 Z"
                      fill="url(#outerFabricGrad)"
                    />

                    {/* Peaked / Notched Lapels with Roll Line */}
                    <path
                      d="M 174 186 L 160 226 L 176 242 L 182 200 Z"
                      fill={outerPalette.highlight}
                      stroke={outerPalette.stitch}
                      strokeWidth="1"
                    />
                    <path
                      d="M 226 186 L 240 226 L 224 242 L 218 200 Z"
                      fill={outerPalette.highlight}
                      stroke={outerPalette.stitch}
                      strokeWidth="1"
                    />

                    {/* Welt Breast Pocket & Silk Pocket Square */}
                    <path d="M 152 232 L 168 232" stroke={outerPalette.shadow} strokeWidth="3" />
                    <polygon points="156,230 162,223 166,230" fill="#ffffff" />

                    {/* Lower Flap Pockets */}
                    <rect x="142" y="296" width="24" height="6" rx="1" fill={outerPalette.shadow} />
                    <rect x="234" y="296" width="24" height="6" rx="1" fill={outerPalette.shadow} />

                    {/* Jacket Horn Buttons */}
                    <circle cx="204" cy="268" r="3" fill="#18181b" stroke="#71717a" strokeWidth="0.8" />
                    <circle cx="204" cy="298" r="3" fill="#18181b" stroke="#71717a" strokeWidth="0.8" />
                  </g>
                )}

                {/* 4B. 3/4 Turn Outerwear */}
                {viewAngle === 'three_quarter' && (
                  <g id="outerThreeQuarter">
                    <path
                      d="M 136 190 C 150 186 248 186 264 190 L 258 350 C 220 354 160 354 144 350 Z"
                      fill="url(#outerFabricGrad)"
                    />
                    <path d="M 176 186 L 194 250 L 200 350" stroke={outerPalette.highlight} strokeWidth="2" fill="none" />
                  </g>
                )}

                {/* 4C. Side Profile Outerwear */}
                {viewAngle === 'side' && (
                  <g id="outerSide">
                    <path
                      d="M 164 194 C 180 182 228 182 232 194 L 226 350 C 206 354 178 354 168 350 Z"
                      fill="url(#outerFabricGrad)"
                    />
                    <path d="M 210 200 L 206 348" stroke={outerPalette.shadow} strokeWidth="3" />
                  </g>
                )}

                {/* 4D. Back View Outerwear */}
                {viewAngle === 'back' && (
                  <g id="outerBack">
                    <path
                      d="M 132 190 C 145 186 255 186 268 190 L 260 350 C 235 354 165 354 140 350 Z"
                      fill="url(#outerFabricGrad)"
                    />
                    {/* Back Center Seam & Tailored Vent */}
                    <path d="M 200 194 L 200 310" stroke={outerPalette.stitch} strokeWidth="1.5" />
                    <path d="M 200 310 L 200 350" stroke="#000000" strokeWidth="2.5" />
                  </g>
                )}
              </g>
            )}

            {/* LAYER 5: SHOES & FOOTWEAR */}
            {equippedShoes ? (
              <g id="footwear" className="transition-all duration-300">
                {viewAngle !== 'side' ? (
                  <g id="shoesFront">
                    {/* Left Shoe */}
                    <path
                      d={
                        isShoeBoot
                          ? 'M 160 618 C 158 630 156 648 152 654 C 158 660 184 660 190 654 C 186 648 184 630 182 618 Z'
                          : 'M 160 622 C 158 635 154 650 150 654 C 158 658 184 658 190 654 C 186 650 182 635 180 622 Z'
                      }
                      fill="url(#shoeGrad)"
                      filter="drop-shadow(0 3px 5px rgba(0,0,0,0.3))"
                    />
                    {/* Right Shoe */}
                    <path
                      d={
                        isShoeBoot
                          ? 'M 218 618 C 216 630 214 648 210 654 C 216 660 242 660 248 654 C 244 648 242 630 240 618 Z'
                          : 'M 220 622 C 218 635 214 650 210 654 C 218 658 244 658 250 654 C 246 650 242 635 240 622 Z'
                      }
                      fill="url(#shoeGrad)"
                      filter="drop-shadow(0 3px 5px rgba(0,0,0,0.3))"
                    />

                    {/* Minimalist White Sneaker Rubber Soles / Dress Welts */}
                    {isShoeSneaker ? (
                      <>
                        <path d="M 150 650 C 160 655 180 655 190 650 L 190 655 C 180 660 160 660 150 655 Z" fill="#ffffff" />
                        <path d="M 210 650 C 220 655 240 655 250 650 L 250 655 C 240 660 220 660 210 655 Z" fill="#ffffff" />
                        {/* Sneaker Laces */}
                        <path d="M 166 632 L 174 632 M 166 636 L 174 636 M 166 640 L 174 640" stroke="#e4e4e7" strokeWidth="1.5" />
                        <path d="M 226 632 L 234 632 M 226 636 L 234 636 M 226 640 L 234 640" stroke="#e4e4e7" strokeWidth="1.5" />
                      </>
                    ) : (
                      <>
                        {/* Dress Oxford Toe Cap Polish Sheen */}
                        <ellipse cx="170" cy="648" rx="8" ry="3" fill="#ffffff" opacity="0.25" />
                        <ellipse cx="230" cy="648" rx="8" ry="3" fill="#ffffff" opacity="0.25" />
                      </>
                    )}
                  </g>
                ) : (
                  /* Side Profile Shoe */
                  <g id="shoeSide">
                    <path
                      d="M 174 622 L 172 650 C 172 656 186 658 214 658 C 226 658 238 654 240 650 C 238 644 230 632 226 622 Z"
                      fill="url(#shoeGrad)"
                    />
                    <path d="M 172 654 L 240 654" stroke="#000000" strokeWidth="3" />
                  </g>
                )}
              </g>
            ) : null}

            {/* LAYER 6: ACCESSORIES (Watch, Belt, Glasses) */}
            {equippedAccessory && (
              <g id="accessories">
                <circle cx="120" cy="406" r="5" fill="#ca8a04" stroke="#78350f" strokeWidth="1" />
              </g>
            )}

            {/* LAYER 7: AVATAR HEAD (Real User Photo OR Blank Sculptural Atelier Head) */}
            <g id="avatarHeadGroup">
              {activeFacePhoto ? (
                /* REAL USER PHOTO INTEGRATION */
                <g id="realUserFaceContainer">
                  {/* Perspective Head Framing based on active view angle */}
                  {viewAngle === 'front' || viewAngle === 'detail' ? (
                    <g
                      transform={`translate(${faceOffsetX}, ${faceOffsetY}) scale(${faceScale})`}
                      style={{ transformOrigin: '200px 95px' }}
                    >
                      {/* Integrated User Portrait Image */}
                      <image
                        href={activeFacePhoto}
                        x="162"
                        y="46"
                        width="76"
                        height="98"
                        preserveAspectRatio="xMidYMid slice"
                        clipPath="url(#avatarHeadClip)"
                        className="filter contrast-[1.03] brightness-[1.02]"
                      />
                      {/* Feathered Edge Blend into Neck */}
                      <path
                        d="M 166 88 C 166 52 180 44 200 44 C 220 44 234 52 234 88 C 234 116 218 138 200 138 C 182 138 166 116 166 88 Z"
                        fill="none"
                        stroke="rgba(0,0,0,0.14)"
                        strokeWidth="1.5"
                      />
                      {/* Subtle Jaw Vignette */}
                      <path
                        d="M 184 126 C 192 136 208 136 216 126 Z"
                        fill="url(#skinGradReal)"
                        opacity="0.3"
                      />
                    </g>
                  ) : viewAngle === 'three_quarter' ? (
                    /* 3/4 Turn Head with perspective offset */
                    <g
                      transform={`translate(${8 + faceOffsetX}, ${faceOffsetY}) scale(${faceScale})`}
                      style={{ transformOrigin: '200px 95px' }}
                    >
                      <image
                        href={activeFacePhoto}
                        x="164"
                        y="48"
                        width="72"
                        height="96"
                        preserveAspectRatio="xMidYMid slice"
                        clipPath="url(#avatarHeadClip)"
                        className="filter contrast-[1.04]"
                      />
                      {/* 3D Perspective Rim Shadow */}
                      <path
                        d="M 166 88 C 166 52 180 44 200 44 C 220 44 234 52 234 88 C 234 116 218 138 200 138 C 182 138 166 116 166 88 Z"
                        fill="rgba(0,0,0,0.18)"
                        className="mix-blend-multiply"
                      />
                    </g>
                  ) : viewAngle === 'side' ? (
                    /* Side Profile Contour */
                    <g
                      transform={`translate(${12 + faceOffsetX}, ${faceOffsetY}) scale(${faceScale})`}
                      style={{ transformOrigin: '200px 95px' }}
                    >
                      <ellipse cx="196" cy="95" rx="30" ry="44" fill="url(#skinGradReal)" />
                      <image
                        href={activeFacePhoto}
                        x="166"
                        y="50"
                        width="64"
                        height="92"
                        preserveAspectRatio="xMidYMid slice"
                        clipPath="url(#avatarHeadClip)"
                        opacity="0.88"
                      />
                    </g>
                  ) : (
                    /* Back View Head (Natural hair & nape) */
                    <g>
                      <ellipse cx="200" cy="95" rx="34" ry="44" fill={twinProfile?.hairColorHex || '#262626'} />
                      <ellipse cx="200" cy="85" rx="32" ry="34" fill="#171717" />
                      {/* Neck Nape Shading */}
                      <path d="M 188 126 C 194 134 206 134 212 126 Z" fill="url(#skinGradReal)" />
                    </g>
                  )}
                </g>
              ) : (
                /* BLANK SCULPTURAL ATELIER MANNEQUIN HEAD (When no photo uploaded) */
                <g id="blankMannequinHead">
                  {/* Clean Faceless Minimalist Atelier Head Oval */}
                  <ellipse
                    cx="200"
                    cy="95"
                    rx="34"
                    ry="44"
                    fill="url(#bodyBlankGrad)"
                    filter="drop-shadow(0 4px 8px rgba(0,0,0,0.25))"
                  />
                  {/* Studio Specular Soft Reflection */}
                  <ellipse
                    cx="192"
                    cy="85"
                    rx="14"
                    ry="24"
                    fill="#ffffff"
                    opacity="0.16"
                  />
                  {/* Sculptural Jaw Contour Line */}
                  <path
                    d="M 180 115 C 190 130 210 130 220 115"
                    stroke="#262626"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.4"
                  />
                </g>
              )}
            </g>

            {/* LAYER 8: INTERACTIVE FIT HOTSPOTS / ANCHORS */}
            {showHotspots &&
              activeHotspots.map((hs) => {
                const isSelected = selectedHotspot?.id === hs.id;
                // Scale hotspot coordinates to SVG space (400 x 700)
                const cx = (hs.xPct / 100) * 400;
                const cy = (hs.yPct / 100) * 700;

                return (
                  <g
                    key={hs.id}
                    onClick={() => setSelectedHotspot(isSelected ? null : hs)}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing Target Ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r="10"
                      fill="rgba(59, 130, 246, 0.2)"
                      className="animate-ping"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r="7"
                      fill={isSelected ? '#1e40af' : '#2563eb'}
                      stroke="#ffffff"
                      strokeWidth="2"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                    />
                    <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />
                  </g>
                );
              })}
          </svg>
        </div>
        )}

        {/* ACTIVE FIT DIAGNOSTIC POPUP */}
        {selectedHotspot && (
          <div className="absolute bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-30 animate-fade-in">
            <div className="rounded-2xl bg-white/95 backdrop-blur-md p-4 shadow-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1 text-3xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  <Activity size={10} />
                  <span>Fit Diagnosis • {selectedHotspot.area}</span>
                </span>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="rounded-full p-1 text-stone-400 hover:text-stone-700"
                >
                  <X size={14} />
                </button>
              </div>

              <h4 className="text-xs font-bold text-ink-950 font-serif">
                {selectedHotspot.title}
              </h4>
              <p className="mt-1 text-2xs text-ink-600 leading-relaxed">
                {selectedHotspot.diagnosis}
              </p>

              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-3xs">
                <span className="text-ink-400">Tailoring Status:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <Check size={11} /> Perfect Drape & Tension
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. BOTTOM GARMENT RACK STATUS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-white px-4 sm:px-6 py-3 z-10 relative">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-semibold text-ink-600">Equipped on Avatar:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {equippedItems.length === 0 ? (
              <span className="text-2xs text-ink-400 italic">
                Minimalist base layer active — drag or tap garments to dress
              </span>
            ) : (
              equippedItems.map(({ item, slot }) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-2xs font-medium text-ink-800 border border-stone-200"
                >
                  <span className="font-semibold capitalize">{slot}:</span>
                  <span className="truncate max-w-[120px]">{item.name}</span>
                  {onRemoveSlot && (
                    <button
                      onClick={() => onRemoveSlot(slot)}
                      className="text-ink-400 hover:text-red-600 ml-0.5"
                      title={`Remove ${slot}`}
                    >
                      <X size={11} />
                    </button>
                  )}
                </span>
              ))
            )}
          </div>
        </div>

        {/* View Perspective Hint */}
        <div className="flex items-center gap-2 text-2xs text-ink-500">
          <span>
            Current: <strong>{viewAngle.toUpperCase()}</strong> ({orbitDeg}°)
          </span>
          <span className="text-stone-300">•</span>
          <span>{activeLighting.ambientNote}</span>
        </div>
      </div>
    </div>
  );
}
