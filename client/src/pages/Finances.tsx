import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function Finances() {
  const [expenses] = useState([
    { id: 1, date: '2024-12-30', category: 'Ingredientes', description: 'Compra de farinha', amount: 150.00 },
    { id: 2, date: '2024-12-29', category: 'Aluguel', description: 'Aluguel da loja', amount: 1500.00 },
    { id: 3, date: '2024-12-28', category: 'Utilidades', description: 'Energia elétrica', amount: 280.00 },
    { id: 4, date: '2024-12-27', category: 'Embalagem', description: 'Caixas e sacolas', amount: 95.00 },
  ]);

  const expenseData = [
    { name: 'Ingredientes', value: 450, color: '#D4A574' },
    { name: 'Aluguel', value: 1500, color: '#2C2415' },
    { name: 'Utilidades', value: 280, color: '#9B8B7E' },
    { name: 'Embalagem', value: 95, color: '#E8B4C8' },
  ];

  const totalRevenue = 12500.50;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const profitMargin = ((profit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Finanças</h1>
          <p className="text-muted-foreground">Controle de receitas e despesas</p>
        </div>
        <Button className="flex items-center gap-2 bg-accent hover:bg-accent/90">
          <Plus size={18} />
          Registrar Despesa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Receita Total</p>
              <p className="metric-value">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Despesas</p>
              <p className="metric-value">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <TrendingDown className="text-red-600" size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Lucro Líquido</p>
              <p className="metric-value text-green-600">R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-sm font-semibold text-green-600 bg-green-100 dark:bg-green-900 px-3 py-1 rounded">
              {profitMargin}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Distribuição de Despesas</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: R$ ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Resumo Financeiro</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="text-foreground">Receita Total</span>
              <span className="font-semibold text-green-600">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="text-foreground">Total de Despesas</span>
              <span className="font-semibold text-red-600">-R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between pt-4 bg-accent/10 px-4 py-3 rounded-lg">
              <span className="text-foreground font-semibold">Lucro Líquido</span>
              <span className="font-bold text-lg text-accent">R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Últimas Despesas</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Categoria</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Descrição</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Valor</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground text-sm">{expense.date}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground">{expense.description}</td>
                  <td className="text-right py-3 px-4 font-semibold text-red-600">-R$ {expense.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
