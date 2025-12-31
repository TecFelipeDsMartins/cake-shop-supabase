import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Sale {
  id: number;
  date: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
}

interface SalesData {
  date: string;
  sales: number;
  quantity: number;
}

export default function Sales() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [sales, setSales] = useState<Sale[]>([
    { id: 1, date: '2024-12-28', product: 'Bolo de Chocolate', quantity: 2, unitPrice: 85.00, totalPrice: 170.00, paymentMethod: 'Dinheiro', status: 'completed' },
    { id: 2, date: '2024-12-28', product: 'Cupcakes Variados', quantity: 12, unitPrice: 3.50, totalPrice: 42.00, paymentMethod: 'Cartão', status: 'completed' },
    { id: 3, date: '2024-12-27', product: 'Croissant', quantity: 10, unitPrice: 5.50, totalPrice: 55.00, paymentMethod: 'Pix', status: 'completed' },
    { id: 4, date: '2024-12-27', product: 'Pão de Forma', quantity: 5, unitPrice: 12.00, totalPrice: 60.00, paymentMethod: 'Dinheiro', status: 'completed' },
    { id: 5, date: '2024-12-26', product: 'Bolo de Chocolate', quantity: 1, unitPrice: 85.00, totalPrice: 85.00, paymentMethod: 'Cartão', status: 'completed' },
  ]);

  const [formData, setFormData] = useState<{
    product: string;
    quantity: number;
    unitPrice: number;
    paymentMethod: string;
    status: 'completed' | 'pending' | 'cancelled';
  }>({
    product: '',
    quantity: 1,
    unitPrice: 0,
    paymentMethod: 'Dinheiro',
    status: 'completed',
  });

  const paymentMethods = ['Dinheiro', 'Cartão', 'Pix', 'Cheque'];
  const productPrices: Record<string, number> = {
    'Bolo de Chocolate': 85.00,
    'Cupcakes Variados': 3.50,
    'Pão de Forma': 12.00,
    'Croissant': 5.50,
  };
  const products = Object.keys(productPrices);

  const handleOpenModal = (sale?: Sale) => {
    if (sale) {
      setEditingId(sale.id);
      setFormData({
        product: sale.product,
        quantity: sale.quantity,
        unitPrice: sale.unitPrice,
        paymentMethod: sale.paymentMethod,
        status: sale.status,
      });
    } else {
      setEditingId(null);
      setFormData({
        product: '',
        quantity: 1,
        unitPrice: 0,
        paymentMethod: 'Dinheiro',
        status: 'completed' as const,
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.product || formData.quantity <= 0 || formData.unitPrice <= 0) {
      alert('Preencha todos os campos corretamente');
      return;
    }

    const totalPrice = formData.quantity * formData.unitPrice;
    const today = new Date().toISOString().split('T')[0];

    if (editingId) {
      setSales(sales.map(sale =>
        sale.id === editingId
          ? { ...sale, ...formData, totalPrice }
          : sale
      ));
    } else {
      const newSale: Sale = {
        id: Math.max(...sales.map(s => s.id), 0) + 1,
        date: today,
        ...formData,
        totalPrice,
      };
      setSales([newSale, ...sales]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta venda?')) {
      setSales(sales.filter(s => s.id !== id));
    }
  };

  // Cálculos
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageTicket = sales.length > 0 ? totalSales / sales.length : 0;
  const completedSales = sales.filter(s => s.status === 'completed').length;

  // Dados para gráficos
  const salesByDate = sales.reduce((acc, sale) => {
    const existing = acc.find(item => item.date === sale.date);
    if (existing) {
      existing.sales += sale.totalPrice;
      existing.quantity += sale.quantity;
    } else {
      acc.push({ date: sale.date, sales: sale.totalPrice, quantity: sale.quantity });
    }
    return acc;
  }, [] as SalesData[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const salesByProduct = sales.reduce((acc, sale) => {
    const existing = acc.find(item => item.name === sale.product);
    if (existing) {
      existing.value += sale.totalPrice;
    } else {
      acc.push({ name: sale.product, value: sale.totalPrice });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const COLORS = ['#D4A574', '#8B6F47', '#C19A6B', '#A0826D'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Gestão de Vendas</h1>
          <p className="text-muted-foreground">Histórico e análise de transações</p>
        </div>
        <Button
          className="flex items-center gap-2 bg-accent hover:bg-accent/90"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} />
          Nova Venda
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total de Vendas</p>
          <p className="text-2xl font-bold text-accent">R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Quantidade Vendida</p>
          <p className="text-2xl font-bold text-foreground">{totalQuantity} un.</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold text-accent">R$ {averageTicket.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Vendas Concluídas</p>
          <p className="text-2xl font-bold text-green-600">{completedSales}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Vendas por Dia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="var(--accent)" strokeWidth={2} name="Vendas (R$)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Vendas por Produto</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesByProduct}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: R$ ${value.toFixed(0)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {salesByProduct.map((entry, index) => (
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
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Histórico de Vendas</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Produto</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Qtd</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Preço Unit.</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Total</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Pagamento</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground text-sm">{new Date(sale.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-4 text-foreground font-medium">{sale.product}</td>
                  <td className="text-center py-3 px-4 text-foreground">{sale.quantity}</td>
                  <td className="text-right py-3 px-4 text-foreground">R$ {sale.unitPrice.toFixed(2)}</td>
                  <td className="text-right py-3 px-4 font-semibold text-accent">R$ {sale.totalPrice.toFixed(2)}</td>
                  <td className="text-center py-3 px-4 text-sm text-muted-foreground">{sale.paymentMethod}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                      sale.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                    }`}>
                      {sale.status === 'completed' ? 'Concluída' : sale.status === 'pending' ? 'Pendente' : 'Cancelada'}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent hover:text-accent/80"
                        onClick={() => handleOpenModal(sale)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(sale.id)}
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
                {editingId ? 'Editar Venda' : 'Nova Venda'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Produto *</label>
                  <select
                    value={formData.product}
                    onChange={(e) => {
                      const selectedProduct = e.target.value;
                      setFormData({
                        ...formData,
                        product: selectedProduct,
                        unitPrice: productPrices[selectedProduct] || 0,
                      });
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Selecione um produto</option>
                    {products.map(product => (
                      <option key={product} value={product}>
                        {product} (R$ {productPrices[product].toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Quantidade *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Preço Unit. (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitPrice || 0}
                      onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Preço será preenchido automaticamente"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Método de Pagamento</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="completed">Concluída</option>
                    <option value="pending">Pendente</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                <div className="bg-accent/10 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total: <span className="font-bold text-accent">R$ {(formData.quantity * formData.unitPrice).toFixed(2)}</span></p>
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
                    {editingId ? 'Atualizar' : 'Registrar'} Venda
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
