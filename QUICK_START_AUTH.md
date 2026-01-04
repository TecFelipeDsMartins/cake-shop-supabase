# Quick Start - Autenticação

## ⚡ 3 Passos para Ativar

### 1️⃣ Executar Migration (5 min)

```
1. Abrir: https://supabase.com/dashboard
2. Projeto → SQL Editor → New Query
3. Copiar todo conteúdo de: supabase_migration_v3_auth.sql
4. Colar no editor
5. Clicar: Run
6. Pronto!
```

### 2️⃣ Testar Localmente (2 min)

```bash
npm run dev
# Abrir http://localhost:5173/login
```

### 3️⃣ Pronto! 🎉

## 🧪 Teste Rápido

1. Clique **Cadastrar**
2. Email: `teste@exemplo.com`
3. Senha: `senha123`
4. Clique **Cadastrar**
5. Fazer login
6. Criar um ingrediente
7. Clique **Sair**
8. Abrir nova aba (anônimo)
9. Fazer login com **outro email**
10. Verifique que ingredientes são diferentes ✅

## 📋 Arquivos para Revisar

```
✅ src/contexts/AuthContext.tsx          - Lógica de auth
✅ src/pages/Login.tsx                   - Página de login
✅ src/components/ProtectedRoute.tsx     - Proteção de rotas
✅ supabase_migration_v3_auth.sql        - SQL (executar no Supabase)
```

## 🐛 Se Algo Não Funcionar

1. F12 → Console → Ver erros
2. Confirmar migration foi executada
3. Conferir se RLS está habilitado (Dashboard → Tables → Cada tabela)

## 🚀 Deploy

Mesmos passos. Migration rodará uma vez, RLS fica ativo para sempre.

---

**Tempo total**: ~10 minutos para estar 100% funcional
