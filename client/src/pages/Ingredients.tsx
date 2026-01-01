import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { getIngredients, addIngredient, updateIngredient, deleteIngredient } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface Ingredient {
  id?: number;
  name: string;
  category?: string;
  unit?: string;
  cost: number;
  minimum_stock?: number;
  current_stock?: number;
  is_processed?: boolean;
  created_at?: string;
}

const INGREDIENT_CATEGORIES = [
  'Farinhas',
  'Açúcares',
  'Ovos',
  'Leite e Derivados',
  'Chocolate',
  'Frutas',
  'Especiarias',
  'Fermento',
  'Outros'
];

export default function Ingredients() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Ingredient>({
    name: '',
    category: '',
    unit: 'kg',
    cost: 0,
    minimum_stock: 0,
    current_stock: 0,
    is_processed: false,
  });

  // Funções para localStorage
  const loadIngredientsFromStorage = (): Ingredient[] => {
    try {
      const stored = localStorage.getItem('cake_shop_ingredients');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveIngredientsToStorage = (ings: Ingredient[]) => {
    try {
      localStorage.setItem('cake_shop_ingredients', JSON.stringify(ings));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  useEffect(() => {
    loadIngredients();
  }, []);

  async function loadIngredients() {
    setLoading(true);
    try {
      // Tentar carregar do Supabase
      try {
        const data = await getIngredients();
        if (data && data.length > 0) {
          setIngredients(data);
          saveIngredientsToStorage(data);
        } else {
          // Se Supabase retornar vazio, tentar localStorage
          const stored = loadIngredientsFromStorage();
          setIngredients(stored);
        }
      } catch (supabaseError) {
        // Se Supabase falhar, usar localStorage
        console.warn('Supabase indisponível, usando localStorage:', supabaseError);
        const stored = loadIngredientsFromStorage();
        setIngredients(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar insumos:', error);
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
        category: '',
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

    if (formData.cost < 0) {
      toast.error('Custo não pode ser negativo');
      return;
    }

    try {
      let updatedIngredients = [...ingredients];

      if (editingId) {
        // Atualizar insumo existente
        updatedIngredients = updatedIngredients.map(i =>
          i.id === editingId ? { ...formData, id: editingId } : i
        );
      } else {
        // Criar novo insumo
        const newId = Math.max(...ingredients.map(i => i.id || 0), 0) + 1;
        updatedIngredients.push({
          ...formData,
          id: newId,
        });
      }

      // Salvar no localStorage
      saveIngredientsToStorage(updatedIngredients);
      setIngredients(updatedIngredients);

      // Tentar salvar no Supabase em background (não bloqueia)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          try {
            if (editingId) {
              updateIngredient(editingId, formData).catch(err => 
                console.warn('Supabase sync falhou:', err)
              );
            } else {
              addIngredient(formData).catch(err => 
                console.warn('Supabase sync falhou:', err)
              );
            }
          } catch (error) {
            console.warn('Supabase indisponível:', error);
          }
        }, 0);
      }

      toast.success(editingId ? 'Insumo atualizado com sucesso' : 'Insumo adicionado com sucesso');
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
        // Deletar do localStorage
        const updatedIngredients = ingredients.filter(i => i.id !== id);
        saveIngredientsToStorage(updatedIngredients);
        setIngredients(updatedIngredients);

        // Tentar deletar do Supabase em background
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            deleteIngredient(id).catch(err => 
              console.warn('Supabase sync falhou:', err)
            );
          }, 0);
        }

        toast.success('Insumo deletado com sucesso');
      } catch (error) {
        console.error('Erro ao deletar insumo:', error);
        toast.error('Erro ao deletar insumo');
      }
    }
  }

  const filteredIngredients = ingredients.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockIngredients = ingredients.filter(i =>
    (i.current_stock || 0) <= (i.minimum_stock || 0)
  );

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
        <h1 className="text-3xl font-bold text-foreground">Gerenciar Insumos</h1>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Insumo
        </Button>
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
              <th className="text-left py-3 px-4 font-semibold text-foreground">Categoria</th>
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
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum insumo encontrado
                </td>
              </tr>
            ) : (
              filteredIngredients.map(ingredient => (
                <tr key={ingredient.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 text-foreground font-medium">{ingredient.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{ingredient.category || '-'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{ingredient.unit}</td>
                  <td className="py-3 px-4 text-right text-foreground">R$ {(ingredient.cost || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-foreground">
                    <span className={(ingredient.current_stock || 0) <= (ingredient.minimum_stock || 0) ? 'text-red-600 font-semibold' : ''}>
                      {ingredient.current_stock || 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{ingredient.minimum_stock || 0}</td>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {editingId ? 'Editar Insumo' : 'Novo Insumo'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nome do Insumo *</label>
                <input
                  type="text"
                  placeholder="Ex: Farinha de Trigo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Categoria</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                >
                  <option value="">Selecione uma categoria</option>
                  {INGREDIENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Unidade de Medida</label>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Custo por Unidade (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost || 0}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Estoque Atual ({formData.unit || 'kg'})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.current_stock || 0}
                  onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Estoque Mínimo ({formData.unit || 'kg'})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minimum_stock || 0}
                  onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                />
              </div>

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

            <div className="flex gap-2 justify-end pt-4 border-t border-border">
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
