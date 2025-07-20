import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente do Supabase não encontradas. ' +
    'Certifique-se de definir VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local'
  );
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Tipos para TypeScript (serão expandidos conforme criamos as tabelas)
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          name: string;
          address: string;
          energy_unit_name: string | null;
          type: 'apartment' | 'house' | 'commercial';
          purchase_price: number;
          rent_value: number;
          status: 'rented' | 'vacant' | 'maintenance';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          energy_unit_name?: string | null;
          type: 'apartment' | 'house' | 'commercial';
          purchase_price: number;
          rent_value: number;
          status: 'rented' | 'vacant' | 'maintenance';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          energy_unit_name?: string | null;
          type?: 'apartment' | 'house' | 'commercial';
          purchase_price?: number;
          rent_value?: number;
          status?: 'rented' | 'vacant' | 'maintenance';
          created_at?: string;
        };
      };
      tenants: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          email: string;
          cpf: string | null;
          phone: string;
          start_date: string;
          agreed_payment_date: string | null;
          monthly_rent: number;
          deposit: number;
          payment_method: 'À vista' | 'A prazo' | null;
          installments: '2x' | '3x' | null;
          deposit_paid_installments: boolean[] | null;
          formalized_contract: boolean | null;
          status: 'active' | 'inactive';
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          name: string;
          email: string;
          cpf?: string | null;
          phone: string;
          start_date: string;
          agreed_payment_date?: string | null;
          monthly_rent: number;
          deposit: number;
          payment_method?: 'À vista' | 'A prazo' | null;
          installments?: '2x' | '3x' | null;
          deposit_paid_installments?: boolean[] | null;
          formalized_contract?: boolean | null;
          status: 'active' | 'inactive';
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          name?: string;
          email?: string;
          cpf?: string | null;
          phone?: string;
          start_date?: string;
          agreed_payment_date?: string | null;
          monthly_rent?: number;
          deposit?: number;
          payment_method?: 'À vista' | 'A prazo' | null;
          installments?: '2x' | '3x' | null;
          deposit_paid_installments?: boolean[] | null;
          formalized_contract?: boolean | null;
          status?: 'active' | 'inactive';
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          property_id: string;
          type: 'income' | 'expense';
          category: string;
          amount: number;
          description: string;
          date: string;
          recurring: any | null; // JSON field
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          type: 'income' | 'expense';
          category: string;
          amount: number;
          description: string;
          date: string;
          recurring?: any | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          type?: 'income' | 'expense';
          category?: string;
          amount?: number;
          description?: string;
          date?: string;
          recurring?: any | null;
          created_at?: string;
        };
      };
      // Mais tabelas serão adicionadas conforme necessário
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
};

// Cliente tipado
export const supabaseTyped = supabase as typeof supabase & {
  from<T extends keyof Database['public']['Tables']>(
    table: T
  ): any;
};

// Utilitários para autenticação
export const auth = supabase.auth;

// Utilitários para storage (para upload de documentos no futuro)
export const storage = supabase.storage;

// Helper para verificar se o usuário está autenticado
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
  return user;
};

// Helper para fazer logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

// Helper para verificar conexão com Supabase
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = tabela não existe ainda
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão com Supabase:', error);
    return false;
  }
};