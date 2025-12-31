import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { getIngredients, addIngredient, updateIngredient, deleteIngredient } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface Ingredient {
  id?: number;
  name: string;
  category_id?: number;
  unit?: string;
  cost: number;
  minimum_stock?: number;
  current_stock?: number;
  is_processed?: boolean;
  created_at?: string;
}

export default function Ingredients() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Ingredient>({
    name: '',
    unit: 'kg',
    cost: 0,
    minimum_stock: 0,
    current_stock: 0,
    is_processed: false,
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  async function loadIngredients() {
    setLoading(true);
    try {
      const data = await getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
      toast.error('Erro ao carregar insumos');
    }
    setLoading(false);
  }

  function handleOpenModal(ingredient?: Ingredient) {
    if (ingredient) {
      setEditingId(ingredient.id || null);
      setFormData(ingredient);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        unit: 'kg',
        cost: 0,
        minimum_stock: 0,
        current_stock: 0,
        is_processed: false,
      });
    }
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      toast.error('Nome do insumo é obrigatório');
      return;
    }

    try {
      if (editingId) {
        await updateIngredient(editingId, formData);
        toast.success('Insumo atualizado com sucesso');
      } else {
        await addIngredient(formData);
        toast.success('Insumo adicionado com sucesso');
      }
      setShowModal(false);
      loadIngredients();
    } catch (error) {
      console.error('Erro ao salvar insumo:', error);
      toast.error('Erro ao salvar insumo');
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Tem certeza que deseja deletar este insumo?')) {
      try {
        await deleteIngredient(id);
        toast.success('Insumo deletado com sucesso');
        loadIngredients();
      } catch (error) {
        console.error('Erro ao deletar insumo:', error);
        toast.error('Erro ao deletar insumo');
      }
    }
  }

  const filteredIngredients = ingredients.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockIngredients = filteredIngredients.filter(i =>
    (i.current_stock || 0) <= (i.minimum_stock || 0)
  );

  const totalValue = filteredIngredients.reduce((sum, i) => sum + (i.cost * (i.current_stock || 0)), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando insumos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Insumos</h1>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Insumo
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total de Insumos</p>
          <p className="text-2xl font-bold text-foreground">{filteredIngredients.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
          <p className="text-2xl font-bold text-accent">R$ {totalValue.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Estoque Baixo</p>
          <p className="text-2xl font-bold text-amber-600">{lowStockIngredients.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Processados</p>
          <p className="text-2xl font-bold text-blue-600">{filteredIngredients.filter(i => i.is_processed).length}</p>
        </Card>
      </div>

      {/* Alerta de Estoque Baixo */}
      {lowStockIngredients.length > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Estoque Baixo</h3>
              <p className="text-sm text-red-800 mt-1">
                {lowStockIngredients.length} insumo(s) com estoque abaixo do mínimo:
              </p>
              <ul className="text-sm text-red-800 mt-2 space-y-1">
                {lowStockIngredients.map(i => (
                  <li key={i.id}>• {i.name}: {i.current_stock} {i.unit} (mín: {i.minimum_stock})</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar insumo..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
      />

      {/* Tabela de Insumos */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Nome</th>
              <th className="text-left py-3 px-4 font-semibold text-foreground">Unidade</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Custo</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Estoque Atual</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Mínimo</th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">Tipo</th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum insumo encontrado
                </td>
              </tr>
            ) : (
              filteredIngredients.map(ingredient => (
                <tr key={ingredient.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-foreground font-medium">{ingredient.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{ingredient.unit}</td>
                  <td className="py-3 px-4 text-right text-foreground">R$ {ingredient.cost.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-foreground">
                    <span className={ingredient.current_stock! <= ingredient.minimum_stock! ? 'text-red-600 font-semibold' : ''}>
                      {ingredient.current_stock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{ingredient.minimum_stock}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {ingredient.is_processed ? 'Processado' : 'Base'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center flex gap-2 justify-center">
                    <button
                      onClick={() => handleOpenModal(ingredient)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => ingredient.id && handleDelete(ingredient.id)}
                      className="p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {editingId ? 'Editar Insumo' : 'Novo Insumo'}
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              />

              <select
                value={formData.unit || 'kg'}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              >
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Grama (g)</option>
                <option value="l">Litro (l)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="un">Unidade (un)</option>
              </select>

              <input
                type="number"
                step="0.01"
                placeholder="Custo (R$)"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              />

              <input
                type="number"
                step="0.01"
                placeholder="Estoque Atual"
                value={formData.current_stock || 0}
                onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              />

              <input
                type="number"
                step="0.01"
                placeholder="Estoque Mínimo"
                value={formData.minimum_stock || 0}
                onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_processed || false}
                  onChange={(e) => setFormData({ ...formData, is_processed: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">Insumo Processado</span>
              </label>
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
