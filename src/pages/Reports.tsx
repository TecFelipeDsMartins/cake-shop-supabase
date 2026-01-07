import { useState, useEffect } from 'react';
import { getSales, getSaleItems } from '@/lib/supabaseClient';
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
   const [monthlyData, setMonthlyData] = useState<any[]>([]);
   const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([]);
   const [categoryPerformance, setCategoryPerformance] = useState<any[]>([]);
   const [totalDeliveryExpenses, setTotalDeliveryExpenses] = useState(0);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     loadData();
   }, []);

   async function loadData() {
     setLoading(true);
     try {
       const sales = await getSales();
       
       // Calcular despesas com entrega
       const deliveryExpenses = (sales || []).reduce((sum, sale) => sum + (sale.delivery_cost || 0), 0);
       setTotalDeliveryExpenses(deliveryExpenses);
       
       // Processar produtos e itens
       const saleItemsPromises = (sales || []).map(sale => getSaleItems(sale.id));
       const allItems = await Promise.all(saleItemsPromises);
       
       // Processar dados por mês
       const monthlyMap: { [key: string]: any } = {};
       for (const sale of sales || []) {
         const date = new Date(sale.sale_date);
         const monthKey = `${date.getMonth() + 1}`.padStart(2, '0');
         const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' });
         
         if (!monthlyMap[monthKey]) {
           monthlyMap[monthKey] = { month: monthLabel, revenue: 0, expenses: 0, profit: 0, units: 0 };
         }
         monthlyMap[monthKey].revenue += sale.total_amount || 0;
       }
       
       // Somar unidades por mês
       allItems.forEach((saleItems, saleIndex) => {
        const sale = sales[saleIndex];
        const date = new Date(sale.sale_date);
        const monthKey = `${date.getMonth() + 1}`.padStart(2, '0');
        
        saleItems.forEach((item: any) => {
          monthlyMap[monthKey].units += item.quantity || 0;
          const productCost = item.product?.production_cost || 0;
          const itemExpense = productCost * (item.quantity || 0);
          monthlyMap[monthKey].expenses += itemExpense;
        });
       });
       
       // Calcular lucro
       Object.values(monthlyMap).forEach((month: any) => {
         month.profit = month.revenue - month.expenses;
       });
       
       const computed = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));
       setMonthlyData(computed);

       // Processar produtos mais vendidos
       const productMap: { [key: string]: any } = {};
       
       allItems.forEach(items => {
         items.forEach((item: any) => {
           const key = item.product_id;
           if (!productMap[key]) {
             productMap[key] = { product: item.product?.name || 'Produto', sales: 0, revenue: 0, expenses: 0, margin: 0, trend: 0 };
           }
           productMap[key].sales += item.quantity || 0;
           productMap[key].revenue += item.subtotal || 0;
           productMap[key].expenses += (item.product?.production_cost || 0) * item.quantity || 0;
         });
       });
       
       // Calcular margem real
       Object.values(productMap).forEach((prod: any) => {
         const profit = prod.revenue - prod.expenses;
         prod.margin = prod.revenue > 0 ? Math.round((profit / prod.revenue) * 100) : 0;
       });
       
       const topProds = Object.values(productMap)
         .sort((a: any, b: any) => b.revenue - a.revenue)
         .slice(0, 5);
       setProductPerformance(topProds);

       // Categorias por tipo de produto (agrupado)
       const categoryMap: { [key: string]: any } = {};
       allItems.forEach(items => {
         items.forEach((item: any) => {
           const categoryName = item.product?.name || 'Outros';
           if (!categoryMap[categoryName]) {
             categoryMap[categoryName] = { name: categoryName, value: 0, units: 0 };
           }
           categoryMap[categoryName].value += item.subtotal || 0;
           categoryMap[categoryName].units += item.quantity || 0;
         });
       });
       setCategoryPerformance(Object.values(categoryMap).sort((a: any, b: any) => b.value - a.value).slice(0, 4));
     } catch (error) {
       console.error('Erro ao carregar relatórios:', error);
     }
     setLoading(false);
   }

  const totalRevenue = monthlyData.length > 0 ? monthlyData.reduce((sum, m) => sum + m.revenue, 0) : 0;
  const totalExpenses = monthlyData.length > 0 ? monthlyData.reduce((sum, m) => sum + m.expenses, 0) : 0;
  const totalProfit = totalRevenue - totalExpenses;
  const netProfit = totalProfit - totalDeliveryExpenses;
  const totalUnits = monthlyData.length > 0 ? monthlyData.reduce((sum, m) => sum + m.units, 0) : 0;
  const avgMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  const topProduct = productPerformance.length > 0 ? productPerformance.reduce((prev, current) => 
    prev.revenue > current.revenue ? prev : current
  ) : { product: 'N/A', sales: 0, revenue: 0, margin: 0, trend: 0 };

  const COLORS = ['#D4A574', '#8B6F47', '#C19A6B', '#A0826D'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Relatórios</h1>
            <p className="text-muted-foreground">Análise detalhada de desempenho e tendências</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              Atualizar
            </Button>
            <Button className="flex items-center gap-2 bg-accent hover:bg-accent/90">
              <Download size={18} />
              Exportar PDF
            </Button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
          <p className="text-2xl font-bold text-green-600">R$ {totalRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp size={14} className="text-green-600" />
            <span className="text-xs text-green-600">+12.5% vs mês anterior</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Despesas (Insumos)</p>
          <p className="text-2xl font-bold text-red-600">R$ {totalExpenses.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown size={14} className="text-red-600" />
            <span className="text-xs text-red-600">{totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0'}% da receita</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Despesas (Entrega)</p>
          <p className="text-2xl font-bold text-orange-600">R$ {totalDeliveryExpenses.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-orange-600">{totalRevenue > 0 ? ((totalDeliveryExpenses / totalRevenue) * 100).toFixed(1) : '0'}% da receita</span>
          </div>
        </Card>

        <Card className="p-4 border-2 border-blue-200 bg-blue-50">
          <p className="text-sm text-muted-foreground mb-1 font-bold">Lucro Bruto</p>
          <p className="text-2xl font-bold text-blue-600">R$ {totalProfit.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-blue-600 font-semibold">{avgMargin}% de margem</span>
          </div>
        </Card>

        <Card className="p-4 border-2 border-accent bg-accent/5">
          <p className="text-sm text-muted-foreground mb-1 font-bold">Lucro Líquido</p>
          <p className="text-2xl font-bold text-accent">R$ {netProfit.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-accent font-semibold">{netMargin}% de margem líquida</span>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Unidades Vendidas</p>
          <p className="text-2xl font-bold text-foreground">{totalUnits}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-muted-foreground">Ticket médio: R$ {totalUnits > 0 ? (totalRevenue / totalUnits).toFixed(2) : '0.00'}</span>
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
