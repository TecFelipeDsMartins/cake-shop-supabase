import { useState } from 'react';
import { useLocation } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Login() {
  const [, setLocation] = useLocation();
  const { signIn, signUp, user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Se já está autenticado, redireciona
  if (user) {
    setLocation('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success('Cadastro realizado! Verifique seu email');
        // Após signup, fazer login automaticamente
        await signIn(email, password);
        setLocation('/');
      } else {
        await signIn(email, password);
        toast.success('Autenticado com sucesso');
        setLocation('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-accent/20">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-foreground mb-2">Cake Shop</h1>
            <p className="text-muted-foreground">
              {isSignUp ? 'Criar nova conta' : 'Entrar na sua conta'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent outline-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-2 rounded-lg transition-all"
            >
              {loading ? 'Carregando...' : isSignUp ? 'Cadastrar' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            </p>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-accent hover:text-accent/90 font-semibold transition-colors"
            >
              {isSignUp ? 'Entrar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
