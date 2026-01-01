import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getFinancialTransactions, addFinancialTransaction, deleteFinancialTransaction, getAccounts, getTransactionCategories } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function Finances() {
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    type: 'income',
    category_id: null as number | null,
    account_id: null as number | null,
    amount: 0,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [transData, accData, catData] = await Promise.all([
        getFinancialTransactions(),
        getAccounts(),
        getTransactionCategories()
      ]);
      setTransactions(transData || []);
      setAccounts(accData || []);
      setCategories(catData || []);
      
      if (accData && accData.length > 0) {
        const defaultAcc = accData.find((a: any) => a.is_default) || accData[0];
        setFormData((prev) => ({ ...prev, account_id: defaultAcc.id }));
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    }
    setLoading(false);
  }

  const handleSave = async () => {
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    try {
      await addFinancialTransaction({
        ...formData,
        amount: formData.amount * 100
      });
      toast.success('Transação registrada com sucesso');
      setShowModal(false);
      setFormData({
        type: 'income',
        category_id: null,
        account_id: formData.account_id,
        amount: 0,
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar transação');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta transação?')) {
      try {
        await deleteFinancialTransaction(id);
        toast.success('Transação deletada com sucesso');
        loadData();
      } catch (error) {
        toast.error('Erro ao deletar transação');
      }
    }
  };

  const incomes = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
  const balance = incomes - expenses;

  const chartData = transactions
    .slice(-30)
    .reduce((acc: any[], t) => {
      const date = new Date(t.transaction_date).toLocaleDateString('pt-BR');
      const existing = acc.find(a => a.date === date);
      if (existing) {
        if (t.type === 'income') existing.income += t.amount || 0;
        else existing.expense += t.amount || 0;
      } else {
        acc.push({
          date,
          income: t.type === 'income' ? t.amount || 0 : 0,
          expense: t.type === 'expense' ? t.amount || 0 : 0
        });
      }
      return acc;
    }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando finanças...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Finanças</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw size={18} />
          </Button>
          <Button onClick={() => setShowModal(true)} className="bg-accent text-white">
            <Plus size={18} className="mr-2" /> Nova Transação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">Receitas</p>
              <p className="text-2xl font-bold text-green-600">R$ {(incomes / 100).toFixed(2)}</p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </Card>

        <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-red-700 dark:text-red-300">Despesas</p>
              <p className="text-2xl font-bold text-red-600">R$ {(expenses / 100).toFixed(2)}</p>
            </div>
            <TrendingDown className="text-red-600" size={24} />
          </div>
        </Card>

        <Card className="p-4 border-accent/20 bg-accent/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {(balance / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Receitas vs Despesas</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Receitas" />
              <Bar dataKey="expense" fill="#ef4444" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhuma transação registrada</p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Histórico de Transações</h2>
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma transação registrada</p>
          ) : (
            transactions.slice(0, 10).map(trans => (
              <div key={trans.id} className="flex justify-between items-center p-3 border rounded hover:bg-muted/30">
                <div className="flex-1">
                  <p className="font-bold">{trans.description || 'Sem descrição'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trans.transaction_date).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${trans.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {trans.type === 'income' ? '+' : '-'} R$ {(trans.amount / 100).toFixed(2)}
                  </p>
                  <button 
                    onClick={() => handleDelete(trans.id)} 
                    className="text-red-500 text-xs hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-background">
            <h2 className="text-2xl font-bold mb-6">Nova Transação</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold">Tipo</label>
                <select 
                  className="w-full p-2 border border-border rounded bg-background text-foreground"
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                  <option value="transfer">Transferência</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">Categoria</label>
                  <select 
                    className="w-full p-2 border border-border rounded bg-background text-foreground"
                    value={formData.category_id ? String(formData.category_id) : ''} 
                    onChange={e => setFormData({...formData, category_id: e.target.value ? parseInt(e.target.value) : null})}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.filter(c => c.type === formData.type).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">Conta</label>
                  <select 
                    className="w-full p-2 border border-border rounded bg-background text-foreground"
                    value={formData.account_id ? String(formData.account_id) : ''} 
                    onChange={e => setFormData({...formData, account_id: e.target.value ? parseInt(e.target.value) : null})}
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold">Valor (R$)</label>
                <input 
                  type="number" 
                  className="w-full p-2 border border-border rounded bg-background text-foreground"
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} 
                />
              </div>

              <div>
                <label className="text-sm font-bold">Data</label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-border rounded bg-background text-foreground"
                  value={formData.transaction_date} 
                  onChange={e => setFormData({...formData, transaction_date: e.target.value})} 
                />
              </div>

              <div>
                <label className="text-sm font-bold">Descrição</label>
                <textarea 
                  className="w-full p-2 border border-border rounded bg-background text-foreground"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button onClick={handleSave} className="bg-accent text-white">Salvar</Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
