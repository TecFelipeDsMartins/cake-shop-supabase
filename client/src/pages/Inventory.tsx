import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye, X } from 'lucide-react';
import { 
  getProductsWithIngredients, 
  addProduct, 
  updateProduct,
  deleteProduct, 
  getIngredients,
  addProductIngredient,
  deleteProductIngredientsByProductId
} from '@/lib/supabaseClient';
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
  id?: number;
  product_id?: number;
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
  // Dados de exemplo para insumos
  const exampleIngredients: Ingredient[] = [
    // Insumos Base
    { id: 1, name: 'Farinha de Trigo', unit: 'kg', cost: 5.50, is_processed: false },
    { id: 2, name: 'Açúcar Cristal', unit: 'kg', cost: 4.20, is_processed: false },
    { id: 3, name: 'Ovos', unit: 'dúzia', cost: 12.00, is_processed: false },
    { id: 4, name: 'Leite Integral', unit: 'L', cost: 4.50, is_processed: false },
    { id: 5, name: 'Manteiga', unit: 'kg', cost: 28.00, is_processed: false },
    { id: 6, name: 'Chocolate em Pó', unit: 'kg', cost: 18.50, is_processed: false },
    { id: 7, name: 'Chocolate Amargo', unit: 'kg', cost: 35.00, is_processed: false },
    { id: 8, name: 'Fermento em Pó', unit: 'kg', cost: 22.00, is_processed: false },
    { id: 9, name: 'Leite Condensado', unit: 'L', cost: 8.50, is_processed: false },
    { id: 10, name: 'Coco Ralado', unit: 'kg', cost: 15.00, is_processed: false },
    // Insumos Processados
    { id: 11, name: 'Brigadeiro', unit: 'kg', cost: 25.00, is_processed: true },
    { id: 12, name: 'Calda de Chocolate', unit: 'L', cost: 18.00, is_processed: true },
    { id: 13, name: 'Ganache', unit: 'kg', cost: 32.00, is_processed: true },
    { id: 14, name: 'Cobertura de Açúcar', unit: 'kg', cost: 12.00, is_processed: true },
    { id: 15, name: 'Massa de Bolo', unit: 'kg', cost: 15.00, is_processed: true },
  ];

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showRecipe, setShowRecipe] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>(exampleIngredients);
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

  // Funções para localStorage
  const loadProductsFromStorage = (): Product[] => {
    try {
      const stored = localStorage.getItem('cake_shop_products');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveProductsToStorage = (prods: Product[]) => {
    try {
      localStorage.setItem('cake_shop_products', JSON.stringify(prods));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Tentar carregar do Supabase
      try {
        const productsData = await getProductsWithIngredients();
        if (productsData && productsData.length > 0) {
          setProducts(productsData);
          saveProductsToStorage(productsData);
        } else {
          // Se Supabase retornar vazio, tentar localStorage
          const stored = loadProductsFromStorage();
          setProducts(stored);
        }
      } catch (supabaseError) {
        // Se Supabase falhar, usar localStorage
        console.warn('Supabase indisponível, usando localStorage:', supabaseError);
        const stored = loadProductsFromStorage();
        setProducts(stored);
      }

      try {
        const ingredientsData = await getIngredients();
        if (ingredientsData && ingredientsData.length > 0) {
          setIngredients(ingredientsData);
        } else {
          setIngredients(exampleIngredients);
        }
      } catch {
        setIngredients(exampleIngredients);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setIngredients(exampleIngredients);
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
    setSelectedIngredient(null);
    setIngredientQuantity(0);
    setShowModal(true);
  }

  function handleAddIngredient() {
    if (!selectedIngredient || ingredientQuantity <= 0) {
      toast.error('Selecione um insumo e quantidade válida');
      return;
    }

    const newIngredient: ProductIngredient = {
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

  function handleRemoveIngredient(index: number) {
    const updatedIngredients = (formData.ingredients || []).filter((_, i) => i !== index);
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
      let productId: number;
      let updatedProducts = [...products];

      if (editingProduct?.id) {
        // Atualizar produto existente
        productId = editingProduct.id;
        updatedProducts = updatedProducts.map(p =>
          p.id === productId
            ? {
                ...formData,
                id: productId,
              }
            : p
        );
      } else {
        // Criar novo produto
        productId = Math.max(...products.map(p => p.id || 0), 0) + 1;
        updatedProducts.push({
          ...formData,
          id: productId,
        });
      }

      // Salvar no localStorage
      saveProductsToStorage(updatedProducts);
      setProducts(updatedProducts);

      // Tentar salvar no Supabase (não bloqueia se falhar)
      try {
        if (editingProduct?.id) {
          await updateProduct(editingProduct.id, {
            name: formData.name,
            description: formData.description,
            category_id: formData.category_id,
            price: formData.price,
            production_cost: formData.production_cost,
          });

          await deleteProductIngredientsByProductId(editingProduct.id);
        } else {
          const newProduct = await addProduct({
            name: formData.name,
            description: formData.description,
            category_id: formData.category_id,
            price: formData.price,
            production_cost: formData.production_cost,
          });

          if (newProduct?.id) {
            productId = newProduct.id;
          }
        }

        // Salvar insumos do produto
        if (formData.ingredients && formData.ingredients.length > 0) {
          for (const ingredient of formData.ingredients) {
            await addProductIngredient({
              product_id: productId,
              ingredient_id: ingredient.ingredient_id,
              ingredient_name: ingredient.ingredient_name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              cost: ingredient.cost,
              is_processed: ingredient.is_processed,
            });
          }
        }
      } catch (supabaseError) {
        console.warn('Supabase indisponível, dados salvos localmente:', supabaseError);
      }

      toast.success(editingProduct ? 'Produto atualizado com sucesso' : 'Produto adicionado com sucesso');
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
        // Deletar do localStorage
        const updatedProducts = products.filter(p => p.id !== id);
        saveProductsToStorage(updatedProducts);
        setProducts(updatedProducts);

        // Tentar deletar do Supabase (não bloqueia se falhar)
        try {
          await deleteProduct(id);
        } catch (supabaseError) {
          console.warn('Supabase indisponível, produto deletado localmente:', supabaseError);
        }

        toast.success('Produto deletado com sucesso');
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
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
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
                        <optgroup label="Insumos Base">
                          {baseIngredients.map(ing => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} (R$ {ing.cost?.toFixed(2) || '0.00'}/{ing.unit})
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {processedIngredients.length > 0 && (
                        <optgroup label="Insumos Processados">
                          {processedIngredients.map(ing => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} (R$ {ing.cost?.toFixed(2) || '0.00'}/{ing.unit}) ⭐
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Quantidade ({selectedIngredient?.unit || 'kg'})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={ingredientQuantity}
                      onChange={(e) => setIngredientQuantity(parseFloat(e.target.value) || 0)}
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
                    {formData.ingredients?.map((ing, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {ing.ingredient_name} {ing.is_processed && '⭐'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ing.quantity} {ing.unit} × R$ {((ing.cost / ing.quantity) || 0).toFixed(2)} = R$ {ing.cost.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveIngredient(index)}
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
                <p className="text-foreground"><strong>Descrição:</strong> {selectedProduct.description || 'Sem descrição'}</p>
                <p className="text-foreground"><strong>Preço:</strong> R$ {selectedProduct.price.toFixed(2)}</p>
                <p className="text-foreground"><strong>Custo:</strong> R$ {selectedProduct.production_cost.toFixed(2)}</p>
                <p className="text-foreground"><strong>Margem:</strong> {(((selectedProduct.price - selectedProduct.production_cost) / selectedProduct.price) * 100).toFixed(1)}%</p>
              </div>

              {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Insumos Utilizados</h3>
                  <div className="space-y-2">
                    {selectedProduct.ingredients.map((ing, index) => (
                      <div key={index} className="p-2 bg-muted rounded">
                        <p className="text-sm font-medium text-foreground">
                          {ing.ingredient_name} {ing.is_processed && '⭐'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ing.quantity} {ing.unit} × R$ {((ing.cost / ing.quantity) || 0).toFixed(2)} = R$ {ing.cost.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
