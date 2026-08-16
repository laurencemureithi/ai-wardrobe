import { useState, useEffect } from 'react';
import { User, LogOut, MapPin, Heart, Shirt, Sparkles, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { upsertProfile } from '@/lib/profileService';
import { fetchClothingItems } from '@/lib/wardrobeService';
import { fetchSavedOutfits } from '@/lib/outfitService';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function ProfileScreen() {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [saving, setSaving] = useState(false);
  const [itemCount, setItemCount] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Load counts on mount
  useEffect(() => {
    fetchClothingItems().then((items) => setItemCount(items.length)).catch(() => {});
    fetchSavedOutfits().then((outfits) => setSavedCount(outfits.length)).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertProfile({
        id: user!.id,
        display_name: displayName,
        location,
      });
      await refreshProfile();
      setEditing(false);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-serif text-2xl text-ink-900">Profile</h1>
      </div>

      {/* Avatar + name */}
      <div className="flex flex-col items-center px-5 pb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-ink-900 text-ink-50">
          <User size={36} />
        </div>
        <h2 className="mt-3 font-serif text-xl text-ink-900">
          {profile?.display_name ?? 'Your name'}
        </h2>
        <p className="text-sm text-ink-400">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-5">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-sm">
          <Shirt size={20} className="mx-auto text-ink-500" />
          <p className="mt-1.5 font-serif text-xl text-ink-900">
            {itemCount ?? '—'}
          </p>
          <p className="text-2xs text-ink-400">Items</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-sm">
          <Heart size={20} className="mx-auto text-ink-500" />
          <p className="mt-1.5 font-serif text-xl text-ink-900">
            {savedCount ?? '—'}
          </p>
          <p className="text-2xs text-ink-400">Saved</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-4 text-center shadow-sm">
          <Sparkles size={20} className="mx-auto text-ink-500" />
          <p className="mt-1.5 font-serif text-xl text-ink-900">
            {profile?.style_preferences?.length ?? 0}
          </p>
          <p className="text-2xs text-ink-400">Styles</p>
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 px-5">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 outline-none focus:border-ink-400"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none focus:border-ink-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button fullWidth onClick={handleSave} disabled={saving}>
                  {saving ? <Spinner size="sm" className="border-ink-200 border-t-ink-50" /> : 'Save'}
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-medium uppercase tracking-wider text-ink-400">Name</p>
                  <p className="mt-0.5 text-sm text-ink-800">{profile?.display_name ?? 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-medium uppercase tracking-wider text-ink-400">Location</p>
                  <p className="mt-0.5 text-sm text-ink-800">{profile?.location ?? 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-medium uppercase tracking-wider text-ink-400">Lifestyle</p>
                  <p className="mt-0.5 text-sm text-ink-800">
                    {profile?.lifestyle?.join(', ') ?? 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xs font-medium uppercase tracking-wider text-ink-400">Style preferences</p>
                  <p className="mt-0.5 text-sm text-ink-800">
                    {profile?.style_preferences?.join(', ') ?? 'Not set'}
                  </p>
                </div>
              </div>
              <Button variant="outline" fullWidth onClick={() => setEditing(true)}>
                Edit profile
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
              <p className="text-sm font-semibold text-red-700">Delete account?</p>
            </div>
            <p className="mt-2 text-sm text-red-600">
              This will permanently delete your profile and wardrobe data. This cannot be undone.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" fullWidth onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                fullWidth
                className="bg-red-500 hover:bg-red-600"
                onClick={async () => {
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
            <AlertTriangle size={16} /> Delete account
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
    </div>
  );
}
