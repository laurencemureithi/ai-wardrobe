import { useState, useEffect } from 'react';
import {
  Home,
  Sparkles,
  Shirt,
  MessageSquare,
  Calendar,
  BarChart3,
  Bookmark,
  Clock,
  User,
  Wand2,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import { getBranding, setBranding, type BrandingConfig, SYSTEM_NAME_PRESETS } from '@/lib/brandingService';

export type Tab =
  | 'home'
  | 'twin'
  | 'wardrobe'
  | 'stylist'
  | 'planner'
  | 'insights'
  | 'looks'
  | 'history'
  | 'profile';

interface NavigationProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  laundryBadgeCount?: number;
}

const MAIN_TABS: { id: Tab; label: string; icon: typeof Home; badge?: string }[] = [
  { id: 'home', label: 'Today', icon: Home },
  { id: 'twin', label: 'Digital Twin', icon: Wand2, badge: 'Flagship' },
  { id: 'wardrobe', label: 'Wardrobe', icon: Shirt },
  { id: 'stylist', label: 'AI Stylist', icon: MessageSquare },
  { id: 'planner', label: 'Planner', icon: Calendar },
  { id: 'insights', label: 'Insights & Social', icon: BarChart3 },
  { id: 'looks', label: 'Saved Looks', icon: Bookmark },
  { id: 'history', label: 'Wear History', icon: Clock },
  { id: 'profile', label: 'Profile', icon: User },
];

const MOBILE_PRIMARY_TABS: Tab[] = ['home', 'twin', 'wardrobe', 'stylist', 'planner', 'profile'];

export function Navigation({ active, onChange, laundryBadgeCount }: NavigationProps) {
  const [branding, setLocalBranding] = useState<BrandingConfig>(getBranding());
  const [isEditingBrand, setIsEditingBrand] = useState(false);
  const [brandInput, setBrandInput] = useState(branding.systemName);
  const [taglineInput, setTaglineInput] = useState(branding.systemTagline);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent<BrandingConfig>).detail;
      if (detail) {
        setLocalBranding(detail);
        setBrandInput(detail.systemName);
        setTaglineInput(detail.systemTagline);
      }
    };
    window.addEventListener('atelier:branding_updated', handleUpdate);
    return () => window.removeEventListener('atelier:branding_updated', handleUpdate);
  }, []);

  const handleSaveBrand = () => {
    if (brandInput.trim()) {
      const updated = setBranding({
        systemName: brandInput.trim(),
        systemTagline: taglineInput.trim(),
      });
      setLocalBranding(updated);
    }
    setIsEditingBrand(false);
  };

  return (
    <>
      {/* DESKTOP / TABLET SIDEBAR */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-ink-100 bg-white/95 backdrop-blur-md z-40">
        {/* Brand Header */}
        <div className="group relative px-5 py-5 border-b border-ink-100">
          {!isEditingBrand ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white shadow-sm">
                  <Sparkles size={20} className="text-sand-300" />
                </div>
                <div>
                  <h1 className="text-base font-serif font-bold text-ink-950 tracking-tight leading-tight">
                    {branding.systemName}
                  </h1>
                  <p className="text-3xs text-ink-500 font-sans tracking-wide truncate max-w-[130px]">
                    {branding.systemTagline}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setBrandInput(branding.systemName);
                  setTaglineInput(branding.systemTagline);
                  setIsEditingBrand(true);
                }}
                title="Rename System"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-stone-100"
              >
                <Edit3 size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xs uppercase font-bold text-ink-400 tracking-wider">Rename System</span>
                <button
                  onClick={() => setIsEditingBrand(false)}
                  className="text-ink-400 hover:text-ink-800"
                >
                  <X size={14} />
                </button>
              </div>
              <input
                type="text"
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                placeholder="System Name"
                className="w-full text-xs font-semibold px-2 py-1 rounded-md border border-ink-300 bg-white text-ink-950 focus:outline-none focus:ring-1 focus:ring-ink-900"
                autoFocus
              />
              <input
                type="text"
                value={taglineInput}
                onChange={(e) => setTaglineInput(e.target.value)}
                placeholder="System Tagline"
                className="w-full text-2xs px-2 py-1 rounded-md border border-ink-200 bg-stone-50 text-ink-700 focus:outline-none focus:ring-1 focus:ring-ink-900"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1 pt-1">
                {SYSTEM_NAME_PRESETS.slice(0, 3).map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setBrandInput(p.name);
                      setTaglineInput(p.tagline);
                    }}
                    className="text-3xs px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-ink-700"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-1 pt-1">
                <button
                  onClick={() => setIsEditingBrand(false)}
                  className="px-2 py-1 text-2xs text-ink-500 hover:text-ink-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBrand}
                  className="flex items-center gap-1 px-2.5 py-1 text-2xs font-semibold bg-ink-900 text-white rounded-md hover:bg-ink-800 shadow-xs"
                >
                  <Check size={12} /> Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-3 pb-2 text-2xs font-semibold text-ink-400 uppercase tracking-wider">
            Daily Dressing
          </div>
          {MAIN_TABS.slice(0, 5).map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'text-ink-700 hover:bg-ink-100 hover:text-ink-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{tab.label}</span>
                </div>
                {tab.id === 'planner' && laundryBadgeCount && laundryBadgeCount > 0 ? (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-2xs font-semibold text-amber-700">
                    {laundryBadgeCount} wash
                  </span>
                ) : null}
                {tab.badge && !isActive && (
                  <span className="rounded-md bg-accent-100 px-1.5 py-0.5 text-2xs font-medium text-accent-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="px-3 pt-6 pb-2 text-2xs font-semibold text-ink-400 uppercase tracking-wider">
            Intelligence & Archive
          </div>
          {MAIN_TABS.slice(5).map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-ink-900 text-white shadow-sm'
                    : 'text-ink-700 hover:bg-ink-100 hover:text-ink-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{tab.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Desktop Quick Assistant Widget */}
        <div className="p-4 border-t border-ink-100">
          <div className="rounded-xl bg-ink-50 p-3 border border-ink-200/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-900">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Decision Fatigue: Zero</span>
            </div>
            <p className="mt-1 text-2xs text-ink-500">
              Weather synced • Calendar aligned • Clothes clean
            </p>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-ink-100 bg-white/95 backdrop-blur-lg safe-bottom">
        <div className="flex items-center justify-around px-1 py-1.5">
          {MOBILE_PRIMARY_TABS.map((tabId) => {
            const tab = MAIN_TABS.find((t) => t.id === tabId)!;
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors ${
                  isActive ? 'text-ink-950 font-semibold' : 'text-ink-400 hover:text-ink-700'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.9}
                    className="transition-transform duration-150"
                  />
                  {tab.id === 'twin' && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white" />
                  )}
                </div>
                <span className="text-2xs tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
