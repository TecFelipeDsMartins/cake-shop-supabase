import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Recipe, RecipeIngredient, IngredientType } from '@/lib/types';
import { updateRecipeIngredientsCosts, detectCycles } from '@/lib/recipeUtils';

interface RecipeEditorModalProps {
  recipe?: Recipe;
  allRecipes: Recipe[];
  onSave: (recipe: Recipe) => void;
  onClose: () => void;
}

export default function RecipeEditorModal({
  recipe,
  allRecipes,
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

    // Verifica ciclos se for insumo processado ou produto final
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
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {recipe ? 'Editar Receita' : 'Nova Receita'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rendimento *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.yield}
                  onChange={(e) => setFormData({ ...formData, yield: parseFloat(e.target.value) })}
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
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Custo de Preparo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.prepCost}
                onChange={(e) => setFormData({ ...formData, prepCost: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Mão de obra, gás, energia, etc.
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-3">Ingredientes</h3>

              {formData.ingredients.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{ing.ingredientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {ing.quantity}
                          {ing.unit} × R$ {ing.costPerUnit.toFixed(2)} = R${' '}
                          {ing.totalCost.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleRemoveIngredient(ing.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Selecionar Insumo
                  </label>
                  <select
                    value={newIngredient.ingredientId || ''}
                    onChange={(e) => {
                      const selected = availableRecipes.find(r => r.id === parseInt(e.target.value));
                      if (selected) {
                        setNewIngredient({
                          ...newIngredient,
                          ingredientId: selected.id,
                          ingredientName: selected.name,
                          costPerUnit: selected.costPerUnit,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Escolha um insumo...</option>
                    {availableRecipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (R$ {r.costPerUnit.toFixed(2)}/un)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={newIngredient.quantity || 1}
                      onChange={(e) =>
                        setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) })
                      }
                      className="w-full px-2 py-1 border border-border rounded text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Unidade
                    </label>
                    <input
                      type="text"
                      value={newIngredient.unit || 'g'}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                      className="w-full px-2 py-1 border border-border rounded text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Custo/un
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newIngredient.costPerUnit || 0}
                      onChange={(e) =>
                        setNewIngredient({
                          ...newIngredient,
                          costPerUnit: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 border border-border rounded text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-accent hover:bg-accent/90 flex items-center justify-center gap-2"
                  onClick={handleAddIngredient}
                >
                  <Plus size={16} />
                  Adicionar Ingrediente
                </Button>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button className="bg-accent hover:bg-accent/90" onClick={handleSave}>
                Salvar Receita
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
