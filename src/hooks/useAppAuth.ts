import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User as FirebaseUser } from 'firebase/auth';

import { useAuth } from '@/hooks/useAuth';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

export type AppAuthProvider = 'supabase' | 'firebase' | null;
export type AppUser = SupabaseUser | FirebaseUser;

/**
 * App-level auth that treats either provider as a valid login.
 * This prevents redirect loops when the user logs in via Firebase.
 */
export function useAppAuth() {
  const supabase = useAuth();
  const firebase = useFirebaseAuth();

  const loading = supabase.loading || firebase.loading;
  const user: AppUser | null = (supabase.user ?? firebase.user) as AppUser | null;
  const provider: AppAuthProvider = supabase.user
    ? 'supabase'
    : firebase.user
      ? 'firebase'
      : null;

  const signOut = async () => {
    // sign out from both to avoid mixed sessions
    const [s, f] = await Promise.all([
      supabase.user ? supabase.signOut() : Promise.resolve({ error: null }),
      firebase.user ? firebase.signOut() : Promise.resolve({ error: null }),
    ]);

    return { error: s.error ?? f.error };
  };

  return {
    user,
    loading,
    provider,
    signOut,
    // expose raw provider states when needed
    supabaseUser: supabase.user,
    firebaseUser: firebase.user,
  };
}
