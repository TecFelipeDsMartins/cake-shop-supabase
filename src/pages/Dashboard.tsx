import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Package, ShoppingCart, AlertCircle, Cake, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getSales, getCustomers, getProducts, getIngredients, getDashboardMetrics, getSaleItems } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    lowStockItems: 0,
    monthlyGrowth: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [birthdayCustomers, setBirthdayCustomers] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [dashMetrics, salesList, customersList, productsList, ingredientsList] = await Promise.all([
        getDashboardMetrics(),
        getSales(),
        getCustomers(),
        getProducts(),
        getIngredients()
      ]);

      // Processar métricas
      setMetrics({
        totalRevenue: dashMetrics.totalSales || 0,
        totalSales: dashMetrics.salesCount || 0,
        lowStockItems: ingredientsList?.filter((i: any) => i.current_stock <= i.minimum_stock).length || 0,
        monthlyGrowth: 12.5, // Será calculado dinamicamente em versão futura
        totalCustomers: dashMetrics.totalCustomers || 0,
        totalProducts: dashMetrics.totalProducts || 0,
      });

      // Processar aniversariantes do mês
      const currentMonth = new Date().getMonth();
      const birthdays = customersList?.filter((c: any) => {
        if (!c.birth_date) return false;
        const birthMonth = new Date(c.birth_date).getMonth();
        return birthMonth === currentMonth;
      }) || [];
      setBirthdayCustomers(birthdays);

      // Processar dados de vendas por dia
      const salesByDate: { [key: string]: number } = {};
      salesList?.forEach((sale: any) => {
        const date = new Date(sale.sale_date).toLocaleDateString('pt-BR');
        const amount = sale.total_amount || 0;
        const correctedAmount = amount < 100 ? amount * 100 : amount;
        salesByDate[date] = (salesByDate[date] || 0) + correctedAmount;
      });

      const chartData = Object.entries(salesByDate)
        .map(([date, amount]) => ({
          date,
          sales: Number(amount),
          revenue: Number(amount)
        }))
        .slice(-7); // Últimos 7 dias

      setSalesData(chartData);

      // Processar produtos mais vendidos - buscar items de cada venda
      const productSales: { [key: string]: { name: string; sales: number; revenue: number } } = {};
      
      // Buscar items de todas as vendas em paralelo (mais eficiente)
      const saleItemsPromises = (salesList || []).map(sale => getSaleItems(sale.id));
      const allSaleItemsResults = await Promise.all(saleItemsPromises);
      
      // Processar todos os items
      allSaleItemsResults.forEach((saleItems, index) => {
        saleItems.forEach((item: any) => {
          const key = item.product_id;
          const productName = item.product?.name || 'Produto';
          if (!productSales[key]) {
            productSales[key] = { name: productName, sales: 0, revenue: 0 };
          }
          productSales[key].sales += Number(item.quantity) || 0;
          productSales[key].revenue += Number(item.subtotal) || 0;
        });
      });

      const topProds = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

      setTopProducts(topProds);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vindo ao seu painel de controle</p>
        </div>
        <Button variant="outline" onClick={loadDashboardData}>
          <RefreshCw size={18} className="mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
            <AlertCircle className="text-amber-600" size={24} />
          </div>
          <p className="text-xs text-muted-foreground mt-4">Itens para reabastecer</p>
        </div>

        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Clientes</p>
              <p className="metric-value">{metrics.totalCustomers}</p>
            </div>
            <ShoppingCart className="text-accent" size={24} />
          </div>
          <p className="text-xs text-muted-foreground mt-4">Clientes cadastrados</p>
        </div>

        <div className="metric-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="metric-label">Produtos</p>
              <p className="metric-value">{metrics.totalProducts}</p>
            </div>
            <Package className="text-accent" size={24} />
          </div>
          <p className="text-xs text-muted-foreground mt-4">Produtos no catálogo</p>
        </div>
      </div>

      {/* Aniversariantes do Mês */}
      {birthdayCustomers.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <Cake className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-900">Aniversariantes do Mês</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {birthdayCustomers.map(customer => (
              <div key={customer.id} className="bg-white rounded-lg p-3 border border-amber-100">
                <p className="font-medium text-foreground">{customer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {customer.birth_date && new Date(customer.birth_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Vendas por Dia</h2>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#D4A574" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma venda registrada</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Produtos Mais Vendidos</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} unidades vendidas</p>
                  </div>
                  <p className="font-bold text-accent">R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma venda registrada</p>
          )}
        </Card>
      </div>
    </div>
  );
}
