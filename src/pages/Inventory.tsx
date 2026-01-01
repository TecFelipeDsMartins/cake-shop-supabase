import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye, X, Calculator, Package, Zap, RefreshCw } from 'lucide-react';
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
      console.log('Iniciando carregamento de dados para o Inventário...');
      const [productsData, ingredientsData, recipesData] = await Promise.all([
        getProductsWithIngredients(),
        getIngredients(),
        getRecipes()
      ]);
      
      console.log('Insumos carregados:', ingredientsData?.length || 0);
      console.log('Receitas carregadas:', recipesData?.length || 0);
      
      setProducts(productsData || []);
      setIngredients(ingredientsData || []);
      setRecipes(recipesData || []);
      
      toast.success('Dados sincronizados');
    } catch (error) {
      console.error('Erro crítico ao carregar dados:', error);
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
          await addProductIngredient({ 
            product_id: productId,
            ingredient_id: ing.is_processed ? null : ing.ingredient_id,
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
      toast.error('Erro ao salvar produto');
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} className="gap-2">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Sincronizar
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-accent hover:bg-accent/90 gap-2">
            <Plus size={18} /> Novo Produto
          </Button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar produtos no estoque..."
        className="w-full px-4 py-3 border border-border rounded-xl bg-background shadow-sm focus:ring-2 focus:ring-accent outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="p-5 hover:shadow-xl transition-all border-accent/10 group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">{product.name}</h3>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-accent/10 text-accent px-2 py-1 rounded">
                  {categories.find(c => c.id === product.category_id)?.name || 'Geral'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-accent">R$ {product.price.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Custo: R$ {product.production_cost.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => { setSelectedProduct(product); setShowRecipe(true); }}>
                <Eye size={14} /> Ficha Técnica
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleOpenModal(product)}>
                <Edit2 size={14} />
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => product.id && deleteProduct(product.id).then(loadData)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto p-8 shadow-2xl border-accent/20">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <div>
                <h2 className="text-3xl font-black text-foreground">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
                <p className="text-sm text-muted-foreground">Preencha os dados e a composição do produto</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="rounded-full"><X size={24} /></Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground uppercase tracking-tight">Nome do Produto *</label>
                  <input type="text" className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-accent outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Bolo de Cenoura com Chocolate" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-tight">Categoria</label>
                    <select className="w-full px-4 py-2 border rounded-lg bg-background outline-none" value={formData.category_id} onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground uppercase tracking-tight">Preço de Venda (R$)</label>
                    <input type="number" className="w-full px-4 py-2 border rounded-lg bg-background font-bold text-accent outline-none" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-muted-foreground uppercase">Custo de Produção Atual</span>
                    <span className="text-2xl font-black text-accent">R$ {formData.production_cost.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground italic">O custo é calculado automaticamente com base na ficha técnica ao lado.</div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-black text-xl flex items-center gap-2 text-foreground"><Calculator size={22} className="text-accent" /> Ficha Técnica do Produto</h3>
                
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-xl p-3 bg-muted/10">
                  {formData.ingredients && formData.ingredients.length > 0 ? (
                    formData.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-3 bg-background rounded-lg border border-border/50 shadow-sm group">
                        <div>
                          <p className="font-bold text-foreground">{ing.ingredient_name}</p>
                          <p className="text-xs text-muted-foreground">{ing.quantity}{ing.unit} • R$ {ing.cost.toFixed(2)}</p>
                        </div>
                        <button onClick={() => handleRemoveIngredient(idx)} className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center text-muted-foreground text-sm italic">Nenhum item adicionado à ficha técnica.</div>
                  )}
                </div>

                <div className="p-5 bg-accent/5 rounded-2xl border border-accent/20 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-accent uppercase">Selecionar Insumo ou Receita</label>
                    <select 
                      className="w-full px-4 py-2 border rounded-lg bg-background text-sm font-medium outline-none focus:ring-2 focus:ring-accent"
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
                      <option value="">Escolha um item da lista...</option>
                      {ingredients.length > 0 && (
                        <optgroup label="📦 INSUMOS (MATÉRIA-PRIMA)">
                          {ingredients.map(i => <option key={`ing:${i.id}`} value={`ing:${i.id}`}>{i.name} ({i.unit})</option>)}
                        </optgroup>
                      )}
                      {recipes.length > 0 && (
                        <optgroup label="⚙️ RECEITAS (PREPAROS)">
                          {recipes.map(r => <option key={`rec:${r.id}`} value={`rec:${r.id}`}>{r.name} ({r.yieldUnit})</option>)}
                        </optgroup>
                      )}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase">Quantidade</label>
                      <input type="number" className="w-full px-4 py-2 border rounded-lg bg-background text-sm outline-none" value={newIngredient.quantity} onChange={e => setNewIngredient({...newIngredient, quantity: parseFloat(e.target.value) || 0})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-muted-foreground uppercase">Unidade</label>
                      <select className="w-full px-4 py-2 border rounded-lg bg-background text-sm outline-none" value={newIngredient.unit} onChange={e => {
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
                    </div>
                  </div>
                  <Button onClick={handleAddIngredient} className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-accent/20 transition-all active:scale-95">
                    <Plus size={20} className="mr-2" /> Adicionar à Composição
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t mt-10 pt-6">
              <Button variant="outline" onClick={() => setShowModal(false)} className="px-8 py-6 rounded-xl font-bold">Cancelar</Button>
              <Button onClick={handleSaveProduct} className="bg-primary hover:bg-primary/90 text-white px-12 py-6 rounded-xl font-black text-lg shadow-xl transition-all active:scale-95">Salvar Produto Final</Button>
            </div>
          </Card>
        </div>
      )}

      {showRecipe && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-lg">
          <Card className="w-full max-w-lg p-8 shadow-2xl border-accent/30">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-black text-foreground">Ficha Técnica: {selectedProduct.name}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowRecipe(false)} className="rounded-full"><X size={24} /></Button>
            </div>
            <div className="space-y-4">
              {selectedProduct.ingredients?.map((ing, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-border/50 pb-3">
                  <div>
                    <p className="font-bold text-foreground">{ing.ingredient_name}</p>
                    <p className="text-xs text-muted-foreground">{ing.is_processed ? 'Receita/Preparo' : 'Insumo Base'}</p>
                  </div>
                  <span className="font-black text-accent">{ing.quantity}{ing.unit} • R$ {ing.cost.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-6 flex justify-between items-center font-black text-2xl">
                <span className="text-foreground">Custo Total:</span>
                <span className="text-accent">R$ {selectedProduct.production_cost.toFixed(2)}</span>
              </div>
            </div>
            <Button onClick={() => setShowRecipe(false)} className="w-full mt-8 py-4 font-bold rounded-xl">Fechar Visualização</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
