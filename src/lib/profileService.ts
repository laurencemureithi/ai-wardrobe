import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

export async function fetchProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfile(profile: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function completeOnboarding(profile: Partial<Profile>): Promise<void> {
  await upsertProfile({ ...profile, onboarding_complete: true });
}

export async function deleteAccount(userId: string): Promise<void> {
  // Delete profile cascade; auth user deletion requires service role
  await supabase.from('profiles').delete().eq('id', userId);
  await supabase.auth.signOut();
}
