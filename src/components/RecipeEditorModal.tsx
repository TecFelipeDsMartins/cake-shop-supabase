import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Recipe, RecipeIngredient, IngredientType } from '@/lib/types';
import { updateRecipeIngredientsCosts, detectCycles } from '@/lib/recipeUtils';

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
  const [formData, setFormData] = useState<Recipe>(
    recipe || {
      id: Math.random(),
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

  const [newIngredient, setNewIngredient] = useState<Partial<RecipeIngredient>>({
    quantity: 1,
    unit: 'g',
    costPerUnit: 0,
  });

  const [error, setError] = useState<string>('');

  const availableRecipes = allRecipes.filter(r => r.id !== formData.id);

  // Função para converter unidades e calcular custo proporcional
  const calculateProportionalCost = (
    baseUnit: string,
    targetUnit: string,
    baseCost: number
  ): number => {
    const unit = baseUnit.toLowerCase();
    const target = targetUnit.toLowerCase();

    if (unit === target) return baseCost;

    // Conversões de Peso
    if (unit === 'kg' && target === 'g') return baseCost / 1000;
    if (unit === 'g' && target === 'kg') return baseCost * 1000;

    // Conversões de Volume
    if (unit === 'l' && target === 'ml') return baseCost / 1000;
    if (unit === 'ml' && target === 'l') return baseCost * 1000;

    return baseCost; // Se não houver conversão conhecida, mantém o custo base
  };

  const handleAddIngredient = () => {
    if (!newIngredient.ingredientId || !newIngredient.ingredientName) {
      setError('Selecione um insumo');
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

    const updatedRecipe = updateRecipeIngredientsCosts(formData);
    onSave(updatedRecipe);
  };

  const typeLabels: Record<IngredientType, string> = {
    base: 'Insumo Base (comprado)',
    processed: 'Insumo Processado (preparado)',
    final: 'Produto Final',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {recipe ? 'Editar Receita' : 'Nova Receita'}
            </h2>
            <Button variant="ghost" onClick={onClose}>&times;</Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tipo de Receita *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as IngredientType })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nome da Receita *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Ex: Brigadeiro"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                rows={2}
                placeholder="Descrição da receita"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rendimento *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.yield}
                  onChange={(e) => setFormData({ ...formData, yield: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Unidade
                </label>
                <input
                  type="text"
                  value={formData.yieldUnit}
                  onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="un, kg, L, etc"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Custo de Preparo (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prepCost}
                  onChange={(e) => setFormData({ ...formData, prepCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Calculator size={18} className="text-accent" />
                Ingredientes e Composição
              </h3>

              {formData.ingredients.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{ing.ingredientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {ing.quantity}
                          {ing.unit} × R$ {ing.costPerUnit.toFixed(4)} = 
                          <span className="font-bold text-foreground ml-1">R$ {ing.totalCost.toFixed(2)}</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleRemoveIngredient(ing.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Selecionar Insumo ou Receita
                    </label>
                    <select
                      value={newIngredient.ingredientId ? `${newIngredient.unit === 'g' || newIngredient.unit === 'kg' ? 'ing' : 'rec'}:${newIngredient.ingredientId}` : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) return;
                        
                        const [type, id] = val.split(':');
                        const numericId = parseInt(id);
                        
                        if (type === 'ing') {
                          const selected = ingredients.find(i => i.id === numericId);
                          if (selected) {
                            const targetUnit = newIngredient.unit || selected.unit || 'g';
                            const proportionalCost = calculateProportionalCost(
                              selected.unit || 'kg',
                              targetUnit,
                              selected.cost
                            );
                            setNewIngredient({
                              ...newIngredient,
                              ingredientId: selected.id,
                              ingredientName: selected.name,
                              costPerUnit: proportionalCost,
                              unit: targetUnit,
                            });
                          }
                        } else {
                          const selected = availableRecipes.find(r => r.id === numericId);
                          if (selected) {
                            setNewIngredient({
                              ...newIngredient,
                              ingredientId: selected.id,
                              ingredientName: selected.name,
                              costPerUnit: selected.costPerUnit,
                              unit: selected.yieldUnit,
                            });
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm"
                    >
                      <option value="">Escolha um item...</option>
                      {ingredients.length > 0 && (
                        <optgroup label="Insumos Cadastrados">
                          {ingredients.map(i => (
                            <option key={`ing:${i.id}`} value={`ing:${i.id}`}>
                              {i.name} ({i.unit}) - R$ {i.cost.toFixed(2)}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {availableRecipes.length > 0 && (
                        <optgroup label="Outras Receitas">
                          {availableRecipes.map(r => (
                            <option key={`rec:${r.id}`} value={`rec:${r.id}`}>
                              {r.name} ({r.yieldUnit}) - R$ {r.costPerUnit.toFixed(2)}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        value={newIngredient.quantity}
                        onChange={(e) => {
                          const qty = parseFloat(e.target.value) || 0;
                          setNewIngredient({
                            ...newIngredient,
                            quantity: qty,
                          });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Unidade
                      </label>
                      <select
                        value={newIngredient.unit}
                        onChange={(e) => {
                          const newUnit = e.target.value;
                          // Recalcular custo se mudar de kg para g ou vice-versa
                          let updatedCost = newIngredient.costPerUnit || 0;
                          const selectedIng = ingredients.find(i => i.id === newIngredient.ingredientId);
                          
                          if (selectedIng) {
                            updatedCost = calculateProportionalCost(
                              selectedIng.unit || 'kg',
                              newUnit,
                              selectedIng.cost
                            );
                          }

                          setNewIngredient({
                            ...newIngredient,
                            unit: newUnit,
                            costPerUnit: updatedCost
                          });
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground text-sm"
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
                
                <Button
                  type="button"
                  onClick={handleAddIngredient}
                  className="w-full bg-accent hover:bg-accent/90 text-white gap-2 mt-2"
                >
                  <Plus size={16} />
                  Adicionar à Receita
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Custo dos Ingredientes:</span>
                <span className="font-medium text-foreground">
                  R$ {(formData.ingredients.reduce((sum, i) => sum + i.totalCost, 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Custo de Preparo:</span>
                <span className="font-medium text-foreground">R$ {formData.prepCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
                <span className="text-foreground">Custo Total:</span>
                <span className="text-accent">
                  R$ {(formData.ingredients.reduce((sum, i) => sum + i.totalCost, 0) + formData.prepCost).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-right text-muted-foreground">
                Custo por {formData.yieldUnit}: R$ {((formData.ingredients.reduce((sum, i) => sum + i.totalCost, 0) + formData.prepCost) / (formData.yield || 1)).toFixed(2)}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={onClose} className="px-8">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="px-8 bg-primary hover:bg-primary/90">
                Salvar Receita
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
