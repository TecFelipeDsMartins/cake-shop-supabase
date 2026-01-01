# Guia: Como Fazer Push no GitHub

## Passo 1: Gerar um Personal Access Token (PAT)

### No GitHub.com:

1. **Acesse sua conta GitHub**
   - Vá para: https://github.com/login
   - Faça login com suas credenciais

2. **Abra as Configurações de Desenvolvedor**
   - Clique na sua foto de perfil (canto superior direito)
   - Selecione **Settings** (Configurações)
   - Na barra lateral esquerda, clique em **Developer settings**
   - Clique em **Personal access tokens**
   - Clique em **Tokens (classic)**

3. **Crie um novo token**
   - Clique em **Generate new token**
   - Clique em **Generate new token (classic)**

4. **Configure o token**
   - **Note**: Digite algo como "Cake Shop Push"
   - **Expiration**: Selecione "30 days" (ou outro período)
   - **Scopes**: Marque apenas:
     - ✅ `repo` (acesso completo ao repositório)
   
5. **Copie o token**
   - Clique em **Generate token**
   - **IMPORTANTE**: Copie o token que aparece (você só verá uma vez!)
   - Guarde em um lugar seguro

## Passo 2: Fazer o Push

### No seu terminal/linha de comando:

```bash
cd /tmp/cake-shop-work
git push origin main
```

Quando pedir:
- **Username**: `TecFelipeDsMartins`
- **Password**: Cole o token que você copiou

## Alternativa: Usar SSH (mais seguro)

Se preferir usar SSH em vez de HTTPS:

1. **Gere uma chave SSH** (se não tiver):
   ```bash
   ssh-keygen -t ed25519 -C "seu-email@example.com"
   ```

2. **Adicione a chave pública ao GitHub**:
   - Copie o conteúdo de `~/.ssh/id_ed25519.pub`
   - Vá para GitHub Settings > SSH and GPG keys
   - Clique em "New SSH key"
   - Cole a chave

3. **Configure o repositório para usar SSH**:
   ```bash
   cd /tmp/cake-shop-work
   git remote set-url origin git@github.com:TecFelipeDsMartins/cake-shop-supabase.git
   git push origin main
   ```

## Verificar se o Push foi bem-sucedido

Após fazer o push, acesse:
```
https://github.com/TecFelipeDsMartins/cake-shop-supabase
```

Você deve ver:
- Um novo commit com a mensagem: "fix: corrigir todas as funções do Supabase..."
- Os arquivos atualizados: `src/lib/supabaseClient.ts`, `.env.example`, `SETUP_GUIDE.md`

## O que foi feito no commit

✅ Corrigidas todas as funções do Supabase
✅ Adicionado CRUD completo para clientes, vendas, contas
✅ Corrigidos nomes de campos para snake_case
✅ Adicionada função saveFullRecipe
✅ Adicionadas métricas do dashboard
✅ Todos os erros de tipo TypeScript resolvidos
✅ Adicionado arquivo .env.example
✅ Adicionado guia de setup

## Dúvidas?

Se tiver problemas, você pode:
1. Verificar se o token foi copiado corretamente
2. Confirmar que está no diretório correto: `/tmp/cake-shop-work`
3. Tentar novamente com: `git push -u origin main`
