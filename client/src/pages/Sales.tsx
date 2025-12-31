import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Download } from 'lucide-react';

export default function Sales() {
  const [sales] = useState([
    { id: 1, date: '2024-12-30', product: 'Bolo de Chocolate', quantity: 2, unitPrice: 85.00, total: 170.00, payment: 'Dinheiro', status: 'completed' },
    { id: 2, date: '2024-12-30', product: 'Cupcakes Variados', quantity: 12, unitPrice: 3.50, total: 42.00, payment: 'Cartão', status: 'completed' },
    { id: 3, date: '2024-12-29', product: 'Pão de Forma', quantity: 5, unitPrice: 12.00, total: 60.00, payment: 'PIX', status: 'completed' },
    { id: 4, date: '2024-12-29', product: 'Croissant', quantity: 10, unitPrice: 5.50, total: 55.00, payment: 'Dinheiro', status: 'completed' },
    { id: 5, date: '2024-12-28', product: 'Bolo de Cenoura', quantity: 1, unitPrice: 75.00, total: 75.00, payment: 'Cartão', status: 'completed' },
  ]);

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Vendas</h1>
          <p className="text-muted-foreground">Histórico de transações e receitas</p>
        </div>
        <Button className="flex items-center gap-2 bg-accent hover:bg-accent/90">
          <Plus size={18} />
          Nova Venda
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total de Vendas</p>
          <p className="text-2xl font-bold text-foreground">R$ {totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Quantidade de Itens</p>
          <p className="text-2xl font-bold text-foreground">{totalQuantity}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Transações</p>
          <p className="text-2xl font-bold text-foreground">{sales.length}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Histórico de Vendas</h2>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download size={16} />
            Exportar
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Data</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Produto</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Qtd</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Preço Unit.</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Total</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Pagamento</th>
                <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-foreground text-sm">{sale.date}</td>
                  <td className="py-3 px-4 text-foreground font-medium">{sale.product}</td>
                  <td className="text-center py-3 px-4 text-foreground">{sale.quantity}</td>
                  <td className="text-right py-3 px-4 text-foreground">R$ {sale.unitPrice.toFixed(2)}</td>
                  <td className="text-right py-3 px-4 font-semibold text-accent">R$ {sale.total.toFixed(2)}</td>
                  <td className="text-center py-3 px-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {sale.payment}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
