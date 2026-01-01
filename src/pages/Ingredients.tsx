import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Search, RefreshCw } from 'lucide-react';
import { getIngredients, addIngredient, updateIngredient, deleteIngredient } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const INGREDIENT_CATEGORIES = [
  'Laticínios',
  'Farinhas e Grãos',
  'Açúcares e Adoçantes',
  'Gorduras e Óleos',
  'Chocolates e Cacau',
  'Frutas e Castanhas',
  'Fermentos e Aditivos',
  'Outros'
];

export default function Ingredients() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Outros',
    unit: 'kg',
    cost: 0,
    minimum_stock: 0,
    current_stock: 0,
    is_processed: false
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getIngredients();
      setIngredients(data || []);
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
      toast.error('Erro ao carregar insumos');
    }
    setLoading(false);
  }

  const handleOpenModal = (ingredient?: any) => {
    if (ingredient) {
      setEditingId(ingredient.id);
      setFormData({
        name: ingredient.name,
        category: ingredient.category || 'Outros',
        unit: ingredient.unit || 'kg',
        cost: ingredient.cost || 0,
        minimum_stock: ingredient.minimum_stock || 0,
        current_stock: ingredient.current_stock || 0,
        is_processed: ingredient.is_processed || false
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: 'Outros',
        unit: 'kg',
        cost: 0,
        minimum_stock: 0,
        current_stock: 0,
        is_processed: false
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('O nome do insumo é obrigatório');
      return;
    }

    try {
      // Nota: O banco espera category_id, mas vamos enviar os dados básicos primeiro
      // para garantir que o insert funcione mesmo sem a relação de categorias completa
      const payload = {
        name: formData.name,
        unit: formData.unit,
        cost: formData.cost,
        minimum_stock: formData.minimum_stock,
        current_stock: formData.current_stock,
        is_processed: formData.is_processed
      };

      if (editingId) {
        await updateIngredient(editingId, payload);
        toast.success('Insumo atualizado com sucesso');
      } else {
        await addIngredient(payload);
        toast.success('Insumo adicionado com sucesso');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar insumo:', error);
      toast.error('Erro ao salvar no banco de dados');
    }
  };

  const filteredIngredients = ingredients.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Insumos</h1>
          <p className="text-muted-foreground">Gerencie sua matéria-prima e custos base</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-accent hover:bg-accent/90 gap-2">
            <Plus size={18} /> Novo Insumo
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Buscar insumos..."
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIngredients.map((ingredient) => (
          <Card key={ingredient.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg">{ingredient.name}</h3>
                <p className="text-xs text-muted-foreground uppercase font-semibold">{ingredient.unit}</p>
              </div>
              <p className="text-xl font-black text-accent">R$ {ingredient.cost.toFixed(2)}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenModal(ingredient)}>
                <Edit2 size={14} className="mr-1" /> Editar
              </Button>
              <Button variant="outline" size="sm" className="text-red-500" onClick={() => deleteIngredient(ingredient.id).then(loadData)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-2xl font-bold">{editingId ? 'Editar Insumo' : 'Novo Insumo'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Nome *</label>
                <input type="text" className="w-full px-3 py-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Unidade</label>
                  <select className="w-full px-3 py-2 border rounded" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                    <option value="kg">kg</option><option value="g">g</option><option value="l">L</option><option value="ml">ml</option><option value="un">un</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Custo (R$)</label>
                  <input type="number" className="w-full px-3 py-2 border rounded" value={formData.cost} onChange={e => setFormData({...formData, cost: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSave} className="bg-accent text-white">Salvar</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
