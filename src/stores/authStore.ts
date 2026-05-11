import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      set({ session, user, loading: false });
    } else {
      set({ loading: false });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ session, user });
      } else if (event === 'SIGNED_OUT') {
        set({ session: null, user: null });
      }
    });
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUpWithEmail: async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
