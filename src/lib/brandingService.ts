export interface BrandingConfig {
  systemName: string;
  systemTagline: string;
  aiAssistantName: string;
}

const STORAGE_KEY_SYSTEM_NAME = 'atelier_system_name';
const STORAGE_KEY_SYSTEM_TAGLINE = 'atelier_system_tagline';
const STORAGE_KEY_ASSISTANT_NAME = 'atelier_assistant_name';

export const DEFAULT_SYSTEM_NAME = 'Atelier Persona';
export const DEFAULT_SYSTEM_TAGLINE = 'Living Wardrobe & Digital Twin';
export const DEFAULT_ASSISTANT_NAME = 'Aria';

export const SYSTEM_NAME_PRESETS = [
  { name: 'Atelier Persona', tagline: 'Living Wardrobe & Digital Twin' },
  { name: 'Maison Silhouette', tagline: 'Bespoke AI Wardrobe & Mannequin' },
  { name: 'Sartorial Living', tagline: 'Interactive Digital Twin Studio' },
  { name: 'Persona Haute Studio', tagline: 'Digital Dressing & Wardrobe Intelligence' },
  { name: 'L’Atelier Miroir', tagline: 'Living Mirror & AI Style Companion' },
];

export const ASSISTANT_NAME_PRESETS = [
  'Aria',
  'Chloe',
  'Julian',
  'Marcus',
  'Sora',
  'Vesper',
  'Elise',
  'Gabriel',
  'Aura',
];

export function getBranding(): BrandingConfig {
  if (typeof window === 'undefined') {
    return {
      systemName: DEFAULT_SYSTEM_NAME,
      systemTagline: DEFAULT_SYSTEM_TAGLINE,
      aiAssistantName: DEFAULT_ASSISTANT_NAME,
    };
  }

  const storedSystem = localStorage.getItem(STORAGE_KEY_SYSTEM_NAME);
  const storedTagline = localStorage.getItem(STORAGE_KEY_SYSTEM_TAGLINE);
  const storedAssistant = localStorage.getItem(STORAGE_KEY_ASSISTANT_NAME);

  return {
    systemName: storedSystem || DEFAULT_SYSTEM_NAME,
    systemTagline: storedTagline || DEFAULT_SYSTEM_TAGLINE,
    aiAssistantName: storedAssistant || DEFAULT_ASSISTANT_NAME,
  };
}

export function setBranding(updates: Partial<BrandingConfig>): BrandingConfig {
  const current = getBranding();
  const next: BrandingConfig = {
    systemName: updates.systemName?.trim() || current.systemName,
    systemTagline: updates.systemTagline?.trim() || current.systemTagline,
    aiAssistantName: updates.aiAssistantName?.trim() || current.aiAssistantName,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SYSTEM_NAME, next.systemName);
    localStorage.setItem(STORAGE_KEY_SYSTEM_TAGLINE, next.systemTagline);
    localStorage.setItem(STORAGE_KEY_ASSISTANT_NAME, next.aiAssistantName);
    window.dispatchEvent(new CustomEvent('atelier:branding_updated', { detail: next }));
  }

  return next;
}
