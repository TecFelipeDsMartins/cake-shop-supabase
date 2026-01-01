import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

interface ProductPerformance {
  product: string;
  sales: number;
  revenue: number;
  margin: number;
  trend: number;
}

export default function Reports() {
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-06-30' });

  const monthlyData = [
    { month: 'Jan', revenue: 8500, expenses: 4200, profit: 4300, units: 145 },
    { month: 'Fev', revenue: 9200, expenses: 4500, profit: 4700, units: 162 },
    { month: 'Mar', revenue: 10100, expenses: 4800, profit: 5300, units: 178 },
    { month: 'Abr', revenue: 11500, expenses: 5200, profit: 6300, units: 195 },
    { month: 'Mai', revenue: 12000, expenses: 5500, profit: 6500, units: 210 },
    { month: 'Jun', revenue: 12500, expenses: 5800, profit: 6700, units: 225 },
  ];

  const productPerformance: ProductPerformance[] = [
    { product: 'Bolo de Chocolate', sales: 156, revenue: 13260, margin: 45, trend: 8 },
    { product: 'Cupcakes', sales: 234, revenue: 8190, margin: 52, trend: 12 },
    { product: 'Pão de Forma', sales: 189, revenue: 2268, margin: 38, trend: -3 },
    { product: 'Croissant', sales: 145, revenue: 7975, margin: 48, trend: 5 },
    { product: 'Bolo de Cenoura', sales: 98, revenue: 7350, margin: 42, trend: -1 },
  ];

  const categoryPerformance = [
    { name: 'Bolos', value: 20680, units: 254 },
    { name: 'Cupcakes', value: 8190, units: 234 },
    { name: 'Pães', value: 2268, units: 189 },
    { name: 'Croissants', value: 7975, units: 145 },
  ];

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = monthlyData.reduce((sum, m) => sum + m.profit, 0);
  const totalUnits = monthlyData.reduce((sum, m) => sum + m.units, 0);
  const avgMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  const topProduct = productPerformance.reduce((prev, current) => 
    prev.revenue > current.revenue ? prev : current
  );

  const COLORS = ['#D4A574', '#8B6F47', '#C19A6B', '#A0826D'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Relatórios</h1>
          <p className="text-muted-foreground">Análise detalhada de desempenho e tendências</p>
        </div>
        <Button className="flex items-center gap-2 bg-accent hover:bg-accent/90">
          <Download size={18} />
          Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
          <p className="text-2xl font-bold text-green-600">R$ {(totalRevenue / 1000).toFixed(1)}k</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={14} className="text-green-600" />
            <span className="text-xs text-green-600">+12.5% vs mês anterior</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Despesas Totais</p>
          <p className="text-2xl font-bold text-red-600">R$ {(totalExpenses / 1000).toFixed(1)}k</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown size={14} className="text-red-600" />
            <span className="text-xs text-red-600">{((totalExpenses / totalRevenue) * 100).toFixed(1)}% da receita</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Lucro Total</p>
          <p className="text-2xl font-bold text-accent">R$ {(totalProfit / 1000).toFixed(1)}k</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-accent font-semibold">{avgMargin}% de margem</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Unidades Vendidas</p>
          <p className="text-2xl font-bold text-foreground">{totalUnits}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-muted-foreground">Ticket médio: R$ {(totalRevenue / totalUnits).toFixed(2)}</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Produto Top</p>
          <p className="text-lg font-bold text-foreground truncate">{topProduct.product}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-accent">R$ {topProduct.revenue.toLocaleString('pt-BR')}</span>
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                stroke="var(--accent)"
                strokeWidth={3}
                dot={{ fill: 'var(--accent)', r: 5 }}
                name="Lucro"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Vendas por Categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryPerformance}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: R$ ${value.toLocaleString('pt-BR')}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

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
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Tendência</th>
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
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                      {product.margin}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      {product.trend > 0 ? (
                        <>
                          <TrendingUp size={16} className="text-green-600" />
                          <span className="text-xs text-green-600 font-semibold">+{product.trend}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown size={16} className="text-red-600" />
                          <span className="text-xs text-red-600 font-semibold">{product.trend}%</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Análise de Período</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Data Inicial</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Data Final</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
        <Button className="mt-4 bg-accent hover:bg-accent/90">
          <Calendar size={16} className="mr-2" />
          Gerar Relatório
        </Button>
      </Card>
    </div>
  );
}
