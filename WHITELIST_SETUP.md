# Whitelist Setup - Controle de Acesso

Este documento descreve como configurar e usar o sistema de whitelist para controlar quem pode se registrar no sistema.

## O que é Whitelist?

A whitelist é uma lista de emails autorizados. Apenas pessoas com emails nessa lista podem criar uma conta no sistema.

## Passo 1: Executar a Migração SQL

Execute o arquivo `WHITELIST_MIGRATION.sql` no Supabase:

1. Acesse o Supabase (https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Clique em **New Query**
5. Copie o conteúdo de `WHITELIST_MIGRATION.sql`
6. Cole no editor e clique em **Run**

**Arquivo:** `WHITELIST_MIGRATION.sql`

```sql
-- Cria a tabela whitelisted_emails
-- Habilita RLS
-- Adiciona políticas de segurança
-- Insere os emails iniciais
```

## Passo 2: Adicionar Seus Emails

Após executar a migração, você precisa adicionar os emails da sua equipe.

### Opção A: Via Supabase (Recomendado)

1. No Supabase, vá para **Table Editor**
2. Selecione a tabela `whitelisted_emails`
3. Clique em **Insert row**
4. Digite o email e clique em **Save**

### Opção B: Via Aplicação

1. Faça login na aplicação com o primeiro email (o que foi adicionado na migração)
2. Vá para **Whitelist** (ícone de cadeado no menu)
3. Digite um email e clique em **Adicionar**
4. Repita para todos os emails da sua equipe

### Opção C: Via SQL

```sql
INSERT INTO whitelisted_emails (email) VALUES
  ('seu_email@example.com'),
  ('gerente@example.com'),
  ('vendedor@example.com')
ON CONFLICT (email) DO NOTHING;
```

## Passo 3: Testar

1. Logout da aplicação
2. Vá para a página de Login
3. Tente se registrar com um email **NÃO** na whitelist
   - Deve mostrar erro: "Este email não está autorizado para se registrar"
4. Tente se registrar com um email **NA** whitelist
   - Deve funcionar normalmente

## Gerenciar Whitelist

### Acessar a página de Whitelist

1. Faça login na aplicação
2. No menu lateral, clique em **Whitelist** (ícone de cadeado)
3. Você verá:
   - Lista de todos os emails autorizados
   - Campo para adicionar novos emails
   - Botão para remover emails

### Adicionar um novo email

1. Digite o email no campo **"Digite um email..."**
2. Clique em **+ Adicionar**
3. O email aparecerá na lista abaixo

### Remover um email

1. Encontre o email na lista
2. Clique no ícone **X** (vermelho) à direita
3. O email será removido da whitelist

### Copiar um email

1. Clique no ícone **Copiar** (próximo ao X)
2. O email será copiado para a área de transferência

## Estrutura do Banco de Dados

### Tabela: `whitelisted_emails`

```
id          | BIGSERIAL PRIMARY KEY
email       | TEXT UNIQUE NOT NULL
created_at  | TIMESTAMP DEFAULT NOW()
```

### Políticas de Segurança (RLS)

- **SELECT**: Qualquer pessoa pode ver (necessário para validar durante signup)
- **INSERT/UPDATE/DELETE**: Apenas usuários autenticados

## Arquivos Modificados

1. **`WHITELIST_MIGRATION.sql`** - Criação da tabela e configuração
2. **`src/lib/supabaseClient.ts`** - Funções de validação
3. **`src/contexts/AuthContext.tsx`** - Validação no signup
4. **`src/pages/Whitelist.tsx`** - Página de gerenciamento
5. **`src/App.tsx`** - Rota da página
6. **`src/components/Sidebar.tsx`** - Link no menu

## Troubleshooting

### Erro: "Este email não está autorizado para se registrar"

**Solução:** O email não está na tabela `whitelisted_emails`. Adicione-o via Supabase ou via aplicação.

### Erro: "Tabela whitelisted_emails não existe"

**Solução:** Execute a migração SQL (`WHITELIST_MIGRATION.sql`) no Supabase.

### Não consigo acessar a página de Whitelist

**Solução:** 
1. Verifique se está logado
2. Verifique se seu email está na whitelist
3. O sistema só permite gerenciar whitelist para usuários autenticados

### Quero permitir convites por código em vez de whitelist

Veja a sugestão anterior sobre "Invite Codes" em `README.md`.

## Segurança

- ✅ Emails são únicos (não há duplicatas)
- ✅ Validação acontece no backend (seguro)
- ✅ RLS protege a tabela
- ✅ Tokens são limpados após logout
- ✅ Apenas usuários autenticados podem gerenciar whitelist

## Próximos Passos

1. Execute a migração SQL
2. Adicione os emails da sua equipe
3. Teste o login com um email não autorizado
4. Teste o login com um email autorizado
5. Use a página de Whitelist para adicionar mais usuários conforme necessário

---

**Última atualização:** 04/01/2026
