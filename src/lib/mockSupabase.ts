/* eslint-disable @typescript-eslint/no-explicit-any */
import { DEMO_ITEMS } from '@/lib/demoData';
import type { ClothingItem, Profile, Outfit, OutfitItem, WearEvent } from '@/lib/types';

interface MockUser {
  id: string;
  email: string;
}

interface MockSession {
  user: MockUser;
  access_token: string;
}

const STORAGE_KEY = 'ai_wardrobe_local_db_v1';
const SESSION_KEY = 'ai_wardrobe_local_session_v1';

interface LocalDB {
  users: MockUser[];
  profiles: Profile[];
  clothing_items: ClothingItem[];
  outfits: Outfit[];
  outfit_items: OutfitItem[];
  wear_events: WearEvent[];
}

function getDefaultDB(): LocalDB {
  const demoUserId = 'demo-user-123';
  const now = new Date().toISOString();

  const demoProfile: Profile = {
    id: demoUserId,
    display_name: 'Alex',
    gender: 'Prefer not to say',
    location: 'London',
    lifestyle: ['Casual', 'Creative'],
    style_preferences: ['Casual', 'Smart casual', 'Minimal'],
    color_preferences: ['Navy', 'White', 'Black'],
    onboarding_complete: true,
    created_at: now,
    updated_at: now,
  };

  const initialItems: ClothingItem[] = DEMO_ITEMS.map((item, index) => ({
    ...item,
    id: `item-${index + 1}`,
    user_id: demoUserId,
    created_at: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
    updated_at: now,
  }));

  return {
    users: [{ id: demoUserId, email: 'demo@wardrobe.ai' }],
    profiles: [demoProfile],
    clothing_items: initialItems,
    outfits: [],
    outfit_items: [],
    wear_events: [],
  };
}

function loadDB(): LocalDB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.clothing_items)) {
        return parsed;
      }
    }
  } catch {
    /* fallback to default */
  }
  const initial = getDefaultDB();
  saveDB(initial);
  return initial;
}

function saveDB(db: LocalDB): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* localStorage write fail ignore */
  }
}

function loadSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  // Default to demo session so preview works instantly without blank screen
  const defaultSession: MockSession = {
    user: { id: 'demo-user-123', email: 'demo@wardrobe.ai' },
    access_token: 'mock-token-123',
  };
  saveSession(defaultSession);
  return defaultSession;
}

function saveSession(sess: MockSession | null): void {
  try {
    if (sess) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

type AuthCallback = (event: string, session: MockSession | null) => void;
const authListeners = new Set<AuthCallback>();

function triggerAuth(event: string, session: MockSession | null) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (e) {
      console.error(e);
    }
  });
}

const fileStore = new Map<string, string>();

class MockQueryBuilder {
  private table: keyof LocalDB;
  private filters: Array<(row: any) => boolean> = [];
  private orderFn?: (a: any, b: any) => number;
  private isMaybeSingle = false;
  private selectQuery = '';
  private insertData?: any;
  private updateData?: any;
  private isDelete = false;

  constructor(table: string) {
    this.table = table as keyof LocalDB;
  }

  select(query = '*') {
    this.selectQuery = query;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((row: any) => row[column] === value);
    return this;
  }

  order(column: string, opts: { ascending?: boolean } = { ascending: true }) {
    this.orderFn = (a: any, b: any) => {
      const valA = a[column];
      const valB = b[column];
      if (valA < valB) return opts.ascending ? -1 : 1;
      if (valA > valB) return opts.ascending ? 1 : -1;
      return 0;
    };
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this.execute();
  }

  insert(data: any) {
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.updateData = data;
    return this;
  }

  upsert(data: any) {
    this.insertData = data;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  // Promise-like then for direct await on query builder
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private async execute(): Promise<{ data: any; error: null }> {
    const db = loadDB();
    const rows = (db[this.table] as any[]) || [];

    // Handle INSERT / UPSERT
    if (this.insertData !== undefined) {
      const items = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const inserted: any[] = [];
      const session = loadSession();
      const currentUserId = session?.user?.id ?? 'demo-user-123';

      for (const item of items) {
        const id = item.id || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const existingIdx = rows.findIndex((r: any) => r.id === id);
        const record = {
          ...item,
          id,
          user_id: item.user_id ?? currentUserId,
          created_at: item.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (existingIdx >= 0) {
          rows[existingIdx] = { ...rows[existingIdx], ...record };
          inserted.push(rows[existingIdx]);
        } else {
          rows.push(record);
          inserted.push(record);
        }
      }

      saveDB(db);
      const res = Array.isArray(this.insertData) ? inserted : inserted[0];
      return { data: res, error: null };
    }

    // Handle UPDATE
    if (this.updateData !== undefined) {
      const updated: any[] = [];
      for (let i = 0; i < rows.length; i++) {
        if (this.filters.every((f) => f(rows[i]))) {
          rows[i] = {
            ...rows[i],
            ...this.updateData,
            updated_at: new Date().toISOString(),
          };
          updated.push(rows[i]);
        }
      }
      saveDB(db);
      return { data: this.isMaybeSingle ? (updated[0] ?? null) : updated, error: null };
    }

    // Handle DELETE
    if (this.isDelete) {
      const remaining: any[] = [];
      for (const row of rows) {
        if (!this.filters.every((f) => f(row))) {
          remaining.push(row);
        }
      }
      (db as any)[this.table] = remaining;

      // Cascade delete outfit_items if outfit deleted
      if (this.table === 'outfits') {
        const remainingOutfitIds = new Set(remaining.map((o: any) => o.id));
        db.outfit_items = db.outfit_items.filter((oi) => remainingOutfitIds.has(oi.outfit_id));
      }

      saveDB(db);
      return { data: null, error: null };
    }

    // Handle SELECT
    let result = rows.filter((row) => this.filters.every((f) => f(row)));

    if (this.orderFn) {
      result.sort(this.orderFn);
    }

    // Resolve nested relations
    if (this.table === 'outfits' && this.selectQuery.includes('outfit_items')) {
      result = result.map((outfit: Outfit) => {
        const outfitItems = db.outfit_items.filter((oi) => oi.outfit_id === outfit.id);
        const joinedItems = outfitItems.map((oi) => {
          const item = db.clothing_items.find((c) => c.id === oi.clothing_item_id);
          return {
            ...oi,
            clothing_item: item || null,
          };
        });
        return {
          ...outfit,
          items: joinedItems,
        };
      });
    } else if (this.table === 'wear_events' && this.selectQuery.includes('outfit:outfits')) {
      result = result.map((evt: WearEvent) => {
        const outfit = db.outfits.find((o) => o.id === evt.outfit_id) || null;
        return {
          ...evt,
          outfit,
        };
      });
    }

    if (this.isMaybeSingle) {
      return { data: result[0] ?? null, error: null };
    }

    return { data: result, error: null };
  }
}

export function createMockSupabase() {
  return {
    auth: {
      async getSession() {
        const session = loadSession();
        return { data: { session }, error: null };
      },
      onAuthStateChange(callback: AuthCallback) {
        authListeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe() {
                authListeners.delete(callback);
              },
            },
          },
        };
      },
      async signInWithPassword({ email }: { email: string; password?: string }) {
        const db = loadDB();
        let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          user = {
            id: `user-${Date.now()}`,
            email,
          };
          db.users.push(user);
          saveDB(db);
        }

        const session: MockSession = {
          user,
          access_token: `token-${Date.now()}`,
        };
        saveSession(session);
        triggerAuth('SIGNED_IN', session);
        return { data: { user, session }, error: null };
      },
      async signUp({ email }: { email: string; password?: string }) {
        const db = loadDB();
        const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        const user = existing || {
          id: `user-${Date.now()}`,
          email,
        };
        if (!existing) {
          db.users.push(user);
          // Create initial empty profile needing onboarding
          db.profiles.push({
            id: user.id,
            display_name: email.split('@')[0],
            gender: null,
            location: null,
            lifestyle: [],
            style_preferences: [],
            color_preferences: [],
            onboarding_complete: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          saveDB(db);
        }

        const session: MockSession = {
          user,
          access_token: `token-${Date.now()}`,
        };
        saveSession(session);
        triggerAuth('SIGNED_IN', session);
        return { data: { user, session }, error: null };
      },
      async signOut() {
        saveSession(null);
        triggerAuth('SIGNED_OUT', null);
        return { error: null };
      },
    },

    from(tableName: string) {
      return new MockQueryBuilder(tableName);
    },

    storage: {
      from() {
        return {
          async upload(path: string, file: File) {
            try {
              const url = URL.createObjectURL(file);
              fileStore.set(path, url);
            } catch {
              /* ignore */
            }
            return { data: { path }, error: null };
          },
          async createSignedUrl(path: string) {
            const url = fileStore.get(path) || 'https://images.pexels.com/photos/9594086/pexels-photo-9594086.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
            return { data: { signedUrl: url }, error: null };
          },
        };
      },
    },
  };
}
