import type {
  ClothingItem,
  WardrobeInsight,
  SocialPost,
  ReactionType,
} from '@/lib/types';

const SOCIAL_POSTS_KEY = 'ai_wardrobe_social_posts_v1';

export const INITIAL_COMMUNITY_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=300',
    outfitTitle: 'Minimalist Autumn Layering',
    outfitItems: ['Cream Wool Turtleneck', 'Pleated Taupe Trousers', 'Leather Loafers'],
    imageUrl: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Rainy morning meeting look. AI Stylist suggested keeping the palette strictly monochrome to project effortless poise.',
    tags: ['#Monochrome', '#SmartCasual', '#OfficeStyle'],
    timestamp: '2 hours ago',
    reactions: {
      fire: 24,
      love: 42,
      smart: 19,
      stylish: 38,
    },
  },
  {
    id: 'post-2',
    userName: 'Marcus Sterling',
    userAvatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=300',
    outfitTitle: 'Navy Blazer & Classic Oxford',
    outfitItems: ['Navy Tailored Blazer', 'White Oxford Shirt', 'Grey Chinos', 'Brown Derby Shoes'],
    imageUrl: 'https://images.pexels.com/photos/1342609/pexels-photo-1342609.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Client presentation outfit approved by the calendar engine. Cost-per-wear on this blazer is down to $2.10!',
    tags: ['#CostPerWear', '#ExecutiveStyle', '#WardrobeTwin'],
    timestamp: '5 hours ago',
    reactions: {
      fire: 56,
      love: 31,
      smart: 47,
      stylish: 29,
    },
  },
  {
    id: 'post-3',
    userName: 'Amina Diallo',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
    outfitTitle: 'Clean Silhouette & Contemporary Cut',
    outfitItems: ['Linen Shirt Dress', 'Woven Leather Mules', 'Gold Accent Hoops'],
    imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=800',
    caption: 'Tried this look in Digital Twin mode before stepping out into 26°C humidity. Perfectly breathable.',
    tags: ['#CapsuleWardrobe', '#WarmWeather', '#Effortless'],
    timestamp: 'Yesterday',
    reactions: {
      fire: 38,
      love: 64,
      smart: 15,
      stylish: 52,
    },
  },
];

export function getSocialPosts(): SocialPost[] {
  try {
    const raw = localStorage.getItem(SOCIAL_POSTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  saveSocialPosts(INITIAL_COMMUNITY_POSTS);
  return INITIAL_COMMUNITY_POSTS;
}

export function saveSocialPosts(posts: SocialPost[]): void {
  try {
    localStorage.setItem(SOCIAL_POSTS_KEY, JSON.stringify(posts));
  } catch {
    /* ignore */
  }
}

export function togglePostReaction(postId: string, reaction: ReactionType): SocialPost[] {
  const posts = getSocialPosts();
  const target = posts.find((p) => p.id === postId);
  if (!target) return posts;

  if (target.userReaction === reaction) {
    target.reactions[reaction] = Math.max(0, target.reactions[reaction] - 1);
    target.userReaction = undefined;
  } else {
    if (target.userReaction) {
      target.reactions[target.userReaction] = Math.max(0, target.reactions[target.userReaction] - 1);
    }
    target.reactions[reaction] += 1;
    target.userReaction = reaction;
  }

  saveSocialPosts(posts);
  return [...posts];
}

export function calculateWardrobeHealth(clothingItems: ClothingItem[]): WardrobeInsight {
  const total = clothingItems.length;
  if (total === 0) {
    return {
      utilizationRate: 0,
      totalItems: 0,
      activeItems: 0,
      dormantItems: 0,
      avgCostPerWear: 0,
      currency: '$',
      missingPieces: [],
    };
  }

  const active = clothingItems.filter((i) => i.wear_count > 0);
  const dormant = clothingItems.filter((i) => i.wear_count === 0);
  const utilization = Math.round((active.length / total) * 100);

  // Sort by wear count
  const sorted = [...clothingItems].sort((a, b) => b.wear_count - a.wear_count);
  const topWorn = sorted[0];
  const leastWorn = sorted[sorted.length - 1];

  const gaps = [
    {
      itemType: 'Neutral Beige / Khaki Chinos',
      reason: 'You currently have many dark & navy tops but few neutral bottom layers.',
      impact: '+38% more outfit versatility across smart-casual and weekend combinations.',
    },
    {
      itemType: 'Classic Brown Leather Loafers',
      reason: 'Bridges the gap between casual sneakers and formal dress shoes.',
      impact: 'Enables 12 new business-casual pairings with existing trousers.',
    },
    {
      itemType: 'Lightweight Linen Overshirt',
      reason: 'Essential for transitional 18°C–24°C weather without wearing a heavy jacket.',
      impact: 'Keeps outfits fresh during variable weather without overheating.',
    },
  ];

  return {
    utilizationRate: utilization,
    totalItems: total,
    activeItems: active.length,
    dormantItems: dormant.length,
    avgCostPerWear: 8.4,
    currency: '$',
    topWornItem: topWorn,
    leastWornItem: leastWorn,
    missingPieces: gaps,
  };
}
