# 📘 Guia Passo a Passo: Executar Migration v2 e Testar

Este guia vai te ajudar a executar a migration v2 no Supabase e testar todas as funcionalidades.

---

## 🔵 Parte 1: Executar Migration v2 no Supabase

### Passo 1: Acessar o Painel do Supabase

1. Abra seu navegador
2. Acesse: https://supabase.com/dashboard
3. Faça login na sua conta (se necessário)
4. Selecione seu projeto: **icewgfmkqqffcjjltafm** (ou o projeto que você criou)

### Passo 2: Abrir o SQL Editor

1. No menu lateral esquerdo, procure por **"SQL Editor"**
2. Clique em **"SQL Editor"**
3. Você verá a interface de edição SQL

### Passo 3: Criar Nova Query

1. Clique no botão **"New query"** (geralmente no canto superior esquerdo ou direito)
2. Uma nova aba/janela de query será aberta

### Passo 4: Copiar o Script SQL

1. Abra o arquivo `supabase_migration_v2.sql` no seu editor de código
2. Selecione **TODO** o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)

**OU**

1. Navegue até a pasta do projeto: `C:\Users\User\cake-shop-supabase`
2. Abra o arquivo `supabase_migration_v2.sql`
3. Copie todo o conteúdo

### Passo 5: Colar e Executar no Supabase

1. No SQL Editor do Supabase, cole o conteúdo copiado (Ctrl+V)
2. **IMPORTANTE:** Verifique se todo o script foi colado corretamente
3. Clique no botão **"Run"** (ou pressione **Ctrl+Enter**)
4. Aguarde alguns segundos enquanto o script executa

### Passo 6: Verificar Sucesso

Você deve ver uma mensagem de sucesso como:
- ✅ "Success. No rows returned" (normal para CREATE TABLE/ALTER TABLE)
- ✅ Mensagem indicando que foi executado com sucesso

**Se houver erro:**
- Leia a mensagem de erro
- Erros comuns:
  - Se disser que algo já existe: pode ser que a migration já tenha sido executada (pode ignorar)
  - Se houver erro de sintaxe: verifique se copiou todo o conteúdo

### Passo 7: Verificar se as Tabelas Foram Criadas (Opcional)

1. No menu lateral, vá em **"Table Editor"**
2. Verifique se a tabela **"technical_sheets"** aparece na lista
3. Se aparecer, a migration foi executada com sucesso!

---

## 🟢 Parte 2: Testar as Funcionalidades

### Pré-requisitos

1. Certifique-se de que o servidor de desenvolvimento está rodando:
   ```powershell
   cd C:\Users\User\cake-shop-supabase
   pnpm dev
   ```
2. Abra o navegador em: `http://localhost:5173` (ou a porta que o Vite indicar)

---

### Teste 1: Dashboard ✅

**O que testar:**
- Valores monetários estão corretos (não divididos por 100)
- Produtos mais vendidos aparecem corretamente
- Gráficos de vendas funcionam

**Como testar:**
1. Acesse a página Dashboard (página inicial)
2. Verifique se:
   - ✅ Valores monetários estão em reais (ex: R$ 50,00, não R$ 0,50)
   - ✅ Se houver vendas, os produtos mais vendidos aparecem
   - ✅ Gráficos de vendas por dia estão funcionando

**Se algo estiver errado:**
- Verifique o console do navegador (F12 → Console)
- Verifique se há vendas no banco de dados

---

### Teste 2: Vendas (Sales) ✅

**O que testar:**
- Validações funcionam corretamente
- Vendas podem ser criadas
- Items são salvos corretamente

**Como testar:**
1. Vá para a página "Vendas" no menu lateral
2. Clique em "Nova Venda" ou botão "+"
3. Tente criar uma venda **sem items**:
   - ✅ Deve mostrar erro: "Adicione pelo menos um item à venda"
4. Adicione um item:
   - Selecione um produto
   - Digite quantidade > 0
   - Digite preço unitário
   - Clique em "Adicionar"
5. Tente salvar:
   - ✅ Venda deve ser criada com sucesso
   - ✅ Mensagem de sucesso deve aparecer

**Validações para testar:**
- Quantidade zero ou negativa → deve dar erro
- Preço negativo → deve dar erro
- Sem produtos selecionados → deve dar erro

---

### Teste 3: Receitas (Recipes) ⚠️

**IMPORTANTE:** Este teste só funcionará se a migration v2 foi executada!

**O que testar:**
- Listagem de receitas funciona
- Criação de receitas funciona
- Ficha técnica é salva corretamente

**Como testar:**
1. Vá para a página "Receitas" no menu lateral
2. Verifique se a página carrega sem erros
3. Tente criar uma nova receita:
   - Clique em "Nova Receita"
   - Preencha os dados
   - Adicione ingredientes
   - Salve

**Se houver erro:**
- Verifique o console (F12)
- Erro sobre "technical_sheets" → Migration não foi executada
- Outros erros → Verifique o console para detalhes

---

### Teste 4: Insumos (Ingredients) ✅

**O que testar:**
- CRUD de insumos funciona
- Validações funcionam

**Como testar:**
1. Vá para "Insumos" no menu
2. Teste criar um novo insumo
3. Teste editar um insumo existente
4. Teste deletar um insumo

---

### Teste 5: Produtos (Products) ✅

**O que testar:**
- CRUD de produtos funciona

**Como testar:**
1. Vá para "Produtos" (pode estar em outra página)
2. Teste criar, editar e deletar produtos

---

### Teste 6: Console do Navegador (Verificação de Erros)

**Como fazer:**
1. Pressione **F12** no navegador
2. Vá na aba **"Console"**
3. Verifique se há erros em vermelho
4. Se houver erros:
   - Anote a mensagem
   - Verifique se está relacionado a "technical_sheets" (migration não executada)
   - Outros erros podem indicar problemas no código

---

## 🔍 Checklist de Verificação

Marque cada item conforme você testa:

### Migration
- [ ] Migration v2 executada no Supabase
- [ ] Tabela "technical_sheets" existe no Table Editor
- [ ] Sem erros na execução do SQL

### Dashboard
- [ ] Página carrega sem erros
- [ ] Valores monetários estão corretos (em reais)
- [ ] Gráficos aparecem (se houver dados)
- [ ] Produtos mais vendidos aparecem (se houver vendas)

### Vendas
- [ ] Página carrega sem erros
- [ ] Validações funcionam (quantidade, preço, etc.)
- [ ] Vendas podem ser criadas
- [ ] Items são salvos corretamente

### Receitas
- [ ] Página carrega sem erros (pode dar erro se migration não foi executada)
- [ ] Receitas podem ser criadas (após migration)
- [ ] Ficha técnica é salva (após migration)

### Console
- [ ] Sem erros no console do navegador
- [ ] Apenas warnings menores (se houver)

---

## 🐛 Problemas Comuns e Soluções

### Problema 1: "Table 'technical_sheets' does not exist"

**Causa:** Migration v2 não foi executada

**Solução:**
1. Volte para a Parte 1 deste guia
2. Execute a migration v2 novamente
3. Verifique se a tabela foi criada no Table Editor

---

### Problema 2: Valores monetários ainda estão incorretos

**Causa:** Cache do navegador ou código não atualizado

**Solução:**
1. Pare o servidor (Ctrl+C)
2. Limpe o cache do navegador (Ctrl+Shift+Delete)
3. Reinicie o servidor: `pnpm dev`
4. Recarregue a página (Ctrl+F5)

---

### Problema 3: Vendas não aparecem no Dashboard

**Causa:** Pode não haver vendas ou erro ao buscar items

**Solução:**
1. Verifique se há vendas no banco (Table Editor → sales)
2. Verifique o console do navegador para erros
3. Tente criar uma nova venda e verificar se aparece

---

### Problema 4: Erro ao criar receita

**Causa:** Migration não executada ou dados inválidos

**Solução:**
1. Verifique se migration v2 foi executada
2. Verifique o console para mensagem de erro específica
3. Certifique-se de adicionar ingredientes válidos

---

## 📞 Próximos Passos Após Testes

Se todos os testes passarem:

1. ✅ **Parabéns!** O sistema está funcionando corretamente
2. 📝 **Documente** qualquer problema encontrado
3. 🚀 **Considere** fazer deploy para produção (se aplicável)

Se houver problemas:

1. 📝 **Anote** os erros específicos
2. 🔍 **Verifique** o console do navegador
3. 📚 **Consulte** os arquivos de documentação:
   - `CHANGELOG_CORRECOES.md`
   - `REVISAO_LOGICA.md`
   - `RESUMO_EXECUCAO.md`

---

## 💡 Dicas Úteis

1. **Sempre verifique o console** quando algo não funcionar
2. **Use o Table Editor do Supabase** para verificar dados diretamente
3. **Mantenha o servidor rodando** enquanto testa
4. **Recarregue a página** após fazer mudanças no banco
5. **Anote problemas** para referência futura

---

**Boa sorte com os testes! 🚀**

Se precisar de ajuda, consulte a documentação ou verifique os erros no console do navegador.


