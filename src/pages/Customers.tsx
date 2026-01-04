import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, User, Cake, RefreshCw } from 'lucide-react';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, getCustomerOrigins } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface Customer {
   id?: number;
   name: string;
   email?: string;
   phone?: string;
   address?: string;
   city?: string;
   state?: string;
   zip_code?: string;
   birth_date?: string;
   notes?: string;
   origin_id?: number | null;
   created_at?: string;
   total_purchases?: number;
   last_purchase_date?: string;
 }

export default function Customers() {
   const [showModal, setShowModal] = useState(false);
   const [editingId, setEditingId] = useState<number | null>(null);
   const [searchTerm, setSearchTerm] = useState('');
   const [customers, setCustomers] = useState<Customer[]>([]);
   const [origins, setOrigins] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [formData, setFormData] = useState<Customer>({
     name: '',
     email: '',
     phone: '',
     address: '',
     city: '',
     state: '',
     zip_code: '',
     birth_date: '',
     notes: '',
     origin_id: null,
   });

   // Carregar clientes e origens do Supabase
   useEffect(() => {
     loadData();
   }, []);

   async function loadData() {
     setLoading(true);
     try {
       const [customersData, originsData] = await Promise.all([
         getCustomers(),
         getCustomerOrigins()
       ]);
       setCustomers(customersData);
       setOrigins(originsData || []);
     } catch (error) {
       console.error('Erro ao carregar dados:', error);
       toast.error('Erro ao carregar clientes');
     }
     setLoading(false);
   }

   async function loadCustomers() {
     await loadData();
   }

  function handleOpenModal(customer?: Customer) {
    if (customer) {
      setEditingId(customer.id || null);
      setFormData(customer);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        birth_date: '',
        notes: '',
      });
    }
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }

    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
        toast.success('Cliente atualizado com sucesso');
      } else {
        await addCustomer(formData);
        toast.success('Cliente adicionado com sucesso');
      }
      setShowModal(false);
      loadCustomers();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente');
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Tem certeza que deseja deletar este cliente?')) {
      try {
        await deleteCustomer(id);
        toast.success('Cliente deletado com sucesso');
        loadCustomers();
      } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        toast.error('Erro ao deletar cliente');
      }
    }
  }

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  // Calcular aniversariantes do mês
  const currentMonth = new Date().getMonth();
  const birthdaysThisMonth = filteredCustomers.filter(c => {
    if (!c.birth_date) return false;
    const birthMonth = new Date(c.birth_date).getMonth();
    return birthMonth === currentMonth;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw size={18} />
          </Button>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Aniversariantes do Mês */}
      {birthdaysThisMonth.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center gap-2 mb-4">
            <Cake className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-900">Aniversariantes do Mês</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {birthdaysThisMonth.map(customer => (
              <div key={customer.id} className="bg-white rounded-lg p-3 border border-amber-100">
                <p className="font-medium text-foreground">{customer.name}</p>
                <p className="text-sm text-muted-foreground">
                   {customer.birth_date && new Date(customer.birth_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                 </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Busca */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Buscar cliente por nome, email ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground"
        />
      </div>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum cliente encontrado</p>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <Card key={customer.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">{customer.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(customer)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => customer.id && handleDelete(customer.id)}
                      className="p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>

                {customer.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {customer.email}
                  </div>
                )}

                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {customer.phone}
                  </div>
                )}

                {customer.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {customer.address}, {customer.city}
                  </div>
                )}

                {customer.birth_date && (
                   <div className="text-xs text-muted-foreground">
                     Aniversário: {new Date(customer.birth_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                   </div>
                 )}

                {customer.notes && (
                  <div className="text-xs bg-muted p-2 rounded text-foreground">
                    {customer.notes}
                  </div>
                )}

                <div className="text-xs text-muted-foreground border-t border-border pt-2">
                  Total de compras: R$ {(customer.total_purchases || 0).toFixed(2)}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {editingId ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              />

              <input
                type="tel"
                placeholder="Telefone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              />

              <input
                type="text"
                placeholder="Endereço"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Cidade"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="px-3 py-2 border border-border rounded bg-background text-foreground"
                />
                <input
                  type="text"
                  placeholder="UF"
                  maxLength={2}
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  className="px-3 py-2 border border-border rounded bg-background text-foreground"
                />
              </div>

              <input
                type="text"
                placeholder="CEP"
                value={formData.zip_code || ''}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              />

              <input
                type="date"
                placeholder="Data de Aniversário"
                value={formData.birth_date || ''}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              />

              <select
                value={formData.origin_id ? String(formData.origin_id) : ''}
                onChange={(e) => setFormData({ ...formData, origin_id: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
              >
                <option value="">Selecione uma origem...</option>
                {origins.map(origin => (
                  <option key={origin.id} value={origin.id}>{origin.name}</option>
                ))}
              </select>

              <textarea
                placeholder="Notas"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded bg-background text-foreground"
                rows={3}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingId ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
