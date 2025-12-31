import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  isDefault: boolean;
  description?: string;
}

export default function Accounts() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([
    { id: 1, name: 'Conta Corrente', type: 'Corrente', balance: 5000.00, isDefault: true, description: 'Conta principal para operações' },
    { id: 2, name: 'Poupança', type: 'Poupança', balance: 2500.00, isDefault: false, description: 'Reserva de emergência' },
    { id: 3, name: 'Caixa', type: 'Caixa', balance: 500.00, isDefault: false, description: 'Dinheiro em espécie' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    balance: 0,
    description: '',
  });

  const accountTypes = ['Corrente', 'Poupança', 'Caixa', 'Investimento', 'Crédito', 'Outro'];

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingId(account.id);
      setFormData({
        name: account.name,
        type: account.type,
        balance: account.balance,
        description: account.description || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        type: '',
        balance: 0,
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.type) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingId) {
      setAccounts(accounts.map(acc =>
        acc.id === editingId
          ? { ...acc, ...formData }
          : acc
      ));
    } else {
      const newAccount: Account = {
        id: Math.max(...accounts.map(a => a.id), 0) + 1,
        ...formData,
        isDefault: accounts.length === 0,
      };
      setAccounts([...accounts, newAccount]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (accounts.find(a => a.id === id)?.isDefault) {
      alert('Não é possível deletar a conta padrão. Defina outra conta como padrão primeiro.');
      return;
    }

    if (confirm('Tem certeza que deseja deletar esta conta?')) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  };

  const handleSetDefault = (id: number) => {
    setAccounts(accounts.map(acc => ({
      ...acc,
      isDefault: acc.id === id,
    })));
  };

  const defaultAccount = accounts.find(a => a.isDefault);
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contas</h1>
          <p className="text-muted-foreground mt-1">Gerenciar contas bancárias e de caixa</p>
        </div>
        <Button
          className="bg-accent hover:bg-accent/90"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} className="mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Saldo Total</p>
          <p className="text-2xl font-bold text-foreground">R$ {totalBalance.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">{accounts.length} contas</p>
        </Card>

        {defaultAccount && (
          <Card className="p-6 bg-accent/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Conta Padrão</p>
                <p className="text-lg font-bold text-foreground">{defaultAccount.name}</p>
                <p className="text-sm text-accent font-semibold mt-1">R$ {defaultAccount.balance.toFixed(2)}</p>
              </div>
              <Star size={32} className="text-accent fill-accent" />
            </div>
          </Card>
        )}

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Informação</p>
          <p className="text-foreground font-medium">A conta padrão recebe automaticamente as vendas</p>
          <p className="text-xs text-muted-foreground mt-3">Clique na estrela para definir como padrão</p>
        </Card>
      </div>

      {/* Lista de Contas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Minhas Contas</h2>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{account.name}</h3>
                  {account.isDefault && (
                    <Star size={16} className="text-accent fill-accent" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{account.type}</p>
                {account.description && (
                  <p className="text-xs text-muted-foreground mt-1">{account.description}</p>
                )}
              </div>

              <div className="text-right mr-4">
                <p className="text-xl font-bold text-foreground">R$ {account.balance.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-2">
                {!account.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-accent"
                    onClick={() => handleSetDefault(account.id)}
                    title="Definir como padrão"
                  >
                    <Star size={18} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-accent hover:text-accent/80"
                  onClick={() => handleOpenModal(account)}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(account.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal de Conta */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingId ? 'Editar Conta' : 'Nova Conta'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome da Conta *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Ex: Conta Corrente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tipo de Conta *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Selecione um tipo</option>
                    {accountTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Saldo Inicial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance || 0}
                    onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Adicione uma descrição (opcional)"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-accent hover:bg-accent/90"
                    onClick={handleSave}
                  >
                    {editingId ? 'Atualizar' : 'Criar'} Conta
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
