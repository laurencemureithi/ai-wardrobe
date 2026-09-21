import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Shirt,
  Wand2,
  Check,
  RotateCcw,
  Edit2,
  X,
  UserCheck,
} from 'lucide-react';
import type { StylistMessage, ClothingItem, Recommendation } from '@/lib/types';
import {
  getStylistMessages,
  askStylist,
  saveStylistMessages,
} from '@/lib/aiStylistService';
import { fetchClothingItems } from '@/lib/wardrobeService';
import { getWeather } from '@/lib/weatherService';
import { getCalendarEvents } from '@/lib/plannerService';
import { saveOutfit, recordWearEvent } from '@/lib/outfitService';
import { useAuth } from '@/lib/auth';
import { upsertProfile } from '@/lib/profileService';
import { Spinner } from '@/components/ui/Spinner';
import { getBranding, setBranding } from '@/lib/brandingService';

interface StylistScreenProps {
  onTryInDigitalTwin: (outfit: Recommendation) => void;
  onNavigateHome?: () => void;
}

const QUICK_PROMPTS = [
  'What should I wear tomorrow?',
  'I have a wedding this weekend',
  'Make my outfit more professional',
  'I want something comfortable & relaxed',
  'Show me something I haven’t worn recently',
  'Show this outfit in different poses',
];

const SUGGESTED_NAMES = ['Aria', 'Chloe', 'Julian', 'Marcus', 'Sora', 'Vesper', 'Aura'];

export function StylistScreen({ onTryInDigitalTwin }: StylistScreenProps) {
  const { profile, user, refreshProfile } = useAuth();
  const [assistantName, setAssistantName] = useState(
    profile?.ai_assistant_name || getBranding().aiAssistantName
  );
  const [showNameModal, setShowNameModal] = useState(false);
  const [customNameInput, setCustomNameInput] = useState(assistantName);
  const [messages, setMessages] = useState<StylistMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Set<string>>(new Set());
  const [wornOutfits, setWornOutfits] = useState<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.ai_assistant_name) {
      setAssistantName(profile.ai_assistant_name);
      setCustomNameInput(profile.ai_assistant_name);
    }
  }, [profile?.ai_assistant_name]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const items = await fetchClothingItems();
      setClothing(items);
      const msgs = getStylistMessages();

      // Ensure welcome message uses the active assistant name
      if (msgs.length > 0 && msgs[0].id === 'msg-welcome') {
        msgs[0].text = `Hello! I'm ${assistantName}, your personal style consultant. I analyze your wardrobe, check the weather, sync with your calendar, and ensure you feel sharp and confident every day. What are you dressing for today?`;
      }
      setMessages(msgs);
      setLoading(false);
    }
    init();
  }, [assistantName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSaveAssistantName = async (name: string) => {
    const trimmed = name.trim() || 'Aria';
    setAssistantName(trimmed);
    setBranding({ aiAssistantName: trimmed });
    setShowNameModal(false);

    // Persist to user profile
    if (user) {
      try {
        await upsertProfile({
          id: user.id,
          ai_assistant_name: trimmed,
        });
        await refreshProfile();
      } catch {
        /* ignore */
      }
    }

    // Update first greeting in chat
    setMessages((prev) => {
      if (prev.length > 0 && prev[0].id === 'msg-welcome') {
        const updated = [...prev];
        updated[0] = {
          ...updated[0],
          text: `Hello! I'm ${trimmed}, your personal style consultant. I analyze your wardrobe, check the weather, sync with your calendar, and ensure you feel sharp and confident every day. What are you dressing for today?`,
        };
        saveStylistMessages(updated);
        return updated;
      }
      return prev;
    });
  };

  const handleSend = async (queryText?: string) => {
    const query = queryText || input;
    if (!query.trim()) return;

    const userMsg: StylistMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      saveStylistMessages(updated);
      return updated;
    });
    setInput('');
    setIsTyping(true);

    try {
      const weather = await getWeather();
      const events = getCalendarEvents();
      const aiReply = await askStylist(query, clothing, weather, events);
      setMessages((prev) => {
        const updated = [...prev, aiReply];
        saveStylistMessages(updated);
        return updated;
      });
    } catch {
      /* ignore */
    } finally {
      setIsTyping(false);
    }
  };

  const handleSaveOutfit = async (rec: Recommendation) => {
    try {
      await saveOutfit(
        {
          name: `${assistantName}'s Pick: ${rec.style}`,
          occasion: 'AI Stylist Consultation',
          style: rec.style,
          ai_confidence: rec.confidence,
          reason: rec.reason,
        },
        rec.items.map((i) => ({ clothing_item_id: i.item.id, slot: i.slot }))
      );
      setSavedOutfits((prev) => new Set(prev).add(rec.style));
    } catch {
      /* ignore */
    }
  };

  const handleWearOutfit = async (rec: Recommendation) => {
    try {
      const weather = await getWeather();
      const saved = await saveOutfit(
        {
          name: rec.style,
          occasion: rec.style,
          style: rec.style,
          weather: `${weather.temperature}°C, ${weather.condition}`,
          ai_confidence: rec.confidence,
          reason: rec.reason,
        },
        rec.items.map((i) => ({ clothing_item_id: i.item.id, slot: i.slot }))
      );
      if (saved) {
        await recordWearEvent(
          saved.id,
          'good',
          rec.style,
          `${weather.temperature}°C, ${weather.condition}`
        );
        setWornOutfits((prev) => new Set(prev).add(rec.style));
      }
    } catch {
      /* ignore */
    }
  };

  const handleResetChat = () => {
    const welcome: StylistMessage[] = [
      {
        id: 'msg-welcome',
        sender: 'stylist',
        text: `Hello! I'm ${assistantName}, your personal style consultant. I analyze your wardrobe, check the weather, sync with your calendar, and ensure you feel sharp and confident every day. What are you dressing for today?`,
        timestamp: new Date().toISOString(),
        actionPrompt: 'Ask for wedding, client meeting, or comfortable everyday outfit.',
      },
    ];
    setMessages(welcome);
    saveStylistMessages(welcome);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] max-w-4xl mx-auto px-3 sm:px-6 pt-3 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-ink-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-950 text-white shadow-sm">
            <Sparkles size={19} className="text-sand-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-serif font-bold text-ink-950 leading-none">
                Styling with {assistantName}
              </h1>
              <button
                onClick={() => {
                  setCustomNameInput(assistantName);
                  setShowNameModal(true);
                }}
                className="flex items-center gap-1 rounded-md bg-ink-100 hover:bg-ink-200 px-1.5 py-0.5 text-3xs font-semibold text-ink-700 transition-colors"
                title="Name your AI Stylist"
              >
                <Edit2 size={10} />
                <span>Rename</span>
              </button>
            </div>
            <p className="text-2xs text-ink-500 font-sans mt-0.5">
              Personalized styling trained on your wardrobe, weather & calendar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            title="Reset conversation"
            className="flex items-center gap-1 text-2xs text-ink-500 hover:text-ink-800 rounded-lg px-2.5 py-1.5 border border-ink-200 bg-white"
          >
            <RotateCcw size={12} />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-fade-in`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-ink-950 text-white rounded-br-xs'
                    : 'bg-white text-ink-900 border border-ink-100 rounded-bl-xs'
                }`}
              >
                <p>{msg.text}</p>
              </div>

              {/* Render Recommendation card inside AI response */}
              {!isUser && msg.recommendation && (
                <div className="w-full max-w-[92%] sm:max-w-[85%] rounded-2xl bg-white border border-ink-200/80 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-ink-100 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-accent-100 px-2 py-0.5 text-2xs font-bold text-accent-800 uppercase">
                        {msg.recommendation.style}
                      </span>
                      <span className="text-2xs text-ink-500 font-medium">
                        {Math.round(msg.recommendation.confidence * 100)}% Match
                      </span>
                    </div>
                    <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Clean & Ready
                    </span>
                  </div>

                  {/* Garments Preview Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {msg.recommendation.items.map(({ item, slot }) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-ink-100 bg-ink-50/50 p-2 overflow-hidden"
                      >
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-ink-100">
                          <img
                            src={item.image_url || ''}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <p className="text-3xs font-bold uppercase text-ink-400 mt-1 truncate">
                          {slot}
                        </p>
                        <p className="text-2xs font-semibold text-ink-900 truncate">
                          {item.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Outfit Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-ink-100">
                    <button
                      onClick={() => onTryInDigitalTwin(msg.recommendation!)}
                      className="flex items-center gap-1.5 rounded-xl bg-ink-950 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-ink-800"
                    >
                      <Wand2 size={13} className="text-sand-300" />
                      <span>Try on Digital Twin</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSaveOutfit(msg.recommendation!)}
                        className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                          savedOutfits.has(msg.recommendation.style)
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                            : 'border-ink-200 bg-white text-ink-800 hover:bg-ink-50'
                        }`}
                      >
                        <Check size={12} />
                        <span>
                          {savedOutfits.has(msg.recommendation.style) ? 'Saved' : 'Save'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleWearOutfit(msg.recommendation!)}
                        className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                          wornOutfits.has(msg.recommendation.style)
                            ? 'border-accent-300 bg-accent-50 text-accent-800'
                            : 'border-ink-200 bg-white text-ink-800 hover:bg-ink-50'
                        }`}
                      >
                        <Shirt size={12} />
                        <span>
                          {wornOutfits.has(msg.recommendation.style) ? 'Worn Today' : 'Wear Today'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-ink-500 italic p-2 animate-pulse">
            <Sparkles size={14} className="text-accent-600 animate-spin" />
            <span>{assistantName} is curating the optimal look...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 shrink-0">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="rounded-full border border-ink-200 bg-white px-3 py-1 text-2xs font-medium text-ink-700 hover:border-ink-900 hover:bg-ink-50 transition-all whitespace-nowrap shadow-2xs shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-ink-100 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask ${assistantName} anything about styling, colors, occasions...`}
          className="flex-1 rounded-2xl border border-ink-200 bg-white px-4 py-3 text-xs sm:text-sm text-ink-900 placeholder:text-ink-400 focus:border-ink-900 focus:outline-none focus:ring-1 focus:ring-ink-900 shadow-xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-950 text-white shadow-xs hover:bg-ink-800 disabled:opacity-40 transition-all shrink-0"
        >
          <Send size={16} />
        </button>
      </form>

      {/* NAME AI ASSISTANT MODAL */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-ink-100">
            <div className="flex items-center justify-between pb-3 border-b border-ink-100">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-ink-800" />
                <h3 className="text-base font-serif font-bold text-ink-950">
                  Name Your AI Stylist
                </h3>
              </div>
              <button
                onClick={() => setShowNameModal(false)}
                className="rounded-full bg-ink-100 p-1.5 text-ink-500 hover:bg-ink-200"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-ink-600">
                Choose or customize the name of your personal wardrobe advisor:
              </p>

              {/* Suggestions chips */}
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_NAMES.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setCustomNameInput(sug)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      customNameInput.toLowerCase() === sug.toLowerCase()
                        ? 'bg-ink-950 text-white shadow-xs'
                        : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                    }`}
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div>
                <label className="text-2xs font-semibold uppercase tracking-wider text-ink-400 block mb-1">
                  Custom Name
                </label>
                <input
                  type="text"
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder="e.g. Aria, Chloe, Harper..."
                  className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900"
                  maxLength={30}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
                  className="flex-1 rounded-xl border border-ink-200 py-2 text-xs font-semibold text-ink-700 hover:bg-ink-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAssistantName(customNameInput)}
                  className="flex-1 rounded-xl bg-ink-950 py-2 text-xs font-semibold text-white shadow-xs hover:bg-ink-800"
                >
                  Save Name
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
