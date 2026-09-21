import { useEffect, useState, useCallback } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { fetchWearEvents } from '@/lib/outfitService';
import type { WearEvent, Outfit } from '@/lib/types';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

type WearEventWithOutfit = WearEvent & { outfit: Outfit | null };

const FEEDBACK_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  loved: { label: 'Loved it', emoji: '❤️', color: 'text-accent-600' },
  good: { label: 'Good', emoji: '🙂', color: 'text-ink-600' },
  okay: { label: 'Okay', emoji: '😐', color: 'text-ink-500' },
  not_for_me: { label: "Didn't feel right", emoji: '🙅', color: 'text-ink-400' },
};

export function HistoryScreen() {
  const [events, setEvents] = useState<WearEventWithOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchWearEvents();
      setEvents(data as WearEventWithOutfit[]);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
          title="Couldn't load your history"
          description="Something went wrong. Let's try again."
          action={<Button onClick={load} variant="outline">Try again</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="font-serif text-2xl text-ink-900">History</h1>
        <p className="mt-1 text-sm text-ink-500">What you've worn and how you felt about it.</p>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={<Clock size={28} />}
          title="No history yet"
          description="When you wear an outfit, it'll show up here so I can learn what works for you."
        />
      ) : (
        <div className="space-y-3 px-5">
          {events.map((event) => {
            const feedback = event.feedback
              ? FEEDBACK_LABELS[event.feedback]
              : null;
            return (
              <div
                key={event.id}
                className="rounded-2xl border border-ink-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-base text-ink-900">
                      {event.outfit?.name ?? 'Outfit'}
                    </p>
                    <p className="mt-0.5 text-2xs text-ink-400">
                      {new Date(event.worn_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  {feedback && (
                    <span className={`text-sm font-medium ${feedback.color}`}>
                      {feedback.emoji} {feedback.label}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {event.occasion && (
                    <span className="rounded-full bg-ink-100 px-2.5 py-1 text-2xs font-medium text-ink-600">
                      {event.occasion}
                    </span>
                  )}
                  {event.weather && (
                    <span className="rounded-full bg-ink-100 px-2.5 py-1 text-2xs font-medium text-ink-600">
                      {event.weather}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
