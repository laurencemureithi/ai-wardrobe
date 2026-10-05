import { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  MapPin,
  Heart,
  Shirt,
  Sparkles,
  AlertTriangle,
  Building,
  Camera,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { upsertProfile } from '@/lib/profileService';
import {
  fetchClothingItems,
  clearAllClothingItems,
  restoreSampleClothingItems,
} from '@/lib/wardrobeService';
import { fetchSavedOutfits } from '@/lib/outfitService';
import {
  loadDigitalTwinProfile,
  saveDigitalTwinProfile,
  type AvatarGenerationResult,
} from '@/lib/digitalTwinService';
import { AvatarCreatorModal } from '@/components/ui/AvatarCreatorModal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  getBranding,
  setBranding,
  SYSTEM_NAME_PRESETS,
  ASSISTANT_NAME_PRESETS,
} from '@/lib/brandingService';

export function ProfileScreen() {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [aiAssistantName, setAiAssistantName] = useState(
    profile?.ai_assistant_name ?? getBranding().aiAssistantName
  );
  const [systemName, setSystemName] = useState(getBranding().systemName);
  const [systemTagline, setSystemTagline] = useState(getBranding().systemTagline);
  const [saving, setSaving] = useState(false);
  const [itemCount, setItemCount] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAvatarCreator, setShowAvatarCreator] = useState(false);
  const [twinProfile, setTwinProfile] = useState(() => loadDigitalTwinProfile());
  const [notice, setNotice] = useState<string | null>(null);

  // Sync state if profile loads later
  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name);
    if (profile?.location) setLocation(profile.location);
    if (profile?.ai_assistant_name) setAiAssistantName(profile.ai_assistant_name);
  }, [profile]);

  // Load counts on mount
  useEffect(() => {
    fetchClothingItems().then((items) => setItemCount(items.length)).catch(() => {});
    fetchSavedOutfits().then((outfits) => setSavedCount(outfits.length)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const trimmedAssistant = aiAssistantName.trim() || 'Aria';
      const trimmedSystem = systemName.trim() || 'Atelier Persona';
      const trimmedTagline = systemTagline.trim() || 'Living Wardrobe & Digital Twin';

      setBranding({
        systemName: trimmedSystem,
        systemTagline: trimmedTagline,
        aiAssistantName: trimmedAssistant,
      });

      if (user) {
        await upsertProfile({
          id: user.id,
          display_name: displayName,
          location,
          ai_assistant_name: trimmedAssistant,
        });
        await refreshProfile();
      }

      // Sync display name to twin profile
      const currentTwin = loadDigitalTwinProfile();
      currentTwin.displayName = displayName;
      saveDigitalTwinProfile(currentTwin);
      setTwinProfile(currentTwin);

      setEditing(false);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarGenerated = (result: AvatarGenerationResult) => {
    const updated = {
      ...twinProfile,
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
      displayName: result.displayName || displayName || twinProfile.displayName,
      avatarLikenessNotes: result.notes,
      lastUpdated: new Date().toISOString(),
    };
    saveDigitalTwinProfile(updated);
    setTwinProfile(updated);
    setShowAvatarCreator(false);
    setNotice('Digital Twin Avatar updated successfully!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleClearSampleData = async () => {
    if (confirm('Clear all sample clothing items and start fresh with an empty wardrobe?')) {
      await clearAllClothingItems();
      const updated = await fetchClothingItems();
      setItemCount(updated.length);
      setNotice('All sample items removed. Ready for your own clothes!');
      setTimeout(() => setNotice(null), 3500);
    }
  };

  const handleRestoreSampleData = async () => {
    await restoreSampleClothingItems();
    const updated = await fetchClothingItems();
    setItemCount(updated.length);
    setNotice('Sample capsule collection loaded for inspiration.');
    setTimeout(() => setNotice(null), 3500);
  };

  const avatarImg = twinProfile.generatedAvatarUrl || twinProfile.referencePhotoUrl;

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-serif text-2xl text-ink-900">Profile & Studio Identity</h1>
      </div>

      {notice && (
        <div className="mx-5 mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center gap-2 animate-fade-in">
          <Check size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Avatar + name */}
      <div className="flex flex-col items-center px-5 pb-6">
        <div className="relative group">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl overflow-hidden border-2 border-ink-900 bg-ink-950 text-ink-50 shadow-md">
            {avatarImg ? (
              <img
                src={avatarImg}
                alt={profile?.display_name ?? 'You'}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={40} className="text-ink-400" />
            )}
          </div>
          <button
            onClick={() => setShowAvatarCreator(true)}
            className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-ink-950 text-sand-300 hover:bg-ink-800 shadow-md transition-all border border-sand-300/40"
            title="Update Living Avatar Photo"
          >
            <Camera size={14} />
          </button>
        </div>

        <h2 className="mt-3.5 font-serif text-xl font-bold text-ink-900">
          {profile?.display_name || twinProfile.displayName || 'Your Name'}
        </h2>
        <p className="text-xs text-ink-400">{user?.email}</p>

        <button
          onClick={() => setShowAvatarCreator(true)}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-950 text-white text-xs font-semibold shadow-xs hover:bg-ink-800 transition-all"
        >
          <Sparkles size={13} className="text-sand-300" />
          <span>{avatarImg ? 'Recalibrate AI Twin' : 'Create My AI Avatar'}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-5">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-xs">
          <Shirt size={20} className="mx-auto text-ink-500" />
          <p className="mt-1.5 font-serif text-xl font-bold text-ink-900">
            {itemCount ?? '—'}
          </p>
          <p className="text-2xs text-ink-400">Garments</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-xs">
          <Heart size={20} className="mx-auto text-ink-500" />
          <p className="mt-1.5 font-serif text-xl font-bold text-ink-900">
            {savedCount ?? '—'}
          </p>
          <p className="text-2xs text-ink-400">Saved Looks</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-xs">
          <ShieldCheck size={20} className="mx-auto text-ink-500" />
          <p className="mt-1.5 font-serif text-xl font-bold text-ink-900">
            {avatarImg ? 'Active' : 'Neutral'}
          </p>
          <p className="text-2xs text-ink-400">Digital Twin</p>
        </div>
      </div>

      {/* Wardrobe Data Controls */}
      <div className="mt-6 px-5">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-xs">
          <h3 className="font-serif text-sm font-bold text-ink-950 mb-1 flex items-center gap-1.5">
            <Shirt size={16} className="text-ink-600" />
            <span>Wardrobe Collection Management</span>
          </h3>
          <p className="text-2xs text-ink-500 mb-3">
            Choose whether to keep sample inspiration pieces or start with an empty wardrobe for your own clothes.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleClearSampleData}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
            >
              <Trash2 size={13} />
              <span>Start Fresh (Clear Sample Clothes)</span>
            </button>
            <button
              onClick={handleRestoreSampleData}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
            >
              <RefreshCw size={13} />
              <span>Load Sample Capsule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 px-5">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-xs">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-ink-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Location (City)</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Nairobi, London, Paris, New York"
                    className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none focus:border-ink-400"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">System / Studio Name</label>
                <div className="relative mb-2">
                  <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    placeholder="e.g. Atelier Persona, Maison Silhouette..."
                    className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none focus:border-ink-400"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SYSTEM_NAME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setSystemName(preset.name);
                        setSystemTagline(preset.tagline);
                      }}
                      className="rounded-lg bg-stone-100 px-2 py-1 text-2xs text-ink-700 hover:bg-stone-200"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">AI Assistant / Stylist Name</label>
                <div className="relative mb-2">
                  <Sparkles size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent-600" />
                  <input
                    value={aiAssistantName}
                    onChange={(e) => setAiAssistantName(e.target.value)}
                    placeholder="e.g. Aria, Chloe, Julian..."
                    className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none focus:border-ink-400"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ASSISTANT_NAME_PRESETS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setAiAssistantName(name)}
                      className="rounded-lg bg-accent-50 px-2 py-1 text-2xs text-accent-800 hover:bg-accent-100"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button fullWidth onClick={handleSave} disabled={saving}>
                  {saving ? <Spinner size="sm" className="border-ink-200 border-t-ink-50" /> : 'Save Profile & Settings'}
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-medium uppercase tracking-wider text-ink-400">Studio Name</p>
                  <p className="mt-0.5 text-sm font-serif font-bold text-ink-900 flex items-center gap-1.5">
                    <Building size={14} className="text-ink-600" />
                    <span>{systemName}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-medium uppercase tracking-wider text-ink-400">AI Stylist</p>
                  <p className="mt-0.5 text-sm text-ink-800 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-accent-600" />
                    <span className="font-semibold">{aiAssistantName}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-medium uppercase tracking-wider text-ink-400">Name</p>
                  <p className="mt-0.5 text-sm text-ink-800 font-semibold">{displayName || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-medium uppercase tracking-wider text-ink-400">Location</p>
                  <p className="mt-0.5 text-sm text-ink-800">{location || 'Not set'}</p>
                </div>
              </div>
              <Button variant="outline" fullWidth onClick={() => setEditing(true)}>
                Edit Profile Information
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-6 px-5">
        {confirmDelete ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" />
              <p className="text-sm font-semibold text-red-700">Reset and delete data?</p>
            </div>
            <p className="mt-2 text-sm text-red-600">
              This will permanently delete your wardrobe items, digital twin calibrations, and saved outfits.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" fullWidth onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                fullWidth
                className="bg-red-500 hover:bg-red-600"
                onClick={async () => {
                  await clearAllClothingItems();
                  localStorage.clear();
                  await signOut();
                }}
              >
                Delete everything
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white py-3 text-sm text-ink-500 transition-colors hover:bg-ink-100"
          >
            <AlertTriangle size={16} /> Reset and clear all data
          </button>
        )}
      </div>

      {/* Sign out */}
      <div className="mt-3 px-5">
        <button
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>

      {/* Avatar Creator Modal */}
      {showAvatarCreator && (
        <AvatarCreatorModal
          currentPhoto={avatarImg}
          presentationContext={twinProfile.presentationContext}
          onClose={() => setShowAvatarCreator(false)}
          onAvatarGenerated={handleAvatarGenerated}
          onResetToBlank={() => {
            const blank = {
              ...twinProfile,
              referencePhotoUrl: null,
              generatedAvatarUrl: undefined,
              customAvatarGenerated: false,
              lastUpdated: new Date().toISOString(),
            };
            saveDigitalTwinProfile(blank);
            setTwinProfile(blank);
            setShowAvatarCreator(false);
          }}
        />
      )}
    </div>
  );
}
