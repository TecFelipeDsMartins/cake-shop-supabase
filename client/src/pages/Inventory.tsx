import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';

export default function Inventory() {
  const [products] = useState([
    { id: 1, name: 'Farinha de Trigo', quantity: 25, minQuantity: 20, unit: 'kg', cost: 45.00, status: 'good' },
    { id: 2, name: 'Açúcar Cristal', quantity: 15, minQuantity: 30, unit: 'kg', cost: 65.00, status: 'warning' },
    { id: 3, name: 'Ovos', quantity: 5, minQuantity: 10, unit: 'dúzia', cost: 28.00, status: 'danger' },
    { id: 4, name: 'Manteiga', quantity: 12, minQuantity: 10, unit: 'kg', cost: 35.00, status: 'good' },
    { id: 5, name: 'Chocolate em Pó', quantity: 8, minQuantity: 5, unit: 'kg', cost: 52.00, status: 'good' },
  ]);

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
          <p className="text-muted-foreground">Controle de ingredientes e produtos</p>
        </div>
        <Button className="flex items-center gap-2 bg-accent hover:bg-accent/90">
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
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Quantidade</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Mínimo</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Custo Unit.</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{product.name}</td>
                  <td className="text-center py-3 px-4 text-foreground">{product.quantity} {product.unit}</td>
                  <td className="text-center py-3 px-4 text-muted-foreground">{product.minQuantity} {product.unit}</td>
                  <td className="text-center py-3 px-4 text-foreground">R$ {product.cost.toFixed(2)}</td>
                  <td className="text-center py-3 px-4">
                    <span className={`status-badge ${getStatusBadge(product.status)}`}>
                      {getStatusLabel(product.status)}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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

      <Card className="p-6 border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">Atenção</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Você tem 1 produto com estoque crítico e 1 com estoque baixo. Considere fazer um pedido de reabastecimento.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
