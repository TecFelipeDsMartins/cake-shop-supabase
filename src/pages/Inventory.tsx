import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye, X, Calculator, Package, Zap } from 'lucide-react';
import { 
  getProductsWithIngredients, 
  addProduct, 
  updateProduct,
  deleteProduct, 
  getIngredients,
  getRecipes,
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

interface Recipe {
  id: number;
  name: string;
  costPerUnit: number;
  yieldUnit: string;
  type: string;
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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
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

  const [newIngredient, setNewIngredient] = useState({
    id: '',
    quantity: 1,
    unit: 'g',
    costPerUnit: 0,
    name: '',
    is_processed: false
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [productsData, ingredientsData, recipesData] = await Promise.all([
        getProductsWithIngredients(),
        getIngredients(),
        getRecipes()
      ]);
      
      setProducts(productsData || []);
      setIngredients(ingredientsData || []);
      setRecipes(recipesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do banco de dados');
    }
    setLoading(false);
  }

  const calculateProportionalCost = (baseUnit: string, targetUnit: string, baseCost: number): number => {
    const unit = (baseUnit || 'kg').toLowerCase();
    const target = (targetUnit || 'g').toLowerCase();
    if (unit === target) return baseCost;
    if (unit === 'kg' && target === 'g') return baseCost / 1000;
    if (unit === 'g' && target === 'kg') return baseCost * 1000;
    if (unit === 'l' && target === 'ml') return baseCost / 1000;
    if (unit === 'ml' && target === 'l') return baseCost * 1000;
    return baseCost;
  };

  function handleOpenModal(product?: Product) {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        ingredients: product.ingredients || []
      });
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
    setNewIngredient({ id: '', quantity: 1, unit: 'g', costPerUnit: 0, name: '', is_processed: false });
    setShowModal(true);
  }

  function handleAddIngredient() {
    if (!newIngredient.id || newIngredient.quantity <= 0) {
      toast.error('Selecione um item e quantidade válida');
      return;
    }

    const [type, idStr] = newIngredient.id.split(':');
    const numericId = parseInt(idStr);

    const ingredient: ProductIngredient = {
      ingredient_id: numericId,
      ingredient_name: newIngredient.name,
      quantity: newIngredient.quantity,
      unit: newIngredient.unit,
      cost: newIngredient.costPerUnit * newIngredient.quantity,
      is_processed: type === 'rec',
    };

    const updatedIngredients = [...(formData.ingredients || []), ingredient];
    const totalCost = updatedIngredients.reduce((sum, ing) => sum + ing.cost, 0);

    setFormData({
      ...formData,
      ingredients: updatedIngredients,
      production_cost: totalCost,
    });

    setNewIngredient({ id: '', quantity: 1, unit: 'g', costPerUnit: 0, name: '', is_processed: false });
  }

  function handleRemoveIngredient(index: number) {
    const updatedIngredients = (formData.ingredients || []).filter((_, i) => i !== index);
    const totalCost = updatedIngredients.reduce((sum, ing) => sum + ing.cost, 0);
    setFormData({ ...formData, ingredients: updatedIngredients, production_cost: totalCost });
  }

  async function handleSaveProduct() {
    if (!formData.name.trim()) return toast.error('Nome é obrigatório');
    if (formData.price <= 0) return toast.error('Preço deve ser maior que 0');

    try {
      let productId: number;
      if (editingProduct?.id) {
        productId = editingProduct.id;
        await updateProduct(productId, {
          name: formData.name,
          description: formData.description,
          category_id: formData.category_id,
          price: formData.price,
          production_cost: formData.production_cost,
        });
        await deleteProductIngredientsByProductId(productId);
      } else {
        const newProd = await addProduct({
          name: formData.name,
          description: formData.description,
          category_id: formData.category_id,
          price: formData.price,
          production_cost: formData.production_cost,
        });
        productId = newProd.id;
      }

      if (formData.ingredients) {
        for (const ing of formData.ingredients) {
          // Se for uma receita, o banco pode rejeitar se o ingredient_id não existir na tabela ingredients
          // Para evitar erro de FK, vamos garantir que o ingredient_id seja válido ou nulo se for processado
          await addProductIngredient({ 
            product_id: productId,
            ingredient_id: ing.is_processed ? null : ing.ingredient_id, // Evita erro de FK para receitas
            ingredient_name: ing.ingredient_name,
            quantity: ing.quantity,
            unit: ing.unit,
            cost: ing.cost,
            is_processed: ing.is_processed
          });
        }
      }

      toast.success('Produto salvo com sucesso');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar produto no banco de dados');
    }
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Estoque de Produtos</h1>
          <p className="text-muted-foreground">Gerencie seus produtos finais e seus custos de produção</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-accent hover:bg-accent/90 gap-2">
          <Plus size={18} /> Novo Produto
        </Button>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Buscar produtos..."
          className="flex-1 px-4 py-2 border border-border rounded-lg bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline" onClick={loadData} disabled={loading}>
          {loading ? 'Carregando...' : 'Atualizar Dados'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="p-5 hover:shadow-xl transition-all border-accent/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">{product.name}</h3>
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                  {categories.find(c => c.id === product.category_id)?.name || 'Sem Categoria'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-accent">R$ {product.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Custo: R$ {product.production_cost.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => { setSelectedProduct(product); setShowRecipe(true); }}>
                <Eye size={14} /> Ficha
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleOpenModal(product)}>
                <Edit2 size={14} />
              </Button>
              <Button variant="outline" size="sm" className="text-red-500" onClick={() => product.id && deleteProduct(product.id).then(loadData)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-3xl max-h-[95vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <Button variant="ghost" onClick={() => setShowModal(false)}><X size={20} /></Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Nome do Produto *</label>
                  <input type="text" className="w-full px-3 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Categoria</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={formData.category_id} onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Preço Venda (R$)</label>
                    <input type="number" className="w-full px-3 py-2 border rounded-lg" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Custo Produção</label>
                    <div className="px-3 py-2 bg-muted rounded-lg font-bold text-accent">R$ {formData.production_cost.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2"><Calculator size={18} /> Ficha Técnica</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2 bg-muted/20">
                  {formData.ingredients?.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-background rounded border">
                      <span>{ing.ingredient_name} ({ing.quantity}{ing.unit})</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">R$ {ing.cost.toFixed(2)}</span>
                        <button onClick={() => handleRemoveIngredient(idx)} className="text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-accent/5 rounded-lg border border-accent/20 space-y-3">
                  <select 
                    className="w-full px-2 py-1 text-sm border rounded"
                    value={newIngredient.id}
                    onChange={e => {
                      const val = e.target.value;
                      if (!val) return;
                      const [type, id] = val.split(':');
                      const numericId = parseInt(id);
                      if (type === 'ing') {
                        const item = ingredients.find(i => i.id === numericId);
                        if (item) setNewIngredient({...newIngredient, id: val, name: item.name, costPerUnit: calculateProportionalCost(item.unit || 'kg', newIngredient.unit, item.cost), is_processed: false});
                      } else {
                        const item = recipes.find(r => r.id === numericId);
                        if (item) setNewIngredient({...newIngredient, id: val, name: item.name, costPerUnit: item.costPerUnit, unit: item.yieldUnit, is_processed: true});
                      }
                    }}
                  >
                    <option value="">Adicionar insumo/receita...</option>
                    <optgroup label="📦 Insumos">
                      {ingredients.map(i => <option key={`ing:${i.id}`} value={`ing:${i.id}`}>{i.name} ({i.unit})</option>)}
                    </optgroup>
                    <optgroup label="⚙️ Receitas">
                      {recipes.map(r => <option key={`rec:${r.id}`} value={`rec:${r.id}`}>{r.name} ({r.yieldUnit})</option>)}
                    </optgroup>
                  </select>
                  <div className="flex gap-2">
                    <input type="number" className="w-20 px-2 py-1 border rounded text-sm" value={newIngredient.quantity} onChange={e => setNewIngredient({...newIngredient, quantity: parseFloat(e.target.value) || 0})} />
                    <select className="flex-1 px-2 py-1 border rounded text-sm" value={newIngredient.unit} onChange={e => {
                      const unit = e.target.value;
                      let cost = newIngredient.costPerUnit;
                      const [type, id] = newIngredient.id.split(':');
                      if (type === 'ing') {
                        const item = ingredients.find(i => i.id === parseInt(id));
                        if (item) cost = calculateProportionalCost(item.unit || 'kg', unit, item.cost);
                      }
                      setNewIngredient({...newIngredient, unit, costPerUnit: cost});
                    }}>
                      <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">L</option><option value="un">un</option>
                    </select>
                    <Button size="sm" onClick={handleAddIngredient}><Plus size={14} /></Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSaveProduct} className="bg-primary hover:bg-primary/90 px-8">Salvar Produto</Button>
            </div>
          </Card>
        </div>
      )}

      {showRecipe && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ficha Técnica: {selectedProduct.name}</h2>
              <Button variant="ghost" onClick={() => setShowRecipe(false)}><X size={20} /></Button>
            </div>
            <div className="space-y-3">
              {selectedProduct.ingredients?.map((ing, idx) => (
                <div key={idx} className="flex justify-between border-b pb-2">
                  <span>{ing.ingredient_name}</span>
                  <span className="font-medium">{ing.quantity}{ing.unit} - R$ {ing.cost.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-4 flex justify-between font-bold text-lg">
                <span>Custo Total:</span>
                <span className="text-accent">R$ {selectedProduct.production_cost.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
