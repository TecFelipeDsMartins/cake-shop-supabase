# 🔐 SETUP AUTH AGORA - 5 MINUTOS

## ⚡ Execute Isto

### 1. Abra Supabase Dashboard
https://supabase.com/dashboard → Seu Projeto

### 2. SQL Editor
Painel Esquerdo → **SQL Editor** → **New Query**

### 3. Copy-Paste
Abrir arquivo: `supabase_migration_v3_auth.sql`
Copiar TUDO
Colar no editor SQL

### 4. Executar
Botão **Run** 
Aguarde ✓ Success

### 5. Pronto ✅

## 🧪 Testar

```bash
npm run dev
```

Acesse: http://localhost:5173/login

- Cadastre: teste@email.com / senha
- Crie um ingrediente
- Logout
- Outra aba anônima
- Signup com outro email
- Verifique isolamento ✅

## 📁 Arquivos Criados

Frontend:
- src/contexts/AuthContext.tsx
- src/hooks/useAuth.ts
- src/pages/Login.tsx
- src/components/ProtectedRoute.tsx

Backend:
- supabase_migration_v3_auth.sql

Docs:
- AUTH_SETUP_GUIDE.md
- AUTH_IMPLEMENTATION_SUMMARY.md
- AUTH_COMPLETE.md

## 🔧 Modificado

- src/App.tsx
- src/components/Sidebar.tsx
- src/lib/supabaseClient.ts

## ✅ Pronto!

É só isso. Após migration:
- Login/Signup funciona
- Logout funciona
- Dados isolados
- RLS ativo
- Production ready

---

**Tempo**: 5 min para migration + 2 min para testar = 7 min total
