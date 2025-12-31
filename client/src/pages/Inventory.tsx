import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, AlertTriangle, Eye } from 'lucide-react';
import ProductModal from '@/components/ProductModal';
import RecipeCard, { RecipeIngredient } from '@/components/RecipeCard';

interface InventoryProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  minQuantity: number;
  unit: string;
  status: 'good' | 'warning' | 'danger';
  ingredients: RecipeIngredient[];
}

const mockIngredients = [
  { id: 1, name: 'Farinha de Trigo', unit: 'kg', unitCost: 2.50 },
  { id: 2, name: 'Açúcar Cristal', unit: 'kg', unitCost: 4.30 },
  { id: 3, name: 'Ovos', unit: 'dúzia', unitCost: 28.00 },
  { id: 4, name: 'Manteiga', unit: 'kg', unitCost: 35.00 },
  { id: 5, name: 'Chocolate em Pó', unit: 'kg', unitCost: 52.00 },
  { id: 6, name: 'Fermento em Pó', unit: 'kg', unitCost: 18.00 },
];

export default function Inventory() {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [showRecipe, setShowRecipe] = useState(false);

  const [products, setProducts] = useState<InventoryProduct[]>([
    {
      id: 1,
      name: 'Bolo de Chocolate',
      description: 'Bolo de chocolate com cobertura de ganache',
      category: 'Bolos',
      price: 85.00,
      cost: 25.50,
      quantity: 12,
      minQuantity: 5,
      unit: 'unidade',
      status: 'good',
      ingredients: [
        { id: 1, ingredientId: 1, ingredientName: 'Farinha de Trigo', quantity: 0.3, unit: 'kg', unitCost: 2.50 },
        { id: 2, ingredientId: 5, ingredientName: 'Chocolate em Pó', quantity: 0.2, unit: 'kg', unitCost: 52.00 },
      ],
    },
    {
      id: 2,
      name: 'Cupcakes Variados',
      description: 'Cupcakes com diversos sabores',
      category: 'Cupcakes',
      price: 3.50,
      cost: 1.20,
      quantity: 48,
      minQuantity: 24,
      unit: 'unidade',
      status: 'good',
      ingredients: [
        { id: 3, ingredientId: 1, ingredientName: 'Farinha de Trigo', quantity: 0.05, unit: 'kg', unitCost: 2.50 },
        { id: 4, ingredientId: 3, ingredientName: 'Ovos', quantity: 0.1, unit: 'dúzia', unitCost: 28.00 },
      ],
    },
    {
      id: 3,
      name: 'Pão de Forma',
      description: 'Pão integral de forma',
      category: 'Pães',
      price: 12.00,
      cost: 3.50,
      quantity: 8,
      minQuantity: 4,
      unit: 'unidade',
      status: 'good',
      ingredients: [
        { id: 5, ingredientId: 1, ingredientName: 'Farinha de Trigo', quantity: 0.5, unit: 'kg', unitCost: 2.50 },
      ],
    },
    {
      id: 4,
      name: 'Croissant',
      description: 'Croissant francês tradicional',
      category: 'Croissants',
      price: 5.50,
      cost: 2.10,
      quantity: 20,
      minQuantity: 10,
      unit: 'unidade',
      status: 'good',
      ingredients: [
        { id: 6, ingredientId: 1, ingredientName: 'Farinha de Trigo', quantity: 0.1, unit: 'kg', unitCost: 2.50 },
        { id: 7, ingredientId: 4, ingredientName: 'Manteiga', quantity: 0.05, unit: 'kg', unitCost: 35.00 },
      ],
    },
  ]);

  const handleSaveProduct = (product: any) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...product, id: editingProduct.id, status: product.quantity >= product.minQuantity ? 'good' : 'warning' } : p));
    } else {
      setProducts([...products, { ...product, id: Math.max(...products.map(p => p.id), 0) + 1, status: product.quantity >= product.minQuantity ? 'good' : 'warning' }]);
    }
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      good: 'status-good',
      warning: 'status-warning',
      danger: 'status-danger',
    };
    return badges[status as keyof typeof badges] || 'status-good';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      good: 'Em Estoque',
      warning: 'Estoque Baixo',
      danger: 'Crítico',
    };
    return labels[status as keyof typeof labels] || 'Desconhecido';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Gestão de Estoque</h1>
          <p className="text-muted-foreground">Controle de produtos e fichas técnicas</p>
        </div>
        <Button
          className="flex items-center gap-2 bg-accent hover:bg-accent/90"
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
        >
          <Plus size={18} />
          Novo Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total de Produtos</p>
          <p className="text-2xl font-bold text-foreground">{products.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Estoque Baixo</p>
          <p className="text-2xl font-bold text-amber-600">{products.filter(p => p.status === 'warning').length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Crítico</p>
          <p className="text-2xl font-bold text-red-600">{products.filter(p => p.status === 'danger').length}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Produtos em Estoque</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Produto</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Categoria</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Quantidade</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Mínimo</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Preço</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Custo</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{product.name}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{product.category}</td>
                  <td className="text-center py-3 px-4 text-foreground">{product.quantity} {product.unit}</td>
                  <td className="text-center py-3 px-4 text-muted-foreground">{product.minQuantity} {product.unit}</td>
                  <td className="text-right py-3 px-4 font-semibold text-accent">R$ {product.price.toFixed(2)}</td>
                  <td className="text-right py-3 px-4 text-foreground">R$ {product.cost.toFixed(2)}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`status-badge ${getStatusBadge(product.status)}`}>
                      {getStatusLabel(product.status)}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowRecipe(true);
                        }}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent hover:text-accent/80"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowModal(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showRecipe && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Ficha Técnica - {selectedProduct.name}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRecipe(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>

              <RecipeCard
                productName={selectedProduct.name}
                ingredients={selectedProduct.ingredients}
                onAddIngredient={() => {}}
                onRemoveIngredient={() => {}}
                onEditIngredient={() => {}}
                availableIngredients={mockIngredients}
              />

              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Preço de Venda</p>
                    <p className="text-2xl font-bold text-accent">R$ {selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Lucro Unitário</p>
                    <p className="text-2xl font-bold text-green-600">R$ {(selectedProduct.price - selectedProduct.cost).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-6 border-t border-border mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowRecipe(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <ProductModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct as any}
        availableIngredients={mockIngredients}
      />

      {products.filter(p => p.status === 'danger').length > 0 && (
        <Card className="p-6 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Atenção - Produtos com Estoque Crítico</h3>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                Você tem {products.filter(p => p.status === 'danger').length} produto(s) com estoque crítico. Considere aumentar a produção ou verificar as fichas técnicas.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
