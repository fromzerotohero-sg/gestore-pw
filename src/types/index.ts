/**
 * Tipi centrali dell'applicazione
 * Definiscono le entità e le strutture dati usate in tutto il progetto
 */

// Ruoli utente supportati
export type UserRole = 'admin' | 'viewer';

// Profilo utente (estende auth.users di Supabase)
export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

// Categoria credenziale
export type CredentialCategory = 
  | 'Sviluppo'
  | 'Produzione'
  | 'Marketing'
  | 'Amministrazione'
  | 'HR'
  | 'Altro';

export const CREDENTIAL_CATEGORIES: CredentialCategory[] = [
  'Sviluppo',
  'Produzione',
  'Marketing',
  'Amministrazione',
  'HR',
  'Altro',
];

// Credenziale principale
export interface Credential {
  id: string;
  service_name: string;
  username_email: string;
  password_value: string;
  url: string | null;
  notes: string | null;
  category: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  // Join con profiles
  creator?: Profile;
  updater?: Profile;
}

// Form data per creazione/modifica
export interface CredentialFormData {
  service_name: string;
  username_email: string;
  password_value: string;
  url: string;
  notes: string;
  category: string;
}

// Filtri di ricerca
export interface CredentialFilters {
  search: string;
  category: string;
}

// Utente con sessione
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

// Risposta API standard
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}
