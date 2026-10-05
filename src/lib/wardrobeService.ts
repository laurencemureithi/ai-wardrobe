import { supabase } from '@/lib/supabase';
import { clearAllItems, restoreSampleItems, hasSampleItems } from '@/lib/mockSupabase';
import type { ClothingItem, ClothingCategory, ItemStatus } from '@/lib/types';

export async function fetchClothingItems(): Promise<ClothingItem[]> {
  const { data, error } = await supabase
    .from('clothing_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClothingItem[];
}

export async function clearAllClothingItems(): Promise<void> {
  clearAllItems();
}

export async function restoreSampleClothingItems(): Promise<void> {
  restoreSampleItems();
}

export function checkHasSampleItems(): boolean {
  return hasSampleItems();
}

export interface GarmentAnalysisResult {
  name: string;
  category: ClothingCategory;
  subcategory?: string;
  color: string;
  dominantHex: string;
  material?: string;
  formality: 'casual' | 'smart casual' | 'formal';
  season?: string[];
  stylingNote?: string;
}

export async function analyzeGarmentImage(imageDataUrl: string): Promise<GarmentAnalysisResult | null> {
  try {
    const res = await fetch('/api/garment/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageDataUrl }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as GarmentAnalysisResult;
      }
    }
  } catch (e) {
    console.warn('[wardrobeService] Garment AI analysis failed:', e);
  }
  return null;
}

export async function insertClothingItem(
  item: Partial<ClothingItem>
): Promise<ClothingItem | null> {
  const { data, error } = await supabase
    .from('clothing_items')
    .insert(item)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as ClothingItem | null;
}

export async function updateClothingItem(
  id: string,
  updates: Partial<ClothingItem>
): Promise<ClothingItem | null> {
  const { data, error } = await supabase
    .from('clothing_items')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as ClothingItem | null;
}

export async function deleteClothingItem(id: string): Promise<void> {
  const { error } = await supabase.from('clothing_items').delete().eq('id', id);
  if (error) throw error;
}

export async function updateItemStatus(
  id: string,
  status: ItemStatus
): Promise<void> {
  await updateClothingItem(id, { status });
}

export async function uploadClothingImage(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('wardrobe').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = await supabase.storage.from('wardrobe').createSignedUrl(path, 31536000);
  return data?.signedUrl ?? null;
}

export function categoryLabel(cat: ClothingCategory): string {
  const labels: Record<ClothingCategory, string> = {
    tops: 'Tops',
    bottoms: 'Bottoms',
    dresses: 'Dresses',
    outerwear: 'Outerwear',
    shoes: 'Shoes',
    accessories: 'Accessories',
    other: 'Other',
  };
  return labels[cat];
}

export const CATEGORIES: ClothingCategory[] = [
  'tops',
  'bottoms',
  'dresses',
  'outerwear',
  'shoes',
  'accessories',
  'other',
];
