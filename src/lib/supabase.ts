import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          price: number;
          cost: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          quantity: number;
          min_quantity: number;
          unit: string;
          last_updated: string;
        };
        Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id' | 'last_updated'>;
        Update: Partial<Database['public']['Tables']['inventory']['Row']>;
      };
      sales: {
        Row: {
          id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          sale_date: string;
          payment_method: string;
          notes: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sales']['Row']>;
      };
      expenses: {
        Row: {
          id: string;
          category: string;
          description: string;
          amount: number;
          expense_date: string;
          payment_method: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['expenses']['Row']>;
      };
    };
  };
};
