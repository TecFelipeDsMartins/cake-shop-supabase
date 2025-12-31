import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye, X } from 'lucide-react';
import { getProducts, deleteProduct, getIngredients } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface Product {
  id?: number;
  name: string;
  description?: string;
  category_id?: number;
  price: number;
  production_cost: number;
  profit_margin?: number;
  created_at?: string;
  ingredients?: ProductIngredient[];
}

interface ProductIngredient {
  id?: string;
  ingredient_id: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
  cost: number;
  is_processed: boolean;
}

interface Ingredient {
  id?: number;
  name: string;
  unit?: string;
  cost: number;
  is_processed?: boolean;
}

interface Category {
  id: number;
  name: string;
  color?: string;
}

export default function Inventory() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showRecipe, setShowRecipe] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories] = useState<Category[]>([
    { id: 1, name: 'Bolos', color: '#D4A574' },
    { id: 2, name: 'Doces', color: '#E8B4B8' },
    { id: 3, name: 'Tortas', color: '#C4A69D' },
    { id: 4, name: 'Cupcakes', color: '#F4D4C8' },
  ]);

  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    category_id: 1,
    price: 0,
    production_cost: 0,
    ingredients: [],
  });

  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [ingredientQuantity, setIngredientQuantity] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const productsData = await getProducts();
      const ingredientsData = await getIngredients();
      setProducts(productsData);
      setIngredients(ingredientsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    }
    setLoading(false);
  }

  function handleOpenModal(product?: Product) {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        category_id: 1,
        price: 0,
        production_cost: 0,
        ingredients: [],
      });
    }
    setShowModal(true);
  }

  function handleAddIngredient() {
    if (!selectedIngredient || ingredientQuantity <= 0) {
      toast.error('Selecione um insumo e quantidade válida');
      return;
    }

    const newIngredient: ProductIngredient = {
      id: Math.random().toString(),
      ingredient_id: selectedIngredient.id || 0,
      ingredient_name: selectedIngredient.name,
      quantity: ingredientQuantity,
      unit: selectedIngredient.unit || 'kg',
      cost: (selectedIngredient.cost || 0) * ingredientQuantity,
      is_processed: selectedIngredient.is_processed || false,
    };

    const updatedIngredients = [...(formData.ingredients || []), newIngredient];
    const totalCost = updatedIngredients.reduce((sum, ing) => sum + ing.cost, 0);

    setFormData({
      ...formData,
      ingredients: updatedIngredients,
      production_cost: totalCost,
    });

    setSelectedIngredient(null);
    setIngredientQuantity(0);
    toast.success('Insumo adicionado à ficha técnica');
  }

  function handleRemoveIngredient(id?: string) {
    if (!id) return;
    const updatedIngredients = (formData.ingredients || []).filter(ing => ing.id !== id);
    const totalCost = updatedIngredients.reduce((sum, ing) => sum + ing.cost, 0);

    setFormData({
      ...formData,
      ingredients: updatedIngredients,
      production_cost: totalCost,
    });
  }

  async function handleSaveProduct() {
    if (!formData.name.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }

    if (formData.price <= 0) {
      toast.error('Preço de venda deve ser maior que 0');
      return;
    }

    try {
      // Aqui você implementaria a lógica de salvar o produto
      // await addProduct(formData) ou await updateProduct(editingProduct.id, formData)
      toast.success(editingProduct ? 'Produto atualizado' : 'Produto adicionado');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await deleteProduct(id);
        toast.success('Produto deletado com sucesso');
        loadData();
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
        toast.error('Erro ao deletar produto');
      }
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = filteredProducts.reduce((sum, p) => sum + p.price, 0);
  const totalCost = filteredProducts.reduce((sum, p) => sum + p.production_cost, 0);
  const totalProfit = totalValue - totalCost;

  // Separar insumos base e processados
  const baseIngredients = ingredients.filter(ing => !ing.is_processed);
  const processedIngredients = ingredients.filter(ing => ing.is_processed);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Estoque de Produtos</h1>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total de Produtos</p>
          <p className="text-2xl font-bold text-foreground">{filteredProducts.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
          <p className="text-2xl font-bold text-accent">R$ {totalValue.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Custo Total</p>
          <p className="text-2xl font-bold text-red-600">R$ {totalCost.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Lucro Total</p>
          <p className="text-2xl font-bold text-green-600">R$ {totalProfit.toFixed(2)}</p>
        </Card>
      </div>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar produto..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
      />

      {/* Tabela de Produtos */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-foreground">Nome</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Preço de Venda</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Custo de Produção</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Margem</th>
              <th className="text-center py-3 px-4 font-semibold text-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum produto encontrado
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const margin = product.price - product.production_cost;
                const marginPercent = product.price > 0 ? (margin / product.price) * 100 : 0;
                return (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-foreground font-medium">{product.name}</td>
                    <td className="py-3 px-4 text-right text-foreground">R$ {product.price.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-muted-foreground">R$ {product.production_cost.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-green-600 font-semibold">
                      {marginPercent.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowRecipe(true);
                        }}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => product.id && handleDelete(product.id)}
                        className="p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Criação/Edição de Produto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Informações Básicas */}
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold text-foreground mb-3">Informações do Produto</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nome do Produto *</label>
                    <input
                      type="text"
                      placeholder="Ex: Bolo de Chocolate"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Descrição</label>
                    <textarea
                      placeholder="Descrição do produto..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Categoria</label>
                    <select
                      value={formData.category_id || 1}
                      onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Preço de Venda (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Custo de Produção (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.production_cost}
                        disabled
                        className="w-full px-3 py-2 border border-border rounded bg-muted text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Calculado automaticamente</p>
                    </div>
                  </div>

                  {formData.price > 0 && (
                    <div className="p-3 bg-muted rounded">
                      <p className="text-sm text-foreground">
                        <strong>Margem de Lucro:</strong> {(((formData.price - formData.production_cost) / formData.price) * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-foreground">
                        <strong>Lucro Unitário:</strong> R$ {(formData.price - formData.production_cost).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ficha Técnica */}
              <div className="border-b border-border pb-4">
                <h3 className="font-semibold text-foreground mb-3">Ficha Técnica - Insumos Utilizados</h3>

                {/* Adicionar Insumo */}
                <div className="space-y-3 mb-4 p-3 bg-muted rounded">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Selecione um Insumo</label>
                    <select
                      value={selectedIngredient?.id || ''}
                      onChange={(e) => {
                        const ing = ingredients.find(i => i.id === parseInt(e.target.value));
                        setSelectedIngredient(ing || null);
                      }}
                      className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                    >
                      <option value="">-- Selecione um insumo --</option>
                      {baseIngredients.length > 0 && (
                        <>
                          <optgroup label="Insumos Base">
                            {baseIngredients.map(ing => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} (R$ {ing.cost}/kg)
                              </option>
                            ))}
                          </optgroup>
                        </>
                      )}
                      {processedIngredients.length > 0 && (
                        <>
                          <optgroup label="Insumos Processados">
                            {processedIngredients.map(ing => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name} (R$ {ing.cost}/kg) ⭐
                              </option>
                            ))}
                          </optgroup>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Quantidade ({selectedIngredient?.unit || 'kg'})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={ingredientQuantity}
                      onChange={(e) => setIngredientQuantity(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                    />
                  </div>

                  <Button onClick={handleAddIngredient} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar à Ficha
                  </Button>
                </div>

                {/* Lista de Insumos */}
                {(formData.ingredients || []).length > 0 ? (
                  <div className="space-y-2">
                    {formData.ingredients?.map(ing => (
                      <div key={ing.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {ing.ingredient_name} {ing.is_processed && '⭐'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ing.quantity} {ing.unit} × R$ {((ing.cost / ing.quantity) || 0).toFixed(2)} = R$ {ing.cost.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveIngredient(ing.id)}
                          className="p-1 hover:bg-destructive/10 rounded text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum insumo adicionado ainda</p>
                )}
              </div>

              {/* Resumo */}
              <div className="p-3 bg-accent/10 rounded">
                <p className="text-sm text-foreground">
                  <strong>Custo Total de Produção:</strong> R$ {formData.production_cost.toFixed(2)}
                </p>
                {formData.price > 0 && (
                  <p className="text-sm text-foreground">
                    <strong>Lucro Unitário:</strong> R$ {(formData.price - formData.production_cost).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct}>
                {editingProduct ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Receita */}
      {showRecipe && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Ficha Técnica</h2>
              <button
                onClick={() => setShowRecipe(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Informações do Produto</h3>
                <p className="text-foreground"><strong>Nome:</strong> {selectedProduct.name}</p>
                <p className="text-foreground"><strong>Preço:</strong> R$ {selectedProduct.price.toFixed(2)}</p>
                <p className="text-foreground"><strong>Custo:</strong> R$ {selectedProduct.production_cost.toFixed(2)}</p>
                <p className="text-foreground"><strong>Margem:</strong> {(((selectedProduct.price - selectedProduct.production_cost) / selectedProduct.price) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
