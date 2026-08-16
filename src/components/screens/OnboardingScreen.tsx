import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { completeOnboarding } from '@/lib/profileService';
import { insertClothingItem } from '@/lib/wardrobeService';
import { DEMO_ITEMS } from '@/lib/demoData';

const LIFESTYLES = ['Student', 'Office', 'Business', 'Creative', 'Casual', 'Active', 'Mixed'];
const STYLES = [
  'Casual',
  'Smart casual',
  'Formal',
  'Streetwear',
  'Minimal',
  'Classic',
  'Trendy',
  'Sporty',
  'Elegant',
  'Traditional',
];
const COLORS = ['Black', 'White', 'Navy', 'Grey', 'Brown', 'Beige', 'Blue', 'Green', 'Red', 'Olive'];

export function OnboardingScreen() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [lifestyles, setLifestyles] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const totalSteps = 6;

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await completeOnboarding({
        id: user.id,
        display_name: displayName,
        gender,
        location,
        lifestyle: lifestyles,
        style_preferences: styles,
        color_preferences: colors,
      });
    } catch {
      /* profile upsert may fail silently — user can still proceed */
    }
    // Seed demo wardrobe items (non-blocking — proceed even if individual items fail)
    for (const item of DEMO_ITEMS) {
      try {
        await insertClothingItem(item);
      } catch {
        /* ignore individual item failures */
      }
    }
    await refreshProfile();
    setSaving(false);
  };

  const canProceed = () => {
    if (step === 1) return displayName.trim().length > 0;
    if (step === 2) return gender.length > 0;
    if (step === 3) return location.trim().length > 0;
    if (step === 4) return lifestyles.length > 0;
    if (step === 5) return styles.length > 0;
    return true;
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      {/* Progress bar */}
      <div className="px-6 pt-6">
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-ink-900' : 'bg-ink-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-6 py-8">
        {step === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-in">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-ink-900 text-ink-50">
              <Sparkles size={36} />
            </div>
            <h1 className="font-serif text-3xl text-ink-900">Welcome to your wardrobe</h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-500">
              Let's make getting dressed easier. This takes less than a minute.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="font-serif text-2xl text-ink-900">What should I call you?</h2>
            <p className="mt-1.5 text-sm text-ink-500">Your name makes it personal.</p>
            <input
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="mt-6 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3.5 text-base text-ink-900 outline-none placeholder:text-ink-300 focus:border-ink-400"
            />
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="font-serif text-2xl text-ink-900">Your style preference</h2>
            <p className="mt-1.5 text-sm text-ink-500">This helps me tailor recommendations.</p>
            <div className="mt-6 space-y-2.5">
              {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm transition-all ${
                    gender === g
                      ? 'border-ink-900 bg-ink-900 text-ink-50'
                      : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-100'
                  }`}
                >
                  {g}
                  {gender === g && <Check size={18} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="font-serif text-2xl text-ink-900">Where do you live?</h2>
            <p className="mt-1.5 text-sm text-ink-500">For weather-aware recommendations.</p>
            <div className="relative mt-6">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                autoFocus
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or postcode"
                className="w-full rounded-2xl border border-ink-200 bg-white py-3.5 pl-12 pr-4 text-base text-ink-900 outline-none placeholder:text-ink-300 focus:border-ink-400"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="font-serif text-2xl text-ink-900">Your everyday life</h2>
            <p className="mt-1.5 text-sm text-ink-500">Select all that apply.</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {LIFESTYLES.map((l) => (
                <button
                  key={l}
                  onClick={() => toggle(lifestyles, l, setLifestyles)}
                  className={`rounded-full border px-4 py-2.5 text-sm transition-all ${
                    lifestyles.includes(l)
                      ? 'border-ink-900 bg-ink-900 text-ink-50'
                      : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-100'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in">
            <h2 className="font-serif text-2xl text-ink-900">Your style</h2>
            <p className="mt-1.5 text-sm text-ink-500">Pick the styles you love.</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle(styles, s, setStyles)}
                  className={`rounded-full border px-4 py-2.5 text-sm transition-all ${
                    styles.includes(s)
                      ? 'border-ink-900 bg-ink-900 text-ink-50'
                      : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="mt-8 text-sm font-medium text-ink-600">Optional: favourite colours</p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => toggle(colors, c, setColors)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all ${
                    colors.includes(c)
                      ? 'border-ink-900 bg-ink-900 text-ink-50'
                      : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 safe-bottom">
        {step === totalSteps - 1 ? (
          <div className="animate-fade-in">
            <div className="mb-4 rounded-2xl bg-accent-50 p-4 text-center">
              <p className="text-sm leading-relaxed text-accent-800">
                You're ready. You don't need to organize your whole wardrobe — just use the app
                normally and I'll learn.
              </p>
            </div>
            <Button fullWidth size="lg" onClick={handleFinish} disabled={saving}>
              {saving ? 'Setting up...' : 'Start exploring'}
              <ArrowRight size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {step > 0 && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setStep((s) => s - 1)}
              >
                <ArrowLeft size={18} />
              </Button>
            )}
            <Button
              fullWidth
              size="lg"
              disabled={!canProceed()}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue <ArrowRight size={18} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
