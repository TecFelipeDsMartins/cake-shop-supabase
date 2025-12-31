import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Reports() {
  const [period, setPeriod] = useState('month');

  const monthlyData = [
    { month: 'Jan', revenue: 8500, expenses: 4200, profit: 4300 },
    { month: 'Fev', revenue: 9200, expenses: 4500, profit: 4700 },
    { month: 'Mar', revenue: 10100, expenses: 4800, profit: 5300 },
    { month: 'Abr', revenue: 11500, expenses: 5200, profit: 6300 },
    { month: 'Mai', revenue: 12000, expenses: 5500, profit: 6500 },
    { month: 'Jun', revenue: 12500, expenses: 5800, profit: 6700 },
  ];

  const productPerformance = [
    { product: 'Bolo de Chocolate', sales: 156, revenue: 13260, margin: 45 },
    { product: 'Cupcakes', sales: 234, revenue: 8190, margin: 52 },
    { product: 'Pão de Forma', sales: 189, revenue: 2268, margin: 38 },
    { product: 'Croissant', sales: 145, revenue: 7975, margin: 48 },
    { product: 'Bolo de Cenoura', sales: 98, revenue: 7350, margin: 42 },
  ];

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = monthlyData.reduce((sum, m) => sum + m.profit, 0);
  const avgMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada de desempenho</p>
        </div>
        <Button className="flex items-center gap-2 bg-accent hover:bg-accent/90">
          <Download size={18} />
          Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
          <p className="text-2xl font-bold text-foreground">R$ {(totalRevenue / 1000).toFixed(1)}k</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Despesas Totais</p>
          <p className="text-2xl font-bold text-red-600">R$ {(totalExpenses / 1000).toFixed(1)}k</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Lucro Total</p>
          <p className="text-2xl font-bold text-green-600">R$ {(totalProfit / 1000).toFixed(1)}k</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Margem Média</p>
          <p className="text-2xl font-bold text-accent">{avgMargin}%</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Desempenho Mensal</h2>
          <div className="flex gap-2">
            <Button
              variant={period === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('month')}
            >
              Mês
            </Button>
            <Button
              variant={period === 'quarter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('quarter')}
            >
              Trimestre
            </Button>
            <Button
              variant={period === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('year')}
            >
              Ano
            </Button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
              }}
              formatter={(value) => `R$ ${value}`}
            />
            <Legend />
            <Bar dataKey="revenue" fill="var(--chart-1)" name="Receita" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--chart-4)" name="Despesas" radius={[8, 8, 0, 0]} />
            <Bar dataKey="profit" fill="var(--chart-2)" name="Lucro" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Tendência de Lucro</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
              }}
              formatter={(value) => `R$ ${value}`}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={{ fill: 'var(--primary)', r: 5 }}
              name="Lucro"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Desempenho de Produtos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Produto</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Vendas</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Receita</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Margem</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((product, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{product.product}</td>
                  <td className="text-center py-3 px-4 text-foreground">{product.sales}</td>
                  <td className="text-right py-3 px-4 font-semibold text-accent">
                    R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      {product.margin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
