import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSales, addSale, deleteSale, getCustomers, getProducts, getPaymentMethods, getAccounts, addSaleItem } from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function Sales() {
  const [showModal, setShowModal] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<any>({
    customer_id: null,
    payment_method_id: null,
    account_id: null,
    notes: '',
    items: []
  });

  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 1,
    unit_price: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [salesData, customersData, productsData, pmData, accountsData] = await Promise.all([
        getSales(),
        getCustomers(),
        getProducts(),
        getPaymentMethods(),
        getAccounts()
      ]);
      setSales(salesData || []);
      setCustomers(customersData || []);
      setProducts(productsData || []);
      setPaymentMethods(pmData || []);
      setAccounts(accountsData || []);
      
      if (accountsData && accountsData.length > 0) {
        const defaultAcc = accountsData.find((a: any) => a.is_default) || accountsData[0];
        setFormData((prev: any) => ({ ...prev, account_id: defaultAcc.id }));
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
    }
    setLoading(false);
  }

  const handleAddItem = () => {
    if (!newItem.product_id || newItem.quantity <= 0) {
      toast.error('Selecione um produto e quantidade válida');
      return;
    }
    const product = products.find(p => p.id === parseInt(newItem.product_id));
    if (!product) {
      toast.error('Produto não encontrado');
      return;
    }
    const item = {
      ...newItem,
      product_name: product.name,
      subtotal: newItem.quantity * newItem.unit_price
    };
    setFormData({ ...formData, items: [...formData.items, item] });
    setNewItem({ product_id: '', quantity: 1, unit_price: 0 });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_: any, i: number) => i !== index)
    });
  };

  const handleSave = async () => {
    // Validações
    if (formData.items.length === 0) {
      toast.error('Adicione pelo menos um item à venda');
      return;
    }

    // Validar se produtos existem
    for (const item of formData.items) {
      const productId = parseInt(item.product_id);
      if (!productId || isNaN(productId)) {
        toast.error('Produto inválido encontrado');
        return;
      }
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error(`Produto com ID ${productId} não encontrado`);
        return;
      }
      if (item.quantity <= 0) {
        toast.error('Quantidade deve ser maior que zero');
        return;
      }
      if (item.unit_price < 0) {
        toast.error('Preço unitário não pode ser negativo');
        return;
      }
    }

    // Validar conta se fornecida
    if (formData.account_id) {
      const account = accounts.find(a => a.id === formData.account_id);
      if (!account) {
        toast.error('Conta selecionada não encontrada');
        return;
      }
    }

    // Validar método de pagamento se fornecido
    if (formData.payment_method_id) {
      const paymentMethod = paymentMethods.find(pm => pm.id === formData.payment_method_id);
      if (!paymentMethod) {
        toast.error('Método de pagamento selecionado não encontrado');
        return;
      }
    }
    
    const total_amount = formData.items.reduce((sum: number, item: any) => sum + (item.subtotal || 0), 0);
    
    if (total_amount <= 0) {
      toast.error('Total da venda deve ser maior que zero');
      return;
    }

    const salePayload = {
      customer_id: formData.customer_id || null,
      payment_method_id: formData.payment_method_id || null,
      account_id: formData.account_id || null,
      total_amount,
      notes: formData.notes || null
    };

    try {
      const newSale = await addSale(salePayload);
      
      if (!newSale || !newSale.id) {
        throw new Error('Falha ao criar venda');
      }

      // Adicionar itens da venda
      const itemPromises = formData.items.map(async (item: any) => {
        try {
          await addSaleItem({
            sale_id: newSale.id,
            product_id: parseInt(item.product_id),
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal
          });
        } catch (error) {
          console.error(`Erro ao adicionar item ${item.product_id}:`, error);
          throw error;
        }
      });

      await Promise.all(itemPromises);
      
      toast.success('Venda registrada com sucesso');
      setShowModal(false);
      setFormData({ customer_id: null, payment_method_id: null, account_id: null, notes: '', items: [] });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      toast.error('Erro ao salvar venda. Verifique os dados e tente novamente.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta venda?')) {
      try {
        await deleteSale(id);
        toast.success('Venda deletada com sucesso');
        loadData();
      } catch (error) {
        toast.error('Erro ao deletar venda');
      }
    }
  };

  // Cálculos para gráficos
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
  const salesByDate = sales.reduce((acc: any[], s) => {
    const date = new Date(s.sale_date).toLocaleDateString('pt-BR');
    const existing = acc.find(a => a.date === date);
    if (existing) existing.amount += s.total_amount || 0;
    else acc.push({ date, amount: s.total_amount || 0 });
    return acc;
  }, []).reverse();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando vendas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw size={18} />
          </Button>
          <Button onClick={() => setShowModal(true)} className="bg-accent text-white">
            <Plus size={18} className="mr-2" /> Nova Venda
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Receita Total</p>
          <p className="text-2xl font-bold text-accent">R$ {(totalRevenue / 100).toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total de Vendas</p>
          <p className="text-2xl font-bold">{sales.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Ticket Médio</p>
          <p className="text-2xl font-bold">R$ {sales.length > 0 ? ((totalRevenue / sales.length) / 100).toFixed(2) : '0.00'}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Vendas por Dia</h2>
          {salesByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesByDate}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#D4A574" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nenhuma venda registrada</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Histórico Recente</h2>
          <div className="space-y-3">
            {sales.slice(0, 5).map(sale => (
              <div key={sale.id} className="flex justify-between items-center p-3 border rounded hover:bg-muted/30">
                <div>
                  <p className="font-bold">{sale.customer?.name || 'Cliente Avulso'}</p>
                  <p className="text-xs text-muted-foreground">{new Date(sale.sale_date).toLocaleString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-accent">R$ {(sale.total_amount / 100).toFixed(2)}</p>
                  <button 
                    onClick={() => handleDelete(sale.id)} 
                    className="text-red-500 text-xs hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal de Nova Venda */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6 bg-background max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Nova Venda</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold">Cliente</label>
                  <select 
                    className="w-full p-2 border border-border rounded bg-background text-foreground"
                    value={formData.customer_id || ''} 
                    onChange={e => setFormData({...formData, customer_id: e.target.value ? parseInt(e.target.value) : null})}
                  >
                    <option value="">Cliente Avulso</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold">Conta de Destino</label>
                  <select 
                    className="w-full p-2 border border-border rounded bg-background text-foreground"
                    value={formData.account_id || ''} 
                    onChange={e => setFormData({...formData, account_id: e.target.value ? parseInt(e.target.value) : null})}
                  >
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="border p-4 rounded bg-muted/20">
                <p className="font-bold mb-3">Adicionar Itens</p>
                <div className="grid grid-cols-4 gap-2">
                  <select 
                    className="col-span-2 p-2 border border-border rounded bg-background text-foreground"
                    value={newItem.product_id} 
                    onChange={e => {
                      const p = products.find(prod => prod.id === parseInt(e.target.value));
                      setNewItem({...newItem, product_id: e.target.value, unit_price: p?.price ? p.price / 100 : 0});
                    }}
                  >
                    <option value="">Selecione um produto...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input 
                    type="number" 
                    className="p-2 border border-border rounded bg-background text-foreground"
                    placeholder="Qtd" 
                    value={newItem.quantity} 
                    onChange={e => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})} 
                  />
                  <Button onClick={handleAddItem} className="bg-accent text-white">Add</Button>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <h3 className="font-bold">Itens da Venda:</h3>
                {formData.items.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum item adicionado</p>
                ) : (
                  formData.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-2 border-b">
                      <span>{item.product_name} (x{item.quantity})</span>
                      <div className="flex gap-2">
                        <span className="font-bold">R$ {item.subtotal.toFixed(2)}</span>
                        <button 
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-xl font-bold">Total: R$ {formData.items.reduce((s: number, i: any) => s + i.subtotal, 0).toFixed(2)}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                  <Button onClick={handleSave} className="bg-primary text-white">Finalizar Venda</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
