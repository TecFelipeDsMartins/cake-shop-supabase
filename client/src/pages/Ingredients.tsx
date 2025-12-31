import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';

interface Ingredient {
  id: number;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  unitCost: number;
  supplier: string;
  status: 'good' | 'warning' | 'danger';
}

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: 'Farinha de Trigo', category: 'Farinhas', unit: 'kg', quantity: 25, minQuantity: 20, unitCost: 2.50, supplier: 'Moinho XYZ', status: 'good' },
    { id: 2, name: 'Açúcar Cristal', category: 'Açúcares', unit: 'kg', quantity: 15, minQuantity: 30, unitCost: 4.30, supplier: 'Açúcar Brasil', status: 'warning' },
    { id: 3, name: 'Ovos', category: 'Proteínas', unit: 'dúzia', quantity: 5, minQuantity: 10, unitCost: 28.00, supplier: 'Granja Local', status: 'danger' },
    { id: 4, name: 'Manteiga', category: 'Laticínios', unit: 'kg', quantity: 12, minQuantity: 10, unitCost: 35.00, supplier: 'Laticínios Premium', status: 'good' },
    { id: 5, name: 'Chocolate em Pó', category: 'Chocolates', unit: 'kg', quantity: 8, minQuantity: 5, unitCost: 52.00, supplier: 'Chocolates Finos', status: 'good' },
    { id: 6, name: 'Fermento em Pó', category: 'Fermentos', unit: 'kg', quantity: 3, minQuantity: 2, unitCost: 18.00, supplier: 'Química Brasil', status: 'good' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    quantity: 0,
    minQuantity: 0,
    unitCost: 0,
    supplier: '',
  });

  const categories = ['Farinhas', 'Açúcares', 'Proteínas', 'Laticínios', 'Chocolates', 'Fermentos', 'Aromatizantes', 'Corantes'];
  const units = ['kg', 'g', 'L', 'ml', 'dúzia', 'unidade', 'pacote'];

  const handleOpenModal = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingId(ingredient.id);
      setFormData({
        name: ingredient.name,
        category: ingredient.category,
        unit: ingredient.unit,
        quantity: ingredient.quantity,
        minQuantity: ingredient.minQuantity,
        unitCost: ingredient.unitCost,
        supplier: ingredient.supplier,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: '',
        unit: '',
        quantity: 0,
        minQuantity: 0,
        unitCost: 0,
        supplier: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.category || !formData.unit) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingId) {
      setIngredients(ingredients.map(ing => 
        ing.id === editingId 
          ? { ...ing, ...formData }
          : ing
      ));
    } else {
      const newIngredient: Ingredient = {
        id: Math.max(...ingredients.map(i => i.id), 0) + 1,
        ...formData,
        status: formData.quantity >= formData.minQuantity ? 'good' : formData.quantity > formData.minQuantity * 0.5 ? 'warning' : 'danger',
      };
      setIngredients([...ingredients, newIngredient]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este insumo?')) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
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

  const totalValue = ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.unitCost), 0);
  const criticalItems = ingredients.filter(ing => ing.status === 'danger').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Gestão de Insumos</h1>
          <p className="text-muted-foreground">Controle de matérias-primas e ingredientes</p>
        </div>
        <Button 
          className="flex items-center gap-2 bg-accent hover:bg-accent/90"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} />
          Novo Insumo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total de Insumos</p>
          <p className="text-2xl font-bold text-foreground">{ingredients.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
          <p className="text-2xl font-bold text-accent">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Estoque Baixo</p>
          <p className="text-2xl font-bold text-amber-600">{ingredients.filter(ing => ing.status === 'warning').length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Crítico</p>
          <p className="text-2xl font-bold text-red-600">{criticalItems}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Insumos Cadastrados</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Insumo</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Categoria</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Quantidade</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Mínimo</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Custo Unit.</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Total</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Fornecedor</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{ingredient.name}</td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">{ingredient.category}</td>
                  <td className="text-center py-3 px-4 text-foreground">{ingredient.quantity} {ingredient.unit}</td>
                  <td className="text-center py-3 px-4 text-muted-foreground">{ingredient.minQuantity} {ingredient.unit}</td>
                  <td className="text-right py-3 px-4 text-foreground">R$ {ingredient.unitCost.toFixed(2)}</td>
                  <td className="text-right py-3 px-4 font-semibold text-accent">R$ {(ingredient.quantity * ingredient.unitCost).toFixed(2)}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`status-badge ${getStatusBadge(ingredient.status)}`}>
                      {getStatusLabel(ingredient.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{ingredient.supplier}</td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-accent hover:text-accent/80"
                        onClick={() => handleOpenModal(ingredient)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(ingredient.id)}
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

      {criticalItems > 0 && (
        <Card className="p-6 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Atenção - Insumos Críticos</h3>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                Você tem {criticalItems} insumo(s) com estoque crítico. Considere fazer um pedido urgente de reabastecimento.
              </p>
            </div>
          </div>
        </Card>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingId ? 'Editar Insumo' : 'Novo Insumo'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nome do Insumo *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Ex: Farinha de Trigo"
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

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Unidade *</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="">Selecione uma unidade</option>
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Quantidade Atual</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Quantidade Mínima</label>
                    <input
                      type="number"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Custo Unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitCost}
                      onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">Fornecedor</label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-accent hover:bg-accent/90"
                    onClick={handleSave}
                  >
                    {editingId ? 'Atualizar' : 'Criar'} Insumo
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
