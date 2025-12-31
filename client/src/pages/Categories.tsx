import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  type: 'ingredient' | 'product' | 'expense' | 'payment';
  description: string;
  color: string;
}

export default function Categories() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<'ingredient' | 'product' | 'expense' | 'payment'>('ingredient');

  const [categories, setCategories] = useState<Category[]>([
    // Insumos
    { id: 1, name: 'Farinhas', type: 'ingredient', description: 'Farinha de trigo, milho, etc', color: '#D4A574' },
    { id: 2, name: 'Açúcares', type: 'ingredient', description: 'Açúcar cristal, demerara, etc', color: '#C19A6B' },
    { id: 3, name: 'Ovos', type: 'ingredient', description: 'Ovos frescos', color: '#E8B4C8' },
    { id: 4, name: 'Leite e Derivados', type: 'ingredient', description: 'Leite, manteiga, queijo', color: '#F5E6D3' },
    
    // Produtos
    { id: 5, name: 'Bolos', type: 'product', description: 'Bolos diversos', color: '#8B6F47' },
    { id: 6, name: 'Cupcakes', type: 'product', description: 'Cupcakes variados', color: '#A0826D' },
    { id: 7, name: 'Pães', type: 'product', description: 'Pão de forma, francês, etc', color: '#9B8B7E' },
    
    // Despesas
    { id: 8, name: 'Aluguel', type: 'expense', description: 'Aluguel do espaço', color: '#E74C3C' },
    { id: 9, name: 'Utilidades', type: 'expense', description: 'Água, luz, gás', color: '#E67E22' },
    { id: 10, name: 'Embalagem', type: 'expense', description: 'Caixas, sacolas, papel', color: '#F39C12' },
    
    // Métodos de Pagamento
    { id: 11, name: 'Dinheiro', type: 'payment', description: 'Pagamento em dinheiro', color: '#27AE60' },
    { id: 12, name: 'Cartão', type: 'payment', description: 'Cartão de débito/crédito', color: '#3498DB' },
    { id: 13, name: 'Pix', type: 'payment', description: 'Transferência via Pix', color: '#9B59B6' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#D4A574',
  });

  const typeLabels = {
    ingredient: 'Insumos',
    product: 'Produtos',
    expense: 'Despesas',
    payment: 'Métodos de Pagamento',
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setSelectedType(category.type);
      setFormData({
        name: category.name,
        description: category.description,
        color: category.color,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        color: '#D4A574',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Nome da categoria é obrigatório');
      return;
    }

    if (editingId) {
      setCategories(categories.map(cat =>
        cat.id === editingId
          ? { ...cat, ...formData, type: selectedType }
          : cat
      ));
    } else {
      const newCategory: Category = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        ...formData,
        type: selectedType,
      };
      setCategories([...categories, newCategory]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta categoria?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const groupedCategories = {
    ingredient: categories.filter(c => c.type === 'ingredient'),
    product: categories.filter(c => c.type === 'product'),
    expense: categories.filter(c => c.type === 'expense'),
    payment: categories.filter(c => c.type === 'payment'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Gerenciar Categorias</h1>
          <p className="text-muted-foreground">Organize insumos, produtos, despesas e métodos de pagamento</p>
        </div>
        <Button
          className="flex items-center gap-2 bg-accent hover:bg-accent/90"
          onClick={() => handleOpenModal()}
        >
          <Plus size={18} />
          Nova Categoria
        </Button>
      </div>

      {Object.entries(typeLabels).map(([type, label]) => (
        <div key={type}>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Tag size={24} className="text-accent" />
            {label}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedCategories[type as keyof typeof groupedCategories].map((category) => (
              <Card key={category.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-accent hover:text-accent/80"
                    onClick={() => handleOpenModal(category)}
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}

            {groupedCategories[type as keyof typeof groupedCategories].length === 0 && (
              <Card className="p-8 col-span-full flex items-center justify-center text-center">
                <p className="text-muted-foreground">Nenhuma categoria neste tipo</p>
              </Card>
            )}
          </div>
        </div>
      ))}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tipo de Categoria *</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="ingredient">Insumos</option>
                    <option value="product">Produtos</option>
                    <option value="expense">Despesas</option>
                    <option value="payment">Métodos de Pagamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome da Categoria *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Ex: Farinhas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    rows={3}
                    placeholder="Descrição da categoria"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Cor</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#D4A574', '#8B6F47', '#C19A6B', '#A0826D', '#9B8B7E', '#E8B4C8', '#F5E6D3', '#E74C3C', '#E67E22', '#F39C12', '#27AE60', '#3498DB', '#9B59B6'].map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg transition-transform ${
                          formData.color === color ? 'ring-2 ring-offset-2 ring-accent scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
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
                    {editingId ? 'Atualizar' : 'Criar'} Categoria
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
