import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Calculator, X } from 'lucide-react';
import { Recipe, RecipeIngredient, IngredientType } from '@/lib/types';
import { detectCycles } from '@/lib/recipeUtils';

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

interface RecipeEditorModalProps {
  recipe?: Recipe;
  allRecipes: Recipe[];
  ingredients?: Ingredient[];
  onSave: (recipe: Recipe) => void;
  onClose: () => void;
}

export default function RecipeEditorModal({
  recipe,
  allRecipes,
  ingredients = [],
  onSave,
  onClose,
}: RecipeEditorModalProps) {
  const [formData, setFormData] = useState<Recipe>(() =>
    recipe ? {
      ...recipe,
      ingredients: recipe.ingredients || [], // Garantir que ingredients seja array
    } : {
      id: 0,
      name: '',
      type: 'base',
      description: '',
      category: '',
      ingredients: [],
      prepCost: 0,
      totalCost: 0,
      yield: 1,
      yieldUnit: 'un',
      costPerUnit: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
  // Atualizar formData quando recipe mudar (apenas no início)
  useEffect(() => {
    if (recipe) {
      setFormData({
        ...recipe,
        ingredients: recipe.ingredients || [],
      });
    }
  }, []);
  const [newIngredient, setNewIngredient] = useState<Partial<RecipeIngredient>>({
    quantity: 1,
    unit: 'g',
    costPerUnit: 0,
  });

  const [error, setError] = useState<string>('');

  const availableRecipes = allRecipes.filter(r => r.id !== formData.id);
  
  // Filtrar componentes baseados no tipo da receita atual
  const filteredIngredients = ingredients.filter(i => !i.is_processed);
  const filteredRecipes = availableRecipes;

  // Função para converter unidades e calcular custo proporcional
  const calculateProportionalCost = (
    baseUnit: string,
    targetUnit: string,
    baseCost: number
  ): number => {
    const unit = (baseUnit || 'kg').toLowerCase();
    const target = (targetUnit || 'g').toLowerCase();

    if (unit === target) return baseCost;

    // Conversões de Peso
    if (unit === 'kg' && target === 'g') return baseCost / 1000;
    if (unit === 'g' && target === 'kg') return baseCost * 1000;

    // Conversões de Volume
    if (unit === 'l' && target === 'ml') return baseCost / 1000;
    if (unit === 'ml' && target === 'l') return baseCost * 1000;

    return baseCost;
  };

  const handleAddIngredient = () => {
    if (!newIngredient.ingredientId || !newIngredient.ingredientName) {
      setError('Selecione um insumo ou receita');
      return;
    }

    const ingredient: RecipeIngredient = {
      id: Math.random(),
      ingredientId: newIngredient.ingredientId,
      ingredientName: newIngredient.ingredientName,
      quantity: newIngredient.quantity || 1,
      unit: newIngredient.unit || 'g',
      costPerUnit: newIngredient.costPerUnit || 0,
      totalCost: (newIngredient.quantity || 1) * (newIngredient.costPerUnit || 0),
    };

    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, ingredient],
    });

    setNewIngredient({ quantity: 1, unit: 'g', costPerUnit: 0 });
    setError('');
  };

  const handleRemoveIngredient = (id: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing.id !== id),
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setError('Nome da receita é obrigatório');
      return;
    }

    if (formData.yield <= 0) {
      setError('Rendimento deve ser maior que zero');
      return;
    }

    if (formData.type !== 'base') {
      if (detectCycles(formData, allRecipes)) {
        setError('Ciclo detectado! Uma receita não pode conter a si mesma indiretamente');
        return;
      }
    }

    onSave(formData);
  };

  const typeLabels: Record<IngredientType, string> = {
    base: 'Insumo Base (comprado)',
    processed: 'Insumo Processado (preparado)',
    final: 'Produto Final',
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border-accent/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {recipe ? 'Editar Receita' : 'Nova Receita'}
              </h2>
              <p className="text-sm text-muted-foreground">Configure a ficha técnica e custos</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X size={20} />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex items-center gap-2">
              <Calculator size={16} />
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Tipo de Receita *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as IngredientType })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent outline-none"
                >
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Nome da Receita *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent outline-none"
                  placeholder="Ex: Massa de Bolo de Chocolate"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Rendimento *</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.yield}
                  onChange={(e) => setFormData({ ...formData, yield: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Unidade</label>
                <input
                  type="text"
                  value={formData.yieldUnit}
                  onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent outline-none"
                  placeholder="un, kg, etc"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Custo Preparo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prepCost}
                  onChange={(e) => setFormData({ ...formData, prepCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-2 border-t border-border pt-4">
                <Calculator size={20} className="text-accent" />
                Composição da Ficha Técnica
              </h3>

              {/* Lista de Ingredientes Adicionados */}
              <div className="space-y-2">
                {formData.ingredients.map((ing) => (
                  <div key={ing.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/50 group">
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{ing.ingredientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {ing.quantity}{ing.unit} × R$ {ing.costPerUnit.toFixed(4)} = 
                        <span className="font-bold text-accent ml-1">R$ {ing.totalCost.toFixed(2)}</span>
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveIngredient(ing.id)}
                      className="text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Seletor para Adicionar Novo Ingrediente */}
              <div className="p-4 bg-accent/5 rounded-xl border border-accent/20 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Item (Insumo ou Receita)</label>
                    <select
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-accent outline-none"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        const [type, id] = val.split(':');
                        const numericId = parseInt(id);

                        if (type === 'ing') {
                          const item = ingredients.find(i => i.id === numericId);
                          if (item) {
                            const targetUnit = newIngredient.unit || item.unit || 'g';
                            setNewIngredient({
                              ...newIngredient,
                              ingredientId: item.id,
                              ingredientName: item.name,
                              costPerUnit: calculateProportionalCost(item.unit || 'kg', targetUnit, item.cost),
                              unit: targetUnit
                            });
                          }
                        } else {
                          const item = availableRecipes.find(r => r.id === numericId);
                          if (item) {
                            setNewIngredient({
                              ...newIngredient,
                              ingredientId: item.id,
                              ingredientName: item.name,
                              costPerUnit: item.costPerUnit,
                              unit: item.yieldUnit
                            });
                          }
                        }
                      }}
                      value={newIngredient.ingredientId ? `${ingredients.some(i => i.id === newIngredient.ingredientId) ? 'ing' : 'rec'}:${newIngredient.ingredientId}` : ''}
                    >
                      <option value="">Selecione um item para adicionar...</option>
                      {filteredIngredients.length > 0 && (
                        <optgroup label="📦 Insumos (Matéria-prima)">
                          {filteredIngredients.map(i => (
                            <option key={`ing:${i.id}`} value={`ing:${i.id}`}>
                              {i.name} ({i.unit}) - R$ {i.cost.toFixed(2)}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {formData.type !== 'base' && filteredRecipes.length > 0 && (
                        <optgroup label="⚙️ Receitas (Bases e Preparos)">
                          {filteredRecipes.map(r => (
                            <option key={`rec:${r.id}`} value={`rec:${r.id}`}>
                              {r.name} ({r.yieldUnit}) - R$ {r.costPerUnit.toFixed(2)}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Qtd</label>
                      <input
                        type="number"
                        value={newIngredient.quantity}
                        onChange={(e) => setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Unidade</label>
                      <select
                        value={newIngredient.unit}
                        onChange={(e) => {
                          const newUnit = e.target.value;
                          let updatedCost = newIngredient.costPerUnit || 0;
                          const item = ingredients.find(i => i.id === newIngredient.ingredientId);
                          if (item) {
                            updatedCost = calculateProportionalCost(item.unit || 'kg', newUnit, item.cost);
                          }
                          setNewIngredient({ ...newIngredient, unit: newUnit, costPerUnit: updatedCost });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm outline-none"
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">L</option>
                        <option value="un">un</option>
                      </select>
                    </div>
                  </div>
                </div>
                <Button onClick={handleAddIngredient} className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-2 rounded-lg transition-all">
                  <Plus size={18} className="mr-2" /> Adicionar Item
                </Button>
              </div>
            </div>

            {/* Resumo de Custos */}
             <div className="bg-muted/30 p-5 rounded-xl border border-border space-y-3">
               {(() => {
                 const ingredientsCost = formData.ingredients.reduce((sum, i) => sum + i.totalCost, 0);
                 const totalCost = ingredientsCost + formData.prepCost;
                 const costPerUnit = totalCost / (formData.yield || 1);
                 console.log('Ingredientes:', formData.ingredients);
                 console.log('Custo ingredientes:', ingredientsCost);
                 console.log('Custo preparo:', formData.prepCost);
                 console.log('Total:', totalCost);
                 return (
                   <>
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Soma dos Ingredientes:</span>
                       <span className="font-semibold">R$ {ingredientsCost.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Custo de Preparo:</span>
                       <span className="font-semibold">R$ {formData.prepCost.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center border-t border-border pt-3">
                       <span className="font-bold text-lg">Custo Total da Receita:</span>
                       <span className="text-2xl font-black text-accent">
                         R$ {totalCost.toFixed(2)}
                       </span>
                     </div>
                     <div className="text-xs text-right text-muted-foreground italic">
                       Custo unitário estimado: R$ {costPerUnit.toFixed(2)} por {formData.yieldUnit}
                     </div>
                   </>
                 );
               })()}
             </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={onClose} className="px-6 py-2 font-semibold">Cancelar</Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white px-10 py-2 font-bold rounded-lg shadow-lg transition-all">
                Salvar Receita Completa
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
