import { supabase } from '@/lib/supabase';
import type { Outfit, OutfitItem, OutfitWithItems, ClothingItem, Feedback } from '@/lib/types';

export async function fetchOutfits(): Promise<OutfitWithItems[]> {
  const { data, error } = await supabase
    .from('outfits')
    .select('*, items:outfit_items(*, clothing_item:clothing_items(*))')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OutfitWithItems[];
}

export async function fetchSavedOutfits(): Promise<OutfitWithItems[]> {
  const { data, error } = await supabase
    .from('outfits')
    .select('*, items:outfit_items(*, clothing_item:clothing_items(*))')
    .eq('is_saved', true)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as OutfitWithItems[];
}

export async function saveOutfit(
  outfit: Partial<Outfit>,
  items: { clothing_item_id: string; slot: string }[]
): Promise<OutfitWithItems | null> {
  const { data: outfitData, error: outfitError } = await supabase
    .from('outfits')
    .insert(outfit)
    .select()
    .maybeSingle();
  if (outfitError) throw outfitError;
  const newOutfit = outfitData as Outfit;

  if (items.length > 0) {
    const rows = items.map((i) => ({
      outfit_id: newOutfit.id,
      clothing_item_id: i.clothing_item_id,
      slot: i.slot,
    }));
    const { error: itemError } = await supabase.from('outfit_items').insert(rows);
    if (itemError) throw itemError;
  }

  return await fetchOutfitById(newOutfit.id);
}

export async function fetchOutfitById(id: string): Promise<OutfitWithItems | null> {
  const { data, error } = await supabase
    .from('outfits')
    .select('*, items:outfit_items(*, clothing_item:clothing_items(*))')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as OutfitWithItems | null;
}

export async function updateOutfit(
  id: string,
  updates: Partial<Outfit>
): Promise<Outfit | null> {
  const { data, error } = await supabase
    .from('outfits')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Outfit | null;
}

export async function toggleSaveOutfit(id: string, saved: boolean): Promise<void> {
  await updateOutfit(id, { is_saved: saved });
}

export async function toggleFavoriteOutfit(id: string, fav: boolean): Promise<void> {
  await updateOutfit(id, { is_favorite: fav });
}

export async function deleteOutfit(id: string): Promise<void> {
  const { error } = await supabase.from('outfits').delete().eq('id', id);
  if (error) throw error;
}

export async function replaceOutfitItem(
  outfitId: string,
  slot: string,
  newItemId: string
): Promise<void> {
  const { error: delError } = await supabase
    .from('outfit_items')
    .delete()
    .eq('outfit_id', outfitId)
    .eq('slot', slot);
  if (delError) throw delError;

  const { error: insError } = await supabase.from('outfit_items').insert({
    outfit_id: outfitId,
    clothing_item_id: newItemId,
    slot,
  });
  if (insError) throw insError;
}

export async function recordWearEvent(
  outfitId: string,
  feedback: Feedback,
  occasion?: string,
  weather?: string
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from('wear_events').insert({
    outfit_id: outfitId,
    feedback,
    occasion,
    weather,
    worn_at: today,
  });
  if (error) throw error;

  // Mark the outfit's clothing items as worn
  const { data: items } = await supabase
    .from('outfit_items')
    .select('clothing_item_id')
    .eq('outfit_id', outfitId);
  if (items) {
    for (const oi of items as unknown as OutfitItem[]) {
      const { data: item } = await supabase
        .from('clothing_items')
        .select('wear_count')
        .eq('id', oi.clothing_item_id)
        .maybeSingle();
      await supabase
        .from('clothing_items')
        .update({
          wear_count: (item?.wear_count ?? 0) + 1,
          last_worn: today,
          status: 'worn',
        })
        .eq('id', oi.clothing_item_id);
    }
  }
}

export async function fetchWearEvents(): Promise<
  (import('@/lib/types').WearEvent & { outfit: Outfit | null })[]
> {
  const { data, error } = await supabase
    .from('wear_events')
    .select('*, outfit:outfits(*)')
    .order('worn_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export function getOutfitItemBySlot(
  outfit: OutfitWithItems,
  slot: string
): ClothingItem | null {
  const oi = outfit.items.find((i) => i.slot === slot);
  return oi?.clothing_item ?? null;
}

export function buildOutfitName(items: ClothingItem[]): string {
  const parts = items.map((i) => i.color ?? i.name).filter(Boolean);
  return parts.slice(0, 3).join(' + ');
}
