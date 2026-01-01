import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Wallet, RefreshCw } from 'lucide-react';
import { getAccounts, addAccount, updateAccount, deleteAccount } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function Accounts() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    account_type: 'Corrente',
    balance: 0,
    is_default: false
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(data || []);
    } catch (error) {
      toast.error('Erro ao carregar contas');
    }
    setLoading(false);
  }

  const handleOpenModal = (account?: any) => {
    if (account) {
      setEditingId(account.id);
      setFormData({
        name: account.name,
        account_type: account.account_type || 'Corrente',
        balance: account.balance || 0,
        is_default: account.is_default || false
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        account_type: 'Corrente',
        balance: 0,
        is_default: false
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome da conta é obrigatório');
      return;
    }

    try {
      if (editingId) {
        await updateAccount(editingId, formData);
        toast.success('Conta atualizada com sucesso');
      } else {
        await addAccount(formData);
        toast.success('Conta adicionada com sucesso');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar conta');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta conta?')) {
      try {
        await deleteAccount(id);
        toast.success('Conta deletada com sucesso');
        loadData();
      } catch (error) {
        toast.error('Erro ao deletar conta');
      }
    }
  };

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando contas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contas Bancárias</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw size={18} />
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-accent text-white">
            <Plus size={18} className="mr-2" /> Nova Conta
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-r from-accent/10 to-accent/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Saldo Total</p>
            <p className="text-3xl font-bold text-accent">R$ {(totalBalance / 100).toFixed(2)}</p>
          </div>
          <Wallet size={40} className="text-accent/30" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma conta cadastrada</p>
          </div>
        ) : (
          accounts.map(account => (
            <Card key={account.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{account.name}</h3>
                    <p className="text-xs text-muted-foreground">{account.account_type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(account)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => account.id && handleDelete(account.id)}
                      className="p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className="text-xl font-bold text-accent">R$ {(account.balance / 100).toFixed(2)}</p>
                </div>

                {account.is_default && (
                  <div className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded w-fit">
                    Conta Padrão
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {editingId ? 'Editar Conta' : 'Nova Conta'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold">Nome da Conta *</label>
                <input
                  type="text"
                  placeholder="Ex: Conta Corrente"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-bold">Tipo de Conta</label>
                <select
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                >
                  <option>Corrente</option>
                  <option>Poupança</option>
                  <option>Caixa</option>
                  <option>Investimento</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">Saldo Inicial (R$)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.balance / 100}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) * 100 || 0 })}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Definir como conta padrão</span>
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingId ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
