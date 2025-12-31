import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Package, ShoppingCart, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [metrics] = useState({
    totalRevenue: 12500.50,
    totalSales: 45,
    lowStockItems: 3,
    monthlyGrowth: 12.5,
  });

  const salesData = [
    { date: '01/12', sales: 1200, revenue: 2400 },
    { date: '02/12', sales: 1500, revenue: 3200 },
    { date: '03/12', sales: 1100, revenue: 2800 },
    { date: '04/12', sales: 2000, revenue: 4200 },
    { date: '05/12', sales: 1800, revenue: 3800 },
    { date: '06/12', sales: 2200, revenue: 4600 },
    { date: '07/12', sales: 2500, revenue: 5200 },
  ];

  const topProducts = [
    { name: 'Bolo de Chocolate', sales: 156, revenue: 3120 },
    { name: 'Cupcakes Variados', sales: 234, revenue: 2340 },
    { name: 'Pão de Forma', sales: 189, revenue: 945 },
    { name: 'Croissant', sales: 145, revenue: 1450 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao seu painel de controle</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Receita Total</p>
              <p className="metric-value">R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <TrendingUp className="text-accent" size={24} />
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-4">+{metrics.monthlyGrowth}% este mês</p>
        </div>

        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Vendas</p>
              <p className="metric-value">{metrics.totalSales}</p>
            </div>
            <ShoppingCart className="text-accent" size={24} />
          </div>
          <p className="text-xs text-muted-foreground mt-4">Transações este mês</p>
        </div>

        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Estoque Baixo</p>
              <p className="metric-value text-amber-600 dark:text-amber-400">{metrics.lowStockItems}</p>
            </div>
            <AlertCircle className="text-amber-500" size={24} />
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-4">Requer atenção</p>
        </div>

        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Valor do Estoque</p>
              <p className="metric-value">R$ 8.450</p>
            </div>
            <Package className="text-accent" size={24} />
          </div>
          <p className="text-xs text-muted-foreground mt-4">Produtos em estoque</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Vendas por Dia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={{ fill: 'var(--primary)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Receita por Dia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="revenue" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Produtos Mais Vendidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Produto</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Vendas</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Receita</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground">{product.name}</td>
                  <td className="text-right py-3 px-4 text-foreground">{product.sales}</td>
                  <td className="text-right py-3 px-4 font-semibold text-accent">
                    R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
