import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Leaf,
  Users,
  Sparkles,
  Heart,
  Flame,
  Award,
  Share2,
  DollarSign,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';
import type { SocialPost, WardrobeInsight, ReactionType } from '@/lib/types';
import {
  getSocialPosts,
  togglePostReaction,
  calculateWardrobeHealth,
} from '@/lib/insightsService';
import { fetchClothingItems } from '@/lib/wardrobeService';
import { Spinner } from '@/components/ui/Spinner';

export function InsightsScreen() {
  const [activeTab, setActiveTab] = useState<'health' | 'shopping' | 'social'>('health');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<WardrobeInsight | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await fetchClothingItems();
      const health = calculateWardrobeHealth(items);
      const feed = getSocialPosts();
      setInsights(health);
      setPosts(feed);
      setLoading(false);
    }
    load();
  }, []);

  const handleReaction = (postId: string, reaction: ReactionType) => {
    const updated = togglePostReaction(postId, reaction);
    setPosts(updated);
  };

  if (loading || !insights) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 pb-24 md:pb-8 pt-4 px-3 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-100 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-950">
            Insights & Style Community
          </h1>
          <p className="text-xs sm:text-sm text-ink-600 mt-0.5">
            Wardrobe utilization, cost-per-wear analytics, gap recommendations & outfit feedback.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-ink-100 rounded-2xl w-fit">
          {(
            [
              { id: 'health', label: 'Closet Health & Eco', icon: Leaf },
              { id: 'shopping', label: 'Shopping Gaps', icon: ShoppingBag },
              { id: 'social', label: 'Style Feed', icon: Users },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-ink-950 shadow-xs'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. CLOSET HEALTH & SUSTAINABILITY */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white p-5 border border-ink-100 shadow-sm">
              <div className="flex items-center justify-between text-ink-500 mb-2">
                <span className="text-2xs font-semibold uppercase tracking-wider">Utilization Rate</span>
                <TrendingUp size={16} className="text-accent-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold text-ink-950">{insights.utilizationRate}%</span>
                <span className="text-2xs text-emerald-700 font-medium">+8% this month</span>
              </div>
              <p className="text-2xs text-ink-500 mt-1">
                {insights.activeItems} of {insights.totalItems} pieces actively worn
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-ink-100 shadow-sm">
              <div className="flex items-center justify-between text-ink-500 mb-2">
                <span className="text-2xs font-semibold uppercase tracking-wider">Avg Cost Per Wear</span>
                <DollarSign size={16} className="text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold text-ink-950">${insights.avgCostPerWear}</span>
                <span className="text-2xs text-emerald-700 font-medium">Down 14%</span>
              </div>
              <p className="text-2xs text-ink-500 mt-1">
                Frequent rotation decreases daily cost per garment
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-ink-100 shadow-sm">
              <div className="flex items-center justify-between text-ink-500 mb-2">
                <span className="text-2xs font-semibold uppercase tracking-wider">Dormant Clothes</span>
                <AlertCircle size={16} className="text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold text-ink-950">{insights.dormantItems}</span>
                <span className="text-2xs text-ink-500">Unworn in 60d</span>
              </div>
              <p className="text-2xs text-ink-500 mt-1">
                AI will prioritize these in upcoming recommendations
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 border border-ink-100 shadow-sm">
              <div className="flex items-center justify-between text-ink-500 mb-2">
                <span className="text-2xs font-semibold uppercase tracking-wider">Carbon Footprint Saved</span>
                <Leaf size={16} className="text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold text-ink-950">14.2 kg</span>
                <span className="text-2xs text-emerald-700 font-medium">Wear-first philosophy</span>
              </div>
              <p className="text-2xs text-ink-500 mt-1">
                Reusing existing clothes before buying new items
              </p>
            </div>
          </div>

          {/* Actionable Wardrobe Rotation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-white p-6 border border-ink-100 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-ink-100 mb-4">
                <h3 className="text-sm font-semibold text-ink-900">
                  Most Versatile Garment
                </h3>
                <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  High ROI
                </span>
              </div>
              {insights.topWornItem && (
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden bg-ink-100 shrink-0">
                    <img
                      src={insights.topWornItem.image_url || ''}
                      alt={insights.topWornItem.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-ink-950">{insights.topWornItem.name}</h4>
                    <p className="text-xs text-ink-600 mt-0.5">
                      Worn {insights.topWornItem.wear_count} times across 14 outfit combinations.
                    </p>
                    <p className="text-2xs text-emerald-700 font-medium mt-1">
                      Calculated Cost Per Wear: $2.10
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 border border-ink-100 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-ink-100 mb-4">
                <h3 className="text-sm font-semibold text-ink-900">
                  Underutilized Garment Rotation
                </h3>
                <span className="text-2xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Action Recommended
                </span>
              </div>
              {insights.leastWornItem && (
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden bg-ink-100 shrink-0">
                    <img
                      src={insights.leastWornItem.image_url || ''}
                      alt={insights.leastWornItem.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-ink-950">{insights.leastWornItem.name}</h4>
                    <p className="text-xs text-ink-600">
                      Worn only {insights.leastWornItem.wear_count} times recently.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-3xs font-semibold text-ink-700 bg-ink-100 px-2 py-0.5 rounded">
                        Restyle
                      </span>
                      <span className="text-3xs font-semibold text-ink-700 bg-ink-100 px-2 py-0.5 rounded">
                        Donate
                      </span>
                      <span className="text-3xs font-semibold text-ink-700 bg-ink-100 px-2 py-0.5 rounded">
                        Consign
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SHOPPING ASSISTANT & WARDROBE GAPS */}
      {activeTab === 'shopping' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-sand-50 p-6 border border-sand-200/80">
            <span className="text-2xs font-bold uppercase tracking-wider text-sand-800">
              Smart Wardrobe Investment AI
            </span>
            <h3 className="text-xl font-serif font-bold text-sand-950 mt-1">
              Buy Less, Wear Better
            </h3>
            <p className="text-xs sm:text-sm text-sand-800 mt-1 max-w-2xl leading-relaxed">
              Instead of buying another patterned hoodie, our AI analyzes your current 20+ pieces and identifies precisely which single missing item will unlock the greatest number of new outfits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.missingPieces.map((piece, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white p-5 border border-ink-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-ink-100 mb-3">
                    <span className="rounded-md bg-accent-100 px-2 py-0.5 text-3xs font-bold text-accent-800 uppercase">
                      Strategic Gap #{idx + 1}
                    </span>
                    <span className="text-2xs font-semibold text-emerald-700">High Synergy</span>
                  </div>
                  <h4 className="text-base font-bold text-ink-950">{piece.itemType}</h4>
                  <p className="text-xs text-ink-600 mt-2 leading-relaxed">{piece.reason}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-ink-100">
                  <div className="rounded-xl bg-ink-50 p-2.5 text-2xs font-semibold text-ink-900 border border-ink-100">
                    Expected Impact: <span className="text-accent-800 font-bold">{piece.impact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. STYLE COMMUNITY FEED */}
      {activeTab === 'social' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="rounded-2xl bg-white p-4 border border-ink-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink-900">Today's Outfit Share</h3>
              <p className="text-2xs text-ink-500">
                Share your Digital Twin or mirror selfie with your style circle.
              </p>
            </div>
            <button className="flex items-center gap-1.5 rounded-xl bg-ink-950 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-ink-800">
              <Share2 size={13} />
              <span>Share OOTD</span>
            </button>
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-3xl bg-white border border-ink-100 shadow-sm overflow-hidden"
              >
                {/* Author row */}
                <div className="flex items-center justify-between p-4 border-b border-ink-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.userAvatar || ''}
                      alt={post.userName}
                      className="h-9 w-9 rounded-full object-cover border border-ink-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-ink-900">{post.userName}</p>
                      <p className="text-3xs text-ink-400">{post.timestamp}</p>
                    </div>
                  </div>
                  <span className="text-2xs font-semibold text-ink-600 bg-ink-50 rounded-full px-2.5 py-0.5">
                    {post.outfitTitle}
                  </span>
                </div>

                {/* Outfit Image */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-ink-100">
                  <img
                    src={post.imageUrl}
                    alt={post.outfitTitle}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Content & items */}
                <div className="p-4 space-y-3">
                  <p className="text-xs sm:text-sm text-ink-800 leading-relaxed">
                    {post.caption}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {post.outfitItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-ink-100 px-2 py-0.5 text-2xs font-medium text-ink-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Meaningful Reactions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-ink-100">
                    <button
                      onClick={() => handleReaction(post.id, 'fire')}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                        post.userReaction === 'fire'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      <Flame size={14} className="text-amber-500" />
                      <span>{post.reactions.fire}</span>
                    </button>

                    <button
                      onClick={() => handleReaction(post.id, 'love')}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                        post.userReaction === 'love'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      <Heart size={14} className="text-rose-500" />
                      <span>{post.reactions.love}</span>
                    </button>

                    <button
                      onClick={() => handleReaction(post.id, 'smart')}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                        post.userReaction === 'smart'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      <Award size={14} className="text-blue-500" />
                      <span>{post.reactions.smart} Smart</span>
                    </button>

                    <button
                      onClick={() => handleReaction(post.id, 'stylish')}
                      className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                        post.userReaction === 'stylish'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      <Sparkles size={14} className="text-purple-500" />
                      <span>{post.reactions.stylish} Stylish</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
