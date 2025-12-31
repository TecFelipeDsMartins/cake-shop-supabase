import { useState } from 'react';
import { Link } from 'wouter';
import { Menu, X, BarChart3, Package, ShoppingCart, DollarSign, FileText, LogOut, Leaf, Tag, BookOpen, Wallet, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/recipes', label: 'Receitas', icon: BookOpen },
    { path: '/ingredients', label: 'Insumos', icon: Leaf },
    { path: '/inventory', label: 'Estoque', icon: Package },
    { path: '/sales', label: 'Vendas', icon: ShoppingCart },
    { path: '/customers', label: 'Clientes', icon: Users },
    { path: '/finances', label: 'Finanças', icon: DollarSign },
    { path: '/reports', label: 'Relatórios', icon: FileText },
    { path: '/accounts', label: 'Contas', icon: Wallet },
    { path: '/categories', label: 'Categorias', icon: Tag },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-card"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border
          transform transition-transform duration-300 z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:relative lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold text-sidebar-primary">🎂 Cake Shop</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Gestão Financeira & Estoque</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors block
                  ${
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-4 right-4">
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => {
              // TODO: Implement logout
              console.log('Logout');
            }}
          >
            <LogOut size={18} />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
