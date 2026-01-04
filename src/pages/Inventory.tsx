import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye, X, Calculator, RefreshCw } from 'lucide-react';
import { 
  getProductsWithIngredients, 
  saveFullProduct,
  deleteProduct, 
  getIngredients,
  getRecipes
} from '@/lib/supabaseClient';
import { toast } from 'sonner';

export default function Inventory() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showRecipe, setShowRecipe] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<any>({
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
      console.log('Buscando dados do Supabase...');
      const [productsData, ingredientsData, recipesData] = await Promise.all([
        getProductsWithIngredients(),
        getIngredients(),
        getRecipes()
      ]);
      
      console.log('Insumos recebidos:', ingredientsData);
      console.log('Receitas recebidas:', recipesData);
      
      setProducts(productsData || []);
      setIngredients(ingredientsData || []);
      setRecipes(recipesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do banco');
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

  function handleOpenModal(product?: any) {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product, ingredients: product.ingredients || [] });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', category_id: 1, price: 0, production_cost: 0, ingredients: [] });
    }
    setNewIngredient({ id: '', quantity: 1, unit: 'g', costPerUnit: 0, name: '', is_processed: false });
    setShowModal(true);
  }

  function handleAddIngredient() {
    if (!newIngredient.id || newIngredient.quantity <= 0) {
      toast.error('Selecione um item e quantidade');
      return;
    }

    const ingredient = {
      ingredient_id: parseInt(newIngredient.id.split(':')[1]),
      ingredient_name: newIngredient.name,
      quantity: newIngredient.quantity,
      unit: newIngredient.unit,
      cost: newIngredient.costPerUnit,
      total_cost: newIngredient.costPerUnit * newIngredient.quantity,
      is_processed: newIngredient.is_processed,
    };

    const updatedIngredients = [...(formData.ingredients || []), ingredient];
    setFormData({
      ...formData,
      ingredients: updatedIngredients,
      production_cost: updatedIngredients.reduce((sum, ing) => sum + ing.total_cost, 0),
    });
    setNewIngredient({ id: '', quantity: 1, unit: 'g', costPerUnit: 0, name: '', is_processed: false });
  }

  async function handleSaveProduct() {
    if (!formData.name.trim() || formData.price <= 0) return toast.error('Preencha os campos obrigatórios');
    try {
      // Preparar ficha técnica para o novo formato
      const technical_sheet = (formData.ingredients || []).map((ing: any) => ({
        component_id: ing.ingredient_id,
        quantity: ing.quantity,
        unit: ing.unit
      }));

      const productPayload = {
        ...formData,
        technical_sheet
      };

      await saveFullProduct(productPayload);

      toast.success('Produto salvo');
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar');
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Estoque</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}><RefreshCw size={18} className={loading ? 'animate-spin' : ''} /></Button>
          <Button onClick={() => handleOpenModal()} className="bg-accent text-white"><Plus size={18} className="mr-2" /> Novo Produto</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(p => (
          <Card key={p.id} className="p-4">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-accent font-black">R$ {p.price.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedProduct(p); setShowRecipe(true); }}>Ficha</Button>
              <Button variant="outline" size="sm" onClick={() => handleOpenModal(p)}><Edit2 size={14} /></Button>
              <Button variant="outline" size="sm" className="text-red-500" onClick={() => deleteProduct(p.id).then(loadData)}><Trash2 size={14} /></Button>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl p-6 bg-white">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">{editingProduct ? 'Editar' : 'Novo'} Produto</h2>
              <Button variant="ghost" onClick={() => setShowModal(false)}><X size={24} /></Button>
            </div>

            <div className="space-y-4">
              <input type="text" placeholder="Nome" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preço</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-gray-200 border border-r-0 rounded-l text-sm">R$</span>
                    <input type="number" placeholder="0.00" className="flex-1 p-2 border rounded-r" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="p-2 bg-muted rounded font-bold flex items-center">Custo: R$ {formData.production_cost.toFixed(2)}</div>
              </div>

              <div className="p-2 bg-green-100 rounded font-bold text-green-800">
                Margem de Lucro: {formData.price > 0 ? ((formData.price - formData.production_cost) / formData.price * 100).toFixed(2) : 0}%
              </div>

              <div className="border p-4 rounded bg-accent/5">
                <p className="text-xs font-bold mb-2 uppercase">Adicionar à Ficha Técnica</p>
                <div className="flex flex-col gap-2">
                  <select 
                    className="w-full p-2 border rounded bg-white"
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
                    <option value="">Selecione um item...</option>
                    {ingredients && ingredients.length > 0 && (
                      <optgroup label="Insumos">
                        {ingredients.map(i => <option key={`ing:${i.id}`} value={`ing:${i.id}`}>{i.name} ({i.unit})</option>)}
                      </optgroup>
                    )}
                    {recipes && recipes.length > 0 && (
                      <optgroup label="Receitas">
                        {recipes.map(r => <option key={`rec:${r.id}`} value={`rec:${r.id}`}>{r.name} ({r.yieldUnit})</option>)}
                      </optgroup>
                    )}
                  </select>
                  <div className="flex gap-2">
                    <input type="number" className="w-24 p-2 border rounded" value={newIngredient.quantity} onChange={e => setNewIngredient({...newIngredient, quantity: parseFloat(e.target.value) || 0})} />
                    <select className="flex-1 p-2 border rounded" value={newIngredient.unit} onChange={e => setNewIngredient({...newIngredient, unit: e.target.value})}>
                      <option value="g">g</option><option value="kg">kg</option><option value="ml">ml</option><option value="l">L</option><option value="un">un</option>
                    </select>
                    <Button onClick={handleAddIngredient} className="bg-accent text-white"><Plus size={18} /></Button>
                  </div>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2">
                {formData.ingredients?.map((ing: any, idx: number) => (
                   <div key={idx} className="flex justify-between p-2 bg-muted rounded text-sm">
                     <span>{ing.ingredient_name} ({ing.quantity}{ing.unit})</span>
                     <div className="flex gap-2 items-center">
                       <span className="font-bold">R$ {ing.cost.toFixed(2)}</span>
                       <Button 
                         variant="ghost" 
                         size="sm"
                         className="text-red-500"
                         onClick={() => {
                           const ings = formData.ingredients.filter((_: any, i: number) => i !== idx);
                           setFormData({...formData, ingredients: ings, production_cost: ings.reduce((s: any, n: any) => s + n.total_cost, 0)});
                         }}
                       >
                         <Trash2 size={14} />
                       </Button>
                     </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={handleSaveProduct} className="bg-primary text-white px-8">Salvar</Button>
            </div>
          </Card>
        </div>
      )}

      {showRecipe && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Ficha: {selectedProduct.name}</h2>
              <Button variant="ghost" onClick={() => setShowRecipe(false)}><X size={24} /></Button>
            </div>
            <div className="space-y-2">
              {selectedProduct.ingredients?.map((ing: any, idx: number) => (
                <div key={idx} className="flex justify-between border-b pb-1">
                  <span>{ing.ingredient_name}</span>
                  <span>{ing.quantity}{ing.unit} - R$ {ing.cost.toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-4 font-bold text-lg flex justify-between">
                <span>Total:</span>
                <span className="text-accent">R$ {selectedProduct.production_cost.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
