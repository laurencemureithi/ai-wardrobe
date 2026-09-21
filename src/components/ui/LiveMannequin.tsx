import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Eye,
  Activity,
  Compass,
  User,
  X,
  Heart,
} from 'lucide-react';
import type { ClothingItem, OutfitSlot } from '@/lib/types';
import {
  MANNEQUIN_POSITIONS,
  SKIN_TONE_PALETTES,
  type MannequinPosition,
  type MannequinPositionId,
} from '@/lib/mannequinFitEngine';

interface LiveMannequinProps {
  equippedItems: { item: ClothingItem; slot: OutfitSlot }[];
  activePositionId: MannequinPositionId;
  onPositionChange: (posId: MannequinPositionId) => void;
  userReferencePhotoUrl?: string | null;
  userName?: string;
  gender?: 'female' | 'male' | 'unisex';
  onEquipItem?: (item: ClothingItem, slot?: OutfitSlot) => void;
  onRemoveSlot?: (slot: OutfitSlot) => void;
  isDragOver?: boolean;
}

export function LiveMannequin({
  equippedItems,
  activePositionId,
  onPositionChange,
  userReferencePhotoUrl,
  userName = 'Alex',
  gender = 'male',
  onRemoveSlot,
  isDragOver,
}: LiveMannequinProps) {
  // Body customization state
  const [skinToneIndex, setSkinToneIndex] = useState(1); // Warm Sand
  const [chestScale, setChestScale] = useState(1.0);
  const [waistScale, setWaistScale] = useState(1.0);
  const [hipScale, setHipScale] = useState(1.0);
  const [shoulderScale, setShoulderScale] = useState(1.0);
  const [headMode, setHeadMode] = useState<'real_face' | 'atelier_sculpt'>(
    userReferencePhotoUrl ? 'real_face' : 'atelier_sculpt'
  );

  // View modes
  const [showFitHeatmap, setShowFitHeatmap] = useState(false);
  const [showTailorGrid, setShowTailorGrid] = useState(false);
  const [showProportionControls, setShowProportionControls] = useState(false);
  const [livingBreathing, setLivingBreathing] = useState(true);
  const [orbitAngle, setOrbitAngle] = useState(0); // 0 to 360 deg

  const currentSkin = SKIN_TONE_PALETTES[skinToneIndex] || SKIN_TONE_PALETTES[1];
  const activePosition: MannequinPosition =
    MANNEQUIN_POSITIONS.find((p) => p.id === activePositionId) || MANNEQUIN_POSITIONS[0];

  // Extract equipped items by slot
  const top = equippedItems.find((i) => i.slot === 'top')?.item;
  const bottom = equippedItems.find((i) => i.slot === 'bottom')?.item;
  const outerwear = equippedItems.find((i) => i.slot === 'outerwear')?.item;
  const shoes = equippedItems.find((i) => i.slot === 'shoes')?.item;
  const accessory = equippedItems.find((i) => i.slot === 'accessory')?.item;

  // Map clothing colors to realistic fabric HEX
  const getGarmentColor = (item?: ClothingItem, defaultHex = '#27272a') => {
    if (!item) return defaultHex;
    const c = (item.color || '').toLowerCase();
    const name = item.name.toLowerCase();

    if (c.includes('white') || name.includes('white') || name.includes('ivory')) return '#fafaf9';
    if (c.includes('black') || name.includes('black') || name.includes('charcoal')) return '#18181b';
    if (c.includes('navy') || name.includes('navy')) return '#1e293b';
    if (c.includes('blue') || name.includes('denim')) return '#3b82f6';
    if (c.includes('beige') || c.includes('cream') || name.includes('beige') || name.includes('sand')) return '#e7e0d4';
    if (c.includes('grey') || c.includes('gray')) return '#71717a';
    if (c.includes('brown') || c.includes('camel') || name.includes('camel')) return '#a16207';
    if (c.includes('olive') || c.includes('green')) return '#4d7c0f';
    if (c.includes('red') || c.includes('burgundy')) return '#881337';
    return '#3f3f46';
  };

  const topColor = getGarmentColor(top, '#f4f4f5');
  const bottomColor = getGarmentColor(bottom, '#27272a');
  const outerColor = getGarmentColor(outerwear, '#1c1917');
  const shoeColor = getGarmentColor(shoes, '#09090b');

  // Handle position select
  const handleSelectPosition = (pos: MannequinPosition) => {
    onPositionChange(pos.id);
    setOrbitAngle(pos.angleDeg);
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Top Mannequin Controls Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white/80 backdrop-blur-md rounded-2xl border border-stone-200/80 shadow-xs mb-3">
        {/* Real Person Likeness Badge */}
        <div className="flex items-center gap-2">
          <div className="relative h-7 w-7 rounded-full overflow-hidden border border-accent-400 bg-stone-100 flex items-center justify-center shadow-xs">
            {userReferencePhotoUrl && headMode === 'real_face' ? (
              <img src={userReferencePhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <User size={15} className="text-ink-600" />
            )}
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-ink-950 font-serif">{userName}’s Digital Mannequin</span>
              <span className="text-3xs uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-accent-100 text-accent-800">
                Live Atelier
              </span>
            </div>
            <p className="text-3xs text-ink-500 font-sans">
              Calibrated to {gender} silhouette • {currentSkin.name}
            </p>
          </div>
        </div>

        {/* Quick Diagnostic Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLivingBreathing(!livingBreathing)}
            title={livingBreathing ? 'Pause Living Motion' : 'Activate Living Breathing'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-semibold transition-all ${
              livingBreathing
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-ink-600 hover:bg-stone-200'
            }`}
          >
            <Heart size={13} className={livingBreathing ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">{livingBreathing ? 'Living Motion' : 'Static'}</span>
          </button>

          <button
            onClick={() => setShowFitHeatmap(!showFitHeatmap)}
            title="Toggle Fabric Tension Heatmap"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-semibold transition-all ${
              showFitHeatmap
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-stone-100 text-ink-600 hover:bg-stone-200'
            }`}
          >
            <Activity size={13} />
            <span className="hidden sm:inline">Fit Heatmap</span>
          </button>

          <button
            onClick={() => setShowTailorGrid(!showTailorGrid)}
            title="Toggle Tailoring Landmark Grid"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-semibold transition-all ${
              showTailorGrid
                ? 'bg-ink-900 text-white shadow-xs'
                : 'bg-stone-100 text-ink-600 hover:bg-stone-200'
            }`}
          >
            <Compass size={13} />
            <span className="hidden sm:inline">Grid Lines</span>
          </button>

          <button
            onClick={() => setShowProportionControls(!showProportionControls)}
            title="Body Measurement Calibration"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-semibold transition-all ${
              showProportionControls
                ? 'bg-accent-700 text-white shadow-xs'
                : 'bg-stone-100 text-ink-600 hover:bg-stone-200'
            }`}
          >
            <Sliders size={13} />
            <span className="hidden sm:inline">Calibrate Body</span>
          </button>

          {userReferencePhotoUrl && (
            <button
              onClick={() => setHeadMode(headMode === 'real_face' ? 'atelier_sculpt' : 'real_face')}
              title="Toggle Face Likeness"
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-semibold transition-all ${
                headMode === 'real_face'
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-ink-600 hover:bg-stone-200'
              }`}
            >
              <Eye size={13} />
              <span className="hidden sm:inline">
                {headMode === 'real_face' ? 'Photo Head' : 'Sculpt Head'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Expandable Body Proportion Sliders */}
      {showProportionControls && (
        <div className="w-full bg-stone-50/95 border border-stone-200 rounded-2xl p-3.5 mb-3 animate-fadeIn text-xs shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-ink-900">Custom Body Calibration (Bespoke Sizing)</span>
            <button
              onClick={() => {
                setChestScale(1.0);
                setWaistScale(1.0);
                setHipScale(1.0);
                setShoulderScale(1.0);
              }}
              className="text-3xs text-accent-700 hover:underline flex items-center gap-1"
            >
              <RotateCcw size={11} /> Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <div className="flex justify-between text-3xs font-semibold text-ink-600 mb-1">
                <span>Chest / Bust</span>
                <span>{Math.round(chestScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.2"
                step="0.02"
                value={chestScale}
                onChange={(e) => setChestScale(parseFloat(e.target.value))}
                className="w-full accent-ink-900 h-1.5 bg-stone-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-3xs font-semibold text-ink-600 mb-1">
                <span>Waist</span>
                <span>{Math.round(waistScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.25"
                step="0.02"
                value={waistScale}
                onChange={(e) => setWaistScale(parseFloat(e.target.value))}
                className="w-full accent-ink-900 h-1.5 bg-stone-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-3xs font-semibold text-ink-600 mb-1">
                <span>Hips</span>
                <span>{Math.round(hipScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.25"
                step="0.02"
                value={hipScale}
                onChange={(e) => setHipScale(parseFloat(e.target.value))}
                className="w-full accent-ink-900 h-1.5 bg-stone-200 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-3xs font-semibold text-ink-600 mb-1">
                <span>Shoulders</span>
                <span>{Math.round(shoulderScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.9"
                max="1.15"
                step="0.02"
                value={shoulderScale}
                onChange={(e) => setShoulderScale(parseFloat(e.target.value))}
                className="w-full accent-ink-900 h-1.5 bg-stone-200 rounded-lg"
              />
            </div>
          </div>

          {/* Skin Tone Selector */}
          <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center gap-2">
            <span className="text-3xs font-semibold text-ink-500 uppercase">Skin Tone:</span>
            <div className="flex items-center gap-1.5">
              {SKIN_TONE_PALETTES.map((st, idx) => (
                <button
                  key={st.id}
                  onClick={() => setSkinToneIndex(idx)}
                  title={st.name}
                  className={`h-5 w-5 rounded-full border border-stone-300 transition-all ${
                    skinToneIndex === idx ? 'ring-2 ring-ink-950 scale-110 shadow-xs' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: st.hex }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Mannequin Stage */}
      <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[3/4.8] rounded-3xl overflow-hidden bg-gradient-to-b from-stone-100 via-stone-200/90 to-stone-300/80 border-2 border-white/90 shadow-2xl flex flex-col items-center justify-center p-2">
        {/* Studio Floor Plinth / Shadow */}
        <div className="absolute bottom-6 w-48 h-10 rounded-full bg-ink-950/15 blur-md transform -rotate-1 pointer-events-none" />
        <div className="absolute bottom-5 w-40 h-3 rounded-full bg-stone-400/50 blur-xs pointer-events-none" />

        {/* Ambient Tailor Studio Grid Guide (if enabled) */}
        {showTailorGrid && (
          <div className="absolute inset-0 pointer-events-none opacity-40 z-10">
            {/* Horizontal landmark lines */}
            <div className="absolute top-[22%] left-0 right-0 border-b border-dashed border-sky-600 flex justify-between px-2 text-3xs font-mono text-sky-700">
              <span>SHOULDER YOKE</span>
              <span>102 CM</span>
            </div>
            <div className="absolute top-[36%] left-0 right-0 border-b border-dashed border-sky-600 flex justify-between px-2 text-3xs font-mono text-sky-700">
              <span>CHEST APEX</span>
              <span>88 CM</span>
            </div>
            <div className="absolute top-[48%] left-0 right-0 border-b border-dashed border-sky-600 flex justify-between px-2 text-3xs font-mono text-sky-700">
              <span>NATURAL WAIST</span>
              <span>74 CM</span>
            </div>
            <div className="absolute top-[58%] left-0 right-0 border-b border-dashed border-sky-600 flex justify-between px-2 text-3xs font-mono text-sky-700">
              <span>HIP PIVOT</span>
              <span>96 CM</span>
            </div>
            <div className="absolute top-[82%] left-0 right-0 border-b border-dashed border-sky-600 flex justify-between px-2 text-3xs font-mono text-sky-700">
              <span>TROUSER BREAK</span>
              <span>HEM 18 CM</span>
            </div>
            {/* Vertical Plumb Line */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 border-l border-sky-600/40" />
          </div>
        )}

        {/* Fit Heatmap Legend Banner */}
        {showFitHeatmap && (
          <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between bg-ink-950/85 backdrop-blur-md rounded-xl px-3 py-1.5 text-white text-3xs shadow-lg animate-fadeIn">
            <span className="font-bold flex items-center gap-1">
              <Activity size={12} className="text-amber-400" />
              Dynamic Drape Tension
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Relaxed
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Tailored
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-400" /> High Stress
              </span>
            </div>
          </div>
        )}

        {/* Drag Over Cue */}
        {isDragOver && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-accent-600/25 backdrop-blur-xs border-2 border-dashed border-accent-600 animate-pulse">
            <div className="flex items-center gap-2 rounded-2xl bg-ink-950 px-4 py-2 text-xs font-semibold text-white shadow-xl">
              <Sparkles size={16} className="text-accent-300" />
              <span>Release to fit onto {userName}’s mannequin!</span>
            </div>
          </div>
        )}

        {/* 3D Interactive Mannequin Model Container */}
        <div
          className={`relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-out ${
            livingBreathing ? 'avatar-living-breathe' : ''
          }`}
          style={{
            transform: `perspective(900px) rotateY(${orbitAngle}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Real Person Face Headpiece OR Haute-Couture Sculpt Head */}
          <div
            className="absolute top-[5%] z-20 flex flex-col items-center transition-all duration-300"
            style={{
              transform: `scale(${shoulderScale})`,
            }}
          >
            {userReferencePhotoUrl && headMode === 'real_face' ? (
              <div className="relative h-16 w-14 rounded-2xl overflow-hidden border border-stone-300/80 shadow-md bg-stone-200">
                <img
                  src={userReferencePhotoUrl}
                  alt={userName}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent pointer-events-none" />
              </div>
            ) : (
              /* Stylized Atelier Mannequin Head */
              <div
                className="relative h-16 w-12 rounded-[24px] shadow-md flex flex-col items-center justify-center border border-stone-400/40"
                style={{
                  background: `linear-gradient(145deg, ${currentSkin.hex} 0%, ${currentSkin.shadow} 100%)`,
                }}
              >
                {/* Chic faceted crest line */}
                <div className="w-1 h-6 rounded-full bg-stone-900/15" />
                <div className="w-4 h-0.5 rounded-full bg-stone-900/20 mt-1" />
              </div>
            )}
            {/* Neck Pillar */}
            <div
              className="w-4 h-5 -mt-1 rounded-b-md shadow-inner"
              style={{ backgroundColor: currentSkin.shadow }}
            />
          </div>

          {/* SVG ATELIER LIVE MANNEQUIN & FITTED ATTIRE */}
          <svg
            viewBox="0 0 300 480"
            className="w-full h-full max-h-[440px] drop-shadow-lg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Radial & Linear Shading Gradients */}
              <linearGradient id="mannequinShade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={currentSkin.shadow} />
                <stop offset="35%" stopColor={currentSkin.hex} />
                <stop offset="70%" stopColor={currentSkin.hex} />
                <stop offset="100%" stopColor={currentSkin.shadow} />
              </linearGradient>

              <linearGradient id="topShade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#000" stopOpacity="0.25" />
                <stop offset="30%" stopColor="#fff" stopOpacity="0.1" />
                <stop offset="70%" stopColor="#fff" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
              </linearGradient>

              <linearGradient id="outerShade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
                <stop offset="50%" stopColor="#fff" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
              </linearGradient>

              <linearGradient id="bottomShade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#000" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#fff" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
              </linearGradient>

              {/* Heatmap tension filters */}
              <filter id="tensionGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* BASE ANATOMICAL MANNEQUIN SILHOUETTE (Body Form) */}
            <g id="mannequin-torso-base">
              {/* Shoulders & Chest Base */}
              <path
                d={
                  gender === 'female'
                    ? `M ${150 - 48 * shoulderScale} 92 Q 150 86 ${150 + 48 * shoulderScale} 92 L ${
                        150 + 38 * chestScale
                      } 150 Q ${150 + 26 * waistScale} 185 ${150 + 40 * hipScale} 220 L ${
                        150 - 40 * hipScale
                      } 220 Q ${150 - 26 * waistScale} 185 ${150 - 38 * chestScale} 150 Z`
                    : `M ${150 - 54 * shoulderScale} 92 Q 150 86 ${150 + 54 * shoulderScale} 92 L ${
                        150 + 44 * chestScale
                      } 150 Q ${150 + 32 * waistScale} 185 ${150 + 38 * hipScale} 220 L ${
                        150 - 38 * hipScale
                      } 220 Q ${150 - 32 * waistScale} 185 ${150 - 44 * chestScale} 150 Z`
                }
                fill="url(#mannequinShade)"
                stroke={currentSkin.shadow}
                strokeWidth="1.2"
              />

              {/* Pelvis & Hip Pivot */}
              <path
                d={`M ${150 - 38 * hipScale} 220 Q 150 235 ${150 + 38 * hipScale} 220 L ${
                  150 + 34 * hipScale
                } 250 Q 150 262 ${150 - 34 * hipScale} 250 Z`}
                fill={currentSkin.shadow}
                opacity="0.8"
              />
            </g>

            {/* LEGS GEOMETRY (Adapts to Active Position) */}
            <g id="mannequin-legs">
              {activePositionId === 'walking' ? (
                // Walking Stride: Front leg forward, back leg back
                <g>
                  {/* Back Leg (Right) */}
                  <path
                    d="M 158 245 L 180 340 L 195 435 L 175 438 L 160 345 L 152 250 Z"
                    fill={currentSkin.shadow}
                    opacity="0.8"
                  />
                  {/* Front Leg (Left) */}
                  <path
                    d="M 125 245 L 115 340 L 105 432 L 125 434 L 138 340 L 148 250 Z"
                    fill="url(#mannequinShade)"
                  />
                </g>
              ) : activePositionId === 'seated' ? (
                // Seated Pose: Hips angled, thighs horizontal, shins down
                <g>
                  {/* Studio Plinth Box */}
                  <rect x="75" y="320" width="150" height="120" rx="10" fill="#e4e4e7" stroke="#cbd5e1" />
                  <path
                    d="M 120 240 L 95 320 L 92 430 L 112 430 L 118 330 L 145 250 Z"
                    fill="url(#mannequinShade)"
                  />
                  <path
                    d="M 155 240 L 185 320 L 188 430 L 168 430 L 162 330 L 135 250 Z"
                    fill="url(#mannequinShade)"
                  />
                </g>
              ) : activePositionId === 'side_profile' ? (
                // 90° Side Profile: Unified leg profile
                <path
                  d="M 140 240 Q 165 245 160 330 Q 155 380 152 435 L 132 435 Q 135 380 138 330 Q 135 280 140 240 Z"
                  fill="url(#mannequinShade)"
                />
              ) : (
                // Standard Standing (Front, Hands on Hips, 3/4, Back)
                <g>
                  {/* Left Leg */}
                  <path
                    d="M 122 245 L 118 340 L 112 435 L 134 435 L 140 340 L 146 250 Z"
                    fill="url(#mannequinShade)"
                  />
                  {/* Right Leg */}
                  <path
                    d="M 154 250 L 160 340 L 166 435 L 188 435 L 182 340 L 178 245 Z"
                    fill="url(#mannequinShade)"
                  />
                </g>
              )}
            </g>

            {/* ATTIRE LAYER 1: BOTTOMS (Trousers, Jeans, Skirts, Shorts) */}
            {bottom && (
              <g id="fitted-bottoms">
                {activePositionId === 'walking' ? (
                  // Walking Stride Bottoms
                  <path
                    d="M 118 208 Q 150 216 182 208 L 198 340 L 202 428 L 168 428 L 158 330 L 148 330 L 138 428 L 100 428 L 108 340 Z"
                    fill={bottomColor}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="0.8"
                  />
                ) : activePositionId === 'seated' ? (
                  // Seated Bottoms
                  <path
                    d="M 115 208 Q 150 216 185 208 L 195 325 L 194 425 L 162 425 L 155 330 L 145 330 L 138 425 L 105 425 L 105 325 Z"
                    fill={bottomColor}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="0.8"
                  />
                ) : activePositionId === 'side_profile' ? (
                  // Side Profile Bottoms
                  <path
                    d="M 132 208 Q 155 212 168 208 L 165 330 L 158 430 L 126 430 L 130 330 Z"
                    fill={bottomColor}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="0.8"
                  />
                ) : (
                  // Upright Standing Trousers (Front, Hands on Hips, 3/4, Back)
                  <g>
                    {/* Waistband */}
                    <path
                      d={`M ${150 - 36 * waistScale} 206 Q 150 212 ${150 + 36 * waistScale} 206 L ${
                        150 + 38 * hipScale
                      } 220 Q 150 226 ${150 - 38 * hipScale} 220 Z`}
                      fill={bottomColor}
                      filter="brightness(0.92)"
                    />
                    {/* Trouser Legs */}
                    <path
                      d={`M ${150 - 38 * hipScale} 218 Q 150 224 ${150 + 38 * hipScale} 218 L ${
                        150 + 44 * hipScale
                      } 265 L 196 345 L 194 430 L 160 430 L 150 280 L 140 430 L 106 430 L 104 345 L ${
                        150 - 44 * hipScale
                      } 265 Z`}
                      fill={bottomColor}
                      stroke="rgba(0,0,0,0.25)"
                      strokeWidth="1"
                    />
                    {/* Tailored Center Crease Lines */}
                    <line x1="126" y1="240" x2="123" y2="425" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                    <line x1="174" y1="240" x2="177" y2="425" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
                  </g>
                )}
                {/* Fabric Shading Overlay */}
                <rect x="90" y="206" width="120" height="230" fill="url(#bottomShade)" pointerEvents="none" />
              </g>
            )}

            {/* ATTIRE LAYER 2: TOPS (Shirt, T-Shirt, Knitwear, Turtleneck) */}
            {top && (
              <g id="fitted-top">
                {/* Main Torso Garment */}
                <path
                  d={
                    gender === 'female'
                      ? `M ${150 - 47 * shoulderScale} 92 Q 150 85 ${150 + 47 * shoulderScale} 92 L ${
                          150 + 39 * chestScale
                        } 150 Q ${150 + 28 * waistScale} 185 ${150 + 38 * hipScale} 215 Q 150 220 ${
                          150 - 38 * hipScale
                        } 215 Q ${150 - 28 * waistScale} 185 ${150 - 39 * chestScale} 150 Z`
                      : `M ${150 - 53 * shoulderScale} 92 Q 150 85 ${150 + 53 * shoulderScale} 92 L ${
                          150 + 45 * chestScale
                        } 150 Q ${150 + 33 * waistScale} 185 ${150 + 37 * hipScale} 215 Q 150 220 ${
                          150 - 37 * hipScale
                        } 215 Q ${150 - 33 * waistScale} 185 ${150 - 45 * chestScale} 150 Z`
                  }
                  fill={topColor}
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth="0.8"
                />

                {/* Neckline / Collar Geometry based on garment type */}
                {top.name.toLowerCase().includes('turtleneck') ? (
                  // Turtleneck roll collar
                  <rect
                    x="136"
                    y="76"
                    width="28"
                    height="18"
                    rx="4"
                    fill={topColor}
                    stroke="rgba(0,0,0,0.3)"
                    strokeWidth="0.8"
                  />
                ) : top.name.toLowerCase().includes('shirt') || top.subcategory === 'shirt' ? (
                  // Structured Oxford / Button-Down Collar with placket
                  <g>
                    {/* Left Collar Point */}
                    <path d="M 136 90 L 148 114 L 140 112 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.7" />
                    {/* Right Collar Point */}
                    <path d="M 164 90 L 152 114 L 160 112 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.7" />
                    {/* Center Placket Line */}
                    <line x1="150" y1="110" x2="150" y2="210" stroke="rgba(0,0,0,0.18)" strokeWidth="1" strokeDasharray="3,3" />
                  </g>
                ) : (
                  // Clean Crewneck / Scoop Neck
                  <path
                    d="M 137 90 Q 150 106 163 90"
                    fill="none"
                    stroke="rgba(0,0,0,0.25)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}

                {/* Top Fabric Shading */}
                <rect x="90" y="85" width="120" height="135" fill="url(#topShade)" pointerEvents="none" />
              </g>
            )}

            {/* ARMS GEOMETRY & SLEEVES (Adapts to Active Position) */}
            <g id="mannequin-arms">
              {activePositionId === 'hands_on_hips' ? (
                // Hands on Hips: Elbows bent out, hands anchored at waist
                <g>
                  {/* Left Arm */}
                  <path
                    d="M 98 94 L 62 145 L 112 188 L 120 182 L 78 142 L 108 98 Z"
                    fill={top ? topColor : 'url(#mannequinShade)'}
                    stroke="rgba(0,0,0,0.2)"
                  />
                  {/* Right Arm */}
                  <path
                    d="M 202 94 L 238 145 L 188 188 L 180 182 L 222 142 L 192 98 Z"
                    fill={top ? topColor : 'url(#mannequinShade)'}
                    stroke="rgba(0,0,0,0.2)"
                  />
                  {/* Hands on waist */}
                  <circle cx="116" cy="185" r="7" fill={currentSkin.hex} />
                  <circle cx="184" cy="185" r="7" fill={currentSkin.hex} />
                </g>
              ) : activePositionId === 'crossed_arms' ? (
                // Crossed Arms across chest
                <g>
                  {/* Left arm folding over */}
                  <path
                    d="M 98 94 L 88 140 L 188 155 L 186 170 L 80 148 L 105 98 Z"
                    fill={top ? topColor : 'url(#mannequinShade)'}
                    stroke="rgba(0,0,0,0.3)"
                  />
                  {/* Right arm folding under */}
                  <path
                    d="M 202 94 L 212 140 L 112 152 L 114 167 L 220 148 L 195 98 Z"
                    fill={top ? topColor : 'url(#mannequinShade)'}
                    stroke="rgba(0,0,0,0.3)"
                  />
                  {/* Hands tucking into elbows */}
                  <ellipse cx="192" cy="162" rx="7" ry="5" fill={currentSkin.hex} />
                  <ellipse cx="108" cy="160" rx="7" ry="5" fill={currentSkin.hex} />
                </g>
              ) : activePositionId === 'walking' ? (
                // Walking Stride: One arm forward, one back
                <g>
                  {/* Left Arm Swinging Forward */}
                  <path
                    d="M 98 94 L 84 160 L 76 220 L 90 220 L 98 165 L 108 98 Z"
                    fill={top ? topColor : 'url(#mannequinShade)'}
                    stroke="rgba(0,0,0,0.2)"
                  />
                  <ellipse cx="83" cy="225" rx="6" ry="7" fill={currentSkin.hex} />
                  {/* Right Arm Swinging Back */}
                  <path
                    d="M 202 94 L 216 160 L 228 220 L 214 220 L 202 165 L 192 98 Z"
                    fill={top ? topColor : 'url(#mannequinShade)'}
                    stroke="rgba(0,0,0,0.2)"
                  />
                  <ellipse cx="221" cy="225" rx="6" ry="7" fill={currentSkin.hex} />
                </g>
              ) : activePositionId === 'side_profile' ? (
                // Side Profile Single Arm
                <g>
                  <path
                    d="M 148 94 L 152 165 L 150 225 L 138 225 L 140 165 L 136 98 Z"
                    fill={top ? topColor : 'url(#mannequinShade)'}
                    stroke="rgba(0,0,0,0.2)"
                  />
                  <ellipse cx="144" cy="230" rx="6" ry="7" fill={currentSkin.hex} />
                </g>
              ) : (
                // Standard Natural Stance (Front, 3/4, Seated, Back)
                <g>
                  {/* Left Arm */}
                  <path
                    d="M 98 94 L 86 165 L 82 225 L 96 225 L 100 165 L 108 98 Z"
                    fill={top ? topColor : 'url(#mannequinShade)'}
                    stroke="rgba(0,0,0,0.2)"
                  />
                  <ellipse cx="89" cy="230" rx="6" ry="7" fill={currentSkin.hex} />
                  {/* Right Arm */}
                  <path
                    d="M 202 94 L 214 165 L 218 225 L 204 225 L 200 165 L 192 98 Z"
                    fill={top ? topColor : 'url(#mannequinShade)'}
                    stroke="rgba(0,0,0,0.2)"
                  />
                  <ellipse cx="211" cy="230" rx="6" ry="7" fill={currentSkin.hex} />
                </g>
              )}
            </g>

            {/* ATTIRE LAYER 3: OUTERWEAR (Blazer, Trench Coat, Overcoat, Jacket) */}
            {outerwear && (
              <g id="fitted-outerwear">
                {/* Left Lapel & Front Panel */}
                <path
                  d="M 94 92 L 134 94 L 140 148 L 118 225 L 90 222 L 86 145 Z"
                  fill={outerColor}
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth="1.2"
                />
                {/* Right Lapel & Front Panel */}
                <path
                  d="M 206 92 L 166 94 L 160 148 L 182 225 L 210 222 L 214 145 Z"
                  fill={outerColor}
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth="1.2"
                />
                {/* Notch Lapel Collar Rolls */}
                <path d="M 124 93 L 138 128 L 126 122 Z" fill="#ffffff" fillOpacity="0.15" />
                <path d="M 176 93 L 162 128 L 174 122 Z" fill="#ffffff" fillOpacity="0.15" />

                {/* Center Gap Showing Inner Shirt & Button Accent */}
                <circle cx="150" cy="180" r="2.5" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />
                <circle cx="150" cy="202" r="2.5" fill="#e2e8f0" stroke="#475569" strokeWidth="0.8" />

                {/* Flap Pockets */}
                <line x1="98" y1="188" x2="116" y2="188" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="184" y1="188" x2="202" y2="188" stroke="rgba(0,0,0,0.4)" strokeWidth="2.5" strokeLinecap="round" />

                {/* Outerwear Shading */}
                <rect x="85" y="90" width="130" height="140" fill="url(#outerShade)" pointerEvents="none" />
              </g>
            )}

            {/* ATTIRE LAYER 4: FOOTWEAR (Loafers, Boots, Sneakers, Heels) */}
            {shoes && (
              <g id="fitted-shoes">
                {activePositionId === 'side_profile' ? (
                  // Side Shoe Profile
                  <path
                    d="M 124 430 Q 155 430 168 438 L 176 446 L 120 446 Z"
                    fill={shoeColor}
                    stroke="#ffffff"
                    strokeWidth="0.8"
                  />
                ) : (
                  // Front / Stance Shoes
                  <g>
                    {/* Left Shoe */}
                    <path
                      d="M 104 430 Q 118 428 132 430 L 135 446 Q 118 450 101 446 Z"
                      fill={shoeColor}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="0.8"
                    />
                    {/* Right Shoe */}
                    <path
                      d="M 168 430 Q 182 428 196 430 L 199 446 Q 182 450 165 446 Z"
                      fill={shoeColor}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="0.8"
                    />
                  </g>
                )}
              </g>
            )}

            {/* ACCESSORY (Watch / Belt) */}
            {accessory && (
              <g id="fitted-accessory">
                {/* Watch on left wrist */}
                <rect x="84" y="215" width="10" height="4" rx="1.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />
              </g>
            )}

            {/* FIT HEATMAP VISUAL OVERLAYS (When enabled) */}
            {showFitHeatmap && (
              <g id="heatmap-overlays" filter="url(#tensionGlow)" opacity="0.75" pointerEvents="none">
                {/* Shoulder tension indicators */}
                <ellipse cx="102" cy="96" rx="14" ry="9" fill={activePositionId === 'hands_on_hips' ? '#f59e0b' : '#10b981'} />
                <ellipse cx="198" cy="96" rx="14" ry="9" fill={activePositionId === 'hands_on_hips' ? '#f59e0b' : '#10b981'} />
                {/* Chest apex drape */}
                <circle cx="150" cy="140" r="18" fill="#10b981" />
                {/* Waist taper */}
                <ellipse cx="150" cy="188" rx="22" ry="8" fill={activePositionId === 'seated' ? '#f59e0b' : '#10b981'} />
                {/* Hip pivot */}
                <ellipse cx="150" cy="245" rx="30" ry="10" fill="#10b981" />
                {/* Knee / Stride tension */}
                <circle cx="120" cy="340" r="14" fill={activePositionId === 'walking' ? '#3b82f6' : '#10b981'} />
                <circle cx="180" cy="340" r="14" fill={activePositionId === 'walking' ? '#3b82f6' : '#10b981'} />
              </g>
            )}
          </svg>
        </div>

        {/* Equipped Garment Badges on Mannequin Canvas */}
        {equippedItems.length > 0 && onRemoveSlot && (
          <div className="absolute top-3 left-3 z-30 flex flex-wrap gap-1 max-w-[220px]">
            {equippedItems.map(({ item, slot }) => (
              <div
                key={slot}
                className="flex items-center gap-1 rounded-full bg-ink-950/80 backdrop-blur-md px-2 py-0.5 text-3xs font-medium text-white shadow-xs border border-white/20"
              >
                <span className="capitalize text-accent-300">{slot}:</span>
                <span className="truncate max-w-[70px]">{item.name}</span>
                <button
                  onClick={() => onRemoveSlot(slot)}
                  title={`Remove ${slot}`}
                  className="text-white/60 hover:text-white"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Position / Angle Indicator HUD on Canvas Bottom */}
        <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between bg-ink-950/80 backdrop-blur-md rounded-2xl px-3 py-2 text-white shadow-lg">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-3xs uppercase font-bold tracking-widest text-accent-400">Position</span>
              <span className="text-xs font-bold font-serif">{activePosition.name}</span>
            </div>
            <p className="text-3xs text-ink-300 truncate max-w-[200px]">{activePosition.fitFocus}</p>
          </div>

          {/* Quick 360 Orbit Reset */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setOrbitAngle((prev) => (prev + 45) % 360)}
              title="Rotate mannequin by 45°"
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-3xs font-semibold text-white transition-all"
            >
              <RotateCcw size={11} className="transform rotate-90" />
              <span>{orbitAngle}°</span>
            </button>
          </div>
        </div>
      </div>

      {/* POSITIONS & FIT INSPECTION CONTROLS (Below Mannequin) */}
      <div className="w-full mt-3 bg-white rounded-2xl border border-stone-200/80 p-3 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Compass size={15} className="text-accent-600" />
            <span className="text-xs font-bold text-ink-950">Change Position & Inspect Fit</span>
          </div>
          <span className="text-3xs text-ink-500 font-medium">8 Bespoke Stances</span>
        </div>

        {/* Horizontal Position Buttons Scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MANNEQUIN_POSITIONS.map((pos) => {
            const isSelected = activePositionId === pos.id;
            return (
              <button
                key={pos.id}
                onClick={() => handleSelectPosition(pos)}
                className={`flex flex-col items-start p-2 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-ink-950 text-white border-ink-950 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 text-ink-800 border-stone-200/70'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className="text-xs font-bold truncate">{pos.name}</span>
                  {isSelected && <Check size={12} className="text-accent-400" />}
                </div>
                <span
                  className={`text-3xs truncate w-full ${
                    isSelected ? 'text-ink-300' : 'text-ink-500'
                  }`}
                >
                  {pos.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {/* Real-time Tailoring Fit Diagnostic Panel for Selected Position */}
        <div className="mt-3 pt-3 border-t border-stone-200/70">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-3xs font-bold uppercase tracking-wider text-ink-400">
              Live Tailoring Report ({activePosition.name})
            </span>
            <span className="text-3xs text-emerald-700 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Optimal Drape Score: 96%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activePosition.diagnostics.map((diag, i) => (
              <div
                key={i}
                className="flex flex-col p-2 rounded-xl bg-stone-50 border border-stone-200/60 text-2xs"
              >
                <div className="flex items-center justify-between font-semibold mb-0.5">
                  <span className="text-ink-900">{diag.area}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-3xs font-bold uppercase ${
                      diag.status === 'optimal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : diag.status === 'tailored'
                        ? 'bg-blue-100 text-blue-800'
                        : diag.status === 'snug'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-200 text-ink-700'
                    }`}
                  >
                    {diag.status} ({diag.tensionPct}%)
                  </span>
                </div>
                <p className="text-3xs text-ink-600 leading-relaxed">{diag.observation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
