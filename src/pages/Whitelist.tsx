import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getAllWhitelistedEmails, addToWhitelist, removeFromWhitelist } from '@/lib/supabaseClient';

export default function Whitelist() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadEmails();
  }, []);

  async function loadEmails() {
    setLoading(true);
    try {
      const result = await getAllWhitelistedEmails();
      setEmails(result);
    } catch (error) {
      console.error('Erro ao carregar emails:', error);
      toast.error('Erro ao carregar lista de emails');
    }
    setLoading(false);
  }

  async function handleAddEmail() {
    if (!newEmail.trim()) {
      toast.error('Por favor, insira um email');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Email inválido');
      return;
    }

    setAdding(true);
    try {
      await addToWhitelist(newEmail);
      setEmails([...emails, newEmail.toLowerCase()]);
      setNewEmail('');
      toast.success('Email adicionado à whitelist');
    } catch (error) {
      console.error('Erro ao adicionar email:', error);
      toast.error('Erro ao adicionar email');
    }
    setAdding(false);
  }

  async function handleRemoveEmail(email: string) {
    try {
      await removeFromWhitelist(email);
      setEmails(emails.filter(e => e !== email));
      toast.success('Email removido da whitelist');
    } catch (error) {
      console.error('Erro ao remover email:', error);
      toast.error('Erro ao remover email');
    }
  }

  function copyToClipboard(email: string) {
    navigator.clipboard.writeText(email);
    setCopied(email);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Gerenciar Whitelist</h1>
        <p className="text-muted-foreground">Controle quais emails podem se registrar no sistema</p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Adicionar Email</h2>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Digite um email..."
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
          />
          <Button
            onClick={handleAddEmail}
            disabled={adding}
          >
            <Plus size={18} className="mr-2" />
            {adding ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Emails Autorizados ({emails.length})
        </h2>
        
        {emails.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum email na whitelist. Adicione um acima.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {emails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-mono text-sm text-foreground break-all">{email}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(email)}
                    title="Copiar email"
                  >
                    {copied === email ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveEmail(email)}
                  >
                    <X size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Dica:</strong> Apenas emails nesta lista poderão se registrar no sistema.
          Adicione todos os emails da sua equipe.
        </p>
      </Card>
    </div>
  );
}
