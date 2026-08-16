import { supabase } from '@/lib/supabase';
import type { ClothingItem, ClothingCategory, ItemStatus } from '@/lib/types';

export async function fetchClothingItems(): Promise<ClothingItem[]> {
  const { data, error } = await supabase
    .from('clothing_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClothingItem[];
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
