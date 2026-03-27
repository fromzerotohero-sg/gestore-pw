/**
 * Type definitions per il database Supabase
 * Generato manualmente per tipi strong-type
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'viewer';
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: 'admin' | 'viewer';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'viewer';
          created_at?: string;
        };
      };
      credentials: {
        Row: {
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
        };
        Insert: {
          id?: string;
          service_name: string;
          username_email: string;
          password_value: string;
          url?: string | null;
          notes?: string | null;
          category: string;
          created_at?: string;
          updated_at?: string;
          created_by: string;
          updated_by: string;
        };
        Update: {
          id?: string;
          service_name?: string;
          username_email?: string;
          password_value?: string;
          url?: string | null;
          notes?: string | null;
          category?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
          updated_by?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
