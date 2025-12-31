import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type RecordType = 'expense' | 'income' | 'transfer';

interface FinancialRecord {
  id: number;
  date: string;
  type: RecordType;
  description: string;
  category: string;
  amount: number;
  paymentMethod?: string;
  notes?: string;
  fromAccount?: string;
  toAccount?: string;
}

const COLORS = ['#d97706', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function Finances() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<RecordType | 'all'>('all');

  const [records, setRecords] = useState<FinancialRecord[]>([
    { id: 1, date: '2024-12-28', type: 'income', description: 'Vendas do dia', category: 'Vendas', amount: 2500.00, paymentMethod: 'Múltiplos', notes: 'Vendas de bolos e cupcakes' },
    { id: 2, date: '2024-12-28', type: 'expense', description: 'Compra de ingredientes', category: 'Matéria Prima', amount: 450.00, paymentMethod: 'Transferência', notes: 'Farinha, açúcar, ovos' },
    { id: 3, date: '2024-12-27', type: 'expense', description: 'Aluguel do espaço', category: 'Aluguel', amount: 1500.00, paymentMethod: 'Transferência', notes: 'Aluguel dezembro' },
    { id: 4, date: '2024-12-27', type: 'income', description: 'Vendas do dia', category: 'Vendas', amount: 1800.00, paymentMethod: 'Múltiplos', notes: 'Vendas de pães e croissants' },
    { id: 5, date: '2024-12-26', type: 'transfer', description: 'Transferência para conta poupança', category: 'Transferência', amount: 1000.00, fromAccount: 'Conta Corrente', toAccount: 'Poupança', notes: 'Reserva mensal' },
    { id: 6, date: '2024-12-26', type: 'expense', description: 'Energia elétrica', category: 'Utilidades', amount: 280.00, paymentMethod: 'Débito', notes: 'Conta de dezembro' },
  ]);

  const [formData, setFormData] = useState<FinancialRecord>({
    id: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    description: '',
    category: '',
    amount: 0,
    paymentMethod: 'Dinheiro',
    notes: '',
    fromAccount: 'Conta Corrente',
    toAccount: 'Poupança',
  });

  const expenseCategories = ['Matéria Prima', 'Aluguel', 'Utilidades', 'Funcionários', 'Marketing', 'Manutenção', 'Outros'];
  const incomeCategories = ['Vendas', 'Serviços', 'Outros'];
  const paymentMethods = ['Dinheiro', 'Cartão', 'Pix', 'Transferência', 'Cheque', 'Múltiplos'];
  const accounts = ['Conta Corrente', 'Poupança', 'Caixa', 'Conta Investimento'];

  const handleOpenModal = (record?: FinancialRecord) => {
    if (record) {
      setEditingId(record.id);
      setFormData(record);
    } else {
      setEditingId(null);
      setFormData({
        id: 0,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        description: '',
        category: '',
        amount: 0,
        paymentMethod: 'Dinheiro',
        notes: '',
        fromAccount: 'Conta Corrente',
        toAccount: 'Poupança',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.description || !formData.category || formData.amount <= 0) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingId) {
      setRecords(records.map(r => r.id === editingId ? { ...formData, id: editingId } : r));
    } else {
      const newRecord: FinancialRecord = {
        ...formData,
        id: Math.max(...records.map(r => r.id), 0) + 1,
      };
      setRecords([newRecord, ...records]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este registro?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const filteredRecords = filterType === 'all' ? records : records.filter(r => r.type === filterType);

  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const totalTransfers = records.filter(r => r.type === 'transfer').reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpenses;

  const expensesByCategory = records
    .filter(r => r.type === 'expense')
    .reduce((acc, r) => {
      const existing = acc.find(item => item.name === r.category);
      if (existing) {
        existing.value += r.amount;
      } else {
        acc.push({ name: r.category, value: r.amount });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>);

  const incomeByCategory = records
    .filter(r => r.type === 'income')
    .reduce((acc, r) => {
      const existing = acc.find(item => item.name === r.category);
      if (existing) {
        existing.value += r.amount;
      } else {
        acc.push({ name: r.category, value: r.amount });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>);

  const getRecordIcon = (type: RecordType) => {
    switch (type) {
      case 'income':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'expense':
        return <TrendingDown size={16} className="text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft size={16} className="text-blue-600" />;
    }
  };

  const getRecordTypeLabel = (type: RecordType) => {
    switch (type) {
      case 'income':
        return 'Receita';
      case 'expense':
        return 'Despesa';
      case 'transfer':
        return 'Transferência';
    }
  };

  const getCategoryOptions = () => {
    if (formData.type === 'income') return incomeCategories;
    if (formData.type === 'transfer') return ['Transferência'];
    return expenseCategories;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finanças</h1>
          <p className="text-muted-foreground mt-1">Controle de receitas, despesas e transferências</p>
        </div>
        <Button
          className="bg-accent hover:bg-accent/90"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} className="mr-2" />
          Novo Registro
        </Button>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total de Receitas</p>
              <p className="text-2xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</p>
            </div>
            <TrendingUp size={32} className="text-green-600/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total de Despesas</p>
              <p className="text-2xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
            </div>
            <TrendingDown size={32} className="text-red-600/20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Transferências</p>
              <p className="text-2xl font-bold text-blue-600">R$ {totalTransfers.toFixed(2)}</p>
            </div>
            <ArrowRightLeft size={32} className="text-blue-600/20" />
          </div>
        </Card>

        <Card className="p-6 bg-accent/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Saldo Líquido</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {balance.toFixed(2)}
              </p>
            </div>
            <div className={`text-4xl ${balance >= 0 ? 'text-green-600/20' : 'text-red-600/20'}`}>
              {balance >= 0 ? '✓' : '✗'}
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {expensesByCategory.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: R$ ${value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {incomeByCategory.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Receitas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: R$ ${value.toFixed(0)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className={filterType === 'all' ? 'bg-accent' : ''}
          >
            Todos
          </Button>
          <Button
            variant={filterType === 'income' ? 'default' : 'outline'}
            onClick={() => setFilterType('income')}
            className={filterType === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <TrendingUp size={16} className="mr-1" />
            Receitas
          </Button>
          <Button
            variant={filterType === 'expense' ? 'default' : 'outline'}
            onClick={() => setFilterType('expense')}
            className={filterType === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <TrendingDown size={16} className="mr-1" />
            Despesas
          </Button>
          <Button
            variant={filterType === 'transfer' ? 'default' : 'outline'}
            onClick={() => setFilterType('transfer')}
            className={filterType === 'transfer' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <ArrowRightLeft size={16} className="mr-1" />
            Transferências
          </Button>
        </div>
      </Card>

      {/* Histórico de Registros */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Histórico de Registros</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Descrição</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Categoria</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Valor</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Detalhes</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground text-sm">{new Date(record.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getRecordIcon(record.type)}
                      <span className="text-sm font-medium text-foreground">{getRecordTypeLabel(record.type)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground font-medium">{record.description}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{record.category}</td>
                  <td className={`text-right py-3 px-4 font-semibold ${
                    record.type === 'income' ? 'text-green-600' :
                    record.type === 'expense' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {record.type === 'expense' ? '-' : '+'}R$ {record.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {record.type === 'transfer' ? (
                      <span>{record.fromAccount} → {record.toAccount}</span>
                    ) : (
                      <span>{record.paymentMethod}</span>
                    )}
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent hover:text-accent/80"
                        onClick={() => handleOpenModal(record)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(record.id)}
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

      {/* Modal de Registro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingId ? 'Editar Registro' : 'Novo Registro Financeiro'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tipo de Registro *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as RecordType, category: '' })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="income">Receita (Entrada)</option>
                    <option value="expense">Despesa (Saída)</option>
                    <option value="transfer">Transferência</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Data *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
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
                  <label className="block text-sm font-medium text-foreground mb-2">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Selecione uma categoria</option>
                    {getCategoryOptions().map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount || 0}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0.00"
                  />
                </div>

                {formData.type === 'transfer' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">De (Conta) *</label>
                        <select
                          value={formData.fromAccount || 'Conta Corrente'}
                          onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          {accounts.map(acc => (
                            <option key={acc} value={acc}>{acc}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Para (Conta) *</label>
                        <select
                          value={formData.toAccount || 'Poupança'}
                          onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                          {accounts.map(acc => (
                            <option key={acc} value={acc}>{acc}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Método de Pagamento</label>
                    <select
                      value={formData.paymentMethod || 'Dinheiro'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Observações</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Adicione observações adicionais"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-border">
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
                    Salvar Registro
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
