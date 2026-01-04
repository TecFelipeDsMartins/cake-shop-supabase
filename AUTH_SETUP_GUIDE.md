# Guia de Configuração: Autenticação com Supabase Auth

Este documento descreve os passos para configurar completamente o sistema de autenticação.

## Etapa 1: Habilitar Supabase Auth no Painel

1. Acesse o painel do Supabase: https://supabase.com
2. Selecione seu projeto
3. Vá para **Authentication** → **Providers**
4. Certifique-se de que **Email** está habilitado (padrão)
5. Ative confirmação de email se desejar (recomendado para produção)

## Etapa 2: Executar Migration v3 (RLS + user_id)

### Via Supabase Dashboard:

1. Acesse seu projeto no Supabase
2. Vá para **SQL Editor**
3. Clique em **New Query**
4. Copie todo o conteúdo do arquivo `supabase_migration_v3_auth.sql`
5. Cole no SQL Editor
6. Clique em **Run**
7. Aguarde a conclusão

### Ou via Supabase CLI (terminal):

```bash
# Se você tem Supabase CLI instalado
supabase db push
```

## Etapa 3: O que a Migration Faz

- Adiciona coluna `user_id` (UUID) em todas as tabelas principais
- Cria índices para melhor performance
- Ativa RLS (Row Level Security) em todas as tabelas
- Cria políticas para isolar dados por usuário autenticado

### Tabelas Afetadas:
- `ingredients`
- `recipes`
- `products`
- `sales`
- `technical_sheets`
- `ingredient_categories`
- `product_categories`
- `customers`

## Etapa 4: Como Funciona (RLS)

Com RLS habilitado, cada usuário:
- ✅ Vê apenas seus próprios dados
- ✅ Pode inserir novos itens (com seu `user_id` automático)
- ✅ Pode editar apenas seus itens
- ✅ Pode deletar apenas seus itens
- ❌ Não vê dados de outros usuários

## Etapa 5: Novo Fluxo de Uso

### Login
1. Novo usuário acessa `/login`
2. Clica em "Cadastrar"
3. Insere email e senha
4. Receberá confirmação por email (se ativado)

### Uso
1. Usuário entra em `/login`
2. Sistema valida autenticação
3. Usuário acessa dashboard e funcionalidades
4. Dados são isolados por `user_id`

### Logout
1. Clica no botão "Sair" na sidebar
2. É redirecionado para `/login`

## Etapa 6: Variáveis de Ambiente

Certifique-se que seu `.env.local` contém:

```
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

## Etapa 7: Testar

1. Execute `npm run dev` (ou seu comando de dev)
2. Acesse http://localhost:5173/login
3. Cadastre uma nova conta (ex: teste@exemplo.com)
4. Faça login
5. Crie um ingrediente/receita
6. Em outro navegador anônimo, faça login com outro usuário
7. Verifique que os dados estão isolados

## Troubleshooting

### Erro: "Users must be authenticated"
- Migration v3 foi executada?
- Usuário está autenticado?

### Erro: "permission denied"
- Verifique se RLS está habilitado para a tabela
- Verifique as políticas de RLS

### Dados antigos desaparecem
- Dados criados antes da migration não têm `user_id`
- Você pode fazer um UPDATE manual:
```sql
UPDATE ingredients SET user_id = 'seu-user-id-aqui' WHERE user_id IS NULL;
```

### Supabase Dashboard vê os dados mas API não
- Dashboard ignora RLS por padrão
- Isso é esperado e seguro
- API respeita RLS corretamente

## Rollback (Se necessário)

Se precisar reverter a migration:

```sql
-- Desabilitar RLS (remove proteção)
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
-- ... repetir para outras tabelas

-- Remover colunas user_id (CUIDADO - isso apaga os dados!)
-- ALTER TABLE ingredients DROP COLUMN user_id;
-- ... repetir para outras tabelas
```

## Próximos Passos

- [ ] Executar migration v3
- [ ] Testar login/cadastro
- [ ] Testar isolamento de dados
- [ ] Deploy em produção
- [ ] Configurar email de verificação (opcional)
- [ ] Adicionar OAuth (Google, GitHub) (opcional)

## Dúvidas?

Se encontrar problemas:
1. Verifique os logs do navegador (F12)
2. Verifique os logs do Supabase Dashboard
3. Consulte a documentação: https://supabase.com/docs/guides/auth
