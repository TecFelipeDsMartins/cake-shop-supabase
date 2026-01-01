import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Tag, RefreshCw } from 'lucide-react';
import { 
  getIngredientCategories, addIngredientCategory, updateIngredientCategory, deleteIngredientCategory,
  getProductCategories, addProductCategory, updateProductCategory, deleteProductCategory,
  getPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  getTransactionCategories, addTransactionCategory, updateTransactionCategory, deleteTransactionCategory
} from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function Categories() {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'products' | 'payment' | 'transaction'>('ingredients');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [ingredientCategories, setIngredientCategories] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [transactionCategories, setTransactionCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#D4A574',
    type: 'income'
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [ingCat, prodCat, payMethods, transCat] = await Promise.all([
        getIngredientCategories(),
        getProductCategories(),
        getPaymentMethods(),
        getTransactionCategories()
      ]);
      setIngredientCategories(ingCat || []);
      setProductCategories(prodCat || []);
      setPaymentMethods(payMethods || []);
      setTransactionCategories(transCat || []);
    } catch (error) {
      toast.error('Erro ao carregar categorias');
    }
    setLoading(false);
  }

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        name: item.name,
        description: item.description || '',
        color: item.color || '#D4A574',
        type: item.type || 'income'
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        color: '#D4A574',
        type: activeTab === 'transaction' ? 'income' : ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        ...(activeTab === 'transaction' && { type: formData.type })
      };

      if (editingId) {
        if (activeTab === 'ingredients') await updateIngredientCategory(editingId, payload);
        else if (activeTab === 'products') await updateProductCategory(editingId, payload);
        else if (activeTab === 'payment') await updatePaymentMethod(editingId, payload);
        else if (activeTab === 'transaction') await updateTransactionCategory(editingId, payload);
        toast.success('Categoria atualizada com sucesso');
      } else {
        if (activeTab === 'ingredients') await addIngredientCategory(payload);
        else if (activeTab === 'products') await addProductCategory(payload);
        else if (activeTab === 'payment') await addPaymentMethod(payload);
        else if (activeTab === 'transaction') await addTransactionCategory(payload);
        toast.success('Categoria adicionada com sucesso');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta categoria?')) {
      try {
        if (activeTab === 'ingredients') await deleteIngredientCategory(id);
        else if (activeTab === 'products') await deleteProductCategory(id);
        else if (activeTab === 'payment') await deletePaymentMethod(id);
        else if (activeTab === 'transaction') await deleteTransactionCategory(id);
        toast.success('Categoria deletada com sucesso');
        loadData();
      } catch (error) {
        toast.error('Erro ao deletar categoria');
      }
    }
  };

  const getCurrentData = () => {
    if (activeTab === 'ingredients') return ingredientCategories;
    if (activeTab === 'products') return productCategories;
    if (activeTab === 'payment') return paymentMethods;
    return transactionCategories;
  };

  const currentData = getCurrentData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando categorias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw size={18} />
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-accent text-white">
            <Plus size={18} className="mr-2" /> Nova Categoria
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {['ingredients', 'products', 'payment', 'transaction'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'ingredients' && 'Insumos'}
            {tab === 'products' && 'Produtos'}
            {tab === 'payment' && 'Pagamento'}
            {tab === 'transaction' && 'Transações'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentData.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma categoria cadastrada</p>
          </div>
        ) : (
          currentData.map(item => (
            <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color || '#D4A574' }}
                      />
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    )}
                    {item.type && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tipo: {item.type === 'income' ? 'Receita' : item.type === 'expense' ? 'Despesa' : 'Transferência'}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold">Nome *</label>
                <input
                  type="text"
                  placeholder="Nome da categoria"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-bold">Descrição</label>
                <textarea
                  placeholder="Descrição opcional"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-bold">Cor</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 border border-border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-border rounded bg-background text-foreground text-sm"
                  />
                </div>
              </div>

              {activeTab === 'transaction' && (
                <div>
                  <label className="text-sm font-bold">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                    <option value="transfer">Transferência</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingId ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
