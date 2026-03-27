'use client';

/**
 * Hook per gestione CRUD credenziali
 * Semplificato - nessuna relazione esterna
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Credential, CredentialFormData, CredentialFilters } from '@/types';

interface CredentialsState {
  credentials: Credential[];
  loading: boolean;
  error: string | null;
}

export function useCredentials(userId: string | undefined) {
  const [state, setState] = useState<CredentialsState>({
    credentials: [],
    loading: true,
    error: null,
  });

  const supabase = createClient();

  // Fetch credenziali - query semplificata senza relazioni
  const fetchCredentials = useCallback(async () => {
    if (!userId) {
      setState({ credentials: [], loading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .order('service_name', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }

      setState({
        credentials: (data as Credential[]) || [],
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setState({
        credentials: [],
        loading: false,
        error: err instanceof Error ? err.message : 'Errore caricamento dati',
      });
    }
  }, [userId, supabase]);

  // Crea nuova credenziale
  const createCredential = async (
    formData: CredentialFormData
  ): Promise<{ error?: string }> => {
    if (!userId) return { error: 'Utente non autenticato' };

    try {
      const { error } = await supabase
        .from('credentials')
        .insert({
          ...formData,
          created_by: userId,
          updated_by: userId,
        });

      if (error) throw error;

      await fetchCredentials();
      return {};
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Errore creazione credenziale',
      };
    }
  };

  // Aggiorna credenziale esistente
  const updateCredential = async (
    id: string,
    formData: Partial<CredentialFormData>
  ): Promise<{ error?: string }> => {
    if (!userId) return { error: 'Utente non autenticato' };

    try {
      const { error } = await supabase
        .from('credentials')
        .update({
          ...formData,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchCredentials();
      return {};
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Errore aggiornamento credenziale',
      };
    }
  };

  // Elimina credenziale
  const deleteCredential = async (id: string): Promise<{ error?: string }> => {
    if (!userId) return { error: 'Utente non autenticato' };

    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchCredentials();
      return {};
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Errore eliminazione credenziale',
      };
    }
  };

  // Carica dati iniziali
  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  return {
    ...state,
    refresh: fetchCredentials,
    createCredential,
    updateCredential,
    deleteCredential,
  };
}

// Hook per filtrare credenziali
export function useFilteredCredentials(
  credentials: Credential[],
  filters: CredentialFilters
) {
  return useMemo(() => {
    return credentials.filter((cred) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        !filters.search ||
        cred.service_name.toLowerCase().includes(searchLower) ||
        cred.username_email.toLowerCase().includes(searchLower) ||
        cred.category.toLowerCase().includes(searchLower) ||
        (cred.url && cred.url.toLowerCase().includes(searchLower)) ||
        (cred.notes && cred.notes.toLowerCase().includes(searchLower));

      const matchesCategory =
        !filters.category || cred.category === filters.category;

      return matchesSearch && matchesCategory;
    });
  }, [credentials, filters]);
}
