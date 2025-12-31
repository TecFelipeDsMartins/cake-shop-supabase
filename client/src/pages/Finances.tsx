import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export default function Finances() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, date: '2024-12-30', category: 'Ingredientes', description: 'Compra de farinha', amount: 150.00 },
    { id: 2, date: '2024-12-29', category: 'Aluguel', description: 'Aluguel da loja', amount: 1500.00 },
    { id: 3, date: '2024-12-28', category: 'Utilidades', description: 'Energia elétrica', amount: 280.00 },
    { id: 4, date: '2024-12-27', category: 'Embalagem', description: 'Caixas e sacolas', amount: 95.00 },
    { id: 5, date: '2024-12-26', category: 'Manutenção', description: 'Limpeza do forno', amount: 200.00 },
  ]);

  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: 0,
  });

  const categories = ['Ingredientes', 'Aluguel', 'Utilidades', 'Embalagem', 'Manutenção', 'Salários', 'Marketing', 'Transporte'];

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingId(expense.id);
      setFormData({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
      });
    } else {
      setEditingId(null);
      setFormData({
        category: '',
        description: '',
        amount: 0,
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.category || !formData.description || formData.amount <= 0) {
      alert('Preencha todos os campos corretamente');
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (editingId) {
      setExpenses(expenses.map(exp =>
        exp.id === editingId
          ? { ...exp, ...formData }
          : exp
      ));
    } else {
      const newExpense: Expense = {
        id: Math.max(...expenses.map(e => e.id), 0) + 1,
        date: today,
        ...formData,
      };
      setExpenses([newExpense, ...expenses]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta despesa?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  // Cálculos
  const totalRevenue = 12500.50;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const profitMargin = ((profit / totalRevenue) * 100).toFixed(1);

  // Dados para gráficos
  const expenseByCategory = expenses.reduce((acc, exp) => {
    const existing = acc.find(item => item.name === exp.category);
    if (existing) {
      existing.value += exp.amount;
    } else {
      acc.push({ name: exp.category, value: exp.amount });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const expenseByDate = expenses.reduce((acc, exp) => {
    const existing = acc.find(item => item.date === exp.date);
    if (existing) {
      existing.value += exp.amount;
    } else {
      acc.push({ date: exp.date, value: exp.amount });
    }
    return acc;
  }, [] as Array<{ date: string; value: number }>).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const COLORS = ['#D4A574', '#8B6F47', '#C19A6B', '#A0826D', '#9B8B7E'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Análise Financeira</h1>
          <p className="text-muted-foreground">DRE e controle de despesas</p>
        </div>
        <Button
          className="flex items-center gap-2 bg-accent hover:bg-accent/90"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} />
          Registrar Despesa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
          <p className="text-2xl font-bold text-green-600">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={16} className="text-green-600" />
            <span className="text-xs text-green-600">+12.5% este mês</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total de Despesas</p>
          <p className="text-2xl font-bold text-red-600">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown size={16} className="text-red-600" />
            <span className="text-xs text-red-600">{((totalExpenses / totalRevenue) * 100).toFixed(1)}% da receita</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Lucro Líquido</p>
          <p className="text-2xl font-bold text-accent">R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs font-semibold text-accent">{profitMargin}% de margem</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold text-foreground">R$ {(totalExpenses / expenses.length).toFixed(2)}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-muted-foreground">{expenses.length} despesas</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Distribuição de Despesas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: R$ ${value.toFixed(0)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Despesas por Dia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
              />
              <Bar dataKey="value" fill="var(--accent)" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Demonstração de Resultado (DRE)</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-foreground">Receita Bruta</span>
            <span className="font-semibold text-green-600">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-foreground">(-) Despesas Operacionais</span>
            <span className="font-semibold text-red-600">-R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between pt-3 bg-accent/10 px-4 py-3 rounded-lg">
            <span className="text-foreground font-semibold">Lucro Líquido</span>
            <span className="font-bold text-lg text-accent">R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between pt-3 px-4 py-3">
            <span className="text-foreground text-sm">Margem de Lucro</span>
            <span className="font-semibold text-accent">{profitMargin}%</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Histórico de Despesas</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Categoria</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Descrição</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Valor</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground text-sm">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground">{expense.description}</td>
                  <td className="text-right py-3 px-4 font-semibold text-red-600">-R$ {expense.amount.toFixed(2)}</td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent hover:text-accent/80"
                        onClick={() => handleOpenModal(expense)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingId ? 'Editar Despesa' : 'Registrar Despesa'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Descrição *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Ex: Compra de ingredientes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0.00"
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
                    {editingId ? 'Atualizar' : 'Registrar'} Despesa
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
