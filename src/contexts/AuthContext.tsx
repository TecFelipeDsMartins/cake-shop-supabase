import { createContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar sessão ao montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      
      // Limpar o estado localmente ANTES de chamar signOut
      setSession(null);
      setUser(null);
      
      // Limpar todos os dados de sessão do localStorage
      const keysToRemove = [
        'sb-auth-token',
        'supabase.auth.token',
        'supabase.auth.token.cache',
        'SUPABASE_ANON_KEY',
        'SUPABASE_URL'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Limpar sessionStorage também
      sessionStorage.clear();
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout no Supabase:', error);
        // Continuar mesmo se houver erro, pois já limpamos localmente
      }
    } catch (err: any) {
      console.error('Erro no signOut:', err);
      setError(err.message);
      // Não relançar erro para permitir que a redireção aconteça
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, error, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
