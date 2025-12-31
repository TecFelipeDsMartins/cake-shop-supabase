import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

export interface RecipeIngredient {
  id: number;
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

interface RecipeCardProps {
  productName: string;
  ingredients: RecipeIngredient[];
  onAddIngredient: () => void;
  onRemoveIngredient: (ingredientId: number) => void;
  onEditIngredient: (ingredient: RecipeIngredient) => void;
  availableIngredients: Array<{ id: number; name: string; unit: string; unitCost: number }>;
}

export default function RecipeCard({
  productName,
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onEditIngredient,
  availableIngredients,
}: RecipeCardProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);

  const totalCost = ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.unitCost), 0);

  const handleEditStart = (ingredient: RecipeIngredient) => {
    setEditingId(ingredient.id);
    setEditQuantity(ingredient.quantity);
  };

  const handleEditSave = (ingredient: RecipeIngredient) => {
    onEditIngredient({
      ...ingredient,
      quantity: editQuantity,
    });
    setEditingId(null);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/30">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">Ficha Técnica</h3>
        <p className="text-lg text-accent font-semibold">{productName}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-foreground">Insumos Utilizados</h4>
          <Button
            size="sm"
            className="flex items-center gap-2 bg-accent hover:bg-accent/90"
            onClick={onAddIngredient}
          >
            <Plus size={16} />
            Adicionar Insumo
          </Button>
        </div>

        {ingredients.length === 0 ? (
          <div className="p-4 text-center bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">Nenhum insumo adicionado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{ingredient.ingredientName}</p>
                  {editingId === ingredient.id ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                      />
                      <span className="text-sm text-muted-foreground">{ingredient.unit}</span>
                      <span className="text-sm text-muted-foreground">@ R$ {ingredient.unitCost.toFixed(2)}/{ingredient.unit}</span>
                      <span className="text-sm font-semibold text-accent">= R$ {(editQuantity * ingredient.unitCost).toFixed(2)}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      {ingredient.quantity} {ingredient.unit} @ R$ {ingredient.unitCost.toFixed(2)}/{ingredient.unit} = <span className="font-semibold text-accent">R$ {(ingredient.quantity * ingredient.unitCost).toFixed(2)}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {editingId === ingredient.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleEditSave(ingredient)}
                      >
                        ✓
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setEditingId(null)}
                      >
                        ✕
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-accent hover:text-accent/80"
                        onClick={() => handleEditStart(ingredient)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onRemoveIngredient(ingredient.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Custo Total de Produção:</span>
            <span className="text-2xl font-bold text-accent">R$ {totalCost.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Este é o custo de insumos. Adicione margem de lucro ao definir o preço de venda.
          </p>
        </div>
      </div>
    </Card>
  );
}
