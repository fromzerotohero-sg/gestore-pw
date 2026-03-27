'use client';

/**
 * Hook per gestione autenticazione
 * Accesso consentito solo a profili admin (tabella profiles)
 */
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  
  const supabase = createClient();

  // Carica utente corrente
  const loadUser = useCallback(async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        setState({ user: null, loading: false, error: null });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        setState({ user: null, loading: false, error: 'Accesso consentito solo all\'admin' });
        return;
      }

      setState({
        user: {
          id: authUser.id,
          email: authUser.email!,
          role: profile.role,
        },
        loading: false,
        error: null,
      });
    } catch {
      setState({ user: null, loading: false, error: 'Errore sconosciuto' });
    }
  }, [supabase]);

  // Login standard con email e password Supabase
  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error: error.message };
    }

    await loadUser();
    return {};
  };

  // Logout
  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setState({ user: null, loading: false, error: null });
    window.location.href = '/auth/login';
  };

  // Carica utente all'avvio
  useEffect(() => {
    loadUser();

    // Ascolta cambiamenti auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setState({ user: null, loading: false, error: null });
      } else {
        loadUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUser, supabase]);

  return {
    ...state,
    login,
    logout,
    refresh: loadUser,
    isAdmin: state.user?.role === 'admin',
  };
}
