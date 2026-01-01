import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import RecipeCard, { RecipeIngredient } from './RecipeCard';

interface Product {
  id?: number;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  ingredients: RecipeIngredient[];
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product?: Product;
  availableIngredients: Array<{ id: number; name: string; unit: string; unitCost: number }>;
  processedIngredients?: Array<{ id: number; name: string; unit: string; unitCost: number }>;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  product,
  availableIngredients,
  processedIngredients = [],
}: ProductModalProps) {
  const [formData, setFormData] = useState<Product>(
    product || {
      name: '',
      description: '',
      category: '',
      price: 0,
      cost: 0,
      ingredients: [],
    }
  );

  const [showIngredientSelector, setShowIngredientSelector] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null);
  const [ingredientQuantity, setIngredientQuantity] = useState(0);

  const categories = ['Bolos', 'Cupcakes', 'Pães', 'Croissants', 'Doces', 'Salgados', 'Bebidas'];

  const handleAddIngredient = () => {
    if (!selectedIngredientId || ingredientQuantity <= 0) {
      alert('Selecione um insumo e defina a quantidade');
      return;
    }

    // Procura em ambas as listas de ingredientes
    let ingredient = availableIngredients.find(ing => ing.id === selectedIngredientId);
    if (!ingredient) {
      ingredient = processedIngredients.find(ing => ing.id === selectedIngredientId);
    }
    if (!ingredient) return;

    const newIngredient: RecipeIngredient = {
      id: Math.max(...formData.ingredients.map(i => i.id), 0) + 1,
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      quantity: ingredientQuantity,
      unit: ingredient.unit,
      unitCost: ingredient.unitCost,
    };

    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, newIngredient],
    });

    setSelectedIngredientId(null);
    setIngredientQuantity(0);
    setShowIngredientSelector(false);
  };

  const handleRemoveIngredient = (ingredientId: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter(ing => ing.id !== ingredientId),
    });
  };

  const handleEditIngredient = (ingredient: RecipeIngredient) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.map(ing =>
        ing.id === ingredient.id ? ingredient : ing
      ),
    });
  };

  const totalProductionCost = formData.ingredients.reduce(
    (sum, ing) => sum + (ing.quantity * ing.unitCost),
    0
  );

  const profitMargin = formData.price > 0
    ? (((formData.price - totalProductionCost) / formData.price) * 100).toFixed(1)
    : 0;

  const handleSave = () => {
    if (!formData.name || !formData.category) {
      alert('Preencha o nome e categoria do produto');
      return;
    }

    if (formData.ingredients.length === 0) {
      alert('Adicione pelo menos um insumo à ficha técnica');
      return;
    }

    onSave({
      ...formData,
      cost: totalProductionCost,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {product ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={24} />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações do Produto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Informações do Produto</h3>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nome do Produto *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Ex: Bolo de Chocolate"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Descrição do produto"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Categoria *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Custo de Produção (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={(totalProductionCost || 0).toFixed(2)}
                    disabled
                    className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground opacity-75 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Calculado automaticamente</p>
                </div>
              </div>

              <div className="bg-accent/10 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Margem de Lucro:</span>
                  <span className="text-lg font-bold text-accent">{profitMargin}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Lucro Unitário:</span>
                  <span className="text-lg font-bold text-green-600">R$ {(formData.price - totalProductionCost).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Ficha Técnica */}
            <div>
              <RecipeCard
                productName={formData.name || 'Novo Produto'}
                ingredients={formData.ingredients}
                onAddIngredient={() => setShowIngredientSelector(!showIngredientSelector)}
                onRemoveIngredient={handleRemoveIngredient}
                onEditIngredient={handleEditIngredient}
                availableIngredients={availableIngredients}
              />

              {showIngredientSelector && (
                <Card className="p-4 mt-4 bg-muted/30">
                  <h4 className="font-semibold text-foreground mb-3">Adicionar Insumo</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Insumo</label>
                      <select
                        value={selectedIngredientId || ''}
                        onChange={(e) => setSelectedIngredientId(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="">Selecione um insumo</option>
                        {availableIngredients.length > 0 && (
                          <optgroup label="Insumos Base">
                            {availableIngredients.map(ing => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} (R$ {ing.unitCost.toFixed(2)}/{ing.unit})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {processedIngredients.length > 0 && (
                          <optgroup label="Insumos Processados">
                            {processedIngredients.map(ing => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} (R$ {ing.unitCost.toFixed(2)}/{ing.unit})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Quantidade</label>
                      <input
                        type="number"
                        step="0.01"
                        value={ingredientQuantity || 0}
                        onChange={(e) => setIngredientQuantity(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="0"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-accent hover:bg-accent/90"
                        onClick={handleAddIngredient}
                      >
                        <Plus size={16} className="mr-1" />
                        Adicionar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowIngredientSelector(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end pt-6 border-t border-border mt-6">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="bg-accent hover:bg-accent/90"
              onClick={handleSave}
            >
              {product ? 'Atualizar' : 'Criar'} Produto
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
