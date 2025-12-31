import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
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
}

interface Ingredient {
  id?: number;
  name: string;
  unit?: string;
  cost: number;
  is_processed?: boolean;
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
    } else {
      setEditingProduct(null);
    }
    setShowModal(true);
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
              <th className="text-left py-3 px-4 font-semibold text-foreground">Produto</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Preço</th>
              <th className="text-right py-3 px-4 font-semibold text-foreground">Custo</th>
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
