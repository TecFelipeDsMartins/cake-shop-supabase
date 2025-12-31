import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, User } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  createdAt: string;
  totalPurchases: number;
  lastPurchase?: string;
}

export default function Customers() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      name: 'Maria Silva',
      email: 'maria@email.com',
      phone: '(11) 98765-4321',
      address: 'Rua A, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      notes: 'Cliente VIP',
      createdAt: '2024-01-15',
      totalPurchases: 12,
      lastPurchase: '2024-12-28',
    },
    {
      id: 2,
      name: 'João Santos',
      email: 'joao@email.com',
      phone: '(11) 99876-5432',
      address: 'Rua B, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '02345-678',
      notes: 'Compras regulares',
      createdAt: '2024-02-20',
      totalPurchases: 8,
      lastPurchase: '2024-12-25',
    },
    {
      id: 3,
      name: 'Ana Costa',
      email: 'ana@email.com',
      phone: '(11) 97654-3210',
      address: 'Rua C, 789',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '03456-789',
      notes: 'Pedidos para eventos',
      createdAt: '2024-03-10',
      totalPurchases: 5,
      lastPurchase: '2024-12-20',
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        notes: customer.notes || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Nome do cliente é obrigatório');
      return;
    }

    if (editingId) {
      setCustomers(customers.map(c =>
        c.id === editingId
          ? { ...c, ...formData }
          : c
      ));
    } else {
      const newCustomer: Customer = {
        id: Math.max(...customers.map(c => c.id), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        totalPurchases: 0,
      };
      setCustomers([...customers, newCustomer]);
    }

    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja deletar este cliente?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const totalCustomers = customers.length;
  const totalPurchases = customers.reduce((sum, c) => sum + c.totalPurchases, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerenciar base de clientes</p>
        </div>
        <Button
          className="bg-accent hover:bg-accent/90"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} className="mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total de Clientes</p>
          <p className="text-2xl font-bold text-foreground">{totalCustomers}</p>
          <p className="text-xs text-muted-foreground mt-2">Cadastrados no sistema</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total de Compras</p>
          <p className="text-2xl font-bold text-accent">{totalPurchases}</p>
          <p className="text-xs text-muted-foreground mt-2">Transações registradas</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Ticket Médio</p>
          <p className="text-2xl font-bold text-foreground">
            {totalPurchases > 0 ? (totalPurchases / totalCustomers).toFixed(1) : '0'}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Compras por cliente</p>
        </Card>
      </div>

      {/* Busca */}
      <Card className="p-4">
        <input
          type="text"
          placeholder="Buscar por nome, email ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </Card>

      {/* Lista de Clientes */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Clientes Cadastrados</h2>
        
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8">
            <User size={48} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Telefone</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Cidade</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-sm">Compras</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm">Última Compra</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-sm">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{customer.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{customer.email || '-'}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{customer.phone || '-'}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{customer.city || '-'}</td>
                    <td className="py-3 px-4 text-center text-sm font-semibold text-accent">{customer.totalPurchases}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-accent hover:text-accent/80"
                          onClick={() => handleOpenModal(customer)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(customer.id)}
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
        )}
      </Card>

      {/* Modal de Cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {editingId ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Nome completo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Telefone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Endereço</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Rua, número"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Cidade</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">CEP</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="01234-567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Observações</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Adicione observações sobre o cliente"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-border">
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
                    {editingId ? 'Atualizar' : 'Criar'} Cliente
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
