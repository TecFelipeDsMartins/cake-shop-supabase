# 🎂 Cake Shop - Sistema de Gestão Financeira e Estoque

Um sistema web completo de código aberto para gerenciar finanças e estoque de uma confeitaria. Construído com **Next.js**, **React 19**, **Tailwind CSS 4** e **Supabase**.

## ✨ Características Principais

### 📊 Dashboard
- Visão geral de métricas principais (receita, vendas, estoque)
- Gráficos de vendas e receita por dia
- Produtos mais vendidos
- Alertas de estoque baixo

### 📦 Gestão de Estoque
- Controle de ingredientes e produtos
- Alertas de estoque crítico
- Histórico de quantidade
- Custo unitário por produto

### 💰 Vendas
- Registro de transações
- Histórico completo de vendas
- Métodos de pagamento
- Exportação de dados

### 💵 Finanças
- Controle de receitas e despesas
- Análise de lucro líquido
- Distribuição de despesas (gráfico pizza)
- Margem de lucro

### 📈 Relatórios
- Desempenho mensal
- Análise de produtos
- Tendências de lucro
- Exportação em PDF

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Banco de Dados**: Supabase (PostgreSQL)
- **Gráficos**: Recharts
- **Roteamento**: Wouter
- **Build**: Vite
- **Hospedagem**: Manus (ou qualquer servidor Node.js)

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- pnpm (ou npm/yarn)
- Conta Supabase (gratuita em https://supabase.com)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/cake-shop-supabase.git
cd cake-shop-supabase
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

Você pode obter essas credenciais em:
- Acesse https://supabase.com
- Crie um novo projeto ou selecione um existente
- Vá para **Settings > API**
- Copie o **Project URL** e a chave **anon public**

4. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📋 Configuração do Banco de Dados

### Criar Tabelas no Supabase

Execute o seguinte SQL no editor SQL do Supabase:

```sql
-- Tabela de Produtos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Estoque
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  min_quantity DECIMAL(10, 2),
  unit TEXT,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Tabela de Vendas
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  sale_date DATE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Despesas
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📁 Estrutura do Projeto

```
cake-shop-supabase/
├── client/
│   ├── public/
│   │   └── images/          # Imagens do projeto
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── lib/             # Utilitários e configurações
│   │   ├── contexts/        # React contexts
│   │   ├── App.tsx          # Componente raiz
│   │   ├── main.tsx         # Entrada da aplicação
│   │   └── index.css        # Estilos globais
│   ├── index.html           # HTML principal
│   └── package.json
├── server/                  # Servidor Express (placeholder)
├── shared/                  # Tipos compartilhados
└── README.md
```

## 🎨 Design

O sistema utiliza um design **Warm Minimalism** com:

- **Paleta de Cores**: Tons quentes (creme, chocolate profundo, âmbar ouro, rose blush)
- **Tipografia**: Playfair Display para títulos + Inter para corpo
- **Componentes**: shadcn/ui com customizações
- **Responsividade**: Mobile-first, totalmente responsivo

## 🔐 Segurança

- Credenciais do Supabase armazenadas em variáveis de ambiente
- Chave pública (anon) usada apenas no frontend
- Sem exposição de dados sensíveis

## 📱 Funcionalidades Futuras

- [ ] Autenticação de usuários
- [ ] Múltiplos usuários/permissões
- [ ] Integração com sistemas de pagamento
- [ ] Notificações de estoque baixo
- [ ] Backup automático de dados
- [ ] Aplicativo mobile (React Native)
- [ ] API REST completa
- [ ] Integração com WhatsApp/Email

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para detalhes.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte a documentação do Supabase: https://supabase.com/docs
- Verifique a documentação do React: https://react.dev

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend como serviço
- [shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Recharts](https://recharts.org) - Gráficos
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

**Desenvolvido com ❤️ para confeitarias**

Última atualização: Dezembro 2024
